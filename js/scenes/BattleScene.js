/**
 * 对战场景
 * 魔药对战卡牌游戏，包含回合制战斗、卡牌策略、骗子机制等
 */

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });

        // 游戏状态
        this.battleState = 'setup'; // setup, playing, finished
        this.currentTurn = 1;
        this.currentPlayer = 0; // 0 for player, 1 for opponent
        this.phase = 'draw'; // draw, main, battle, end

        // 玩家数据
        this.players = [];
        this.playerDeck = [];
        this.opponentDeck = [];

        // UI元素
        this.uiElements = {};
        this.cardSprites = [];
        this.handDisplays = [];
        this.battleEffects = [];

        // 战斗数据
        this.battleLog = [];
        this.turnTimer = null;
        this.turnTimeLimit = GameConfig.battle.turnTimeLimit;
        this.timeRemaining = this.turnTimeLimit;

        // 特殊机制
        this.bluffMode = false;
        this.detectMode = false;

        // 结果
        this.battleResult = null;
        this.rewards = {};
    }

    create() {
        console.log('⚔️ BattleScene: 创建对战场景');

        // 创建背景
        this.createBackground();

        // 创建UI界面
        this.createUI();

        // 创建战斗区域
        this.createBattleArea();

        // 创建手牌区域
        this.createHandAreas();

        // 创建卡牌系统
        this.createCardSystem();

        // 创建战斗控制
        this.createBattleControls();

        // 创建效果系统
        this.createEffectSystem();

        // 初始化战斗
        this.initializeBattle();

        // 设置键盘控制
        this.setupKeyboardControls();

        // 显示战斗开始信息
        this.showBattleStart();
    }

    /**
     * 创建背景
     */
    createBackground() {
        const { width, height } = this.cameras.main;

        // 战斗背景
        const bg = this.add.image(width / 2, height / 2, 'battle_background');
        bg.setDisplaySize(width, height);
        bg.setAlpha(0.7);

        // 添加战斗氛围
        const battleAtmosphere = this.add.graphics();
        battleAtmosphere.fillGradientStyle(
            0x8B0000, 0x8B0000,
            0x2D1B69, 0x2D1B69,
            0.2, 0.4
        );
        battleAtmosphere.fillRect(0, 0, width, height);

        // 创建战斗光源
        this.createBattleLighting();
    }

    /**
     * 创建战斗光源
     */
    createBattleLighting() {
        const { width, height } = this.cameras.main;

        // 左侧玩家光源
        const playerLight = this.add.pointlight(width / 4, height / 2, 0x00FF7F, 300, 0.6);
        playerLight.setAttenuation(0.05);

        // 右侧对手光源
        const opponentLight = this.add.pointlight(3 * width / 4, height / 2, 0xFF4757, 300, 0.6);
        opponentLight.setAttenuation(0.05);

        // 中央战斗区域光源
        const battleLight = this.add.pointlight(width / 2, height / 2, 0xFFD700, 200, 0.8);
        battleLight.setAttenuation(0.1);
    }

    /**
     * 创建UI界面
     */
    createUI() {
        const { width, height } = this.cameras.main;

        // 顶部信息栏
        this.createTopBar();

        // 左侧玩家面板
        this.createPlayerPanel(0);

        // 右侧对手面板
        this.createPlayerPanel(1);

        // 中央战斗信息
        this.createBattleInfoPanel();

        // 底部控制面板
        this.createBottomPanel();

        // 回合指示器
        this.createTurnIndicator();

        // 日志面板
        this.createLogPanel();
    }

    /**
     * 创建顶部信息栏
     */
    createTopBar() {
        const { width } = this.cameras.main;

        // 背景条
        const topBar = this.add.graphics();
        topBar.fillStyle(0x2D1B69, 0.9);
        topBar.fillRect(0, 0, width, 60);
        topBar.lineStyle(2, 0xFFD700, 0.8);
        topBar.strokeRect(0, 0, width, 60);

        // 战斗标题
        const titleStyle = {
            fontSize: '24px',
            fontFamily: 'ZCOOL KuaiLe',
            color: '#FFD700'
        };

        this.add.text(width / 2, 30, '魔药对战', titleStyle)
            .setOrigin(0.5);

        // 战斗阶段
        this.uiElements.phaseText = this.add.text(width / 2, 50, '', {
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

        const text = this.add.text(0, 0, '退出', {
            fontSize: '12px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        button.add([bg, text]);
        button.setInteractive(new Phaser.Geom.Rectangle(-30, -15, 60, 30),
            Phaser.Geom.Rectangle.Contains);

        button.on('pointerdown', () => {
            this.showExitConfirm();
        });

        return button;
    }

    /**
     * 创建玩家面板
     */
    createPlayerPanel(playerIndex) {
        const { width, height } = this.cameras.main;
        const isPlayer = playerIndex === 0;
        const x = isPlayer ? 150 : width - 150;
        const y = 120;

        // 面板背景
        const panel = this.add.graphics();
        panel.fillStyle(isPlayer ? 0x00FF7F : 0xFF4757, 0.2);
        panel.fillRoundedRect(x - 120, y - 40, 240, 400, 10);
        panel.lineStyle(2, 0xFFD700, 0.8);
        panel.strokeRoundedRect(x - 120, y - 40, 240, 400, 10);

        // 玩家名称
        const nameStyle = {
            fontSize: '18px',
            fontFamily: 'Noto Sans SC',
            color: isPlayer ? '#00FF7F' : '#FF4757'
        };

        this.uiElements[`player${playerIndex}Name`] = this.add.text(x, y, '', nameStyle)
            .setOrigin(0.5);

        // 生命值显示
        this.createHealthBar(x, y + 40, playerIndex);

        // 手牌数量
        this.uiElements[`player${playerIndex}HandCount`] = this.add.text(x, y + 80, '手牌: 0', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC'
        }).setOrigin(0.5);

        // 材料数量
        this.uiElements[`player${playerIndex}Materials`] = this.add.text(x, y + 100, '材料: 0', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC'
        }).setOrigin(0.5);

        // 状态效果
        this.uiElements[`player${playerIndex}Effects`] = this.add.text(x, y + 120, '', {
            fontSize: '12px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);
    }

    /**
     * 创建生命值条
     */
    createHealthBar(x, y, playerIndex) {
        // 生命值背景
        const healthBg = this.add.graphics();
        healthBg.fillStyle(0x333333, 0.8);
        healthBg.fillRoundedRect(x - 80, y - 8, 160, 16, 8);

        // 生命值条
        this.uiElements[`player${playerIndex}HealthBar`] = this.add.graphics();

        // 生命值文本
        this.uiElements[`player${playerIndex}HealthText`] = this.add.text(x, y, '100/100', {
            fontSize: '12px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF'
        }).setOrigin(0.5);
    }

    /**
     * 创建战斗信息面板
     */
    createBattleInfoPanel() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const y = 120;

        // 面板背景
        const panel = this.add.graphics();
        panel.fillStyle(0x2D1B69, 0.8);
        panel.fillRoundedRect(centerX - 150, y - 40, 300, 200, 10);
        panel.lineStyle(2, 0xFFD700, 0.8);
        panel.strokeRoundedRect(centerX - 150, y - 40, 300, 200, 10);

        // 回合信息
        this.uiElements.turnInfo = this.add.text(centerX, y, '第 1 回合', {
            fontSize: '18px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);

        // 当前玩家指示
        this.uiElements.currentPlayer = this.add.text(centerX, y + 30, '你的回合', {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#00FF7F'
        }).setOrigin(0.5);

        // 计时器
        this.uiElements.timerText = this.add.text(centerX, y + 60, '30:00', {
            fontSize: '24px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);

        // 行动按钮
        this.createActionButtons(centerX, y + 100);
    }

    /**
     * 创建行动按钮
     */
    createActionButtons(x, y) {
        const actions = [
            { text: '抽卡', key: 'draw', color: 0x00FF7F },
            { text: '结束回合', key: 'end', color: 0xFFD700 },
            { text: '虚张声势', key: 'bluff', color: 0xFFA502 }
        ];

        actions.forEach((action, index) => {
            const buttonX = x + (index - 1) * 100;
            this.createActionButton(buttonX, y, action);
        });
    }

    /**
     * 创建行动按钮
     */
    createActionButton(x, y, action) {
        const button = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(action.color, 0.8);
        bg.fillRoundedRect(-35, -15, 70, 30, 5);
        bg.lineStyle(1, 0xFFD700, 0.8);
        bg.strokeRoundedRect(-35, -15, 70, 30, 5);

        const text = this.add.text(0, 0, action.text, {
            fontSize: '12px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        button.add([bg, text]);
        button.setInteractive(new Phaser.Geom.Rectangle(-35, -15, 70, 30),
            Phaser.Geom.Rectangle.Contains);

        button.on('pointerdown', () => {
            this.handleAction(action.key);
        });

        this.uiElements[`${action.key}Button`] = button;

        return button;
    }

    /**
     * 创建底部面板
     */
    createBottomPanel() {
        const { width, height } = this.cameras.main;

        // 面板背景
        const panel = this.add.graphics();
        panel.fillStyle(0x2D1B69, 0.9);
        panel.fillRect(0, height - 100, width, 100);
        panel.lineStyle(2, 0xFFD700, 0.8);
        panel.strokeRect(0, height - 100, width, 100);

        // 快捷提示
        const hintStyle = {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#888888'
        };

        this.add.text(width / 2, height - 20,
            '快捷键: [SPACE]出牌 [Q]虚张声势 [W]识破 [E]结束回合 [ESC]退出',
            hintStyle
        ).setOrigin(0.5);
    }

    /**
     * 创建回合指示器
     */
    createTurnIndicator() {
        const { width, height } = this.cameras.main;

        // 回合指示器
        this.turnIndicator = this.add.graphics();

        // 回合进度条
        this.turnProgressBar = this.add.graphics();
    }

    /**
     * 创建日志面板
     */
    createLogPanel() {
        const { width, height } = this.cameras.main;

        // 日志背景
        const logBg = this.add.graphics();
        logBg.fillStyle(0x1A1A2E, 0.8);
        logBg.fillRoundedRect(width - 220, 350, 200, 200, 10);
        logBg.lineStyle(1, 0xFFD700, 0.6);
        logBg.strokeRoundedRect(width - 220, 350, 200, 200, 10);

        // 日志标题
        this.add.text(width - 120, 370, '战斗日志', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);

        // 日志内容
        this.uiElements.battleLog = this.add.text(width - 210, 390, '', {
            fontSize: '10px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            wordWrap: { width: 180 }
        }).setOrigin(0, 0);
    }

    /**
     * 创建战斗区域
     */
    createBattleArea() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        // 战斗区域背景
        const battleArea = this.add.graphics();
        battleArea.fillStyle(0x2D1B69, 0.6);
        battleArea.fillRoundedRect(centerX - 200, centerY - 100, 400, 200, 15);
        battleArea.lineStyle(3, 0xFFD700, 0.8);
        battleArea.strokeRoundedRect(centerX - 200, centerY - 100, 400, 200, 15);

        // 中央对战区域
        this.battleZone = this.add.zone(centerX, centerY, 300, 100);
        this.battleZone.setInteractive();

        // 战斗效果区域
        this.effectZones = [];
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * 120;
            const y = centerY + Math.sin(angle) * 60;

            const zone = this.add.zone(x, y, 60, 60);
            zone.setInteractive();
            this.effectZones.push(zone);
        }

        // 添加战斗装饰
        this.createBattleDecorations(centerX, centerY);
    }

    /**
     * 创建战斗装饰
     */
    createBattleDecorations(x, y) {
        // 魔法阵
        const magicCircle = this.add.graphics();
        magicCircle.lineStyle(2, 0xFFD700, 0.6);
        magicCircle.strokeCircle(x, y, 80);

        // 符文装饰
        const runes = ['☆', '◇', '○', '△'];
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const runeX = x + Math.cos(angle) * 100;
            const runeY = y + Math.sin(angle) * 50;

            const rune = this.add.text(runeX, runeY, runes[i], {
                fontSize: '20px',
                color: '#FFD700'
            }).setOrigin(0.5);

            // 旋转动画
            this.tweens.add({
                targets: rune,
                rotation: Math.PI * 2,
                duration: 8000,
                repeat: -1,
                ease: 'Linear'
            });
        }
    }

    /**
     * 创建手牌区域
     */
    createHandAreas() {
        const { width, height } = this.cameras.main;

        // 玩家手牌区域
        this.playerHandArea = this.add.zone(width / 2, height - 150, 600, 120);
        this.playerHandArea.setInteractive();

        // 对手手牌区域
        this.opponentHandArea = this.add.zone(width / 2, 150, 600, 120);
        this.opponentHandArea.setInteractive();

        // 手牌显示容器
        this.handDisplays = [
            this.add.container(width / 2, height - 150), // 玩家
            this.add.container(width / 2, 150) // 对手
        ];

        // 手牌背景
        const handBgStyle = { fillStyle: { color: 0x2D1B69, alpha: 0.3 } };

        // 玩家手牌背景
        const playerHandBg = this.add.graphics();
        playerHandBg.fillRoundedRect(width / 2 - 300, height - 210, 600, 120, 10);
        playerHandBg.lineStyle(2, 0x00FF7F, 0.6);
        playerHandBg.strokeRoundedRect(width / 2 - 300, height - 210, 600, 120, 10);

        // 对手手牌背景
        const opponentHandBg = this.add.graphics();
        opponentHandBg.fillRoundedRect(width / 2 - 300, 90, 600, 120, 10);
        opponentHandBg.lineStyle(2, 0xFF4757, 0.6);
        opponentHandBg.strokeRoundedRect(width / 2 - 300, 90, 600, 120, 10);
    }

    /**
     * 创建卡牌系统
     */
    createCardSystem() {
        // 初始化卡牌管理器
        if (typeof CardManager !== 'undefined') {
            this.cardManager = cardManager;
        } else {
            this.cardManager = new CardManager();
        }

        // 创建卡组
        this.createPlayerDecks();

        // 创建手牌
        this.initializeHands();

        // 设置卡牌交互
        this.setupCardInteractions();
    }

    /**
     * 创建玩家卡组
     */
    createPlayerDecks() {
        // 玩家卡组
        const playerCards = this.generatePlayerDeck();
        this.playerDeck = this.cardManager.createDeck('player', playerCards, 0);

        // 对手卡组
        const opponentCards = this.generateOpponentDeck();
        this.opponentDeck = this.cardManager.createDeck('opponent', opponentCards, 1);
    }

    /**
     * 生成玩家卡组
     */
    generatePlayerDeck() {
        const deck = [];

        // 基础材料卡
        const baseMaterials = [
            'moonGrass', 'fireGrass', 'dewDrop', 'springWater'
        ];

        baseMaterials.forEach(material => {
            for (let i = 0; i < 3; i++) {
                deck.push(CardDefinitions.materials[material]);
            }
        });

        // 稀有材料卡
        const rareMaterials = [
            'dragonScale', 'phoenixFeather', 'demonBlood', 'unicornHorn'
        ];

        rareMaterials.forEach(material => {
            if (gameState.getMaterialCount(material) > 0) {
                deck.push(CardDefinitions.materials[material]);
            }
        });

        // 道具卡
        const items = ['steal', 'peek', 'shuffle', 'trap', 'counter'];
        items.forEach(item => {
            if (CardDefinitions.items[item]) {
                deck.push(CardDefinitions.items[item]);
            }
        });

        // 特殊卡
        if (gameState.player.level >= 5) {
            deck.push(CardDefinitions.specials.fireStorm);
        }

        return deck;
    }

    /**
     * 生成对手卡组
     */
    generateOpponentDeck() {
        const deck = [];

        // 基础AI卡组
        const baseCards = [
            CardDefinitions.materials.moonGrass,
            CardDefinitions.materials.fireGrass,
            CardDefinitions.materials.dewDrop,
            CardDefinitions.materials.springWater,
            CardDefinitions.items.steal,
            CardDefinitions.items.peek,
            CardDefinitions.items.trap
        ];

        baseCards.forEach(card => {
            if (card) {
                for (let i = 0; i < 2; i++) {
                    deck.push(card);
                }
            }
        });

        // 根据玩家等级调整难度
        const playerLevel = gameState.player.level;
        if (playerLevel >= 3) {
            deck.push(CardDefinitions.materials.dragonScale);
        }
        if (playerLevel >= 5) {
            deck.push(CardDefinitions.materials.phoenixFeather);
        }

        return deck;
    }

    /**
     * 初始化手牌
     */
    initializeHands() {
        // 抽取初始手牌
        this.drawCards(0, GameConfig.battle.maxHandSize);
        this.drawCards(1, GameConfig.battle.maxHandSize);

        // 显示手牌
        this.updateHandDisplay(0);
        this.updateHandDisplay(1);
    }

    /**
     * 创建战斗控制
     */
    createBattleControls() {
        // 拖拽系统
        this.createDragSystem();

        // 选择系统
        this.createSelectionSystem();

        // 快捷操作
        this.createQuickActions();
    }

    /**
     * 创建效果系统
     */
    createEffectSystem() {
        // 攻击效果
        this.attackEffects = this.add.particles(0, 0, null, {
            speed: { min: 100, max: 200 },
            lifespan: 800,
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0xFF4757, 0xFFA502]
        });

        // 治疗效果
        this.healEffects = this.add.particles(0, 0, null, {
            speed: { min: 50, max: 100 },
            lifespan: 1000,
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: [0x00FF7F, 0xFFD700]
        });

        // 特殊效果
        this.specialEffects = this.add.particles(0, 0, null, {
            speed: { min: 80, max: 150 },
            lifespan: 1200,
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.9, end: 0 },
            tint: [0x3742FA, 0xFF69B4, 0x00FFFF]
        });

        this.createEffectTextures();
    }

    /**
     * 创建效果纹理
     */
    createEffectTextures() {
        // 攻击粒子
        const attackGraphics = this.add.graphics();
        attackGraphics.fillStyle(0xFF4757);
        attackGraphics.fillStar(4, 4, 4, 3);
        attackGraphics.generateTexture('attackParticle', 8, 8);
        attackGraphics.destroy();

        // 治疗粒子
        const healGraphics = this.add.graphics();
        healGraphics.fillStyle(0x00FF7F);
        healGraphics.fillCircle(3, 3, 3);
        healGraphics.generateTexture('healParticle', 6, 6);
        healGraphics.destroy();

        // 特殊粒子
        const specialGraphics = this.add.graphics();
        specialGraphics.fillStyle(0x3742FA);
        specialGraphics.fillStar(3, 4, 4, 3);
        specialGraphics.generateTexture('specialParticle', 8, 8);
        specialGraphics.destroy();

        this.attackEffects.setTexture('attackParticle');
        this.healEffects.setTexture('healParticle');
        this.specialEffects.setTexture('specialParticle');

        // 停止所有效果
        this.attackEffects.stop();
        this.healEffects.stop();
        this.specialEffects.stop();
    }

    /**
     * 初始化战斗
     */
    initializeBattle() {
        // 创建玩家数据
        this.players = [
            {
                id: 0,
                name: '你',
                health: GameConfig.battle.maxHealth,
                maxHealth: GameConfig.battle.maxHealth,
                hand: [],
                deck: this.playerDeck,
                discardPile: [],
                materials: {},
                statusEffects: [],
                canBluff: false,
                isBluffing: false
            },
            {
                id: 1,
                name: '对手',
                health: GameConfig.battle.maxHealth,
                maxHealth: GameConfig.battle.maxHealth,
                hand: [],
                deck: this.opponentDeck,
                discardPile: [],
                materials: {},
                statusEffects: [],
                canBluff: false,
                isBluffing: false
            }
        ];

        // 初始化状态
        this.battleState = 'playing';
        this.currentTurn = 1;
        this.currentPlayer = 0;
        this.phase = 'draw';

        // 开始第一回合
        this.startTurn(0);
    }

    /**
     * 设置键盘控制
     */
    setupKeyboardControls() {
        // 卡牌操作
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.currentPlayer === 0 && this.phase === 'main') {
                this.playSelectedCard();
            }
        });

        // 特殊操作
        this.input.keyboard.on('keydown-Q', () => {
            this.toggleBluffMode();
        });

        this.input.keyboard.on('keydown-W', () => {
            this.activateDetectMode();
        });

        this.input.keyboard.on('keydown-E', () => {
            this.endTurn();
        });

        // 抽卡
        this.input.keyboard.on('keydown-D', () => {
            if (this.currentPlayer === 0 && this.phase === 'draw') {
                this.drawPhaseAction();
            }
        });

        // 退出确认
        this.input.keyboard.on('keydown-ESC', () => {
            this.showExitConfirm();
        });
    }

    /**
     * 显示战斗开始信息
     */
    showBattleStart() {
        const { width, height } = this.cameras.main;

        const startStyle = {
            fontSize: '32px',
            fontFamily: 'ZCOOL KuaiLe',
            color: '#FFD700',
            align: 'center',
            stroke: '#2D1B69',
            strokeThickness: 3
        };

        const startText = this.add.text(width / 2, height / 2, '战斗开始！', startStyle)
            .setOrigin(0.5);

        startText.setScale(0);

        this.tweens.add({
            targets: startText,
            scale: 1,
            duration: 1000,
            ease: 'Back.easeOut'
        });

        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 1000,
            delay: 2000,
            ease: 'Power2',
            onComplete: () => startText.destroy()
        });

        // 播放开始音效
        this.sound.play('sfx_notification', { volume: 0.6 });
    }

    /**
     * 开始回合
     */
    startTurn(playerIndex) {
        this.currentPlayer = playerIndex;
        this.phase = 'draw';
        this.timeRemaining = this.turnTimeLimit;

        // 更新UI
        this.updateTurnDisplay();
        this.updateCurrentPlayerDisplay();

        // 重置玩家状态
        const player = this.players[playerIndex];
        player.canBluff = true;
        player.isBluffing = false;

        // 处理状态效果
        this.processStatusEffects(player);

        // 抽卡阶段
        if (playerIndex === 0) {
            this.showPhaseMessage('抽卡阶段 - 按D抽卡');
        } else {
            // AI自动抽卡
            this.time.delayedCall(1000, () => {
                this.aiDrawPhase();
            });
        }

        // 启动回合计时器
        this.startTurnTimer();

        console.log(`🎯 开始回合 ${this.currentTurn} - ${player.name}`);
    }

    /**
     * 更新回合显示
     */
    updateTurnDisplay() {
        if (this.uiElements.turnInfo) {
            this.uiElements.turnInfo.setText(`第 ${this.currentTurn} 回合`);
        }

        // 更新回合指示器
        this.updateTurnIndicator();
    }

    /**
     * 更新当前玩家显示
     */
    updateCurrentPlayerDisplay() {
        const isPlayerTurn = this.currentPlayer === 0;
        const player = this.players[this.currentPlayer];

        if (this.uiElements.currentPlayer) {
            this.uiElements.currentPlayer.setText(isPlayerTurn ? '你的回合' : `${player.name}的回合`);
            this.uiElements.currentPlayer.setColor(isPlayerTurn ? '#00FF7F' : '#FF4757');
        }

        // 更新玩家面板高亮
        this.updatePlayerPanelHighlight();
    }

    /**
     * 更新玩家面板高亮
     */
    updatePlayerPanelHighlight() {
        // 这里可以实现面板高亮效果
    }

    /**
     * 处理状态效果
     */
    processStatusEffects(player) {
        if (!player.statusEffects || player.statusEffects.length === 0) return;

        player.statusEffects.forEach(effect => {
            switch (effect.type) {
                case 'poison':
                    player.health -= effect.damage;
                    this.addBattleLog(`${player.name} 受到 ${effect.damage} 点毒素伤害`);
                    break;

                case 'damage_reflection':
                    // 这个在受到伤害时处理
                    break;

                case 'shield':
                    // 这个在受到伤害时处理
                    break;
            }

            effect.duration--;
        });

        // 移除过期效果
        player.statusEffects = player.statusEffects.filter(effect => effect.duration > 0);

        // 更新显示
        this.updatePlayerDisplay(player.id);
    }

    /**
     * 启动回合计时器
     */
    startTurnTimer() {
        if (this.turnTimer) {
            this.turnTimer.destroy();
        }

        this.turnTimer = this.time.addEvent({
            delay: 100, // 每100ms更新一次
            callback: this.updateTurnTimer,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * 更新回合计时器
     */
    updateTurnTimer() {
        this.timeRemaining -= 100;

        if (this.timeRemaining <= 0) {
            this.handleTurnTimeout();
            return;
        }

        // 更新时间显示
        const seconds = Math.ceil(this.timeRemaining / 1000);
        const displayTime = `${seconds}:${(this.timeRemaining % 1000 / 10).toFixed(0).padStart(2, '0')}`;

        if (this.uiElements.timerText) {
            this.uiElements.timerText.setText(displayTime);

            // 时间不足时变红
            if (seconds <= 5) {
                this.uiElements.timerText.setColor('#FF4757');
            } else if (seconds <= 10) {
                this.uiElements.timerText.setColor('#FFA502');
            } else {
                this.uiElements.timerText.setColor('#FFD700');
            }
        }

        // 更新回合进度条
        this.updateTurnProgressBar();
    }

    /**
     * 处理回合超时
     */
    handleTurnTimeout() {
        this.addBattleLog('回合超时！');

        if (this.currentPlayer === 0) {
            // 玩家超时，自动结束回合
            this.endTurn();
        } else {
            // AI超时，自动执行AI行动
            this.executeAITurn();
        }
    }

    /**
     * 更新回合进度条
     */
    updateTurnProgressBar() {
        if (!this.turnProgressBar) return;

        const progress = this.timeRemaining / this.turnTimeLimit;

        this.turnProgressBar.clear();
        this.turnProgressBar.fillStyle(0xFFD700, 0.8);
        this.turnProgressBar.fillRoundedRect(
            this.cameras.main.width / 2 - 100,
            200,
            200 * progress,
            6,
            3
        );
    }

    /**
     * 抽卡阶段操作
     */
    drawPhaseAction() {
        if (this.phase !== 'draw') return;

        const player = this.players[this.currentPlayer];

        // 抽基础卡牌
        this.drawCards(this.currentPlayer, GameConfig.battle.baseDrawCount);

        // 抽材料
        this.drawMaterials(this.currentPlayer, GameConfig.battle.materialDrawCount);

        // 进入主要阶段
        this.phase = 'main';

        this.showPhaseMessage('主要阶段 - 出牌或使用道具');

        // 更新UI
        this.updateHandDisplay(this.currentPlayer);
        this.updatePlayerDisplay(this.currentPlayer);

        console.log(`🎴 ${player.name} 抽卡完成`);
    }

    /**
     * 抽取卡牌
     */
    drawCards(playerIndex, count) {
        const player = this.players[playerIndex];
        const deck = playerIndex === 0 ? this.playerDeck : this.opponentDeck;

        const drawnCards = this.cardManager.drawCards(
            playerIndex === 0 ? 'player' : 'opponent',
            count
        );

        player.hand.push(...drawnCards);

        console.log(`🎴 ${player.name} 抽取了 ${drawnCards.length} 张卡牌`);

        return drawnCards;
    }

    /**
     * 抽取材料
     */
    drawMaterials(playerIndex, count) {
        const player = this.players[playerIndex];

        // 随机给予基础材料
        const materials = ['moonGrass', 'fireGrass', 'dewDrop', 'springWater'];

        for (let i = 0; i < count; i++) {
            const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
            player.materials[randomMaterial] = (player.materials[randomMaterial] || 0) + 1;
        }

        console.log(`🌿 ${player.name} 抽取了 ${count} 个材料`);
    }

    /**
     * 更新手牌显示
     */
    updateHandDisplay(playerIndex) {
        const player = this.players[playerIndex];
        const container = this.handDisplays[playerIndex];

        // 清除旧显示
        container.removeAll(true);

        // 计算手牌位置
        const cardCount = player.hand.length;
        const spacing = Math.min(80, 600 / Math.max(cardCount, 1));
        const startX = -((cardCount - 1) * spacing) / 2;

        // 显示手牌
        player.hand.forEach((card, index) => {
            const x = startX + index * spacing;
            const y = 0;

            const cardSprite = this.createCardSprite(card, x, y, playerIndex);
            container.add(cardSprite);
        });

        // 更新手牌数量显示
        if (this.uiElements[`player${playerIndex}HandCount`]) {
            this.uiElements[`player${playerIndex}HandCount`].setText(`手牌: ${cardCount}`);
        }

        // 更新材料数量
        if (this.uiElements[`player${playerIndex}Materials`]) {
            const totalMaterials = Object.values(player.materials).reduce((sum, count) => sum + count, 0);
            this.uiElements[`player${playerIndex}Materials`].setText(`材料: ${totalMaterials}`);
        }
    }

    /**
     * 创建卡牌精灵
     */
    createCardSprite(card, x, y, playerIndex) {
        const container = this.add.container(x, y);

        // 卡牌背景
        const bg = this.add.graphics();
        bg.fillStyle(0xFFFFFF, 0.9);
        bg.fillRoundedRect(-30, -40, 60, 80, 5);
        bg.lineStyle(2, CardUtils.getRarityColor(card.definition.rarity), 0.8);
        bg.strokeRoundedRect(-30, -40, 60, 80, 5);

        // 卡牌图标
        const icon = this.add.text(0, -20, this.getCardEmoji(card.definition), {
            fontSize: '20px'
        }).setOrigin(0.5);

        // 卡牌名称
        const name = this.add.text(0, 5, card.definition.name, {
            fontSize: '8px',
            fontFamily: 'Noto Sans SC',
            color: '#000000'
        }).setOrigin(0.5);

        // 卡牌费用
        if (card.definition.cost > 0) {
            const cost = this.add.text(-20, -30, card.definition.cost.toString(), {
                fontSize: '10px',
                fontFamily: 'Noto Sans SC',
                color: '#FFD700',
                backgroundColor: '#2D1B69',
                padding: { x: 2, y: 1 }
            }).setOrigin(0.5);
            container.add(cost);
        }

        container.add([bg, icon, name]);

        // 玩家手牌交互
        if (playerIndex === 0 && this.phase === 'main') {
            container.setInteractive(
                new Phaser.Geom.Rectangle(-30, -40, 60, 80),
                Phaser.Geom.Rectangle.Contains
            );

            container.on('pointerover', () => {
                this.selectCard(card);
                container.setScale(1.1);
            });

            container.on('pointerout', () => {
                container.setScale(1);
            });

            container.on('pointerdown', () => {
                this.playCard(card);
            });
        }

        container.cardData = card;
        container.bg = bg;
        container.icon = icon;

        return container;
    }

    /**
     * 获取卡牌表情符号
     */
    getCardEmoji(cardDef) {
        if (cardDef.type === 'material') {
            return this.getMaterialEmoji(cardDef.id);
        } else if (cardDef.type === 'item') {
            const itemEmojis = {
                'steal': '🤏',
                'peek': '👁️',
                'shuffle': '🔄',
                'trap': '🕳️',
                'counter': '🔄',
                'bluff': '🎭',
                'detect': '🔍'
            };
            return itemEmojis[cardDef.id] || '💎';
        } else if (cardDef.type === 'special') {
            return '⭐';
        }
        return '🃏';
    }

    /**
     * 选择卡牌
     */
    selectCard(card) {
        this.selectedCard = card;
        this.showCardDetails(card);
    }

    /**
     * 显示卡牌详情
     */
    showCardDetails(card) {
        // 这里可以显示卡牌详细信息
        const tooltip = card.definition.description;
        this.showTooltip(tooltip);
    }

    /**
     * 出牌
     */
    playCard(card) {
        if (this.currentPlayer !== 0 || this.phase !== 'main') {
            return { success: false, reason: '现在不能出牌' };
        }

        // 检查是否可以打出
        const canPlay = card.canBePlayed(this.getGameState(), this.players[0], this.players[1]);
        if (!canPlay.canPlay) {
            this.showMessage(canPlay.reason, 'warning');
            return;
        }

        // 执行卡牌效果
        const result = this.executeCardEffect(card);

        if (result.success) {
            // 移除卡牌从手牌
            this.removeCardFromHand(0, card);

            // 记录出牌
            this.cardManager.playCard(card.id, this.getGameState(), this.players[0], this.players[1]);

            // 添加到战斗日志
            this.addBattleLog(`你打出了 ${card.definition.name}`);

            // 播放音效
            this.sound.play('sfx_card_play', { volume: 0.5 });

            // 显示效果
            this.showCardEffect(card);

            console.log(`🎴 玩家出牌: ${card.definition.name}`);
        } else {
            this.showMessage(result.reason, 'error');
        }

        return result;
    }

    /**
     * 执行卡牌效果
     */
    executeCardEffect(card) {
        const player = this.players[this.currentPlayer];
        const opponent = this.players[1 - this.currentPlayer];

        return card.play(this.getGameState(), player, opponent);
    }

    /**
     * 显示卡牌效果
     */
    showCardEffect(card) {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        // 根据卡牌类型显示不同效果
        switch (card.definition.type) {
            case 'material':
                // 材料效果
                this.specialEffects.emitParticleAt(centerX, centerY, 5);
                break;

            case 'item':
                // 道具效果
                if (card.definition.effect === 'damage') {
                    this.attackEffects.emitParticleAt(centerX, centerY, 8);
                } else if (card.definition.effect === 'heal') {
                    this.healEffects.emitParticleAt(centerX, centerY, 6);
                } else {
                    this.specialEffects.emitParticleAt(centerX, centerY, 7);
                }
                break;

            case 'special':
                // 特殊效果
                this.specialEffects.emitParticleAt(centerX, centerY, 10);
                break;
        }
    }

    /**
     * 从手牌移除卡牌
     */
    removeCardFromHand(playerIndex, card) {
        const player = this.players[playerIndex];
        const cardIndex = player.hand.indexOf(card);

        if (cardIndex !== -1) {
            player.hand.splice(cardIndex, 1);
            player.discardPile.push(card);

            // 更新手牌显示
            this.updateHandDisplay(playerIndex);
        }
    }

    /**
     * 结束回合
     */
    endTurn() {
        if (this.currentPlayer !== 0) return;

        const player = this.players[0];

        // 处理回合结束效果
        this.processEndOfTurnEffects(player);

        // 添加战斗日志
        this.addBattleLog('你结束了回合');

        console.log('🔄 玩家结束回合');

        // 停止计时器
        if (this.turnTimer) {
            this.turnTimer.destroy();
        }

        // 切换到对手回合
        this.switchTurn();
    }

    /**
     * 切换回合
     */
    switchTurn() {
        // 切换到下一个玩家
        this.currentPlayer = 1 - this.currentPlayer;

        if (this.currentPlayer === 0) {
            // 新回合开始
            this.currentTurn++;
        }

        // 开始新回合
        this.time.delayedCall(500, () => {
            this.startTurn(this.currentPlayer);
        });
    }

    /**
     * 处理回合结束效果
     */
    processEndOfTurnEffects(player) {
        // 处理各种回合结束效果
        player.statusEffects.forEach(effect => {
            if (effect.type === 'damage_reflection') {
                // 伤害反射效果在回合结束时重置
                effect.duration--;
            }
        });
    }

    /**
     * 显示阶段信息
     */
    showPhaseMessage(message) {
        if (this.uiElements.phaseText) {
            this.uiElements.phaseText.setText(message);
        }

        // 显示临时消息
        this.showMessage(message, 'info', 2000);
    }

    /**
     * 显示消息
     */
    showMessage(message, type = 'info', duration = 3000) {
        const { width, height } = this.cameras.main;

        const colors = {
            info: '#00FF7F',
            success: '#FFD700',
            warning: '#FFA502',
            error: '#FF4757'
        };

        const messageStyle = {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: colors[type] || colors.info,
            backgroundColor: '#2D1B69',
            padding: { x: 15, y: 8 }
        };

        const messageText = this.add.text(width / 2, height / 2 - 100, message, messageStyle)
            .setOrigin(0.5);

        // 淡入动画
        messageText.setAlpha(0);
        this.tweens.add({
            targets: messageText,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });

        // 自动淡出
        this.time.delayedCall(duration, () => {
            this.tweens.add({
                targets: messageText,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => messageText.destroy()
            });
        });
    }

    /**
     * 显示退出确认
     */
    showExitConfirm() {
        this.showConfirmDialog(
            '确定要退出战斗吗？\n退出将视为失败。',
            () => {
                this.endBattle(false);
            },
            () => {
                // 取消退出
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
            padding: { x: 20, y: 15 }
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
     * 处理行动
     */
    handleAction(action) {
        const player = this.players[this.currentPlayer];

        switch (action) {
            case 'draw':
                this.drawPhaseAction();
                break;

            case 'end':
                this.endTurn();
                break;

            case 'bluff':
                this.toggleBluffMode();
                break;

            default:
                console.log(`未知行动: ${action}`);
        }
    }

    /**
     * 切换虚张声势模式
     */
    toggleBluffMode() {
        if (this.currentPlayer !== 0 || this.phase !== 'main') return;

        const player = this.players[0];

        if (!player.canBluff) {
            this.showMessage('本回合已使用过虚张声势', 'warning');
            return;
        }

        player.canBluff = false;
        player.isBluffing = !player.isBluffing;

        this.bluffMode = player.isBluffing;

        this.showMessage(player.isBluffing ? '虚张声势模式已开启' : '虚张声势模式已关闭', 'info');

        // 更新UI显示
        this.updateBluffModeDisplay();

        console.log(`🎭 虚张声势模式: ${this.bluffMode ? '开启' : '关闭'}`);
    }

    /**
     * 激活识破模式
     */
    activateDetectMode() {
        if (this.currentPlayer !== 0 || this.phase !== 'main') return;

        // 检查是否有识破道具
        const hasDetectItem = this.players[0].hand.some(card =>
            card.definition.id === 'detect'
        );

        if (!hasDetectItem) {
            this.showMessage('没有识破道具', 'warning');
            return;
        }

        this.detectMode = true;
        this.showMessage('识破模式已激活', 'info');

        // 使用识破道具
        const detectCard = this.players[0].hand.find(card =>
            card.definition.id === 'detect'
        );

        if (detectCard) {
            this.playCard(detectCard);
        }
    }

    /**
     * 更新虚张声势模式显示
     */
    updateBluffModeDisplay() {
        // 这里可以更新UI显示虚张声势状态
        const bluffButton = this.uiElements.bluffButton;
        if (bluffButton) {
            const isActive = this.players[0].isBluffing;
            const bgColor = isActive ? 0x00FF7F : 0xFFA502;

            bluffButton.list[0].clear();
            bluffButton.list[0].fillStyle(bgColor, 0.8);
            bluffButton.list[0].fillRoundedRect(-35, -15, 70, 30, 5);
            bluffButton.list[0].lineStyle(1, 0xFFD700, 0.8);
            bluffButton.list[0].strokeRoundedRect(-35, -15, 70, 30, 5);
        }
    }

    /**
     * 获取游戏状态
     */
    getGameState() {
        return {
            turnCount: this.currentTurn,
            currentPlayer: this.currentPlayer,
            phase: this.phase,
            bluffMode: this.bluffMode,
            detectMode: this.detectMode
        };
    }

    /**
     * 添加战斗日志
     */
    addBattleLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;

        this.battleLog.push(logEntry);

        // 保持最近20条记录
        if (this.battleLog.length > 20) {
            this.battleLog.shift();
        }

        // 更新显示
        this.updateBattleLogDisplay();
    }

    /**
     * 更新战斗日志显示
     */
    updateBattleLogDisplay() {
        if (!this.uiElements.battleLog) return;

        const logText = this.battleLog.slice(-5).join('\n'); // 显示最近5条
        this.uiElements.battleLog.setText(logText);
    }

    /**
     * 更新玩家显示
     */
    updatePlayerDisplay(playerIndex) {
        const player = this.players[playerIndex];

        // 更新生命值
        if (this.uiElements[`player${playerIndex}HealthBar`]) {
            const healthPercent = player.health / player.maxHealth;
            const barWidth = 160 * healthPercent;
            const barColor = healthPercent > 0.5 ? 0x00FF7F : healthPercent > 0.25 ? 0xFFA502 : 0xFF4757;

            this.uiElements[`player${playerIndex}HealthBar`].clear();
            this.uiElements[`player${playerIndex}HealthBar`].fillStyle(barColor, 0.9);
            this.uiElements[`player${playerIndex}HealthBar`].fillRoundedRect(
                this.cameras.main.width / 2 - 80 + (playerIndex === 1 ? this.cameras.main.width - 300 : 70),
                120 + 40 - 8,
                barWidth,
                16,
                8
            );
        }

        // 更新生命值文本
        if (this.uiElements[`player${playerIndex}HealthText`]) {
            this.uiElements[`player${playerIndex}HealthText`].setText(`${player.health}/${player.maxHealth}`);
        }

        // 更新状态效果
        if (this.uiElements[`player${playerIndex}Effects`]) {
            const effectsText = player.statusEffects.map(effect => {
                const effectNames = {
                    poison: '中毒',
                    shield: '护盾',
                    damage_reflection: '反射'
                };
                return effectNames[effect.type] || effect.type;
            }).join(', ');

            this.uiElements[`player${playerIndex}Effects`].setText(effectsText || '无效果');
        }

        // 更新手牌数量
        if (this.uiElements[`player${playerIndex}HandCount`]) {
            this.uiElements[`player${playerIndex}HandCount`].setText(`手牌: ${player.hand.length}`);
        }
    }

    /**
     * 结束战斗
     */
    endBattle(playerWon) {
        this.battleState = 'finished';

        // 停止所有定时器
        if (this.turnTimer) {
            this.turnTimer.destroy();
        }

        // 计算奖励
        this.calculateRewards(playerWon);

        // 显示结果
        this.showBattleResult(playerWon);

        // 保存结果
        this.saveBattleResult(playerWon);

        // 返回酒馆
        this.time.delayedCall(3000, () => {
            this.scene.stop();
            this.scene.resume('TavernScene');
        });

        console.log(`⚔️ 战斗结束 - 结果: ${playerWon ? '胜利' : '失败'}`);
    }

    /**
     * 计算奖励
     */
    calculateRewards(playerWon) {
        const baseReward = playerWon ? 200 : 50;
        const difficultyBonus = Math.floor(gameState.battle.rating / 10);
        const streakBonus = gameState.battle.streak * 10;

        this.rewards = {
            gold: baseReward + difficultyBonus + streakBonus,
            experience: playerWon ? 100 : 30,
            reputation: playerWon ? 20 : 5,
            materials: playerWon ? this.generateMaterialRewards() : [],
            ratingChange: playerWon ? 25 : -15
        };

        // 应用奖励
        gameState.addGold(this.rewards.gold);
        gameState.addExperience(this.rewards.experience);
        gameState.addReputation(this.rewards.reputation);
        gameState.battle.rating += this.rewards.ratingChange;

        // 添加材料奖励
        this.rewards.materials.forEach(material => {
            gameState.addMaterial(material.type, material.count);
        });
    }

    /**
     * 生成材料奖励
     */
    generateMaterialRewards() {
        const materials = [];
        const possibleMaterials = [
            { type: 'moonGrass', count: 3, chance: 0.8 },
            { type: 'fireGrass', count: 2, chance: 0.6 },
            { type: 'dewDrop', count: 2, chance: 0.7 },
            { type: 'springWater', count: 3, chance: 0.9 }
        ];

        possibleMaterials.forEach(material => {
            if (Math.random() < material.chance) {
                materials.push(material);
            }
        });

        // 稀有材料奖励
        if (Math.random() < 0.3) {
            const rareMaterials = [
                { type: 'dragonScale', count: 1, chance: 0.2 },
                { type: 'phoenixFeather', count: 1, chance: 0.15 },
                { type: 'demonBlood', count: 1, chance: 0.1 }
            ];

            rareMaterials.forEach(material => {
                if (Math.random() < material.chance) {
                    materials.push(material);
                }
            });
        }

        return materials;
    }

    /**
     * 显示战斗结果
     */
    showBattleResult(playerWon) {
        const { width, height } = this.cameras.main;

        const resultText = playerWon ? '胜利！' : '失败！';
        const resultColor = playerWon ? '#00FF7F' : '#FF4757';

        const resultStyle = {
            fontSize: '48px',
            fontFamily: 'ZCOOL KuaiLe',
            color: resultColor,
            align: 'center',
            stroke: '#2D1B69',
            strokeThickness: 4
        };

        const result = this.add.text(width / 2, height / 2 - 50, resultText, resultStyle)
            .setOrigin(0.5);

        // 奖励显示
        const rewardStyle = {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            align: 'center'
        };

        const rewardsText = `
获得奖励:
💰 金币: +${this.rewards.gold}
⭐ 经验: +${this.rewards.experience}
🏆 声誉: +${this.rewards.reputation}
📈 评分: ${this.rewards.ratingChange > 0 ? '+' : ''}${this.rewards.ratingChange}
        `;

        const rewards = this.add.text(width / 2, height / 2 + 50, rewardsText, rewardStyle)
            .setOrigin(0.5);

        // 动画效果
        result.setScale(0);
        rewards.setAlpha(0);

        this.tweens.add({
            targets: result,
            scale: 1,
            duration: 1000,
            ease: 'Back.easeOut'
        });

        this.tweens.add({
            targets: rewards,
            alpha: 1,
            duration: 1000,
            delay: 500,
            ease: 'Power2'
        });

        // 播放结果音效
        const soundKey = playerWon ? 'sfx_victory' : 'sfx_fail';
        this.sound.play(soundKey, { volume: 0.7 });
    }

    /**
     * 保存战斗结果
     */
    saveBattleResult(playerWon) {
        // 记录战斗结果
        gameState.recordBattleResult(playerWon, gameState.battle.rating);

        // 更新统计
        gameState.battle.dailyWins += playerWon ? 1 : 0;

        // 增加声誉
        const reputationGain = playerWon ? 20 : -5;
        gameState.addReputation(reputationGain);

        // 触发事件
        eventManager.triggerEvent('battleEnded', {
            won: playerWon,
            rewards: this.rewards,
            opponent: this.players[1]
        });

        console.log(`⚔️ 战斗结果已保存 - 胜利: ${playerWon}`);
    }

    /**
     * 更新函数
     */
    update(time, delta) {
        // 更新AI行为（如果是AI回合）
        if (this.currentPlayer === 1 && this.battleState === 'playing') {
            this.updateAI(delta);
        }

        // 更新效果
        this.updateEffects(delta);

        // 更新拖拽系统
        this.updateDragSystem(delta);
    }

    /**
     * 更新AI
     */
    updateAI(delta) {
        // 这里实现AI逻辑
        if (this.phase === 'draw') {
            this.aiDrawPhase();
        } else if (this.phase === 'main') {
            this.aiMainPhase();
        }
    }

    /**
     * AI抽卡阶段
     */
    aiDrawPhase() {
        this.drawPhaseAction();
    }

    /**
     * AI主要阶段
     */
    aiMainPhase() {
        const ai = this.players[1];

        // 简单的AI逻辑：随机出牌
        if (ai.hand.length > 0) {
            const randomCard = ai.hand[Math.floor(Math.random() * ai.hand.length)];
            const canPlay = randomCard.canBePlayed(this.getGameState(), ai, this.players[0]);

            if (canPlay.canPlay) {
                this.time.delayedCall(1500, () => {
                    this.playCard(randomCard);
                });
            } else {
                // 如果不能出牌，结束回合
                this.time.delayedCall(1000, () => {
                    this.endTurn();
                });
            }
        } else {
            // 没有手牌，结束回合
            this.time.delayedCall(1000, () => {
                this.endTurn();
            });
        }
    }

    /**
     * 执行AI回合
     */
    executeAITurn() {
        const ai = this.players[1];

        // AI决策逻辑
        if (this.phase === 'draw') {
            this.aiDrawPhase();
        } else if (this.phase === 'main') {
            this.aiMainPhase();
        }
    }

    /**
     * 更新效果
     */
    updateEffects(delta) {
        // 更新各种视觉效果
    }

    /**
     * 更新拖拽系统
     */
    updateDragSystem(delta) {
        // 更新拖拽相关的逻辑
    }

    /**
     * 场景销毁
     */
    shutdown() {
        console.log('🛑 BattleScene: 场景销毁');

        // 停止所有定时器
        if (this.turnTimer) {
            this.turnTimer.destroy();
        }

        // 停止所有效果
        if (this.attackEffects) this.attackEffects.destroy();
        if (this.healEffects) this.healEffects.destroy();
        if (this.specialEffects) this.specialEffects.destroy();

        // 停止音效
        this.sound.stopByKey('bgm_battle');

        // 清理卡牌
        this.cardSprites.forEach(sprite => {
            if (sprite.destroy) sprite.destroy();
        });
        this.cardSprites = [];

        // 清理UI
        Object.values(this.uiElements).forEach(element => {
            if (element.destroy) element.destroy();
        });
        this.uiElements = {};
    }
}

// 导出场景类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleScene;
}