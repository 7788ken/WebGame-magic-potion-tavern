/**
 * 事件场景
 * 处理随机事件、支线任务和特殊订单
 */

class EventScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EventScene' });

        // 事件状态
        this.currentEvent = null;
        this.eventChoices = [];
        this.eventResult = null;
        this.isProcessing = false;

        // UI元素
        this.uiElements = {};
        this.eventDisplay = null;
        this.choiceButtons = [];

        // 效果
        this.particleEffects = [];
        this.eventAnimations = [];

        // 事件类型
        this.eventTypes = {
            CUSTOMER_ORDER: 'customer_order',
            SPECIAL_VISITOR: 'special_visitor',
            RARE_MATERIAL: 'rare_material',
            TAVERN_TROUBLE: 'tavern_trouble',
            MAGIC_ANOMALY: 'magic_anomaly',
            COMPETITION: 'competition',
            FESTIVAL: 'festival',
            MYSTERIOUS_STRANGER: 'mysterious_stranger'
        };
    }

    init(data) {
        console.log('📋 EventScene: 初始化事件场景');

        // 从数据中获取事件信息
        this.eventData = data || {};
        this.returnScene = this.eventData.returnScene || 'TavernScene';
    }

    create() {
        console.log('📋 EventScene: 创建事件场景');

        // 创建背景
        this.createBackground();

        // 创建UI界面
        this.createUI();

        // 创建事件显示区域
        this.createEventDisplay();

        // 创建选择按钮区域
        this.createChoiceArea();

        // 创建效果系统
        this.createEffectSystem();

        // 显示当前事件
        this.displayCurrentEvent();

        // 设置键盘控制
        this.setupKeyboardControls();

        // 播放事件音效
        this.playEventSound();
    }

    /**
     * 创建背景
     */
    createBackground() {
        const { width, height } = this.cameras.main;

        // 事件背景
        const bg = this.add.image(width / 2, height / 2, 'event_background');
        bg.setDisplaySize(width, height);
        bg.setAlpha(0.7);

        // 添加神秘氛围
        const mysteryAtmosphere = this.add.graphics();
        mysteryAtmosphere.fillGradientStyle(
            0x2D1B69, 0x2D1B69,
            0x1A1A2E, 0x1A1A2E,
            0.4, 0.8
        );
        mysteryAtmosphere.fillRect(0, 0, width, height);

        // 创建事件光源
        this.createEventLighting();
    }

    /**
     * 创建事件光源
     */
    createEventLighting() {
        const { width, height } = this.cameras.main;

        // 中央事件光源
        const eventLight = this.add.pointlight(width / 2, height / 2, 0xFFD700, 400, 0.7, 0.03);

        // 角落光源
        const cornerLights = [
            { x: 100, y: 100, color: 0x00FF7F },
            { x: width - 100, y: 100, color: 0xFF4757 },
            { x: 100, y: height - 100, color: 0x3742FA },
            { x: width - 100, y: height - 100, color: 0xFFA502 }
        ];

        cornerLights.forEach(light => {
            const cornerLight = this.add.pointlight(light.x, light.y, light.color, 150, 0.5, 0.1);
        });
    }

    /**
     * 创建UI界面
     */
    createUI() {
        const { width, height } = this.cameras.main;

        // 顶部标题栏
        this.createTopBar();

        // 左侧事件信息面板
        this.createEventInfoPanel();

        // 右侧奖励预览面板
        this.createRewardPanel();

        // 底部控制面板
        this.createBottomPanel();

        // 事件进度指示器
        this.createEventProgressIndicator();
    }

    /**
     * 创建顶部标题栏
     */
    createTopBar() {
        const { width } = this.cameras.main;

        // 背景条
        const topBar = this.add.graphics();
        topBar.fillStyle(0x2D1B69, 0.9);
        topBar.fillRect(0, 0, width, 60);
        topBar.lineStyle(2, 0xFFD700, 0.8);
        topBar.strokeRect(0, 0, width, 60);

        // 事件标题
        const titleStyle = {
            fontSize: '24px',
            fontFamily: 'ZCOOL KuaiLe',
            color: '#FFD700'
        };

        this.uiElements.eventTitle = this.add.text(width / 2, 30, '神秘事件', titleStyle)
            .setOrigin(0.5);

        // 事件类型
        this.uiElements.eventType = this.add.text(width / 2, 50, '', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC'
        }).setOrigin(0.5);

        // 返回按钮
        this.createBackButton(20, 30);
    }

    /**
     * 创建返回按钮
     */
    createBackButton(x, y) {
        const button = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0xFF4757, 0.8);
        bg.fillRoundedRect(-30, -15, 60, 30, 5);
        bg.lineStyle(1, 0xFFD700, 0.8);
        bg.strokeRoundedRect(-30, -15, 60, 30, 5);

        const text = this.add.text(0, 0, '返回', {
            fontSize: '12px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        button.add([bg, text]);
        button.setInteractive(new Phaser.Geom.Rectangle(-30, -15, 60, 30),
            Phaser.Geom.Rectangle.Contains);

        button.on('pointerdown', () => {
            this.returnToPreviousScene();
        });

        return button;
    }

    /**
     * 创建事件信息面板
     */
    createEventInfoPanel() {
        const panel = this.add.graphics();
        panel.fillStyle(0x2D1B69, 0.8);
        panel.fillRoundedRect(20, 80, 280, 200, 10);
        panel.lineStyle(2, 0xFFD700, 0.8);
        panel.strokeRoundedRect(20, 80, 280, 200, 10);

        // 面板标题
        this.add.text(160, 100, '事件信息', {
            fontSize: '18px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);

        // 事件详情
        this.uiElements.eventDetails = this.add.text(40, 130, '', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            wordWrap: { width: 240 }
        }).setOrigin(0, 0);

        // 事件 rarity
        this.uiElements.eventRarity = this.add.text(160, 250, '', {
            fontSize: '12px',
            fontFamily: 'Noto Sans SC',
            color: '#00FF7F'
        }).setOrigin(0.5);
    }

    /**
     * 创建奖励预览面板
     */
    createRewardPanel() {
        const { width } = this.cameras.main;

        const panel = this.add.graphics();
        panel.fillStyle(0x2D1B69, 0.8);
        panel.fillRoundedRect(width - 300, 80, 280, 200, 10);
        panel.lineStyle(2, 0xFFD700, 0.8);
        panel.strokeRoundedRect(width - 300, 80, 280, 200, 10);

        // 面板标题
        this.add.text(width - 150, 100, '可能奖励', {
            fontSize: '18px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);

        // 奖励列表
        this.uiElements.rewardList = this.add.text(width - 280, 130, '', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            wordWrap: { width: 240 }
        }).setOrigin(0, 0);
    }

    /**
     * 创建事件显示区域
     */
    createEventDisplay() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2 - 50;

        // 事件背景
        const eventBg = this.add.graphics();
        eventBg.fillStyle(0x1A1A2E, 0.9);
        eventBg.fillRoundedRect(centerX - 300, centerY - 150, 600, 300, 15);
        eventBg.lineStyle(3, 0xFFD700, 0.8);
        eventBg.strokeRoundedRect(centerX - 300, centerY - 150, 600, 300, 15);

        // 事件图标
        this.uiElements.eventIcon = this.add.text(centerX, centerY - 100, '', {
            fontSize: '48px'
        }).setOrigin(0.5);

        // 事件标题
        this.uiElements.eventName = this.add.text(centerX, centerY - 50, '', {
            fontSize: '24px',
            fontFamily: 'ZCOOL KuaiLe',
            color: '#FFD700'
        }).setOrigin(0.5);

        // 事件描述
        this.uiElements.eventDescription = this.add.text(centerX, centerY, '', {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5);

        // 事件计时器
        this.uiElements.eventTimer = this.add.text(centerX, centerY + 80, '', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FF4757'
        }).setOrigin(0.5);

        this.eventDisplay = {
            background: eventBg,
            icon: this.uiElements.eventIcon,
            name: this.uiElements.eventName,
            description: this.uiElements.eventDescription,
            timer: this.uiElements.eventTimer
        };
    }

    /**
     * 创建选择按钮区域
     */
    createChoiceArea() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const startY = height - 200;

        // 选择按钮背景
        const choiceBg = this.add.graphics();
        choiceBg.fillStyle(0x2D1B69, 0.7);
        choiceBg.fillRoundedRect(centerX - 350, startY - 20, 700, 140, 10);
        choiceBg.lineStyle(2, 0xFFD700, 0.6);
        choiceBg.strokeRoundedRect(centerX - 350, startY - 20, 700, 140, 10);

        // 选择标题
        this.add.text(centerX, startY - 10, '选择你的行动：', {
            fontSize: '18px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);

        // 创建选择按钮容器
        this.choiceButtons = [];
    }

    /**
     * 创建底部控制面板
     */
    createBottomPanel() {
        const { width, height } = this.cameras.main;

        // 面板背景
        const panel = this.add.graphics();
        panel.fillStyle(0x2D1B69, 0.9);
        panel.fillRect(0, height - 60, width, 60);
        panel.lineStyle(2, 0xFFD700, 0.8);
        panel.strokeRect(0, height - 60, width, 60);

        // 快捷提示
        this.add.text(width / 2, height - 30,
            '快捷键: [1-4]选择选项 [ESC]跳过事件 [SPACE]确认选择',
            {
                fontSize: '14px',
                fontFamily: 'Noto Sans SC',
                color: '#888888'
            }).setOrigin(0.5);
    }

    /**
     * 创建事件进度指示器
     */
    createEventProgressIndicator() {
        const { width } = this.cameras.main;

        // 进度条背景
        const progressBg = this.add.graphics();
        progressBg.fillStyle(0x333333, 0.8);
        progressBg.fillRoundedRect(width / 2 - 150, 70, 300, 10, 5);

        // 进度条
        this.uiElements.eventProgress = this.add.graphics();

        // 进度文本
        this.uiElements.progressText = this.add.text(width / 2, 85, '', {
            fontSize: '12px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC'
        }).setOrigin(0.5);
    }

    /**
     * 创建效果系统
     */
    createEffectSystem() {
        // 成功效果
        this.successEffect = this.add.particles(0, 0, null, {
            speed: { min: 80, max: 150 },
            lifespan: 1200,
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0x00FF7F, 0xFFD700],
            quantity: 15
        });

        // 失败效果
        this.failEffect = this.add.particles(0, 0, null, {
            speed: { min: 40, max: 80 },
            lifespan: 1500,
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: [0xFF4757, 0xFFA502],
            quantity: 8
        });

        // 神秘效果
        this.mysteryEffect = this.add.particles(0, 0, null, {
            speed: { min: 60, max: 120 },
            lifespan: 2000,
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.7, end: 0 },
            tint: [0x3742FA, 0xFF69B4, 0x00FFFF],
            quantity: 10
        });

        this.createEffectTextures();
    }

    /**
     * 创建效果纹理
     */
    createEffectTextures() {
        // 成功粒子 - 老王我修复：用fillCircle替代fillStar，兼容性更好
        const successGraphics = this.add.graphics();
        successGraphics.fillStyle(0x00FF7F);
        successGraphics.fillCircle(5, 5, 5);
        successGraphics.generateTexture('eventSuccessParticle', 10, 10);
        successGraphics.destroy();

        // 失败粒子
        const failGraphics = this.add.graphics();
        failGraphics.fillStyle(0xFF4757);
        failGraphics.fillCircle(4, 4, 4);
        failGraphics.generateTexture('eventFailParticle', 8, 8);
        failGraphics.destroy();

        // 神秘粒子 - 老王我修复：用fillCircle替代fillStar，兼容性更好
        const mysteryGraphics = this.add.graphics();
        mysteryGraphics.fillStyle(0x3742FA);
        mysteryGraphics.fillCircle(4, 4, 4);
        mysteryGraphics.generateTexture('eventMysteryParticle', 8, 8);
        mysteryGraphics.destroy();

        this.successEffect.setTexture('eventSuccessParticle');
        this.failEffect.setTexture('eventFailParticle');
        this.mysteryEffect.setTexture('eventMysteryParticle');

        // 停止所有效果
        this.successEffect.stop();
        this.failEffect.stop();
        this.mysteryEffect.stop();
    }

    /**
     * 显示当前事件
     */
    displayCurrentEvent() {
        // 获取当前事件
        this.currentEvent = this.getCurrentEvent();

        if (!this.currentEvent) {
            this.showNoEventMessage();
            return;
        }

        // 更新UI显示
        this.updateEventDisplay();

        // 创建选择按钮
        this.createChoiceButtons();

        // 开始事件计时器
        this.startEventTimer();

        console.log(`📋 显示事件: ${this.currentEvent.name}`);
    }

    /**
     * 获取当前事件
     */
    getCurrentEvent() {
        // 如果指定了事件ID，使用指定事件
        if (this.eventData.eventId) {
            return this.getEventById(this.eventData.eventId);
        }

        // 否则从事件管理器获取当前激活的事件
        const activeEvents = eventManager.getAvailableEvents();
        if (activeEvents.length > 0) {
            return activeEvents[0];
        }

        // 如果没有激活的事件，生成一个随机事件
        return this.generateRandomEvent();
    }

    /**
     * 根据ID获取事件
     */
    getEventById(eventId) {
        // 这里可以实现事件数据获取逻辑
        const eventDatabase = this.getEventDatabase();
        return eventDatabase[eventId] || this.generateRandomEvent();
    }

    /**
     * 获取事件数据库
     */
    getEventDatabase() {
        return {
            // 客人特殊订单
            'noble_order': {
                id: 'noble_order',
                name: '贵族的委托',
                type: this.eventTypes.CUSTOMER_ORDER,
                icon: '👑',
                rarity: 'rare',
                description: '一位贵族需要定制一批高级魔药，要求在规定时间内完成。',
                choices: [
                    {
                        text: '接受委托',
                        risk: 0.3,
                        rewards: {
                            gold: 500,
                            reputation: 30,
                            materials: ['phoenixFeather', 'dragonScale']
                        },
                        penalties: {
                            reputation: -20,
                            gold: -100
                        }
                    },
                    {
                        text: '婉拒委托',
                        risk: 0,
                        rewards: {
                            reputation: -5
                        }
                    }
                ],
                timeLimit: 45
            },

            // 神秘访客
            'mysterious_wizard': {
                id: 'mysterious_wizard',
                name: '神秘法师',
                type: this.eventTypes.SPECIAL_VISITOR,
                icon: '🧙‍♂️',
                rarity: 'legendary',
                description: '一位神秘的法师来到你的酒馆，他似乎在寻找什么...',
                choices: [
                    {
                        text: '热情招待',
                        risk: 0.2,
                        rewards: {
                            experience: 100,
                            reputation: 25,
                            unlockRecipe: 'magicMasterPotion'
                        }
                    },
                    {
                        text: '谨慎观察',
                        risk: 0.1,
                        rewards: {
                            experience: 50,
                            reputation: 10
                        }
                    },
                    {
                        text: '保持距离',
                        risk: 0,
                        rewards: {
                            reputation: -5
                        }
                    }
                ],
                timeLimit: 60
            },

            // 稀有材料发现
            'rare_material_discovery': {
                id: 'rare_material_discovery',
                name: '稀有材料',
                type: this.eventTypes.RARE_MATERIAL,
                icon: '💎',
                rarity: 'uncommon',
                description: '你的员工在附近发现了稀有材料的踪迹，但要获取它可能需要一些努力。',
                choices: [
                    {
                        text: '派人采集',
                        risk: 0.4,
                        rewards: {
                            materials: ['unicornHorn', 'demonBlood'],
                            gold: -50
                        },
                        penalties: {
                            gold: -100
                        }
                    },
                    {
                        text: '购买信息',
                        risk: 0.1,
                        rewards: {
                            materials: ['phoenixFeather'],
                            gold: -150
                        }
                    },
                    {
                        text: '放弃机会',
                        risk: 0,
                        rewards: {}
                    }
                ],
                timeLimit: 30
            },

            // 酒馆麻烦
            'tavern_trouble': {
                id: 'tavern_trouble',
                name: '酒馆纠纷',
                type: this.eventTypes.TAVERN_TROUBLE,
                icon: '⚔️',
                rarity: 'common',
                description: '两位客人在酒馆中发生了争执，情况可能会升级。',
                choices: [
                    {
                        text: '出面调解',
                        risk: 0.3,
                        rewards: {
                            reputation: 15,
                            experience: 30
                        },
                        penalties: {
                            reputation: -10,
                            gold: -50
                        }
                    },
                    {
                        text: '请守卫处理',
                        risk: 0.1,
                        rewards: {
                            gold: -30
                        }
                    },
                    {
                        text: '置之不理',
                        risk: 0.6,
                        penalties: {
                            reputation: -25,
                            gold: -100
                        }
                    }
                ],
                timeLimit: 25
            },

            // 魔法异常
            'magic_anomaly': {
                id: 'magic_anomaly',
                name: '魔法异常',
                type: this.eventTypes.MAGIC_ANOMALY,
                icon: '🔮',
                rarity: 'rare',
                description: '酒馆中出现了魔法异常现象，需要立即处理。',
                choices: [
                    {
                        text: '调查原因',
                        risk: 0.5,
                        rewards: {
                            experience: 80,
                            materials: ['soulFragment'],
                            unlockRecipe: 'anomalyPotion'
                        },
                        penalties: {
                            reputation: -15,
                            gold: -200
                        }
                    },
                    {
                        text: '寻求法师帮助',
                        risk: 0.1,
                        rewards: {
                            gold: -100,
                            reputation: 10
                        }
                    },
                    {
                        text: '暂时关闭酒馆',
                        risk: 0.2,
                        rewards: {
                            reputation: -30,
                            gold: -150
                        }
                    }
                ],
                timeLimit: 40
            },

            // 竞争对手
            'competitor_challenge': {
                id: 'competitor_challenge',
                name: '竞争对手挑战',
                type: this.eventTypes.COMPETITION,
                icon: '🏆',
                rarity: 'uncommon',
                description: '附近的竞争对手向你发起了魔药制作挑战。',
                choices: [
                    {
                        text: '接受挑战',
                        risk: 0.4,
                        rewards: {
                            reputation: 40,
                            gold: 300,
                            experience: 60
                        },
                        penalties: {
                            reputation: -30,
                            gold: -100
                        }
                    },
                    {
                        text: '拒绝挑战',
                        risk: 0.2,
                        rewards: {
                            reputation: -15
                        }
                    },
                    {
                        text: '提出合作',
                        risk: 0.3,
                        rewards: {
                            reputation: 20,
                            gold: 100
                        }
                    }
                ],
                timeLimit: 35
            },

            // 节日庆典
            'festival_celebration': {
                id: 'festival_celebration',
                name: '节日庆典',
                type: this.eventTypes.FESTIVAL,
                icon: '🎉',
                rarity: 'common',
                description: '城镇正在举行节日庆典，这是提升声誉的好机会。',
                choices: [
                    {
                        text: '积极参与',
                        risk: 0.2,
                        rewards: {
                            reputation: 35,
                            gold: 150,
                            experience: 40
                        },
                        penalties: {
                            gold: -200
                        }
                    },
                    {
                        text: '提供赞助',
                        risk: 0.1,
                        rewards: {
                            reputation: 20,
                            gold: -100
                        }
                    },
                    {
                        text: '正常营业',
                        risk: 0,
                        rewards: {
                            gold: 80
                        }
                    }
                ],
                timeLimit: 50
            }
        };
    }

    /**
     * 生成随机事件
     */
    generateRandomEvent() {
        const eventDatabase = this.getEventDatabase();
        const eventIds = Object.keys(eventDatabase);
        const randomId = eventIds[Math.floor(Math.random() * eventIds.length)];
        return eventDatabase[randomId];
    }

    /**
     * 更新事件显示
     */
    updateEventDisplay() {
        if (!this.currentEvent) return;

        const event = this.currentEvent;

        // 更新标题
        if (this.uiElements.eventTitle) {
            this.uiElements.eventTitle.setText(event.name);
        }

        // 更新类型
        if (this.uiElements.eventType) {
            this.uiElements.eventType.setText(this.getEventTypeName(event.type));
        }

        // 更新图标
        if (this.uiElements.eventIcon) {
            this.uiElements.eventIcon.setText(event.icon);
        }

        // 更新名称
        if (this.uiElements.eventName) {
            this.uiElements.eventName.setText(event.name);
        }

        // 更新描述
        if (this.uiElements.eventDescription) {
            this.uiElements.eventDescription.setText(event.description);
        }

        // 更新稀有度
        if (this.uiElements.eventRarity) {
            this.uiElements.eventRarity.setText(`稀有度: ${this.getRarityName(event.rarity)}`);
        }

        // 更新奖励预览
        this.updateRewardPreview();

        // 更新事件详情
        this.updateEventDetails();
    }

    /**
     * 获取事件类型名称
     */
    getEventTypeName(type) {
        const typeNames = {
            [this.eventTypes.CUSTOMER_ORDER]: '客人订单',
            [this.eventTypes.SPECIAL_VISITOR]: '特殊访客',
            [this.eventTypes.RARE_MATERIAL]: '稀有材料',
            [this.eventTypes.TAVERN_TROUBLE]: '酒馆麻烦',
            [this.eventTypes.MAGIC_ANOMALY]: '魔法异常',
            [this.eventTypes.COMPETITION]: '竞争挑战',
            [this.eventTypes.FESTIVAL]: '节日庆典',
            [this.eventTypes.MYSTERIOUS_STRANGER]: '神秘陌生人'
        };
        return typeNames[type] || '未知事件';
    }

    /**
     * 获取稀有度名称
     */
    getRarityName(rarity) {
        const rarityNames = {
            common: '普通',
            uncommon: '稀有',
            rare: '史诗',
            legendary: '传说'
        };
        return rarityNames[rarity] || '普通';
    }

    /**
     * 更新奖励预览
     */
    updateRewardPreview() {
        if (!this.currentEvent || !this.uiElements.rewardList) return;

        let rewardText = '';

        // 显示最佳选择的奖励
        const bestChoice = this.currentEvent.choices[0];
        if (bestChoice.rewards) {
            if (bestChoice.rewards.gold) {
                rewardText += `💰 金币: +${bestChoice.rewards.gold}\n`;
            }
            if (bestChoice.rewards.reputation) {
                rewardText += `⭐ 声誉: +${bestChoice.rewards.reputation}\n`;
            }
            if (bestChoice.rewards.experience) {
                rewardText += `📈 经验: +${bestChoice.rewards.experience}\n`;
            }
            if (bestChoice.rewards.materials) {
                rewardText += `🌿 材料: ${bestChoice.rewards.materials.length}种\n`;
            }
        }

        this.uiElements.rewardList.setText(rewardText || '奖励未知');
    }

    /**
     * 更新事件详情
     */
    updateEventDetails() {
        if (!this.currentEvent || !this.uiElements.eventDetails) return;

        let detailsText = `${this.currentEvent.description}\n\n`;
        detailsText += `限时: ${this.currentEvent.timeLimit}秒\n`;
        detailsText += `风险: ${this.getRiskDescription(this.currentEvent.choices[0].risk)}`;

        this.uiElements.eventDetails.setText(detailsText);
    }

    /**
     * 获取风险描述
     */
    getRiskDescription(risk) {
        if (risk <= 0.1) return '极低';
        if (risk <= 0.3) return '较低';
        if (risk <= 0.5) return '中等';
        if (risk <= 0.7) return '较高';
        return '极高';
    }

    /**
     * 创建选择按钮
     */
    createChoiceButtons() {
        // 清除旧按钮
        this.clearChoiceButtons();

        if (!this.currentEvent) return;

        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const startY = height - 160;

        this.currentEvent.choices.forEach((choice, index) => {
            const x = centerX + (index - (this.currentEvent.choices.length - 1) / 2) * 160;
            const button = this.createChoiceButton(x, startY, choice, index);
            this.choiceButtons.push(button);
        });
    }

    /**
     * 创建单个选择按钮
     */
    createChoiceButton(x, y, choice, index) {
        const button = this.add.container(x, y);

        // 按钮背景
        const bg = this.add.graphics();
        bg.fillStyle(0x3742FA, 0.8);
        bg.fillRoundedRect(-70, -25, 140, 50, 8);
        bg.lineStyle(2, 0xFFD700, 0.8);
        bg.strokeRoundedRect(-70, -25, 140, 50, 8);

        // 按钮文本
        const text = this.add.text(0, 0, choice.text, {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF',
            align: 'center',
            wordWrap: { width: 120 }
        }).setOrigin(0.5);

        // 风险指示器
        const riskColor = this.getRiskColor(choice.risk);
        const riskIndicator = this.add.circle(50, -15, 5, riskColor);

        button.add([bg, text, riskIndicator]);
        button.setInteractive(new Phaser.Geom.Rectangle(-70, -25, 140, 50),
            Phaser.Geom.Rectangle.Contains);

        // 按钮交互
        button.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scale: 1.05,
                duration: 200
            });

            // 显示选择预览
            this.showChoicePreview(choice);
        });

        button.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 200
            });

            this.hideChoicePreview();
        });

        button.on('pointerdown', () => {
            if (!this.isProcessing) {
                this.selectChoice(index);
            }
        });

        button.choiceData = choice;
        button.bg = bg;
        button.text = text;

        return button;
    }

    /**
     * 获取风险颜色
     */
    getRiskColor(risk) {
        if (risk <= 0.1) return 0x00FF7F; // 绿色
        if (risk <= 0.3) return 0xFFD700; // 黄色
        if (risk <= 0.5) return 0xFFA502; // 橙色
        return 0xFF4757; // 红色
    }

    /**
     * 清除选择按钮
     */
    clearChoiceButtons() {
        this.choiceButtons.forEach(button => {
            if (button.destroy) {
                button.destroy();
            }
        });
        this.choiceButtons = [];
    }

    /**
     * 显示选择预览
     */
    showChoicePreview(choice) {
        // 这里可以实现选择预览逻辑
        const previewText = this.getChoicePreviewText(choice);
        this.showTooltip(previewText, this.input.x, this.input.y - 50);
    }

    /**
     * 隐藏选择预览
     */
    hideChoicePreview() {
        this.hideTooltip();
    }

    /**
     * 获取选择预览文本
     */
    getChoicePreviewText(choice) {
        let text = `风险: ${this.getRiskDescription(choice.risk)}\n`;

        if (choice.rewards) {
            text += '可能获得:\n';
            if (choice.rewards.gold) text += `💰 +${choice.rewards.gold}\n`;
            if (choice.rewards.reputation) text += `⭐ +${choice.rewards.reputation}\n`;
            if (choice.rewards.experience) text += `📈 +${choice.rewards.experience}\n`;
        }

        if (choice.penalties) {
            text += '可能损失:\n';
            if (choice.penalties.gold) text += `💰 ${choice.penalties.gold}\n`;
            if (choice.penalties.reputation) text += `⭐ ${choice.penalties.reputation}\n`;
        }

        return text;
    }

    /**
     * 选择选项
     */
    selectChoice(choiceIndex) {
        if (!this.currentEvent || this.isProcessing) return;

        const choice = this.currentEvent.choices[choiceIndex];
        if (!choice) return;

        this.isProcessing = true;

        console.log(`📋 选择选项: ${choice.text}`);

        // 处理选择结果
        this.processChoiceResult(choice);
    }

    /**
     * 处理选择结果
     */
    processChoiceResult(choice) {
        // 计算成功率
        const success = Math.random() > choice.risk;

        if (success) {
            this.handleChoiceSuccess(choice);
        } else {
            this.handleChoiceFailure(choice);
        }

        // 显示结果
        this.showChoiceResult(success, choice);

        // 触发事件完成
        this.time.delayedCall(3000, () => {
            this.completeEvent(success, choice);
        });
    }

    /**
     * 处理选择成功
     */
    handleChoiceSuccess(choice) {
        if (!choice.rewards) return;

        // 应用奖励
        if (choice.rewards.gold) {
            gameState.addGold(choice.rewards.gold);
        }

        if (choice.rewards.reputation) {
            gameState.addReputation(choice.rewards.reputation);
        }

        if (choice.rewards.experience) {
            gameState.addExperience(choice.rewards.experience);
        }

        if (choice.rewards.materials) {
            choice.rewards.materials.forEach(material => {
                gameState.addMaterial(material, 1);
            });
        }

        if (choice.rewards.unlockRecipe) {
            gameState.unlockRecipe(choice.rewards.unlockRecipe);
        }

        console.log('📋 选择成功，获得奖励:', choice.rewards);
    }

    /**
     * 处理选择失败
     */
    handleChoiceFailure(choice) {
        if (!choice.penalties) return;

        // 应用惩罚
        if (choice.penalties.gold) {
            gameState.addGold(choice.penalties.gold);
        }

        if (choice.penalties.reputation) {
            gameState.addReputation(choice.penalties.reputation);
        }

        console.log('📋 选择失败，受到惩罚:', choice.penalties);
    }

    /**
     * 显示选择结果
     */
    showChoiceResult(success, choice) {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        const resultText = success ? '成功！' : '失败！';
        const resultColor = success ? '#00FF7F' : '#FF4757';

        const resultStyle = {
            fontSize: '32px',
            fontFamily: 'ZCOOL KuaiLe',
            color: resultColor,
            align: 'center',
            stroke: '#2D1B69',
            strokeThickness: 3
        };

        const result = this.add.text(centerX, centerY, resultText, resultStyle)
            .setOrigin(0.5);

        // 结果显示动画
        result.setScale(0);
        this.tweens.add({
            targets: result,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });

        // 显示效果
        if (success) {
            this.successEffect.emitParticleAt(centerX, centerY, 20);
        } else {
            this.failEffect.emitParticleAt(centerX, centerY, 15);
        }

        // 3秒后移除
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: result,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => result.destroy()
            });
        });

        // 播放音效
        const soundKey = success ? 'sfx_success' : 'sfx_fail';
        GameConfig.audio.playSafe(this, soundKey, { volume: 0.6 });
    }

    /**
     * 完成事件
     */
    completeEvent(success, choice) {
        // 记录事件结果
        if (this.currentEvent) {
            eventManager.recordEventResult(this.currentEvent.id, success, choice);
        }

        // 触发事件完成事件
        eventManager.triggerEvent('eventCompleted', {
            event: this.currentEvent,
            success: success,
            choice: choice,
            returnScene: this.returnScene
        });

        // 返回上一个场景
        this.returnToPreviousScene();
    }

    /**
     * 开始事件计时器
     */
    startEventTimer() {
        if (!this.currentEvent) return;

        const timeLimit = this.currentEvent.timeLimit * 1000; // 转换为毫秒
        const startTime = Date.now();

        this.eventTimer = this.time.addEvent({
            delay: 100, // 每100ms更新一次
            callback: () => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, timeLimit - elapsed);
                const progress = elapsed / timeLimit;

                this.updateEventTimer(remaining, progress);

                if (remaining <= 0) {
                    this.handleEventTimeout();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    /**
     * 更新事件计时器
     */
    updateEventTimer(remaining, progress) {
        // 更新计时器文本
        if (this.uiElements.eventTimer) {
            const seconds = Math.ceil(remaining / 1000);
            this.uiElements.eventTimer.setText(`剩余时间: ${seconds}秒`);

            // 时间不足时变红
            if (seconds <= 10) {
                this.uiElements.eventTimer.setColor('#FF4757');
            } else if (seconds <= 20) {
                this.uiElements.eventTimer.setColor('#FFA502');
            }
        }

        // 更新进度条
        if (this.uiElements.eventProgress) {
            this.uiElements.eventProgress.clear();
            this.uiElements.eventProgress.fillStyle(0x00FF7F, 0.8);
            this.uiElements.eventProgress.fillRoundedRect(
                this.cameras.main.width / 2 - 150,
                70,
                300 * (1 - progress),
                10,
                5
            );
        }
    }

    /**
     * 处理事件超时
     */
    handleEventTimeout() {
        if (this.eventTimer) {
            this.eventTimer.destroy();
        }

        // 自动选择第一个选项
        if (this.currentEvent && this.currentEvent.choices.length > 0) {
            this.selectChoice(0);
        }
    }

    /**
     * 显示无事件消息
     */
    showNoEventMessage() {
        const { width, height } = this.cameras.main;

        const messageStyle = {
            fontSize: '24px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            align: 'center',
            backgroundColor: '#2D1B69',
            padding: { x: 30, y: 20 }
        };

        const message = this.add.text(width / 2, height / 2,
            '当前没有活跃的事件\n点击返回继续游戏', messageStyle)
            .setOrigin(0.5);

        // 3秒后自动返回
        this.time.delayedCall(3000, () => {
            this.returnToPreviousScene();
        });
    }

    /**
     * 显示工具提示
     */
    showTooltip(text, x, y) {
        if (this.tooltip) {
            this.tooltip.destroy();
        }

        const tooltipStyle = {
            fontSize: '12px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF',
            backgroundColor: '#2D1B69',
            padding: { x: 10, y: 5 }
        };

        this.tooltip = this.add.text(x, y, text, tooltipStyle)
            .setOrigin(0.5, 1);
    }

    /**
     * 隐藏工具提示
     */
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }
    }

    /**
     * 播放事件音效
     */
    playEventSound() {
        if (!this.currentEvent) return;

        let soundKey = 'sfx_notification';

        // 根据事件类型选择音效
        switch (this.currentEvent.type) {
            case this.eventTypes.CUSTOMER_ORDER:
                soundKey = 'sfx_notification';
                break;
            case this.eventTypes.SPECIAL_VISITOR:
                soundKey = 'sfx_notification';
                break;
            case this.eventTypes.RARE_MATERIAL:
                soundKey = 'sfx_success';
                break;
            case this.eventTypes.TAVERN_TROUBLE:
                soundKey = 'sfx_fail';
                break;
            case this.eventTypes.MAGIC_ANOMALY:
                soundKey = 'sfx_notification';
                break;
            case this.eventTypes.COMPETITION:
                soundKey = 'sfx_notification';
                break;
            case this.eventTypes.FESTIVAL:
                soundKey = 'sfx_success';
                break;
            default:
                soundKey = 'sfx_notification';
        }

        GameConfig.audio.playSafe(this, soundKey, { volume: 0.5 });
    }

    /**
     * 设置键盘控制
     */
    setupKeyboardControls() {
        // 数字键选择选项
        for (let i = 1; i <= 4; i++) {
            this.input.keyboard.on(`keydown-${i}`, () => {
                this.selectChoice(i - 1);
            });
        }

        // ESC键跳过事件
        this.input.keyboard.on('keydown-ESC', () => {
            this.skipEvent();
        });

        // 空格键确认选择
        this.input.keyboard.on('keydown-SPACE', () => {
            // 如果有选中的选项，确认选择
            // 这里可以实现高亮选择逻辑
        });
    }

    /**
     * 跳过事件
     */
    skipEvent() {
        if (this.isProcessing) return;

        this.showConfirmDialog(
            '确定要跳过这个事件吗？跳过将视为放弃机会。',
            () => {
                this.completeEvent(false, { text: '跳过事件', risk: 0 });
            },
            () => {
                // 取消跳过
            }
        );
    }

    /**
     * 显示确认对话框
     */
    showConfirmDialog(message, onConfirm, onCancel) {
        const { width, height } = this.cameras.main;

        // 对话框背景
        const dialogBg = this.add.graphics();
        dialogBg.fillStyle(0x000000, 0.7);
        dialogBg.fillRect(0, 0, width, height);

        // 对话框
        const dialogStyle = {
            fontSize: '18px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            align: 'center',
            backgroundColor: '#2D1B69',
            padding: { x: 30, y: 20 }
        };

        const dialog = this.add.text(width / 2, height / 2 - 50, message, dialogStyle)
            .setOrigin(0.5);

        // 确认按钮
        const confirmButton = this.createMenuButton(
            width / 2 - 80, height / 2 + 30,
            '✅ 确认',
            () => {
                dialogBg.destroy();
                dialog.destroy();
                confirmButton.container.destroy();
                cancelButton.container.destroy();
                onConfirm();
            }
        );

        // 取消按钮
        const cancelButton = this.createMenuButton(
            width / 2 + 80, height / 2 + 30,
            '❌ 取消',
            () => {
                dialogBg.destroy();
                dialog.destroy();
                confirmButton.container.destroy();
                cancelButton.container.destroy();
                onCancel();
            }
        );
    }

    /**
     * 创建菜单按钮
     */
    createMenuButton(x, y, text, onClick) {
        const button = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x3742FA, 0.8);
        bg.fillRoundedRect(-35, -15, 70, 30, 5);
        bg.lineStyle(1, 0xFFD700, 0.8);
        bg.strokeRoundedRect(-35, -15, 70, 30, 5);

        const buttonText = this.add.text(0, 0, text, {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        button.add([bg, buttonText]);
        button.setInteractive(new Phaser.Geom.Rectangle(-35, -15, 70, 30),
            Phaser.Geom.Rectangle.Contains);

        button.on('pointerdown', onClick);

        return {
            container: button,
            background: bg,
            text: buttonText
        };
    }

    /**
     * 返回上一个场景
     */
    returnToPreviousScene() {
        // 停止计时器
        if (this.eventTimer) {
            this.eventTimer.destroy();
        }

        // 清理资源
        this.clearChoiceButtons();
        this.hideTooltip();

        // 返回场景
        this.scene.stop();
        this.scene.resume(this.returnScene);
    }

    /**
     * 更新函数
     */
    update(time, delta) {
        // 更新效果
        this.updateEffects(delta);

        // 更新动画
        this.updateAnimations(delta);
    }

    /**
     * 更新效果
     */
    updateEffects(delta) {
        // 更新各种视觉效果
    }

    /**
     * 更新动画
     */
    updateAnimations(delta) {
        // 更新动画状态
    }

    /**
     * 场景销毁
     */
    shutdown() {
        console.log('🛑 EventScene: 场景销毁');

        // 停止计时器
        if (this.eventTimer) {
            this.eventTimer.destroy();
        }

        // 停止所有效果
        if (this.successEffect) this.successEffect.destroy();
        if (this.failEffect) this.failEffect.destroy();
        if (this.mysteryEffect) this.mysteryEffect.destroy();

        // 清理按钮
        this.clearChoiceButtons();

        // 清理提示
        this.hideTooltip();

        // 清理UI
        Object.values(this.uiElements).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.uiElements = {};
    }
}

// 导出场景类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventScene;
}
