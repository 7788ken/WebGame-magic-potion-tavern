// 全局变量
let selectedMaterials = [];
let gameState = {
    gold: 1250,
    materials: 45,
    staff: 3,
    level: 5,
    playerHP: 100,
    enemyHP: 85,
    currentRound: 3
};

// 老王动画兼容函数 - 处理anime.js未加载的情况
function safeAnime(config) {
    if (typeof anime !== 'undefined') {
        return anime(config);
    } else {
        console.log('ℹ️ anime.js未加载，使用CSS动画替代');
        // 简单的CSS动画回退
        if (config.targets) {
            const targets = Array.isArray(config.targets) ? config.targets : [config.targets];
            targets.forEach(target => {
                if (typeof target === 'string') {
                    const elements = document.querySelectorAll(target);
                    elements.forEach(el => {
                        if (config.scale !== undefined) {
                            el.style.transform = `scale(${config.scale})`;
                        }
                        if (config.opacity !== undefined) {
                            el.style.opacity = config.opacity;
                        }
                        if (config.translateY !== undefined) {
                            el.style.transform += ` translateY(${config.translateY}px)`;
                        }
                    });
                }
            });
        }
        // 模拟anime.js的complete回调
        if (config.complete) {
            setTimeout(config.complete, config.duration || 300);
        }
        return {
            pause: () => {},
            play: () => {},
            restart: () => {}
        };
    }
}

// 老王错误管理器 - 专门收集SB报错
// 注意：ErrorManager.js已经创建了全局errorManager实例，这里不要重复声明

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查errorManager是否已存在（由ErrorManager.js创建）
    if (typeof errorManager !== 'undefined') {
        console.log('✅ 老王错误管理系统已启动');
    } else {
        console.error('❌ 错误管理器未找到');
    }

    // 包装所有初始化函数，捕获可能的错误
    const initFunctions = [
        { name: '动画系统', func: initializeAnimations },
        { name: '粒子系统', func: initializeParticles },
        { name: '交互系统', func: initializeInteractions },
        { name: '魔药筛选', func: initializePotionFiltering },
        { name: '魔药弹窗', func: initializePotionModal },
        { name: '制作模拟器', func: initializeBrewingSimulator }
    ];

    initFunctions.forEach(({ name, func }) => {
        try {
            func();
            console.log(`✅ ${name}初始化完成`);
        } catch (error) {
            console.error(`❌ ${name}初始化失败:`, error);
            errorManager.addError({
                type: 'initialization',
                message: `${name}初始化失败: ${error.message}`,
                stack: error.stack,
                severity: 'high'
            });
        }
    });
});

// 初始化动画
function initializeAnimations() {
    // 主页英雄区域动画
    if (document.getElementById('main-title')) {
        anime.timeline({
            easing: 'easeOutExpo',
            duration: 1000
        })
        .add({
            targets: '#main-title',
            opacity: [0, 1],
            translateY: [50, 0],
            delay: 500
        })
        .add({
            targets: '#subtitle',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: 200
        }, '-=700')
        .add({
            targets: '#hero-buttons',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: 300
        }, '-=600');
    }
    
    // 卡片悬停动画
    const cards = document.querySelectorAll('.magic-card, .potion-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            safeAnime({
                targets: this,
                scale: 1.02,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
        
        card.addEventListener('mouseleave', function() {
            safeAnime({
                targets: this,
                scale: 1,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });
    
    // 滚动动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                safeAnime({
                    targets: entry.target,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    duration: 800,
                    easing: 'easeOutQuad',
                    delay: anime.stagger(100)
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 观察所有需要动画的元素
    document.querySelectorAll('.magic-card, .potion-card, .step-indicator').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// 初始化粒子效果
function initializeParticles() {
    const particleContainer = document.getElementById('particles');
    if (!particleContainer) return;
    
    // 创建PIXI应用
    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        backgroundAlpha: 0
    });
    
    particleContainer.appendChild(app.view);
    
    // 创建粒子容器
    const particleContainerPixi = new PIXI.Container();
    app.stage.addChild(particleContainerPixi);
    
    // 粒子数组
    const particles = [];
    const particleCount = 50;
    
    // 创建粒子纹理
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xFFD700, 0.6);
    graphics.drawCircle(0, 0, 2);
    graphics.endFill();
    const particleTexture = app.renderer.generateTexture(graphics);
    
    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
        const particle = new PIXI.Sprite(particleTexture);
        particle.x = Math.random() * app.screen.width;
        particle.y = Math.random() * app.screen.height;
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vy = (Math.random() - 0.5) * 0.5;
        particle.alpha = Math.random() * 0.5 + 0.3;
        particle.scale.set(Math.random() * 0.5 + 0.5);
        
        particles.push(particle);
        particleContainerPixi.addChild(particle);
    }
    
    // 动画循环
    app.ticker.add(() => {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 边界检查
            if (particle.x < 0) particle.x = app.screen.width;
            if (particle.x > app.screen.width) particle.x = 0;
            if (particle.y < 0) particle.y = app.screen.height;
            if (particle.y > app.screen.height) particle.y = 0;
            
            // 闪烁效果
            particle.alpha += Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.01;
        });
    });
    
    // 窗口大小调整
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });
}

// 初始化交互功能
function initializeInteractions() {
    // 导航链接平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 按钮悬停效果
    const buttons = document.querySelectorAll('.glow-button, button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            safeAnime({
                targets: this,
                scale: 1.05,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
        
        button.addEventListener('mouseleave', function() {
            if (typeof anime !== 'undefined') {
                safeAnime({
                    targets: this,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            } else {
                this.style.transform = 'scale(1)';
            }
        });
    });
}

// 经营系统功能
function purchaseMaterial(materialName, cost) {
    if (gameState.gold >= cost) {
        gameState.gold -= cost;
        gameState.materials += 1;
        
        // 更新显示
        const goldElement = document.getElementById('gold-count');
        const materialElement = document.getElementById('material-count');
        if (goldElement) goldElement.textContent = gameState.gold;
        if (materialElement) materialElement.textContent = gameState.materials;
        
        // 显示购买成功动画
        showNotification(`成功购买 ${materialName}！`, 'success');
        
        // 添加购买动画
        safeAnime({
            targets: event.target,
            scale: [1, 1.1, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    } else {
        showNotification('金币不足！', 'error');
    }
}

function craftPotion() {
    const recipe = document.getElementById('potion-recipe').value;
    const progressBar = document.getElementById('crafting-progress');
    
    if (gameState.materials >= 2) {
        gameState.materials -= 2;
        const materialElement = document.getElementById('material-count');
        if (materialElement) materialElement.textContent = gameState.materials;
        
        // 制作进度动画
        safeAnime({
            targets: progressBar,
            width: '100%',
            duration: 2000,
            easing: 'easeInOutQuad',
            complete: function() {
                setTimeout(() => {
                    progressBar.style.width = '0%';
                    showNotification('魔药制作完成！', 'success');
                }, 500);
            }
        });
    } else {
        showNotification('材料不足！', 'error');
    }
}

// 对战系统功能
function drawMaterial(element) {
    if (element.classList.contains('selected')) return;
    
    element.classList.add('selected');
    element.style.opacity = '0.5';
    element.style.pointerEvents = 'none';
    
    // 添加抽取动画
    safeAnime({
        targets: element,
        scale: [1, 1.2, 0.8],
        duration: 500,
        easing: 'easeOutQuad'
    });
    
    showNotification('材料抽取成功！', 'success');
}

function endTurn() {
    gameState.currentRound++;
    const roundElement = document.getElementById('current-round');
    const hpElement = document.getElementById('enemy-hp');
    const hpBarElement = document.getElementById('enemy-hp-bar');

    if (roundElement) roundElement.textContent = gameState.currentRound;

    // 模拟战斗结果
    const damage = Math.floor(Math.random() * 20) + 10;
    gameState.enemyHP = Math.max(0, gameState.enemyHP - damage);

    if (hpElement) hpElement.textContent = `${gameState.enemyHP}/100`;

    // 更新血条
    const hpPercent = (gameState.enemyHP / 100) * 100;
    if (hpBarElement) hpBarElement.style.setProperty('--hp-percent', `${hpPercent}%`);
    
    showNotification(`对敌人造成 ${damage} 点伤害！`, 'success');
    
    if (gameState.currentRound >= 6 || gameState.enemyHP <= 0) {
        setTimeout(() => {
            showNotification('战斗结束！', 'info');
        }, 1000);
    }
}

function synthesizePotion() {
    const selectedSlots = document.querySelectorAll('.material-slot.selected');
    if (selectedSlots.length === 0) {
        showNotification('请先选择材料！', 'error');
        return;
    }
    
    // 模拟合成
    safeAnime({
        targets: '#cauldron',
        rotate: [0, 360],
        scale: [1, 1.2, 1],
        duration: 1000,
        easing: 'easeOutQuad',
        complete: function() {
            showNotification('魔药合成成功！', 'success');
        }
    });
}

// 魔药图鉴功能
function initializePotionFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');
    const potionCards = document.querySelectorAll('.potion-card');

    // 检查必要元素是否存在（避免在test-error-system.html等页面报错）
    if (!searchInput || filterButtons.length === 0) {
        console.log('ℹ️ 魔药筛选元素不存在，跳过初始化');
        return;
    }

    // 筛选按钮
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 更新按钮状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const category = this.dataset.category;
            filterPotions(category, searchInput.value);
        });
    });

    // 搜索功能
    searchInput.addEventListener('input', function() {
        const activeCategory = document.querySelector('.filter-btn.active');
        if (activeCategory) {
            filterPotions(activeCategory.dataset.category, this.value);
        }
    });
    
    // 魔药卡片点击事件
    potionCards.forEach(card => {
        card.addEventListener('click', function() {
            const name = this.dataset.name;
            const effect = this.dataset.effect;
            const category = this.dataset.category;
            showPotionModal(this);
        });
    });
}

function filterPotions(category, searchTerm) {
    const potionCards = document.querySelectorAll('.potion-card');
    
    potionCards.forEach(card => {
        const cardCategory = card.dataset.category;
        const cardName = card.dataset.name.toLowerCase();
        const cardEffect = card.dataset.effect.toLowerCase();
        const matchesCategory = category === 'all' || cardCategory === category;
        const matchesSearch = searchTerm === '' || 
                            cardName.includes(searchTerm.toLowerCase()) || 
                            cardEffect.includes(searchTerm.toLowerCase());
        
        if (matchesCategory && matchesSearch) {
            card.style.display = 'block';
            safeAnime({
                targets: card,
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });
        } else {
            safeAnime({
                targets: card,
                opacity: [1, 0],
                scale: [1, 0.8],
                duration: 200,
                easing: 'easeOutQuad',
                complete: function() {
                    card.style.display = 'none';
                }
            });
        }
    });
}

// 魔药详情模态框
function initializePotionModal() {
    const modal = document.getElementById('potion-modal');

    // 检查元素是否存在（避免在test-error-system.html等页面报错）
    if (!modal) {
        console.log('ℹ️ 魔药模态框不存在，跳过初始化');
        return;
    }

    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function showPotionModal(card) {
    const modal = document.getElementById('potion-modal');
    const icon = card.querySelector('.potion-icon').textContent;
    const name = card.querySelector('h3').textContent;
    const effect = card.querySelector('p').textContent;
    const type = card.dataset.category;
    
    document.getElementById('modal-icon').textContent = icon;
    document.getElementById('modal-title').textContent = name;
    document.getElementById('modal-effect').textContent = effect;
    document.getElementById('modal-type').textContent = getTypeText(type);
    
    // 显示模态框
    modal.classList.add('active');
    
    // 模态框动画
    safeAnime({
        targets: '.modal-content',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
}

function closeModal() {
    const modal = document.getElementById('potion-modal');
    
    safeAnime({
        targets: '.modal-content',
        scale: [1, 0.8],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeOutQuad',
        complete: function() {
            modal.classList.remove('active');
        }
    });
}

function getTypeText(type) {
    const typeMap = {
        'attack': '攻击类',
        'control': '控制类',
        'support': '辅助类'
    };
    return typeMap[type] || '未知';
}

// 魔药制作模拟器
function initializeBrewingSimulator() {
    selectedMaterials = [];
    updateSelectedMaterials();
}

function selectMaterial(element, material, name) {
    if (selectedMaterials.length >= 3) {
        showNotification('最多只能选择3种材料！', 'error');
        return;
    }
    
    if (element.classList.contains('filled')) {
        showNotification('该材料已被选择！', 'error');
        return;
    }
    
    element.classList.add('filled');
    selectedMaterials.push({ material, name });
    updateSelectedMaterials();
    
    // 添加选择动画
    safeAnime({
        targets: element,
        scale: [1, 1.2, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
}

function updateSelectedMaterials() {
    const container = document.getElementById('selected-materials');

    // 检查元素是否存在（避免在test-error-system.html等页面报错）
    if (!container) {
        console.log('ℹ️ 已选材料容器不存在，跳过更新');
        return;
    }

    if (selectedMaterials.length === 0) {
        container.innerHTML = '<div class="text-gray-500">点击材料添加到坩埚</div>';
        return;
    }
    
    container.innerHTML = selectedMaterials.map((item, index) => 
        `<div class="flex items-center space-x-1 bg-gold bg-opacity-20 px-2 py-1 rounded">
            <span class="text-lg">${item.material}</span>
            <span class="text-sm">${item.name}</span>
            <button onclick="removeMaterial(${index})" class="text-red-400 hover:text-red-300">×</button>
        </div>`
    ).join('');
}

function removeMaterial(index) {
    const materialSlots = document.querySelectorAll('.material-slot');
    const removedMaterial = selectedMaterials[index];
    
    // 找到对应的材料槽并移除填充状态
    materialSlots.forEach(slot => {
        if (slot.dataset.material === removedMaterial.material) {
            slot.classList.remove('filled');
        }
    });
    
    selectedMaterials.splice(index, 1);
    updateSelectedMaterials();
}

function brewPotion() {
    if (selectedMaterials.length === 0) {
        showNotification('请先选择材料！', 'error');
        return;
    }
    
    // 坩埚动画
    safeAnime({
        targets: '#cauldron',
        rotate: [0, 360],
        scale: [1, 1.3, 1],
        duration: 1500,
        easing: 'easeOutQuad'
    });
    
    // 模拟制作结果
    setTimeout(() => {
        const result = getBrewingResult(selectedMaterials);
        const brewingResultElement = document.getElementById('brewing-result');
        if (brewingResultElement) brewingResultElement.innerHTML = result;

        // 清空选择
        selectedMaterials = [];
        updateSelectedMaterials();

        // 重置材料槽
        const materialSlots = document.querySelectorAll('.material-slot');
        materialSlots.forEach(slot => {
            slot.classList.remove('filled');
        });

        showNotification('魔药制作完成！', 'success');
    }, 1500);
}

function getBrewingResult(materials) {
    const materialCount = materials.length;
    const materialTypes = materials.map(m => m.name);
    
    // 简单的配方逻辑
    if (materialTypes.includes('火焰花')) {
        if (materialCount === 1) {
            return '<div class="text-red-400">制作成功！获得了 <strong>火焰药剂</strong> 🔥</div>';
        } else if (materialCount === 2) {
            return '<div class="text-red-400">制作成功！获得了 <strong>爆燃药剂</strong> 💥</div>';
        }
    }
    
    if (materialTypes.includes('月光草') && materialTypes.includes('露珠')) {
        return '<div class="text-green-400">制作成功！获得了 <strong>治疗药剂</strong> 💚</div>';
    }
    
    if (materialTypes.includes('暗影粉')) {
        return '<div class="text-purple-400">制作成功！获得了 <strong>控制类魔药</strong> 🌀</div>';
    }
    
    // 随机结果
    const randomResults = [
        '<div class="text-gray-400">制作失败，材料浪费了...</div>',
        '<div class="text-yellow-400">制作出了神秘的药剂！</div>',
        '<div class="text-blue-400">制作成功！获得了基础魔药</div>'
    ];
    
    return randomResults[Math.floor(Math.random() * randomResults.length)];
}

// 通知系统
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300`;
    
    // 根据类型设置样式
    const styles = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        warning: 'bg-yellow-600 text-black',
        info: 'bg-blue-600 text-white'
    };
    
    notification.className += ` ${styles[type] || styles.info}`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>${getNotificationIcon(type)}</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 导出函数供HTML调用
window.purchaseMaterial = purchaseMaterial;
window.craftPotion = craftPotion;
window.drawMaterial = drawMaterial;
window.endTurn = endTurn;
window.synthesizePotion = synthesizePotion;
window.selectMaterial = selectMaterial;
window.removeMaterial = removeMaterial;
window.brewPotion = brewPotion;
window.closeModal = closeModal;

/**
 * 老王错误汇报系统 - 专门收集SB报错
 */

// 显示错误报告
window.showErrorReport = function() {
    if (errorManager) {
        errorManager.showErrorReport();
    } else {
        console.error('❌ 错误管理器未初始化');
    }
};

// 导出错误管理器供全局使用
window.getErrorManager = function() {
    return errorManager;
};

// 手动添加错误（供调试使用）
window.reportError = function(message, severity = 'medium') {
    if (errorManager) {
        errorManager.addError({
            type: 'manual',
            message: message,
            severity: severity,
            timestamp: Date.now()
        });
        console.log(`✅ 手动错误已记录: ${message}`);
    } else {
        console.error('❌ 错误管理器未初始化，无法记录错误:', message);
    }
};

// 获取错误统计
window.getErrorStats = function() {
    if (errorManager) {
        return errorManager.getErrorStats();
    }
    return null;
};

// 清空错误日志
window.clearErrorLog = function() {
    if (errorManager) {
        errorManager.clearErrors();
        console.log('✅ 错误日志已清空');
    }
};

// 导出错误报告
window.exportErrorReport = function() {
    if (errorManager) {
        errorManager.exportReport();
    }
};

/**
 * 添加错误汇报按钮到页面
 */
function addErrorReportButton() {
    // 创建错误汇报按钮
    const errorButton = document.createElement('button');
    errorButton.id = 'error-report-button';
    errorButton.innerHTML = '🐛 报错';
    errorButton.title = '点击查看错误报告 (快捷键: Ctrl+Shift+E)';
    errorButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 50px;
        padding: 12px 20px;
        font-size: 14px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        font-family: Arial, sans-serif;
    `;

    // 添加悬停效果
    errorButton.addEventListener('mouseenter', () => {
        errorButton.style.transform = 'scale(1.1)';
        errorButton.style.background = '#c0392b';
    });

    errorButton.addEventListener('mouseleave', () => {
        errorButton.style.transform = 'scale(1)';
        errorButton.style.background = '#e74c3c';
    });

    // 点击事件
    errorButton.addEventListener('click', () => {
        showErrorReport();
    });

    document.body.appendChild(errorButton);
    console.log('✅ 错误汇报按钮已添加');
}

/**
 * 添加键盘快捷键支持
 */
function addErrorReportShortcut() {
    document.addEventListener('keydown', (e) => {
        // 检测Ctrl（Windows/Linux）或Cmd（Mac）
        const isModifier = e.ctrlKey || e.metaKey;

        // Ctrl/Cmd+Shift+E 显示错误报告（Mac和Windows通用）
        if (isModifier && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            showErrorReport();
        }

        // Ctrl/Cmd+Shift+C 清空错误日志（Mac和Windows通用）
        if (isModifier && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            if (confirm('确定要清空所有错误日志吗？')) {
                clearErrorLog();
            }
        }
    });

    console.log('✅ 错误汇报快捷键已添加 (Ctrl/Cmd+Shift+E 查看报告, Ctrl/Cmd+Shift+C 清空日志)');
}

/**
 * 页面加载完成后添加错误汇报功能
 */
document.addEventListener('DOMContentLoaded', () => {
    // 延迟添加按钮，确保页面完全加载
    setTimeout(() => {
        try {
            addErrorReportButton();
            addErrorReportShortcut();
            console.log('✅ 老王错误汇报系统已完全就绪！');
        } catch (error) {
            console.error('❌ 添加错误汇报按钮失败:', error);
        }
    }, 1000);
});

// 显示欢迎信息和快捷键提示
setTimeout(() => {
    console.log('');
    console.log('🍺 魔药酒馆 - 老王错误汇报系统');
    console.log('=====================================');
    console.log('🐛 点击右下角的"报错"按钮查看错误报告');
    console.log('⌨️  快捷键:');
    console.log('   Ctrl+Shift+E - 显示错误报告');
    console.log('   Ctrl+Shift+C - 清空错误日志');
    console.log('=====================================');
    console.log('');
}, 2000);