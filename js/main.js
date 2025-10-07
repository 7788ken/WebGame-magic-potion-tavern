/**
 * 魔药酒馆游戏主入口
 * Phaser.js 2D游戏引擎初始化
 */

// 游戏场景配置
const gameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'phaser-game',
    backgroundColor: '#2D1B69',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    antialias: true,
    render: {
        pixelArt: false,
        antialias: true
    }
};

// 游戏实例
let game;

/**
 * 获取当前激活场景
 */
function getActiveScene() {
    if (!game || !game.scene) {
        return null;
    }

    const activeScenes = game.scene.getScenes(true);
    if (activeScenes && activeScenes.length > 0) {
        return activeScenes[activeScenes.length - 1];
    }

    return null;
}

/**
 * 获取当前激活场景的 key
 */
function getActiveSceneKey() {
    const activeScene = getActiveScene();
    if (!activeScene || !activeScene.scene) {
        return null;
    }

    return activeScene.scene.key || null;
}

/**
 * 游戏初始化函数
 */
function initializeGame() {
    console.log('🧪 魔药酒馆游戏初始化中...');

    try {
        // 注册所有场景
        registerScenes();

        // 创建Phaser游戏实例
        game = new Phaser.Game(gameConfig);

        console.log('✅ 游戏初始化成功！');

        // 监听游戏事件
        setupGameEventListeners();

    } catch (error) {
        console.error('❌ 游戏初始化失败:', error);
        showErrorMessage('游戏初始化失败，请刷新页面重试。');
    }
}

/**
 * 注册所有游戏场景
 */
function registerScenes() {
    // 基础场景
    gameConfig.scene.push(BootScene);
    gameConfig.scene.push(PreloadScene);
    gameConfig.scene.push(MenuScene);

    // 主要游戏场景
    gameConfig.scene.push(TavernScene);
    gameConfig.scene.push(BrewingScene);
    gameConfig.scene.push(BattleScene);
    gameConfig.scene.push(EventScene);

    console.log('📋 已注册游戏场景:', gameConfig.scene.length);
}

/**
 * 设置游戏事件监听器
 */
function setupGameEventListeners() {
    // 游戏启动事件
    game.events.on('ready', () => {
        console.log('🎮 游戏已准备就绪');

        // 尝试加载存档
        if (saveManager.hasAutoSave()) {
            console.log('💾 发现自动存档，尝试加载...');
            saveManager.quickLoad();
        }
    });

    // 游戏暂停事件
    game.events.on('pause', () => {
        console.log('⏸️ 游戏已暂停');
        saveManager.quickSave(); // 自动保存
    });

    // 游戏恢复事件
    game.events.on('resume', () => {
        console.log('▶️ 游戏已恢复');
    });

    // 窗口失焦事件
    window.addEventListener('blur', () => {
        if (!game) {
            return;
        }

        const activeScene = getActiveScene();
        const activeSceneKey = getActiveSceneKey();

        if (!activeScene || !activeSceneKey) {
            return;
        }

        if (game.scene.isPaused(activeSceneKey)) {
            return;
        }

        activeScene.scene.pause(activeSceneKey);
    });

    // 窗口聚焦事件
    window.addEventListener('focus', () => {
        if (!game) {
            return;
        }

        const activeScene = getActiveScene();
        const activeSceneKey = getActiveSceneKey();

        if (!activeScene || !activeSceneKey) {
            return;
        }

        if (game.scene.isPaused(activeSceneKey)) {
            activeScene.scene.resume(activeSceneKey);
        }
    });

    // 页面卸载事件
    window.addEventListener('beforeunload', () => {
        // 自动保存
        saveManager.quickSave();

        // 停止自动保存
        saveManager.stopAutoSave();

        console.log('💾 游戏数据已自动保存');
    });

    // 错误处理
    window.addEventListener('error', (e) => {
        console.error('🚨 游戏运行错误:', e.error);

        // 尝试保存当前状态
        try {
            saveManager.quickSave();
        } catch (saveError) {
            console.error('💾 自动保存失败:', saveError);
        }
    });
}

/**
 * 显示错误信息
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(139, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-size: 18px;
        text-align: center;
        z-index: 10000;
        max-width: 400px;
    `;
    errorDiv.innerHTML = `
        <h3>🚨 游戏错误</h3>
        <p>${message}</p>
        <button onclick="location.reload()" style="
            background: #FFD700;
            color: #2D1B69;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 10px;
        ">刷新页面</button>
    `;

    document.body.appendChild(errorDiv);

    // 5秒后自动移除
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

/**
 * 游戏工具函数
 */
const GameUtils = {
    /**
     * 格式化时间
     */
    formatTime: function(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}小时${minutes % 60}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    },

    /**
     * 格式化金币
     */
    formatGold: function(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(1) + 'K';
        }
        return amount.toString();
    },

    /**
     * 获取随机颜色
     */
    getRandomColor: function() {
        const colors = [
            0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFECA57,
            0xFF9FF3, 0x54A0FF, 0x5F27CD, 0x00D2D3, 0xFF9F43
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * 创建文本样式
     */
    createTextStyle: function(size = 16, color = '#FFFFFF', font = 'Noto Sans SC') {
        return {
            fontSize: size + 'px',
            fontFamily: font,
            color: color,
            align: 'center',
            wordWrap: { width: 300, useAdvancedWrap: true }
        };
    },

    /**
     * 创建按钮样式
     */
    createButtonStyle: function(width = 120, height = 40, color = 0x2D1B69) {
        return {
            width: width,
            height: height,
            backgroundColor: color,
            textStyle: this.createTextStyle(14, '#FFFFFF'),
            hoverColor: 0xFFD700,
            pressedColor: 0x00FF7F,
            borderColor: 0xFFD700,
            borderWidth: 2,
            borderRadius: 5
        };
    },

    /**
     * 缓动函数
     */
    easeInOut: function(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    /**
     * 线性插值
     */
    lerp: function(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * 随机范围
     */
    randomRange: function(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * 随机选择
     */
    randomChoice: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * 加权随机选择
     */
    weightedRandom: function(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }

        return items[items.length - 1];
    },

    /**
     * 深度克隆对象
     */
    deepClone: function(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));

        const clonedObj = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = this.deepClone(obj[key]);
            }
        }
        return clonedObj;
    },

    /**
     * 防抖函数
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     */
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

/**
 * 全局游戏状态管理
 */
window.GameState = {
    game: game,
    config: GameConfig,
    state: gameState,
    saveManager: saveManager,
    eventManager: eventManager,
    utils: GameUtils,

    /**
     * 获取当前场景
     */
    getCurrentScene: function() {
        if (!game || !game.scene.scenes.length) return null;
        return getActiveScene();
    },

    /**
     * 切换场景
     */
    switchScene: function(sceneKey, data = {}) {
        if (!game) return false;

        try {
            game.scene.start(sceneKey, data);
            return true;
        } catch (error) {
            console.error('场景切换失败:', error);
            return false;
        }
    },

    /**
     * 暂停游戏
     */
    pauseGame: function() {
        if (!game) return;
        const activeScene = getActiveScene();
        const activeSceneKey = getActiveSceneKey();

        if (!activeScene || !activeSceneKey) {
            return;
        }

        if (!game.scene.isPaused(activeSceneKey)) {
            activeScene.scene.pause(activeSceneKey);
        }
    },

    /**
     * 恢复游戏
     */
    resumeGame: function() {
        if (!game) return;
        const activeScene = getActiveScene();
        const activeSceneKey = getActiveSceneKey();

        if (!activeScene || !activeSceneKey) {
            return;
        }

        if (game.scene.isPaused(activeSceneKey)) {
            activeScene.scene.resume(activeSceneKey);
        }
    },

    /**
     * 显示消息
     */
    showMessage: function(message, type = 'info', duration = 3000) {
        const currentScene = this.getCurrentScene();
        if (currentScene && currentScene.showMessage) {
            currentScene.showMessage(message, type, duration);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    },

    /**
     * 显示确认对话框
     */
    showConfirm: function(message, onConfirm, onCancel) {
        const currentScene = this.getCurrentScene();
        if (currentScene && currentScene.showConfirm) {
            currentScene.showConfirm(message, onConfirm, onCancel);
        } else {
            if (confirm(message)) {
                onConfirm && onConfirm();
            } else {
                onCancel && onCancel();
            }
        }
    }
};

/**
 * 初始化游戏
 * 当DOM加载完成后启动游戏
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM加载完成，准备启动游戏...');

    // 延迟启动，确保所有资源加载完成
    setTimeout(() => {
        initializeGame();
    }, 500);
});

// 导出到全局作用域
window.GameUtils = GameUtils;
window.GameState = window.GameState; // 确保全局可用

console.log('🧪 魔药酒馆游戏框架加载完成');
