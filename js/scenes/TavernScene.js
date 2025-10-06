/**
 * 酒馆场景
 * 主要的经营场景，玩家在这里管理酒馆
 */

class TavernScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TavernScene' });

        // 场景状态
        this.isOperating = false;
        this.currentTime = 6; // 从早上6点开始
        this.dayPhase = 'morning';

        // UI元素
        this.uiElements = {};
        this.customerSprites = [];
        this.staffSprites = [];
        this.potionDisplays = [];

        // 管理器
        this.customerManager = null;
        this.staffManager = null;
        this.potionManager = null;

        // 定时器
        this.gameTimeTimer = null;
        this.customerSpawnTimer = null;
        this.autoSaveTimer = null;

        // 统计面板
        this.statsPanel = null;
        this.revenueToday = 0;
        this.customersServedToday = 0;
    }

    init(data) {
        console.log('🍺 TavernScene: 初始化酒馆场景');

        // 从存档数据恢复或初始化新游戏
        if (data && data.isContinue) {
            console.log('💾 继续游戏，使用存档数据');
        } else {
            console.log('🆕 新游戏，初始化默认数据');
        }
    }

    create() {
        console.log('🍺 TavernScene: 创建酒馆场景');

        // 创建场景背景
        this.createBackground();

        // 创建UI界面
        this.createUI();

        // 创建酒馆布局
        this.createTavernLayout();

        // 创建客人区域
        this.createCustomerArea();

        // 创建制作区域
        this.createBrewingArea();

        // 创建员工区域
        this.createStaffArea();

        // 创建库存展示
        this.createInventoryDisplay();

        // 设置游戏循环
        this.setupGameLoop();

        // 开始营业
        this.startOperations();

        // 显示欢迎消息
        this.showWelcomeMessage();

        // 检查随机事件
        this.checkRandomEvents();
    }

    /**
     * 创建背景
     */
    createBackground() {
        const { width, height } = this.cameras.main;

        // 主背景
        const bg = this.add.image(width / 2, height / 2, 'tavern_interior');
        bg.setDisplaySize(width, height);
        bg.setAlpha(0.9);

        // 添加环境光效果
        const ambientLight = this.add.graphics();
        ambientLight.fillGradientStyle(
            0x2D1B69, 0x2D1B69,
            0x1A1A2E, 0x1A1A2E,
            0.2, 0.4
        );
        ambientLight.fillRect(0, 0, width, height);

        // 添加魔法光源
        this.createMagicalLighting();
    }

    /**
     * 创建魔法光源 - 老王我修复了PointLight API
     */
    createMagicalLighting() {
        const { width, height } = this.cameras.main;

        // 中央吊灯 - attenuation作为第6个参数
        const chandelier = this.add.pointlight(width / 2, height / 3, 0xFFD700, 300, 0.8, 0.05);

        // 壁灯
        const wallLights = [
            { x: 100, y: height / 2 },
            { x: width - 100, y: height / 2 },
            { x: width / 4, y: height - 100 },
            { x: 3 * width / 4, y: height - 100 }
        ];

        wallLights.forEach(light => {
            const wallLight = this.add.pointlight(light.x, light.y, 0x00FF7F, 150, 0.6, 0.1);
        });

        // 坩埚光源
        const cauldronLight = this.add.pointlight(width / 2, height - 150, 0xFF6348, 100, 0.7, 0.15);
    }

    /**
     * 创建UI界面
     */
    createUI() {
        const { width, height } = this.cameras.main;

        // 顶部信息栏
        this.createTopBar();

        // 左侧信息面板
        this.createLeftPanel();

        // 右侧操作面板
        this.createRightPanel();

        // 底部快捷栏
        this.createBottomBar();

        // 时间显示
        this.createTimeDisplay();

        // 通知系统
        this.createNotificationSystem();
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

        // 标题
        const titleStyle = {
            fontSize: '24px',
            fontFamily: 'ZCOOL KuaiLe',
            color: '#FFD700'
        };

        this.add.text(20, 30, '魔药酒馆', titleStyle)
            .setOrigin(0, 0.5);

        // 日期时间
        const timeStyle = {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC'
        };

        this.uiElements.timeText = this.add.text(width / 2, 30, '', timeStyle)
            .setOrigin(0.5, 0.5);

        // 资源显示
        this.createResourceDisplay(20, 80);
    }

    /**
     * 创建资源显示
     */
    createResourceDisplay(x, y) {
        const resources = [
            { key: 'gold', icon: '💰', value: gameState.player.gold },
            { key: 'reputation', icon: '⭐', value: Math.floor(gameState.player.reputation) },
            { key: 'materials', icon: '🌿', value: this.getTotalMaterials() }
        ];

        resources.forEach((resource, index) => {
            const xPos = x + index * 150;

            // 图标
            this.add.text(xPos, y, resource.icon, {
                fontSize: '20px'
            }).setOrigin(0, 0.5);

            // 数值
            this.uiElements[resource.key + 'Text'] = this.add.text(xPos + 25, y,
                GameUtils.formatGold(resource.value), {
                fontSize: '18px',
                fontFamily: 'Noto Sans SC',
                color: '#FFD700'
            }).setOrigin(0, 0.5);
        });
    }

    /**
     * 创建左侧信息面板
     */
    createLeftPanel() {
        const panel = this.add.graphics();
        panel.fillStyle(0x2D1B69, 0.8);
        panel.fillRoundedRect(20, 120, 280, 400, 10);
        panel.lineStyle(2, 0xFFD700, 0.8);
        panel.strokeRoundedRect(20, 120, 280, 400, 10);

        // 面板标题
        const titleStyle = {
            fontSize: '20px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        };

        this.add.text(160, 140, '今日统计', titleStyle).setOrigin(0.5);

        // 统计信息
        const stats = [
            { label: '营业额', value: '0 金币', key: 'revenue' },
            { label: '服务客人', value: '0 位', key: 'customers' },
            { label: '制作魔药', value: '0 瓶', key: 'potions' },
            { label: '员工效率', value: '100%', key: 'efficiency' }
        ];

        stats.forEach((stat, index) => {
            const y = 180 + index * 60;

            this.add.text(40, y, stat.label, {
                fontSize: '16px',
                fontFamily: 'Noto Sans SC',
                color: '#FFF8DC'
            }).setOrigin(0, 0.5);

            this.uiElements[stat.key + 'Stat'] = this.add.text(260, y, stat.value, {
                fontSize: '16px',
                fontFamily: 'Noto Sans SC',
                color: '#00FF7F'
            }).setOrigin(1, 0.5);
        });
    }

    /**
     * 创建右侧操作面板
     */
    createRightPanel() {
        const panel = this.add.graphics();
        panel.fillStyle(0x2D1B69, 0.8);
        panel.fillRoundedRect(980, 120, 280, 400, 10);
        panel.lineStyle(2, 0xFFD700, 0.8);
        panel.strokeRoundedRect(980, 120, 280, 400, 10);

        // 操作按钮
        const actions = [
            { text: '制作魔药', action: () => this.openBrewingInterface() },
            { text: '查看库存', action: () => this.openInventory() },
            { text: '员工管理', action: () => this.openStaffManagement() },
            { text: '参与对战', action: () => this.openBattleInterface() },
            { text: '查看事件', action: () => this.openEventLog() }
        ];

        actions.forEach((action, index) => {
            const y = 160 + index * 70;
            this.createActionButton(1120, y, action.text, action.action);
        });
    }

    /**
     * 创建操作按钮
     */
    createActionButton(x, y, text, onClick) {
        const button = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x3742FA, 0.8);
        bg.fillRoundedRect(-100, -25, 200, 50, 8);
        bg.lineStyle(2, 0xFFD700, 0.8);
        bg.strokeRoundedRect(-100, -25, 200, 50, 8);

        const buttonText = this.add.text(0, 0, text, {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC'
        }).setOrigin(0.5);

        button.add([bg, buttonText]);
        button.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50),
            Phaser.Geom.Rectangle.Contains);

        // 交互效果
        button.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scale: 1.05,
                duration: 200
            });
            bg.clear();
            bg.fillStyle(0x00FF7F, 0.9);
            bg.fillRoundedRect(-100, -25, 200, 50, 8);
            bg.lineStyle(2, 0xFFD700, 1);
            bg.strokeRoundedRect(-100, -25, 200, 50, 8);
        });

        button.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 200
            });
            bg.clear();
            bg.fillStyle(0x3742FA, 0.8);
            bg.fillRoundedRect(-100, -25, 200, 50, 8);
            bg.lineStyle(2, 0xFFD700, 0.8);
            bg.strokeRoundedRect(-100, -25, 200, 50, 8);
        });

        button.on('pointerdown', () => {
            GameConfig.audio.playSafe(this, 'sfx_click', { volume: 0.5 });
            onClick();
        });

        return button;
    }

    /**
     * 创建底部快捷栏
     */
    createBottomBar() {
        const { width, height } = this.cameras.main;

        // 快捷按钮
        const shortcuts = [
            { key: 'B', text: '制作', action: () => this.openBrewingInterface() },
            { key: 'I', text: '库存', action: () => this.openInventory() },
            { key: 'S', text: '员工', action: () => this.openStaffManagement() },
            { key: 'F', text: '对战', action: () => this.openBattleInterface() },
            { key: 'ESC', text: '菜单', action: () => this.showGameMenu() }
        ];

        shortcuts.forEach((shortcut, index) => {
            const x = 50 + index * 100;
            const y = height - 50;

            this.add.text(x, y, `[${shortcut.key}] ${shortcut.text}`, {
                fontSize: '14px',
                fontFamily: 'Noto Sans SC',
                color: '#888888'
            }).setOrigin(0, 0.5);
        });
    }

    /**
     * 创建时间显示
     */
    createTimeDisplay() {
        const { width } = this.cameras.main;

        // 时间进度条
        const timeBar = this.add.graphics();
        timeBar.fillStyle(0x2D1B69, 0.8);
        timeBar.fillRoundedRect(width / 2 - 200, 50, 400, 20, 10);
        timeBar.lineStyle(2, 0xFFD700, 0.8);
        timeBar.strokeRoundedRect(width / 2 - 200, 50, 400, 20, 10);

        // 时间进度
        this.uiElements.timeProgress = this.add.graphics();

        // 时间文本
        this.uiElements.timeDisplay = this.add.text(width / 2, 60, '06:00', {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC'
        }).setOrigin(0.5);
    }

    /**
     * 创建通知系统
     */
    createNotificationSystem() {
        this.notificationQueue = [];
        this.activeNotifications = [];

        // 监听事件
        gameState.on('customerArrived', (data) => {
            this.queueNotification(`新客人到达: ${data.customer.name}`, 'info');
        });

        gameState.on('potionMade', (data) => {
            this.queueNotification(`制作了 ${data.potion.name}`, 'success');
        });

        gameState.on('goldChanged', (data) => {
            if (data.amount > 0) {
                this.queueNotification(`获得 ${GameUtils.formatGold(data.amount)} 金币`, 'success');
            }
        });
    }

    /**
     * 创建酒馆布局
     */
    createTavernLayout() {
        const { width, height } = this.cameras.main;

        // 地板
        this.createFloor();

        // 墙壁
        this.createWalls();

        // 家具
        this.createFurniture();

        // 装饰
        this.createDecorations();
    }

    /**
     * 创建地板
     */
    createFloor() {
        const { width, height } = this.cameras.main;

        // 木质地板纹理
        const floorGraphics = this.add.graphics();

        // 创建木纹效果
        for (let y = 100; y < height - 100; y += 20) {
            floorGraphics.fillStyle(0x8B4513, 0.8 + Math.random() * 0.2);
            floorGraphics.fillRect(0, y, width, 18);

            // 添加木纹线条
            floorGraphics.lineStyle(1, 0x654321, 0.5);
            floorGraphics.lineBetween(0, y + 9, width, y + 9);
        }
    }

    /**
     * 创建墙壁
     */
    createWalls() {
        const { width, height } = this.cameras.main;

        const wallGraphics = this.add.graphics();
        wallGraphics.fillStyle(0x8B4513, 0.9);

        // 后墙
        wallGraphics.fillRect(0, 100, width, 20);

        // 左墙
        wallGraphics.fillRect(0, 100, 20, height - 200);

        // 右墙
        wallGraphics.fillRect(width - 20, 100, 20, height - 200);

        // 添加墙壁装饰
        this.createWallDecorations();
    }

    /**
     * 创建墙壁装饰
     */
    createWallDecorations() {
        const { width } = this.cameras.main;

        // 魔法画作
        const paintings = [
            { x: 200, y: 90, text: '🖼️', scale: 2 },
            { x: width - 200, y: 90, text: '🎨', scale: 2 },
            { x: width / 2, y: 90, text: '🔮', scale: 2 }
        ];

        paintings.forEach(painting => {
            this.add.text(painting.x, painting.y, painting.text, {
                fontSize: '32px'
            }).setOrigin(0.5).setScale(painting.scale);
        });

        // 书架
        const bookshelf = this.add.text(100, 90, '📚', {
            fontSize: '48px'
        }).setOrigin(0.5);

        // 魔法武器
        const weapons = this.add.text(width - 100, 90, '⚔️', {
            fontSize: '48px'
        }).setOrigin(0.5);
    }

    /**
     * 创建家具
     */
    createFurniture() {
        const { width, height } = this.cameras.main;

        // 桌椅
        this.createTablesAndChairs();

        // 吧台
        this.createBarCounter();

        // 展示柜
        this.createDisplayCases();

        // 储物柜
        this.createStorageCabinets();
    }

    /**
     * 创建桌椅
     */
    createTablesAndChairs() {
        const tablePositions = [
            { x: 200, y: 300 },
            { x: 400, y: 350 },
            { x: 600, y: 300 },
            { x: 800, y: 350 },
            { x: 1000, y: 300 }
        ];

        tablePositions.forEach(pos => {
            // 桌子
            const table = this.add.text(pos.x, pos.y, '🪑', {
                fontSize: '32px'
            }).setOrigin(0.5);

            // 椅子
            const chair1 = this.add.text(pos.x - 40, pos.y + 30, '🪑', {
                fontSize: '24px'
            }).setOrigin(0.5);

            const chair2 = this.add.text(pos.x + 40, pos.y + 30, '🪑', {
                fontSize: '24px'
            }).setOrigin(0.5);

            // 随机放置一些物品
            if (Math.random() < 0.5) {
                this.add.text(pos.x, pos.y - 20, '🍺', {
                    fontSize: '20px'
                }).setOrigin(0.5);
            }
        });
    }

    /**
     * 创建吧台
     */
    createBarCounter() {
        const { width, height } = this.cameras.main;

        const barX = width / 2;
        const barY = height - 100;

        // 吧台主体
        const bar = this.add.graphics();
        bar.fillStyle(0x8B4513, 0.9);
        bar.fillRect(barX - 150, barY - 30, 300, 60);
        bar.lineStyle(3, 0xFFD700, 0.8);
        bar.strokeRect(barX - 150, barY - 30, 300, 60);

        // 吧台装饰
        const barDecorations = [
            { x: barX - 100, y: barY - 40, item: '🍷' },
            { x: barX, y: barY - 40, item: '🥃' },
            { x: barX + 100, y: barY - 40, item: '🍺' }
        ];

        barDecorations.forEach(dec => {
            this.add.text(dec.x, dec.y, dec.item, {
                fontSize: '24px'
            }).setOrigin(0.5);
        });
    }

    /**
     * 创建展示柜
     */
    createDisplayCases() {
        const { width } = this.cameras.main;

        // 左侧展示柜
        const leftCase = this.add.text(150, 200, '🏺', {
            fontSize: '48px'
        }).setOrigin(0.5);

        // 右侧展示柜
        const rightCase = this.add.text(width - 150, 200, '🏺', {
            fontSize: '48px'
        }).setOrigin(0.5);

        // 展示一些魔药
        const displayPotions = [
            { x: 130, y: 180, potion: '🔴' },
            { x: 170, y: 180, potion: '🔵' },
            { x: width - 170, y: 180, potion: '🟢' },
            { x: width - 130, y: 180, potion: '🟡' }
        ];

        displayPotions.forEach(p => {
            this.add.text(p.x, p.y, p.potion, {
                fontSize: '20px'
            }).setOrigin(0.5);
        });
    }

    /**
     * 创建储物柜
     */
    createStorageCabinets() {
        const { width, height } = this.cameras.main;

        // 储物柜
        const cabinets = [
            { x: 50, y: height / 2, text: '🗄️' },
            { x: width - 50, y: height / 2, text: '🗄️' }
        ];

        cabinets.forEach(cabinet => {
            this.add.text(cabinet.x, cabinet.y, cabinet.text, {
                fontSize: '32px'
            }).setOrigin(0.5);
        });
    }

    /**
     * 创建装饰
     */
    createDecorations() {
        // 魔法植物
        this.createMagicalPlants();

        // 魔法水晶
        this.createMagicalCrystals();

        // 挂饰
        this.createWallHangings();
    }

    /**
     * 创建魔法植物
     */
    createMagicalPlants() {
        const plantPositions = [
            { x: 100, y: 400, plant: '🌿' },
            { x: 300, y: 450, plant: '🌱' },
            { x: 500, y: 400, plant: '🍀' },
            { x: 700, y: 450, plant: '🌿' },
            { x: 900, y: 400, plant: '🌱' }
        ];

        plantPositions.forEach(plant => {
            const plantSprite = this.add.text(plant.x, plant.y, plant.plant, {
                fontSize: '24px'
            }).setOrigin(0.5);

            // 添加轻微摆动动画
            this.tweens.add({
                targets: plantSprite,
                angle: { from: -5, to: 5 },
                duration: 3000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    /**
     * 创建魔法水晶
     */
    createMagicalCrystals() {
        const crystalPositions = [
            { x: 150, y: 150, crystal: '💎', color: 0x00FF7F },
            { x: 850, y: 150, crystal: '💎', color: 0xFFD700 },
            { x: 500, y: 200, crystal: '💎', color: 0x3742FA }
        ];

        crystalPositions.forEach((crystal, index) => {
            const crystalSprite = this.add.text(crystal.x, crystal.y, crystal.crystal, {
                fontSize: '24px'
            }).setOrigin(0.5);

            // 添加发光效果 - 老王我修复了PointLight API
            const glow = this.add.pointlight(crystal.x, crystal.y, crystal.color, 50, 0.6, 0.1);

            // 添加闪烁动画
            this.tweens.add({
                targets: glow,
                intensity: { from: 0.4, to: 0.8 },
                duration: 2000 + index * 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    /**
     * 创建墙面挂饰
     */
    createWallHangings() {
        const { width } = this.cameras.main;

        const hangings = [
            { x: 120, y: 80, item: '🏆' },
            { x: width - 120, y: 80, item: '🎖️' },
            { x: width / 3, y: 80, item: '📜' },
            { x: 2 * width / 3, y: 80, item: '🔔' }
        ];

        hangings.forEach(hanging => {
            this.add.text(hanging.x, hanging.y, hanging.item, {
                fontSize: '20px'
            }).setOrigin(0.5);
        });
    }

    /**
     * 创建客人区域
     */
    createCustomerArea() {
        const { width, height } = this.cameras.main;

        // 客人等待区
        this.customerArea = this.add.zone(width / 2, height / 2, 600, 200);
        this.customerArea.setInteractive();

        // 客人座位
        this.customerSeats = [];
        const seatPositions = [
            { x: 200, y: 300 },
            { x: 400, y: 350 },
            { x: 600, y: 300 },
            { x: 800, y: 350 },
            { x: 1000, y: 300 }
        ];

        seatPositions.forEach((pos, index) => {
            const seat = {
                id: index,
                x: pos.x,
                y: pos.y,
                occupied: false,
                customer: null
            };
            this.customerSeats.push(seat);
        });

        // 客人管理器
        if (typeof CustomerManager !== 'undefined') {
            this.customerManager = new CustomerManager();
            this.customerManager.initialize();
        }
    }

    /**
     * 创建制作区域
     */
    createBrewingArea() {
        const { width, height } = this.cameras.main;

        // 制作台
        const brewingX = width / 2;
        const brewingY = height - 150;

        // 坩埚
        const cauldron = this.add.text(brewingX, brewingY, '⚗️', {
            fontSize: '48px'
        }).setOrigin(0.5);

        // 制作工具
        const tools = [
            { x: brewingX - 60, y: brewingY - 30, tool: '🥄' },
            { x: brewingX + 60, y: brewingY - 30, tool: '🔥' },
            { x: brewingX - 30, y: brewingY + 40, tool: '🧪' },
            { x: brewingX + 30, y: brewingY + 40, tool: '🧪' }
        ];

        tools.forEach(tool => {
            this.add.text(tool.x, tool.y, tool.tool, {
                fontSize: '24px'
            }).setOrigin(0.5);
        });

        // 制作按钮
        this.createBrewingButton(brewingX, brewingY + 80);

        // 添加制作区域光效 - 老王我修复了PointLight API
        const brewingLight = this.add.pointlight(brewingX, brewingY, 0xFF6348, 80, 0.7, 0.1);

        // 添加蒸汽效果
        this.createSteamEffect(brewingX, brewingY - 20);
    }

    /**
     * 创建制作按钮
     */
    createBrewingButton(x, y) {
        const button = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0xFF6348, 0.8);
        bg.fillRoundedRect(-60, -20, 120, 40, 8);
        bg.lineStyle(2, 0xFFD700, 0.8);
        bg.strokeRoundedRect(-60, -20, 120, 40, 8);

        const text = this.add.text(0, 0, '制作魔药', {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        button.add([bg, text]);
        button.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40),
            Phaser.Geom.Rectangle.Contains);

        button.on('pointerdown', () => {
            GameConfig.audio.playSafe(this, 'sfx_click', { volume: 0.5 });
            this.openBrewingInterface();
        });

        // 添加悬停效果
        button.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scale: 1.05,
                duration: 200
            });
        });

        button.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 200
            });
        });
    }

    /**
     * 创建蒸汽效果
     */
    createSteamEffect(x, y) {
        const steam = this.add.particles(x, y, null, {
            y: { min: -20, max: -50 },
            lifespan: 2000,
            speed: { min: 10, max: 30 },
            scale: { start: 0.5, end: 1.5 },
            alpha: { start: 0.6, end: 0 },
            tint: 0xFFFFFF,
            frequency: 1000,
            quantity: 3,
            gravityY: -20
        });

        // 创建蒸汽纹理
        const steamGraphics = this.add.graphics();
        steamGraphics.fillStyle(0xFFFFFF, 0.3);
        steamGraphics.fillCircle(4, 4, 4);
        steamGraphics.generateTexture('steam', 8, 8);
        steamGraphics.destroy();

        steam.setTexture('steam');
    }

    /**
     * 创建员工区域
     */
    createStaffArea() {
        const { width, height } = this.cameras.main;

        // 员工工作区
        const staffX = 150;
        const staffY = height - 200;

        // 员工工作台
        const workbench = this.add.text(staffX, staffY, '🔧', {
            fontSize: '32px'
        }).setOrigin(0.5);

        // 员工管理器
        if (typeof StaffManager !== 'undefined') {
            this.staffManager = staffManager;
        }

        // 显示当前员工
        this.updateStaffDisplay();
    }

    /**
     * 创建库存展示
     */
    createInventoryDisplay() {
        // 库存面板
        const panel = this.add.graphics();
        panel.fillStyle(0x2D1B69, 0.7);
        panel.fillRoundedRect(320, 540, 640, 120, 10);
        panel.lineStyle(2, 0xFFD700, 0.8);
        panel.strokeRoundedRect(320, 540, 640, 120, 10);

        // 库存标题
        this.add.text(640, 560, '库存展示', {
            fontSize: '18px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);

        // 显示一些魔药和材料
        this.updateInventoryDisplay();
    }

    /**
     * 设置游戏循环
     */
    setupGameLoop() {
        // 游戏时间更新
        this.gameTimeTimer = this.time.addEvent({
            delay: 5000, // 5秒 = 游戏内1小时
            callback: this.updateGameTime,
            callbackScope: this,
            loop: true
        });

        // 客人生成
        this.customerSpawnTimer = this.time.addEvent({
            delay: GameConfig.tavern.customerSpawnRate,
            callback: this.spawnCustomer,
            callbackScope: this,
            loop: true
        });

        // 自动保存
        this.autoSaveTimer = this.time.addEvent({
            delay: 300000, // 5分钟
            callback: this.autoSave,
            callbackScope: this,
            loop: true
        });

        // 更新UI
        this.updateUITimer = this.time.addEvent({
            delay: 1000, // 每秒更新
            callback: this.updateUI,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * 开始营业
     */
    startOperations() {
        this.isOperating = true;
        this.currentTime = GameConfig.tavern.operatingHours.start;

        console.log('🍺 酒馆开始营业！');
        this.queueNotification('酒馆开始营业，祝你好运！', 'success');

        // 播放营业音效
        GameConfig.audio.playSafe(this, 'sfx_notification', { volume: 0.5 });
    }

    /**
     * 更新游戏时间
     */
    updateGameTime() {
        this.currentTime++;

        if (this.currentTime >= 24) {
            this.currentTime = 0;
            this.newDay();
        }

        // 更新时间段
        this.updateDayPhase();

        // 更新时间显示
        this.updateTimeDisplay();

        // 检查营业时间
        this.checkOperatingHours();

        // 推进游戏状态时间
        gameState.advanceTime(60); // 1小时
    }

    /**
     * 更新时间段
     */
    updateDayPhase() {
        if (this.currentTime >= 6 && this.currentTime < 12) {
            this.dayPhase = 'morning';
        } else if (this.currentTime >= 12 && this.currentTime < 18) {
            this.dayPhase = 'afternoon';
        } else if (this.currentTime >= 18 && this.currentTime < 24) {
            this.dayPhase = 'evening';
        } else {
            this.dayPhase = 'night';
        }
    }

    /**
     * 更新时间显示
     */
    updateTimeDisplay() {
        const timeString = `${this.currentTime.toString().padStart(2, '0')}:00`;

        if (this.uiElements.timeDisplay) {
            this.uiElements.timeDisplay.setText(timeString);
        }

        // 更新时间进度条
        if (this.uiElements.timeProgress) {
            this.uiElements.timeProgress.clear();
            const progress = (this.currentTime / 24) * 400;
            this.uiElements.timeProgress.fillStyle(0x00FF7F, 0.8);
            this.uiElements.timeProgress.fillRoundedRect(
                this.cameras.main.width / 2 - 200,
                50,
                progress,
                20,
                10
            );
        }
    }

    /**
     * 检查营业时间
     */
    checkOperatingHours() {
        if (this.currentTime >= GameConfig.tavern.operatingHours.end ||
            this.currentTime < GameConfig.tavern.operatingHours.start) {

            if (this.isOperating) {
                this.closeTavern();
            }
        } else {
            if (!this.isOperating) {
                this.openTavern();
            }
        }
    }

    /**
     * 新一天
     */
    newDay() {
        console.log('🌅 新的一天开始了！');

        // 重置日常统计
        this.revenueToday = 0;
        this.customersServedToday = 0;

        // 结算昨日收益
        this.settleDailyRevenue();

        // 生成新事件
        eventManager.generateDailyEvents({ day: gameState.time.day });

        // 更新员工状态
        if (this.staffManager) {
            this.staffManager.paySalaries();
        }

        this.queueNotification(`第 ${gameState.time.day} 天开始了！`, 'info');
    }

    /**
     * 结算每日收益
     */
    settleDailyRevenue() {
        const dailyProfit = this.revenueToday - this.calculateDailyExpenses();

        gameState.addGold(dailyProfit);
        gameState.addExperience(Math.floor(dailyProfit / 10));

        console.log(`💰 昨日收益: ${dailyProfit} 金币`);

        if (dailyProfit > 0) {
            this.queueNotification(`昨日盈利 ${dailyProfit} 金币！`, 'success');
        } else {
            this.queueNotification(`昨日亏损 ${Math.abs(dailyProfit)} 金币`, 'warning');
        }
    }

    /**
     * 计算每日支出
     */
    calculateDailyExpenses() {
        let expenses = 0;

        // 员工工资
        if (gameState.staff) {
            expenses += gameState.staff.reduce((total, staff) => total + staff.salary, 0);
        }

        // 租金
        expenses += GameConfig.economy.rent;

        // 税费
        const tax = Math.floor(gameState.tavern.dailyIncome * GameConfig.economy.taxRate);
        expenses += tax;

        return expenses;
    }

    /**
     * 生成客人
     */
    spawnCustomer() {
        if (!this.isOperating) return;
        if (this.customerManager.customers.length >= gameState.tavern.capacity) return;

        // 检查是否有空座位
        const availableSeats = this.customerSeats.filter(seat => !seat.occupied);
        if (availableSeats.length === 0) return;

        // 生成客人
        const customer = this.customerManager.spawnCustomer();
        if (customer) {
            // 分配到座位
            const seat = availableSeats[0];
            this.assignCustomerToSeat(customer, seat);

            console.log(`👤 新客人: ${customer.name}`);
        }
    }

    /**
     * 分配客人到座位
     */
    assignCustomerToSeat(customer, seat) {
        seat.occupied = true;
        seat.customer = customer;

        // 创建客人精灵
        const customerSprite = this.add.text(seat.x, seat.y, this.getCustomerEmoji(customer.type), {
            fontSize: '32px'
        }).setOrigin(0.5);

        // 添加客人名字标签
        const nameLabel = this.add.text(seat.x, seat.y + 30, customer.name, {
            fontSize: '12px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            backgroundColor: '#2D1B69',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5);

        // 添加耐心指示器
        const patienceBar = this.createPatienceBar(seat.x, seat.y - 30, customer);

        this.customerSprites.push({
            customer: customer,
            sprite: customerSprite,
            nameLabel: nameLabel,
            patienceBar: patienceBar,
            seat: seat
        });

        // 客人坐下动画
        customerSprite.setScale(0);
        this.tweens.add({
            targets: customerSprite,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
    }

    /**
     * 获取客人表情符号
     */
    getCustomerEmoji(customerType) {
        const emojiMap = {
            'adventurer': '🗡️',
            'merchant': '💼',
            'villager': '👨‍🌾',
            'guard': '⚔️',
            'noble': '👑',
            'wizard': '🧙‍♂️',
            'mysteriousStranger': '🧥'
        };

        return emojiMap[customerType] || '👤';
    }

    /**
     * 创建耐心指示器
     */
    createPatienceBar(x, y, customer) {
        const barBg = this.add.graphics();
        barBg.fillStyle(0x333333, 0.8);
        barBg.fillRect(x - 30, y - 3, 60, 6);

        const bar = this.add.graphics();

        const patienceBar = {
            background: barBg,
            bar: bar,
            customer: customer,
            update: () => {
                const patiencePercent = customer.currentPatience / customer.maxPatience;
                const color = patiencePercent > 0.5 ? 0x00FF7F : patiencePercent > 0.25 ? 0xFFA502 : 0xFF4757;

                bar.clear();
                bar.fillStyle(color, 0.9);
                bar.fillRect(x - 30, y - 3, 60 * patiencePercent, 6);
            }
        };

        return patienceBar;
    }

    /**
     * 更新员工显示
     */
    updateStaffDisplay() {
        // 这里实现员工显示更新逻辑
        if (!this.staffManager) return;

        const staffInfo = this.staffManager.getStaffInfo();
        // 更新员工显示...
    }

    /**
     * 更新库存显示
     */
    updateInventoryDisplay() {
        if (!this.potionManager) return;

        const potions = this.potionManager.getAvailablePotions().slice(0, 8);

        // 清除旧的显示
        if (this.potionDisplays) {
            this.potionDisplays.forEach(display => {
                if (display.sprite) display.sprite.destroy();
                if (display.text) display.text.destroy();
            });
        }

        this.potionDisplays = [];

        // 显示魔药
        potions.forEach((potion, index) => {
            const x = 350 + (index % 4) * 80;
            const y = 570 + Math.floor(index / 4) * 40;

            const potionSprite = this.add.text(x, y, '🔮', {
                fontSize: '20px'
            }).setOrigin(0.5);

            const potionText = this.add.text(x + 20, y, `${potion.name} x${potion.currentCharges}`, {
                fontSize: '12px',
                fontFamily: 'Noto Sans SC',
                color: '#FFF8DC'
            }).setOrigin(0, 0.5);

            this.potionDisplays.push({
                sprite: potionSprite,
                text: potionText,
                potion: potion
            });
        });
    }

    /**
     * 获取总材料数
     */
    getTotalMaterials() {
        return Object.values(gameState.inventory.materials).reduce((sum, count) => sum + count, 0);
    }

    /**
     * 更新UI
     */
    updateUI() {
        // 更新资源显示
        if (this.uiElements.goldText) {
            this.uiElements.goldText.setText(GameUtils.formatGold(gameState.player.gold));
        }

        if (this.uiElements.reputationText) {
            this.uiElements.reputationText.setText(Math.floor(gameState.player.reputation));
        }

        if (this.uiElements.materialsText) {
            this.uiElements.materialsText.setText(this.getTotalMaterials());
        }

        // 更新统计
        if (this.uiElements.revenueStat) {
            this.uiElements.revenueStat.setText(`${this.revenueToday} 金币`);
        }

        if (this.uiElements.customersStat) {
            this.uiElements.customersStat.setText(`${this.customersServedToday} 位`);
        }

        // 更新客人耐心条
        this.customerSprites.forEach(display => {
            if (display.patienceBar) {
                display.patienceBar.update();
            }
        });

        // 更新员工显示
        this.updateStaffDisplay();

        // 更新库存显示
        this.updateInventoryDisplay();
    }

    /**
     * 排队通知
     */
    queueNotification(message, type = 'info') {
        this.notificationQueue.push({
            message: message,
            type: type,
            timestamp: Date.now()
        });

        this.processNotificationQueue();
    }

    /**
     * 处理通知队列
     */
    processNotificationQueue() {
        if (this.notificationQueue.length === 0 || this.activeNotifications.length >= 3) {
            return;
        }

        const notification = this.notificationQueue.shift();
        this.showNotification(notification);
    }

    /**
     * 显示通知
     */
    showNotification(notification) {
        const { width } = this.cameras.main;
        const y = 100 + this.activeNotifications.length * 50;

        const colors = {
            info: 0x00FF7F,
            success: 0xFFD700,
            warning: 0xFFA502,
            error: 0xFF4757
        };

        const notificationBg = this.add.graphics();
        notificationBg.fillStyle(0x2D1B69, 0.9);
        notificationBg.fillRoundedRect(width / 2 - 150, y - 20, 300, 40, 8);
        notificationBg.lineStyle(2, colors[notification.type], 0.8);
        notificationBg.strokeRoundedRect(width / 2 - 150, y - 20, 300, 40, 8);

        const notificationText = this.add.text(width / 2, y, notification.message, {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        const notificationObj = {
            bg: notificationBg,
            text: notificationText,
            startTime: notification.timestamp
        };

        this.activeNotifications.push(notificationObj);

        // 自动移除
        this.time.delayedCall(3000, () => {
            this.removeNotification(notificationObj);
        });

        // 淡入动画
        notificationBg.setAlpha(0);
        notificationText.setAlpha(0);

        this.tweens.add({
            targets: [notificationBg, notificationText],
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }

    /**
     * 移除通知
     */
    removeNotification(notification) {
        this.tweens.add({
            targets: [notification.bg, notification.text],
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                notification.bg.destroy();
                notification.text.destroy();

                // 从活动列表中移除
                const index = this.activeNotifications.indexOf(notification);
                if (index !== -1) {
                    this.activeNotifications.splice(index, 1);
                }

                // 处理队列中的下一个通知
                this.processNotificationQueue();
            }
        });
    }

    /**
     * 自动保存
     */
    autoSave() {
        if (gameState.settings.autoSave) {
            saveManager.quickSave();
            console.log('💾 自动保存完成');
        }
    }

    /**
     * 界面操作方法
     */
    openBrewingInterface() {
        console.log('🧪 打开制作界面');
        this.scene.launch('BrewingScene');
    }

    openInventory() {
        console.log('📦 打开库存');
        // 这里实现库存界面
        this.queueNotification('库存功能开发中...', 'info');
    }

    openStaffManagement() {
        console.log('👥 打开员工管理');
        // 这里实现员工管理界面
        this.queueNotification('员工管理功能开发中...', 'info');
    }

    openBattleInterface() {
        console.log('⚔️ 打开对战界面');
        this.scene.launch('BattleScene');
    }

    openEventLog() {
        console.log('📋 打开事件日志');
        // 这里实现事件日志界面
        this.queueNotification('事件日志功能开发中...', 'info');
    }

    showGameMenu() {
        console.log('🎮 显示游戏菜单');
        // 这里实现游戏菜单
        this.queueNotification('游戏菜单功能开发中...', 'info');
    }

    /**
     * 显示欢迎消息
     */
    showWelcomeMessage() {
        this.queueNotification('欢迎来到魔药酒馆！开始你的经营之旅吧！', 'success');

        // 播放欢迎音效
        GameConfig.audio.playSafe(this, 'sfx_notification', { volume: 0.5 });
    }

    /**
     * 检查随机事件
     */
    checkRandomEvents() {
        // 检查是否应该触发新事件
        const currentTime = gameState.getCurrentTime();
        const lastEventTime = gameState.getLastEventTime();
        const eventInterval = 300; // 5分钟游戏时间

        if (currentTime - lastEventTime >= eventInterval) {
            // 尝试触发随机事件
            const random = Math.random();
            let eventChance = 0.3; // 基础事件概率

            // 根据声誉调整事件概率
            const reputation = gameState.player.reputation;
            if (reputation > 500) eventChance += 0.1;
            if (reputation > 1000) eventChance += 0.1;

            if (random < eventChance) {
                this.triggerRandomEvent();
                gameState.setLastEventTime(currentTime);
            }
        }
    }

    /**
     * 触发随机事件
     */
    triggerRandomEvent() {
        // 暂停当前场景
        this.scene.pause();

        // 启动事件场景
        this.scene.launch('EventScene', {
            returnScene: 'TavernScene'
        });

        console.log('📋 触发随机事件');
    }

    /**
     * 打开酒馆
     */
    openTavern() {
        if (!this.isOperating) {
            this.isOperating = true;
            this.queueNotification('酒馆开门营业！', 'success');

            // 重新启动客人生成
            if (this.customerSpawnTimer) {
                this.customerSpawnTimer.paused = false;
            }
        }
    }

    /**
     * 关闭酒馆
     */
    closeTavern() {
        if (this.isOperating) {
            this.isOperating = false;
            this.queueNotification('酒馆打烊，明日请早！', 'info');

            // 停止客人生成
            if (this.customerSpawnTimer) {
                this.customerSpawnTimer.paused = true;
            }

            // 清理剩余客人
            this.clearRemainingCustomers();
        }
    }

    /**
     * 清理剩余客人
     */
    clearRemainingCustomers() {
        this.customerSprites.forEach(display => {
            if (display.customer.status !== 'satisfied') {
                // 强制客人离开
                display.customer.leave('tavern_closed');

                // 移除显示
                this.removeCustomerDisplay(display);
            }
        });
    }

    /**
     * 移除客人显示
     */
    removeCustomerDisplay(display) {
        // 释放座位
        if (display.seat) {
            display.seat.occupied = false;
            display.seat.customer = null;
        }

        // 移除精灵
        if (display.sprite) display.sprite.destroy();
        if (display.nameLabel) display.nameLabel.destroy();
        if (display.patienceBar) {
            if (display.patienceBar.background) display.patienceBar.background.destroy();
            if (display.patienceBar.bar) display.patienceBar.bar.destroy();
        }

        // 从列表中移除
        const index = this.customerSprites.indexOf(display);
        if (index !== -1) {
            this.customerSprites.splice(index, 1);
        }
    }

    /**
     * 更新函数
     */
    update(time, delta) {
        // 更新客人状态
        this.updateCustomers(delta);

        // 更新员工状态
        this.updateStaff(delta);

        // 更新魔药状态
        this.updatePotions(delta);

        // 更新效果
        this.updateEffects(delta);
    }

    /**
     * 更新客人
     */
    updateCustomers(delta) {
        if (!this.customerManager) return;

        this.customerManager.updateCustomers();

        // 检查离开的客人
        this.customerSprites.forEach(display => {
            if (display.customer.status === 'left') {
                this.removeCustomerDisplay(display);
            }
        });
    }

    /**
     * 更新员工
     */
    updateStaff(delta) {
        if (!this.staffManager) return;

        this.staffManager.updateAllStaff();
    }

    /**
     * 更新魔药
     */
    updatePotions(delta) {
        if (!this.potionManager) return;

        this.potionManager.updatePotions();
    }

    /**
     * 更新效果
     */
    updateEffects(delta) {
        // 这里可以添加各种视觉效果的更新
    }

    /**
     * 场景销毁
     */
    shutdown() {
        console.log('🛑 TavernScene: 场景销毁');

        // 停止所有定时器
        if (this.gameTimeTimer) this.gameTimeTimer.destroy();
        if (this.customerSpawnTimer) this.customerSpawnTimer.destroy();
        if (this.autoSaveTimer) this.autoSaveTimer.destroy();
        if (this.updateUITimer) this.updateUITimer.destroy();

        // 停止管理器
        if (this.customerManager) this.customerManager.stop();
        if (this.staffManager) this.staffManager.stop();

        // 保存游戏
        saveManager.quickSave();

        // 清理资源
        this.customerSprites.forEach(display => {
            this.removeCustomerDisplay(display);
        });

        this.customerSprites = [];
        this.uiElements = {};
    }
}

// 导出场景类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TavernScene;
}