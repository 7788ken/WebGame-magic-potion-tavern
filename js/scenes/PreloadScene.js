/**
 * 预加载场景
 * 加载所有游戏资源和数据
 */

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });

        this.loadingProgress = 0;
        this.loadingText = null;
        this.progressBar = null;
        this.loadingMessages = [
            '正在加载魔法纹理...',
            '正在召唤精灵助手...',
            '正在准备坩埚材料...',
            '正在调制基础药水...',
            '正在训练对战AI...',
            '正在装饰酒馆大厅...',
            '正在准备客人名单...',
            '正在校准魔法阵...',
            '正在检查库存系统...',
            '正在初始化经济系统...',
            '正在加载音效文件...',
            '正在配置用户界面...',
            '正在测试游戏平衡...',
            '正在准备随机事件...',
            '魔药酒馆即将开业！'
        ];

        this.currentMessageIndex = 0;
    }

    preload() {
        console.log('📦 PreloadScene: 开始加载游戏资源...');

        this.createLoadingUI();
        this.loadGameAssets();
        this.setupLoadingEvents();
    }

    create() {
        console.log('✅ PreloadScene: 资源加载完成');

        // 初始化游戏管理器
        this.initializeManagers();

        // 创建音频管理器
        this.setupAudioManager();

        // 跳转到主菜单
        this.time.delayedCall(1000, () => {
            this.scene.start('MenuScene');
        });
    }

    /**
     * 创建加载界面
     */
    createLoadingUI() {
        const { width, height } = this.cameras.main;

        // 背景
        const bg = this.add.image(width / 2, height / 2, 'background');
        bg.setDisplaySize(width, height);
        bg.setAlpha(0.3);

        // 标题
        const titleStyle = {
            fontSize: '36px',
            fontFamily: 'ZCOOL KuaiLe',
            color: '#FFD700',
            align: 'center',
            stroke: '#2D1B69',
            strokeThickness: 2
        };

        this.add.text(width / 2, 100, '资源加载中', titleStyle)
            .setOrigin(0.5);

        // 进度条背景
        const progressBg = this.add.graphics();
        progressBg.fillStyle(0x000000, 0.7);
        progressBg.fillRoundedRect(width / 2 - 205, height / 2 - 25, 410, 50, 10);

        progressBg.fillStyle(0x2D1B69, 0.5);
        progressBg.fillRoundedRect(width / 2 - 200, height / 2 - 20, 400, 40, 8);

        // 进度条
        this.progressBar = this.add.graphics();

        // 加载文本
        const loadingStyle = {
            fontSize: '18px',
            fontFamily: 'Noto Sans SC',
            color: '#00FF7F',
            align: 'center'
        };

        this.loadingText = this.add.text(width / 2, height / 2 - 60, '', loadingStyle)
            .setOrigin(0.5);

        // 文件信息
        const fileStyle = {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            align: 'center'
        };

        this.fileText = this.add.text(width / 2, height / 2 + 40, '', fileStyle)
            .setOrigin(0.5);

        // 百分比
        this.percentText = this.add.text(width / 2, height / 2, '0%', {
            fontSize: '24px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700',
            align: 'center'
        }).setOrigin(0.5);

        // 添加装饰元素
        this.createDecorativeElements();
    }

    /**
     * 创建装饰元素
     */
    createDecorativeElements() {
        const { width, height } = this.cameras.main;

        // 创建魔法阵装饰
        const magicCircle = this.add.graphics();
        const centerX = width / 2;
        const centerY = height / 2;

        // 外圈
        magicCircle.lineStyle(2, 0xFFD700, 0.6);
        magicCircle.strokeCircle(centerX, centerY, 180);

        // 中圈
        magicCircle.lineStyle(1, 0x00FF7F, 0.4);
        magicCircle.strokeCircle(centerX, centerY, 160);

        // 内圈
        magicCircle.lineStyle(1, 0x3742FA, 0.3);
        magicCircle.strokeCircle(centerX, centerY, 140);

        // 装饰符文
        const runePositions = [
            { x: centerX - 150, y: centerY - 150 },
            { x: centerX + 150, y: centerY - 150 },
            { x: centerX - 150, y: centerY + 150 },
            { x: centerX + 150, y: centerY + 150 }
        ];

        runePositions.forEach((pos, index) => {
            const rune = this.add.text(pos.x, pos.y, ['☆', '◇', '○', '△'][index], {
                fontSize: '24px',
                color: '#FFD700',
                alpha: 0.6
            }).setOrigin(0.5);

            // 添加旋转动画
            this.tweens.add({
                targets: rune,
                rotation: Math.PI * 2,
                duration: 10000 + index * 1000,
                repeat: -1,
                ease: 'Linear'
            });
        });

        // 创建粒子效果
        this.createLoadingParticles();
    }

    /**
     * 创建加载粒子效果
     */
    createLoadingParticles() {
        const { width, height } = this.cameras.main;

        // 创建粒子纹理
        const particleGraphics = this.add.graphics();
        particleGraphics.fillStyle(0xFFD700);
        particleGraphics.fillCircle(3, 3, 3);
        particleGraphics.generateTexture('loadingParticle', 6, 6);
        particleGraphics.destroy();

        // 创建粒子发射器
        const particles = this.add.particles(0, 0, 'loadingParticle', {
            x: { min: 0, max: width },
            y: { min: 0, max: height / 2 - 100 },
            lifespan: 3000,
            speed: { min: 30, max: 60 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: [0xFFD700, 0x00FF7F, 0x3742FA],
            frequency: 300,
            quantity: 1,
            gravityY: -20
        });
    }

    /**
     * 加载游戏资源
     */
    loadGameAssets() {
        console.log('📦 开始加载游戏资源...');

        // 加载图像资源
        this.loadImages();

        // 加载精灵图
        this.loadSprites();

        // 加载音频资源
        this.loadAudio();

        // 加载数据文件
        this.loadDataFiles();

        // 加载字体
        this.loadFonts();

        // 加载其他资源
        this.loadOtherAssets();
    }

    /**
     * 加载图像资源
     */
    loadImages() {
        // 背景图片
        this.load.image('tavern_interior', 'assets/images/tavern_interior.jpg');
        this.load.image('brewing_background', 'assets/images/brewing_background.jpg');
        this.load.image('battle_background', 'assets/images/battle_background.jpg');
        this.load.image('menu_background', 'assets/images/menu_background.jpg');

        // UI元素
        this.load.image('ui_panel', 'assets/ui/panel.png');
        this.load.image('ui_window', 'assets/ui/window.png');
        this.load.image('ui_button', 'assets/ui/button.png');
        this.load.image('ui_button_hover', 'assets/ui/button_hover.png');
        this.load.image('ui_button_pressed', 'assets/ui/button_pressed.png');
        this.load.image('ui_progress_bar', 'assets/ui/progress_bar.png');
        this.load.image('ui_progress_fill', 'assets/ui/progress_fill.png');

        // 图标
        this.load.image('icon_gold', 'assets/icons/gold.png');
        this.load.image('icon_reputation', 'assets/icons/reputation.png');
        this.load.image('icon_materials', 'assets/icons/materials.png');
        this.load.image('icon_customers', 'assets/icons/customers.png');
        this.load.image('icon_staff', 'assets/icons/staff.png');
        this.load.image('icon_time', 'assets/icons/time.png');
        this.load.image('icon_battle', 'assets/icons/battle.png');
        this.load.image('icon_potion', 'assets/icons/potion.png');

        // 材料图标
        this.load.image('material_moon_grass', 'assets/materials/moon_grass.png');
        this.load.image('material_fire_grass', 'assets/materials/fire_grass.png');
        this.load.image('material_dew_drop', 'assets/materials/dew_drop.png');
        this.load.image('material_spring_water', 'assets/materials/spring_water.png');
        this.load.image('material_dragon_scale', 'assets/materials/dragon_scale.png');
        this.load.image('material_phoenix_feather', 'assets/materials/phoenix_feather.png');
        this.load.image('material_demon_blood', 'assets/materials/demon_blood.png');
        this.load.image('material_unicorn_horn', 'assets/materials/unicorn_horn.png');
        this.load.image('material_time_sand', 'assets/materials/time_sand.png');
        this.load.image('material_soul_fragment', 'assets/materials/soul_fragment.png');
        this.load.image('material_eternal_flower', 'assets/materials/eternal_flower.png');
    }

    /**
     * 加载精灵图
     */
    loadSprites() {
        // 角色精灵
        this.load.spritesheet('character_player', 'assets/sprites/character_player.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.spritesheet('character_npc', 'assets/sprites/character_npc.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.spritesheet('character_enemy', 'assets/sprites/character_enemy.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // 魔药精灵
        this.load.spritesheet('potions', 'assets/sprites/potions.png', {
            frameWidth: 32,
            frameHeight: 48
        });

        // 效果精灵
        this.load.spritesheet('effects', 'assets/sprites/effects.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // 卡牌精灵
        this.load.spritesheet('cards', 'assets/sprites/cards.png', {
            frameWidth: 80,
            frameHeight: 120
        });

        // 粒子效果
        this.load.spritesheet('particles', 'assets/sprites/particles.png', {
            frameWidth: 16,
            frameHeight: 16
        });
    }

    /**
     * 加载音频资源
     */
    loadAudio() {
        // 背景音乐
        this.load.audio('bgm_main', ['assets/audio/main_theme.mp3', 'assets/audio/main_theme.ogg']);
        this.load.audio('bgm_tavern', ['assets/audio/tavern_theme.mp3', 'assets/audio/tavern_theme.ogg']);
        this.load.audio('bgm_brewing', ['assets/audio/brewing_theme.mp3', 'assets/audio/brewing_theme.ogg']);
        this.load.audio('bgm_battle', ['assets/audio/battle_theme.mp3', 'assets/audio/battle_theme.ogg']);
        this.load.audio('bgm_victory', ['assets/audio/victory_theme.mp3', 'assets/audio/victory_theme.ogg']);

        // 音效
        this.load.audio('sfx_click', ['assets/audio/click.mp3', 'assets/audio/click.ogg']);
        this.load.audio('sfx_hover', ['assets/audio/hover.mp3', 'assets/audio/hover.ogg']);
        this.load.audio('sfx_success', ['assets/audio/success.mp3', 'assets/audio/success.ogg']);
        this.load.audio('sfx_fail', ['assets/audio/fail.mp3', 'assets/audio/fail.ogg']);
        this.load.audio('sfx_potion_create', ['assets/audio/potion_create.mp3', 'assets/audio/potion_create.ogg']);
        this.load.audio('sfx_potion_use', ['assets/audio/potion_use.mp3', 'assets/audio/potion_use.ogg']);
        this.load.audio('sfx_card_draw', ['assets/audio/card_draw.mp3', 'assets/audio/card_draw.ogg']);
        this.load.audio('sfx_card_play', ['assets/audio/card_play.mp3', 'assets/audio/card_play.ogg']);
        this.load.audio('sfx_coin', ['assets/audio/coin.mp3', 'assets/audio/coin.ogg']);
        this.load.audio('sfx_level_up', ['assets/audio/level_up.mp3', 'assets/audio/level_up.ogg']);
        this.load.audio('sfx_notification', ['assets/audio/notification.mp3', 'assets/audio/notification.ogg']);
    }

    /**
     * 加载数据文件
     */
    loadDataFiles() {
        // 魔药配方数据
        this.load.json('potion_recipes', 'assets/data/potion_recipes.json');

        // 卡牌数据
        this.load.json('card_definitions', 'assets/data/card_definitions.json');

        // 客人类型数据
        this.load.json('customer_types', 'assets/data/customer_types.json');

        // 事件数据
        this.load.json('random_events', 'assets/data/random_events.json');

        // 对话数据
        this.load.json('dialogues', 'assets/data/dialogues.json');

        // 成就数据
        this.load.json('achievements', 'assets/data/achievements.json');
    }

    /**
     * 加载字体
     */
    loadFonts() {
        // 这里可以加载自定义字体文件
        // this.load.bitmapFont('custom_font', 'assets/fonts/custom_font.png', 'assets/fonts/custom_font.xml');
    }

    /**
     * 加载其他资源
     */
    loadOtherAssets() {
        // 配置文件
        this.load.json('game_config', 'assets/config/game_config.json');

        // 本地化文件
        this.load.json('localization', 'assets/localization/zh_cn.json');

        // 动画数据
        this.load.json('animations', 'assets/animations/animations.json');
    }

    /**
     * 设置加载事件
     */
    setupLoadingEvents() {
        // 监听加载进度
        this.load.on('progress', (value) => {
            this.updateLoadingProgress(value);
        });

        this.load.on('fileprogress', (file) => {
            this.updateFileInfo(file);
        });

        this.load.on('complete', () => {
            this.onLoadingComplete();
        });

        // 错误处理
        this.load.on('loaderror', (file) => {
            console.error('❌ 资源加载失败:', file);
            this.handleLoadingError(file);
        });
    }

    /**
     * 更新加载进度
     */
    updateLoadingProgress(value) {
        this.loadingProgress = value;
        const percent = Math.floor(value * 100);

        // 更新百分比文本
        if (this.percentText) {
            this.percentText.setText(percent + '%');
        }

        // 更新进度条
        if (this.progressBar) {
            this.progressBar.clear();

            // 进度条填充
            this.progressBar.fillStyle(0x00FF7F, 1);
            this.progressBar.fillRoundedRect(
                this.cameras.main.width / 2 - 200,
                this.cameras.main.height / 2 - 20,
                400 * value,
                40,
                8
            );

            // 进度条边框
            this.progressBar.lineStyle(2, 0xFFD700, 0.8);
            this.progressBar.strokeRoundedRect(
                this.cameras.main.width / 2 - 200,
                this.cameras.main.height / 2 - 20,
                400 * value,
                40,
                8
            );
        }

        // 更新加载消息
        if (this.loadingText) {
            const messageIndex = Math.floor(value * this.loadingMessages.length);
            const message = this.loadingMessages[Math.min(messageIndex, this.loadingMessages.length - 1)];
            this.loadingText.setText(message);
        }
    }

    /**
     * 更新文件信息
     */
    updateFileInfo(file) {
        if (this.fileText) {
            this.fileText.setText(`正在加载: ${file.key}`);
        }
    }

    /**
     * 加载完成处理
     */
    onLoadingComplete() {
        console.log('✅ PreloadScene: 所有资源加载完成');

        // 清理加载界面
        if (this.loadingText) this.loadingText.destroy();
        if (this.fileText) this.fileText.destroy();
        if (this.percentText) this.percentText.destroy();
        if (this.progressBar) this.progressBar.destroy();

        // 播放完成音效
        this.sound.play('sfx_success', { volume: 0.5 });
    }

    /**
     * 处理加载错误
     */
    handleLoadingError(file) {
        console.error('❌ 资源加载失败:', file);

        // 显示错误信息
        const { width, height } = this.cameras.main;

        const errorText = this.add.text(width / 2, height - 100,
            `加载失败: ${file.key}`, {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#FF4757',
            align: 'center'
        }).setOrigin(0.5);

        // 3秒后移除错误信息
        this.time.delayedCall(3000, () => {
            errorText.destroy();
        });
    }

    /**
     * 初始化游戏管理器
     */
    initializeManagers() {
        console.log('⚙️ PreloadScene: 初始化游戏管理器...');

        // 初始化客人管理器
        if (typeof CustomerManager !== 'undefined') {
            window.customerManager = new CustomerManager();
            customerManager.initialize();
        }

        // 初始化员工管理器
        if (typeof StaffManager !== 'undefined') {
            window.staffManager = new StaffManager();
            staffManager.initialize();
        }

        // 初始化魔药管理器
        if (typeof PotionManager !== 'undefined') {
            window.potionManager = new PotionManager();
        }

        // 初始化卡牌管理器
        if (typeof CardManager !== 'undefined') {
            window.cardManager = new CardManager();
        }

        console.log('✅ PreloadScene: 管理器初始化完成');
    }

    /**
     * 设置音频管理器
     */
    setupAudioManager() {
        console.log('🔊 PreloadScene: 设置音频管理器...');

        // 设置音频配置
        this.sound.volume = 0.7;

        // 预加载背景音乐
        if (this.sound.get('bgm_main')) {
            this.sound.play('bgm_main', {
                loop: true,
                volume: 0.3
            });
        }

        console.log('✅ PreloadScene: 音频管理器设置完成');
    }

    /**
     * 场景销毁
     */
    shutdown() {
        console.log('🛑 PreloadScene: 场景销毁');

        // 移除事件监听器
        this.load.off('progress');
        this.load.off('fileprogress');
        this.load.off('complete');
        this.load.off('loaderror');

        // 清理资源
        if (this.loadingText) this.loadingText.destroy();
        if (this.fileText) this.fileText.destroy();
        if (this.percentText) this.percentText.destroy();
        if (this.progressBar) this.progressBar.destroy();
    }
}

// 导出场景类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreloadScene;
}