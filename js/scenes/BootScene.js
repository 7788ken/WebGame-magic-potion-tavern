/**
 * 启动场景
 * 游戏启动时的初始化场景
 */

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        console.log('🚀 BootScene: 游戏启动中...');

        // 创建启动画面
        this.createBootScreen();

        // 加载基础资源
        this.loadBasicAssets();

        // 显示加载进度
        this.setupLoadingProgress();
    }

    create() {
        console.log('✅ BootScene: 启动完成，进入预加载场景');

        // 初始化游戏系统
        this.initializeGameSystems();

        // 跳转到预加载场景
        this.scene.start('PreloadScene');
    }

    /**
     * 创建启动画面
     */
    createBootScreen() {
        const { width, height } = this.cameras.main;

        // 背景渐变
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(
            0x1A1A2E, 0x1A1A2E,
            0x2D1B69, 0x2D1B69,
            1
        );
        graphics.fillRect(0, 0, width, height);

        // 游戏标题
        const titleStyle = {
            fontSize: '48px',
            fontFamily: 'ZCOOL KuaiLe',
            color: '#FFD700',
            align: 'center',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                stroke: true,
                fill: true
            }
        };

        this.add.text(width / 2, height / 2 - 100, '魔药酒馆', titleStyle)
            .setOrigin(0.5);

        // 副标题
        const subtitleStyle = {
            fontSize: '24px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            align: 'center'
        };

        this.add.text(width / 2, height / 2 - 40, '经营你的魔法酒馆，成为最强大的魔药大师', subtitleStyle)
            .setOrigin(0.5);

        // 版本信息
        const versionStyle = {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#888888',
            align: 'center'
        };

        this.add.text(width / 2, height - 50, `版本 ${GameConfig.save.version}`, versionStyle)
            .setOrigin(0.5);

        // 加载提示
        const loadingStyle = {
            fontSize: '18px',
            fontFamily: 'Noto Sans SC',
            color: '#00FF7F',
            align: 'center'
        };

        this.loadingText = this.add.text(width / 2, height / 2 + 50, '正在初始化魔法世界...', loadingStyle)
            .setOrigin(0.5);

        // 添加粒子效果
        this.createParticleEffect();
    }

    /**
     * 创建粒子效果
     */
    createParticleEffect() {
        const { width, height } = this.cameras.main;

        // 创建粒子发射器
        const particles = this.add.particles(0, 0, null, {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: 5000,
            speed: { min: 20, max: 50 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: [0xFFD700, 0x00FF7F, 0x3742FA],
            frequency: 200,
            quantity: 2
        });

        // 创建自定义粒子纹理
        const graphics = this.add.graphics();
        graphics.fillStyle(0xFFD700);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();

        particles.setTexture('particle');
    }

    /**
     * 加载基础资源
     */
    loadBasicAssets() {
        // 创建加载进度条
        const { width, height } = this.cameras.main;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 + 80, 320, 30);

        // 加载文本
        const loadingStyle = {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF',
            align: 'center'
        };

        const loadingText = this.add.text(width / 2, height / 2 + 120, '0%', loadingStyle)
            .setOrigin(0.5);

        const assetText = this.add.text(width / 2, height / 2 + 150, '', loadingStyle)
            .setOrigin(0.5);

        // 监听加载进度
        this.load.on('progress', (value) => {
            const percent = Math.floor(value * 100);
            loadingText.setText(percent + '%');
            progressBar.clear();
            progressBar.fillStyle(0x00FF7F, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 + 85, 300 * value, 20);

            // 更新加载文本
            if (this.loadingText) {
                const loadingMessages = [
                    '正在初始化魔法世界...',
                    '正在召唤精灵工人...',
                    '正在准备坩埚和材料...',
                    '正在调制初始魔药...',
                    '正在迎接第一位客人...',
                    '魔药酒馆准备开业！'
                ];

                const messageIndex = Math.floor(value * loadingMessages.length);
                this.loadingText.setText(loadingMessages[Math.min(messageIndex, loadingMessages.length - 1)]);
            }
        });

        this.load.on('fileprogress', (file) => {
            assetText.setText('正在加载: ' + file.key);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            assetText.destroy();
        });

        // 加载基础资源
        this.load.image('logo', 'assets/images/logo.png');
        this.load.image('background', 'assets/images/background.jpg');
        this.load.image('tavern_bg', 'assets/images/tavern_background.jpg');
        this.load.image('cauldron', 'assets/images/cauldron.png');
        this.load.image('potion_base', 'assets/images/potion_base.png');
        this.load.image('card_back', 'assets/images/card_back.png');

        // 加载UI资源
        this.load.image('button_normal', 'assets/ui/button_normal.png');
        this.load.image('button_hover', 'assets/ui/button_hover.png');
        this.load.image('button_pressed', 'assets/ui/button_pressed.png');
        this.load.image('panel', 'assets/ui/panel.png');
        this.load.image('window', 'assets/ui/window.png');

        // 加载图标资源
        this.load.image('icon_gold', 'assets/icons/gold.png');
        this.load.image('icon_reputation', 'assets/icons/reputation.png');
        this.load.image('icon_materials', 'assets/icons/materials.png');
        this.load.image('icon_customers', 'assets/icons/customers.png');
        this.load.image('icon_staff', 'assets/icons/staff.png');

        // 加载粒子效果资源
        this.load.image('particle_spark', 'assets/particles/spark.png');
        this.load.image('particle_glow', 'assets/particles/glow.png');
        this.load.image('particle_magic', 'assets/particles/magic.png');

        // 加载音频资源
        this.load.audio('bgm_main', 'assets/audio/main_theme.mp3');
        this.load.audio('bgm_tavern', 'assets/audio/tavern_theme.mp3');
        this.load.audio('bgm_battle', 'assets/audio/battle_theme.mp3');
        this.load.audio('sfx_click', 'assets/audio/click.mp3');
        this.load.audio('sfx_success', 'assets/audio/success.mp3');
        this.load.audio('sfx_fail', 'assets/audio/fail.mp3');
        this.load.audio('sfx_potion', 'assets/audio/potion.mp3');
        this.load.audio('sfx_card', 'assets/audio/card.mp3');

        console.log('📦 BootScene: 基础资源加载完成');
    }

    /**
     * 设置加载进度
     */
    setupLoadingProgress() {
        const { width, height } = this.cameras.main;

        // 创建进度条背景
        const progressBg = this.add.graphics();
        progressBg.fillStyle(0x000000, 0.5);
        progressBg.fillRoundedRect(width / 2 - 155, height / 2 + 75, 310, 40, 5);

        // 创建进度条
        this.progressBar = this.add.graphics();
        this.progressBar.fillStyle(0x00FF7F, 1);

        // 监听加载进度
        this.load.on('progress', (value) => {
            this.progressBar.clear();
            this.progressBar.fillRoundedRect(
                width / 2 - 150,
                height / 2 + 80,
                300 * value,
                30,
                3
            );

            // 添加发光效果
            this.progressBar.lineStyle(2, 0xFFD700, 0.8);
            this.progressBar.strokeRoundedRect(
                width / 2 - 150,
                height / 2 + 80,
                300 * value,
                30,
                3
            );
        });
    }

    /**
     * 初始化游戏系统
     */
    initializeGameSystems() {
        console.log('⚙️ BootScene: 初始化游戏系统...');

        // 初始化存档管理器
        saveManager.cleanupOldSaves();

        // 初始化事件管理器
        eventManager.initialize();

        // 检查游戏状态
        this.checkGameState();

        console.log('✅ BootScene: 游戏系统初始化完成');
    }

    /**
     * 检查游戏状态
     */
    checkGameState() {
        // 检查是否有有效的存档
        const hasSave = saveManager.hasAutoSave();
        if (hasSave) {
            console.log('💾 发现自动存档');
        } else {
            console.log('🆕 新游戏开始');
        }

        // 检查游戏版本
        const currentVersion = GameConfig.save.version;
        console.log(`📋 游戏版本: ${currentVersion}`);

        // 检查系统要求
        this.checkSystemRequirements();
    }

    /**
     * 检查系统要求
     */
    checkSystemRequirements() {
        const canvas = this.game.canvas;
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
            console.warn('⚠️ WebGL不支持，可能无法正常运行游戏');
        } else {
            console.log('✅ WebGL支持正常');
        }

        // 检查存储空间
        try {
            const testKey = 'potion_tavern_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            console.log('✅ 本地存储可用');
        } catch (error) {
            console.warn('⚠️ 本地存储不可用，无法保存游戏进度');
        }

        // 检查音频支持
        const audio = new Audio();
        const canPlayMP3 = audio.canPlayType('audio/mpeg');
        const canPlayOGG = audio.canPlayType('audio/ogg');

        if (canPlayMP3 || canPlayOGG) {
            console.log('✅ 音频支持正常');
        } else {
            console.warn('⚠️ 音频格式不支持');
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const { width, height } = this.cameras.main;

        const errorStyle = {
            fontSize: '20px',
            fontFamily: 'Noto Sans SC',
            color: '#FF4757',
            align: 'center',
            backgroundColor: '#2D1B69',
            padding: { x: 20, y: 10 }
        };

        this.add.text(width / 2, height / 2 + 200, message, errorStyle)
            .setOrigin(0.5);
    }

    /**
     * 场景销毁
     */
    shutdown() {
        console.log('🛑 BootScene: 场景销毁');

        // 清理资源
        if (this.progressBar) {
            this.progressBar.destroy();
        }

        // 移除事件监听器
        this.load.off('progress');
        this.load.off('fileprogress');
        this.load.off('complete');
    }
}

// 导出场景类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BootScene;
}