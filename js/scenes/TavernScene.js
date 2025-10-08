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

        this.initializeSceneManagers();

        this.createCustomerArea();

        this.updateAllPanels();

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
        this.initializeLayoutMetrics();
        this.createTopBar();
        this.createTimeDisplay();
        this.createTabViews();
        this.createBottomBar();
        this.createNotificationSystem();
        this.switchTab('tavern');
    }

    initializeLayoutMetrics() {
        const { width, height } = this.cameras.main;

        const topBarHeight = Math.max(72, Math.round(height * 0.12));
        const bottomBarHeight = Math.max(88, Math.round(height * 0.13));
        const bottomBarY = height - bottomBarHeight / 2 - 12;

        const contentTop = topBarHeight + 40;
        const contentBottom = bottomBarY - bottomBarHeight / 2 - 32;
        const contentHeight = Math.max(320, contentBottom - contentTop);

        const statsRatio = 0.28;
        const operationsRatio = 0.32;
        const inventoryRatio = 1 - statsRatio - operationsRatio;

        let statsPanelHeight = Math.max(160, Math.round(contentHeight * statsRatio));
        let actionPanelHeight = Math.max(180, Math.round(contentHeight * operationsRatio));
        let inventoryPanelHeight = Math.max(200, Math.round(contentHeight * inventoryRatio));

        const totalPanelsHeight = statsPanelHeight + actionPanelHeight + inventoryPanelHeight + 48;
        if (totalPanelsHeight > contentHeight) {
            const scale = contentHeight / totalPanelsHeight;
            statsPanelHeight = Math.round(statsPanelHeight * scale);
            actionPanelHeight = Math.round(actionPanelHeight * scale);
            inventoryPanelHeight = Math.round(inventoryPanelHeight * scale);
        }

        let statsPanelY = contentTop + statsPanelHeight / 2;
        let actionPanelY = statsPanelY + statsPanelHeight / 2 + actionPanelHeight / 2 + 16;
        let inventoryPanelY = actionPanelY + actionPanelHeight / 2 + inventoryPanelHeight / 2 + 16;

        const bottomLimit = contentBottom;
        const panelBottom = inventoryPanelY + inventoryPanelHeight / 2;
        if (panelBottom > bottomLimit) {
            const offset = panelBottom - bottomLimit;
            statsPanelY -= offset;
            actionPanelY -= offset;
            inventoryPanelY -= offset;
        }

        const panelWidth = Phaser.Math.Clamp(Math.round(width * 0.9), 320, 580);
        const actionButtonWidth = Math.min(panelWidth * 0.85, width * 0.76);

        this.layout = {
            width,
            height,
            centerX: width / 2,
            centerY: height / 2,
            topBarHeight,
            bottomBarHeight,
            bottomBarY,
            panelWidth,
            actionButtonWidth,
            statsPanelHeight,
            statsPanelY,
            actionPanelHeight,
            actionPanelY,
            inventoryPanelHeight,
            inventoryPanelY
        };
    }

    initializeSceneManagers() {
        if (typeof customerManager !== 'undefined') {
            this.customerManager = customerManager;
        } else if (typeof CustomerManager !== 'undefined') {
            this.customerManager = new CustomerManager();
            this.customerManager.initialize();
        }

        if (typeof staffManager !== 'undefined') {
            this.staffManager = staffManager;
        } else if (typeof StaffManager !== 'undefined') {
            this.staffManager = new StaffManager();
            this.staffManager.initialize();
        }

        if (typeof potionManager !== 'undefined') {
            this.potionManager = potionManager;
        } else if (typeof PotionManager !== 'undefined') {
            this.potionManager = new PotionManager();
        }
    }

    updateAllPanels() {
        this.updateUI();
        this.updateStrategyView();
        this.updateProcurementView();
        this.updatePlayerView();
        this.updateBattleView();
    }

    createTopBar() {
        const { width } = this.cameras.main;
        const barHeight = this.layout.topBarHeight;

        const topBar = this.add.graphics();
        topBar.fillGradientStyle(
            0x24164f, 0x2f1f63,
            0x1a1036, 0x231648,
            0.95
        );
        topBar.fillRect(0, 0, width, barHeight);
        topBar.setDepth(4);

        const topHighlight = this.add.graphics();
        topHighlight.fillGradientStyle(0xffffff, 0xffffff, 0xffe8ba, 0xffe8ba, 0.15);
        topHighlight.fillRect(0, 0, width, barHeight * 0.35);
        topHighlight.setDepth(4.1);

        const frame = this.add.image(width / 2, barHeight / 2, 'ui_window');
        frame.setDisplaySize(width * 0.94, barHeight);
        frame.setAlpha(0.92);
        frame.setDepth(4.5);

        const titleStyle = {
            fontSize: '24px',
            fontFamily: 'ZCOOL KuaiLe',
            color: '#FFD700'
        };

        const title = this.add.text(40, barHeight / 2, '魔药酒馆', titleStyle)
            .setOrigin(0, 0.5);
        title.setDepth(6);

        this.createResourceDisplay();

        const quickActions = [
            { key: 'tavern', texture: 'icon_bell', handler: () => this.switchTab('tavern'), tooltip: '酒馆总览' },
            { key: 'settings', texture: 'icon_palette', handler: () => this.showGameMenu(), tooltip: '设置菜单' },
            { key: 'battle', texture: 'icon_battle', handler: () => this.switchTab('battle'), tooltip: '参加战斗' }
        ];

        quickActions.forEach((item, index) => {
            const icon = this.add.image(width - 40 - index * 44, barHeight / 2, item.texture);
            icon.setDisplaySize(28, 28);
            icon.setInteractive({ useHandCursor: true });
            icon.setAlpha(0.88);
            icon.setDepth(6);

            icon.on('pointerover', () => {
                icon.setAlpha(1);
                this.showTooltip(item.tooltip, icon.x, icon.y - 28);
            });

            icon.on('pointerout', () => {
                icon.setAlpha(0.88);
                this.hideTooltip();
            });

            icon.on('pointerdown', () => {
                GameConfig.audio.playSafe(this, 'sfx_click', { volume: 0.4 });
                item.handler();
                this.hideTooltip();
            });
        });
    }

    createResourceDisplay() {
        const { width } = this.cameras.main;
        const barHeight = this.layout.topBarHeight;

        const resources = [
            { key: 'gold', texture: 'icon_gold', value: gameState.player.gold, formatter: GameUtils.formatGold },
            { key: 'reputation', texture: 'icon_reputation', value: Math.floor(gameState.player.reputation) },
            { key: 'materials', texture: 'icon_materials', value: this.getTotalMaterials() }
        ];

        const spacing = Math.min(220, (width * 0.8) / resources.length);
        const startX = width / 2 - ((resources.length - 1) * spacing) / 2;
        const y = barHeight / 2;

        this.resourceFormatters = this.resourceFormatters || {};

        resources.forEach((resource, index) => {
            const xPos = startX + index * spacing;

            const icon = this.add.image(xPos - 46, y, resource.texture);
            icon.setOrigin(0, 0.5);
            icon.setDisplaySize(26, 26);
            icon.setAlpha(0.92);
            icon.setDepth(6);

            const formatter = resource.formatter || ((value) => `${value}`);
            const valueText = this.add.text(xPos - 10, y, formatter(resource.value), {
                fontSize: '18px',
                fontFamily: 'Noto Sans SC',
                color: '#FFE8A3'
            }).setOrigin(0, 0.5);
            valueText.setDepth(6);

            this.uiElements[resource.key + 'Text'] = valueText;
            this.resourceFormatters[resource.key] = formatter;
        });
    }

    createTabViews() {
        this.tabViews = {};
        this.tabData = {};

        const tavernView = this.add.container(0, 0);
        tavernView.setDepth(5);
        tavernView.setVisible(false);
        this.tabViews.tavern = tavernView;

        tavernView.add(this.buildStatsPanel());
        tavernView.add(this.buildOperationsPanel());
        tavernView.add(this.buildInventoryPanel());

        const battleView = this.createBattleTab();
        const strategyView = this.createStrategyTab();
        const procurementView = this.createProcurementTab();
        const playerView = this.createPlayerTab();

        this.tabViews.battle = battleView;
        this.tabViews.strategy = strategyView;
        this.tabViews.procurement = procurementView;
        this.tabViews.player = playerView;

        Object.values(this.tabViews).forEach(view => {
            if (view) {
                view.setVisible(false);
            }
        });
    }

    createBottomBar() {
        const { width } = this.cameras.main;
        const barHeight = this.layout.bottomBarHeight;

        const container = this.add.container(width / 2, this.layout.bottomBarY);
        container.setDepth(6);

        const frame = this.add.image(0, 0, 'ui_window');
        frame.setDisplaySize(width * 0.94, barHeight);
        frame.setAlpha(0.92);
        container.add(frame);

        const tabs = [
            { key: 'tavern', label: '酒馆', icon: 'icon_gold' },
            { key: 'battle', label: '战斗', icon: 'icon_battle' },
            { key: 'strategy', label: '策略', icon: 'icon_palette' },
            { key: 'procurement', label: '采购', icon: 'icon_materials' },
            { key: 'player', label: '玩家', icon: 'icon_reputation' }
        ];

        this.tabButtons = {};
        const tabWidth = frame.displayWidth / tabs.length;

        tabs.forEach((tab, index) => {
            const button = this.createTabBarButton(tab, tabWidth, barHeight);
            button.container.x = -frame.displayWidth / 2 + tabWidth * index + tabWidth / 2;
            container.add(button.container);
            this.tabButtons[tab.key] = button;
        });

        this.uiElements.tabBar = container;
    }

    createTabBarButton(tab, tabWidth, barHeight) {
        const container = this.add.container(0, 0);
        container.setSize(tabWidth - 12, barHeight - 16);

        const bg = this.add.image(0, 0, 'ui_button');
        bg.setDisplaySize(tabWidth - 16, barHeight - 18);
        container.add(bg);

        const icon = this.add.image(-tabWidth / 4, -2, tab.icon);
        icon.setDisplaySize(22, 22);
        container.add(icon);

        const label = this.add.text(0, barHeight * 0.08, tab.label, {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#EDE3FF'
        }).setOrigin(0.5, 0);
        container.add(label);

        container.setInteractive(new Phaser.Geom.Rectangle(-tabWidth / 2, -barHeight / 2, tabWidth, barHeight), Phaser.Geom.Rectangle.Contains);
        container.on('pointerdown', () => {
            GameConfig.audio.playSafe(this, 'sfx_click', { volume: 0.4 });
            this.switchTab(tab.key);
        });

        return { container, bg, icon, label };
    }

    createPanelButton(label, onClick) {
        const container = this.add.container(0, 0);

        const width = Math.min(this.layout.actionButtonWidth, this.layout.panelWidth - 80);
        const bg = this.add.image(0, 0, 'ui_button');
        bg.setDisplaySize(width, 48);
        container.add(bg);

        const text = this.add.text(0, 0, label, {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC'
        }).setOrigin(0.5);
        container.add(text);

        container.setSize(width, 48);
        container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -24, width, 48), Phaser.Geom.Rectangle.Contains);

        container.on('pointerover', () => {
            bg.setTexture('ui_button_hover');
        });

        container.on('pointerout', () => {
            bg.setTexture('ui_button');
        });

        container.on('pointerdown', () => {
            bg.setTexture('ui_button_pressed');
        });

        container.on('pointerup', () => {
            bg.setTexture('ui_button_hover');
            if (typeof onClick === 'function') {
                onClick();
            }
        });

        return container;
    }

    setTabButtonState(tabKey, active) {
        const button = this.tabButtons && this.tabButtons[tabKey];
        if (!button) return;

        button.bg.setTexture(active ? 'ui_button_pressed' : 'ui_button');
        button.icon.setAlpha(active ? 1 : 0.85);
        button.label.setColor(active ? '#FFFFFF' : '#EDE3FF');
        button.container.setDepth(active ? 7 : 6);
    }

    switchTab(tabKey) {
        if (!this.tabViews || !this.tabViews[tabKey]) {
            return;
        }

        this.activeTab = tabKey;

        Object.entries(this.tabViews).forEach(([key, view]) => {
            if (view) {
                view.setVisible(key === tabKey);
            }
        });

        Object.keys(this.tabButtons || {}).forEach(key => {
            this.setTabButtonState(key, key === tabKey);
        });

        this.updateTabContent(tabKey);
    }

    updateTabContent(tabKey) {
        switch (tabKey) {
            case 'tavern':
                this.updateUI();
                break;
            case 'strategy':
                this.updateStrategyView();
                break;
            case 'procurement':
                this.updateProcurementView();
                break;
            case 'player':
                this.updatePlayerView();
                break;
            case 'battle':
                this.updateBattleView();
                break;
            default:
                break;
        }
    }

    buildStatsPanel() {
        const { panelWidth, statsPanelHeight, statsPanelY, centerX } = this.layout;
        const container = this.add.container(centerX, statsPanelY);
        container.setDepth(6);

        const panel = this.add.image(0, 0, 'ui_panel');
        panel.setDisplaySize(panelWidth, statsPanelHeight);
        container.add(panel);

        const title = this.add.text(0, -statsPanelHeight / 2 + 32, '今日统计', {
            fontSize: '20px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);
        container.add(title);

        const stats = [
            { label: '营业额', value: '0 金币', key: 'revenue' },
            { label: '服务客人', value: '0 位', key: 'customers' },
            { label: '制作魔药', value: '0 瓶', key: 'potions' },
            { label: '员工效率', value: '100%', key: 'efficiency' }
        ];

        const rowGap = (statsPanelHeight - 100) / stats.length;

        stats.forEach((stat, index) => {
            const yOffset = -statsPanelHeight / 2 + 80 + index * rowGap;

            const label = this.add.text(-panelWidth / 2 + 40, yOffset, stat.label, {
                fontSize: '16px',
                fontFamily: 'Noto Sans SC',
                color: '#FFF8DC'
            }).setOrigin(0, 0.5);
            container.add(label);

            const value = this.add.text(panelWidth / 2 - 40, yOffset, stat.value, {
                fontSize: '16px',
                fontFamily: 'Noto Sans SC',
                color: '#8BF0A7'
            }).setOrigin(1, 0.5);
            container.add(value);

            this.uiElements[`${stat.key}Stat`] = value;
        });

        return container;
    }

    buildOperationsPanel() {
        const { panelWidth, actionPanelHeight, actionPanelY, centerX } = this.layout;
        const container = this.add.container(centerX, actionPanelY);
        container.setDepth(6);

        const panel = this.add.image(0, 0, 'ui_panel');
        panel.setDisplaySize(panelWidth, actionPanelHeight);
        container.add(panel);

        const title = this.add.text(0, -actionPanelHeight / 2 + 30, '酒馆运营', {
            fontSize: '20px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);
        container.add(title);

        const eventLabel = this.add.text(0, -actionPanelHeight / 2 + 70, '事件: 当前无随机事件', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFE8A3'
        }).setOrigin(0.5, 0);
        container.add(eventLabel);
        this.uiElements.eventSummary = eventLabel;

        const staffTitle = this.add.text(-panelWidth / 2 + 40, -actionPanelHeight / 2 + 110, '员工状态', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#C8F8FF'
        }).setOrigin(0, 0);
        container.add(staffTitle);

        this.uiElements.staffList = [];
        const maxRows = 5;
        const rowGap = (actionPanelHeight - 160) / maxRows;

        for (let i = 0; i < maxRows; i++) {
            const rowY = -actionPanelHeight / 2 + 150 + i * rowGap;
            const staffText = this.add.text(-panelWidth / 2 + 40, rowY, '员工空缺', {
                fontSize: '14px',
                fontFamily: 'Noto Sans SC',
                color: '#FFF8DC'
            }).setOrigin(0, 0.5);
            container.add(staffText);
            this.uiElements.staffList.push(staffText);
        }

        const brewingButton = this.createPanelButton('打开制作台', () => {
            GameConfig.audio.playSafe(this, 'sfx_click', { volume: 0.4 });
            this.openBrewingInterface();
        });
        brewingButton.setPosition(0, actionPanelHeight / 2 - 50);
        container.add(brewingButton);

        return container;
    }

    buildInventoryPanel() {
        const { panelWidth, inventoryPanelHeight, inventoryPanelY, centerX } = this.layout;
        const container = this.add.container(centerX, inventoryPanelY);
        container.setDepth(6);

        const panel = this.add.image(0, 0, 'ui_panel');
        panel.setDisplaySize(panelWidth, inventoryPanelHeight);
        container.add(panel);

        const title = this.add.text(0, -inventoryPanelHeight / 2 + 30, '库存展示', {
            fontSize: '18px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);
        container.add(title);

        const content = this.add.container(0, -inventoryPanelHeight / 2 + 70);
        container.add(content);

        this.uiElements.inventoryContainer = container;
        this.uiElements.inventoryContent = content;

        this.updateInventoryDisplay();

        return container;
    }

    createBattleTab() {
        const { panelWidth, statsPanelHeight, centerX, statsPanelY } = this.layout;
        const container = this.add.container(centerX, statsPanelY);
        container.setDepth(5);
        container.setVisible(false);

        const panelHeight = statsPanelHeight + 80;
        const panel = this.add.image(0, 0, 'ui_panel');
        panel.setDisplaySize(panelWidth, panelHeight);
        container.add(panel);

        const title = this.add.text(0, -panelHeight / 2 + 32, '战斗匹配', {
            fontSize: '20px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);
        container.add(title);

        const description = this.add.text(0, -panelHeight / 2 + 80,
            '匹配对手进行魔药对决，赢取荣耀与奖励。', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFE8A3',
            align: 'center',
            wordWrap: { width: panelWidth - 80 }
        }).setOrigin(0.5, 0);
        container.add(description);

        const rankText = this.add.text(0, -panelHeight / 2 + 130, '当前段位: 未定级', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#C8F8FF'
        }).setOrigin(0.5);
        container.add(rankText);

        const button = this.add.container(0, panelHeight / 2 - 60);
        button.setInteractive(new Phaser.Geom.Rectangle(-110, -28, 220, 56), Phaser.Geom.Rectangle.Contains);
        const btnBg = this.add.image(0, 0, 'ui_button');
        btnBg.setDisplaySize(220, 56);
        button.add(btnBg);
        const btnLabel = this.add.text(0, 0, '开始匹配', {
            fontSize: '18px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC'
        }).setOrigin(0.5);
        button.add(btnLabel);

        button.on('pointerover', () => btnBg.setTexture('ui_button_hover'));
        button.on('pointerout', () => btnBg.setTexture('ui_button'));
        button.on('pointerdown', () => {
            btnBg.setTexture('ui_button_pressed');
            GameConfig.audio.playSafe(this, 'sfx_click', { volume: 0.4 });
            this.openBattleInterface();
        });
        button.on('pointerup', () => btnBg.setTexture('ui_button_hover'));
        container.add(button);

        this.uiElements.battleRank = rankText;

        return container;
    }

    updateBattleView() {
        if (!this.uiElements.battleRank) return;
        const battleState = gameState.battle || {};
        const rank = battleState.rank || battleState.tier || '未定级';
        const winRate = battleState.winRate ? `${Math.floor(battleState.winRate * 100)}%` : '0%';
        this.uiElements.battleRank.setText(`当前段位: ${rank} · 胜率 ${winRate}`);
    }

    createStrategyTab() {
        const { panelWidth, statsPanelHeight, actionPanelHeight, centerX, statsPanelY } = this.layout;
        const container = this.add.container(centerX, statsPanelY);
        container.setDepth(5);
        container.setVisible(false);

        const panelHeight = statsPanelHeight + actionPanelHeight;
        const panel = this.add.image(0, 0, 'ui_panel');
        panel.setDisplaySize(panelWidth, panelHeight);
        container.add(panel);

        const title = this.add.text(0, -panelHeight / 2 + 30, '生产策略', {
            fontSize: '20px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);
        container.add(title);

        const guidance = this.add.text(0, -panelHeight / 2 + 64,
            '根据库存与订单制定各类魔药的生产数量。', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFE8A3',
            align: 'center',
            wordWrap: { width: panelWidth - 80 }
        }).setOrigin(0.5, 0);
        container.add(guidance);

        this.uiElements.strategyRows = [];
        const recipes = Object.values(PotionRecipes).slice(0, 6);
        const startY = -panelHeight / 2 + 120;
        const rowGap = (panelHeight - 160) / recipes.length;

        recipes.forEach((recipe, index) => {
            const rowY = startY + index * rowGap;

            const rowContainer = this.add.container(0, rowY);

            const nameText = this.add.text(-panelWidth / 2 + 40, 0, recipe.name, {
                fontSize: '16px',
                fontFamily: 'Noto Sans SC',
                color: '#FFF8DC'
            }).setOrigin(0, 0.5);
            rowContainer.add(nameText);

            const materialsText = this.add.text(0, 0, '', {
                fontSize: '12px',
                fontFamily: 'Noto Sans SC',
                color: '#C8F8FF'
            }).setOrigin(0.5, 0.5);
            rowContainer.add(materialsText);

            const quantityText = this.add.text(panelWidth / 2 - 40, 0, '数量: 0', {
                fontSize: '14px',
                fontFamily: 'Noto Sans SC',
                color: '#8BF0A7'
            }).setOrigin(1, 0.5);
            rowContainer.add(quantityText);

            container.add(rowContainer);

            this.uiElements.strategyRows.push({
                recipeId: recipe.id,
                materialsText,
                quantityText
            });
        });

        return container;
    }

    updateStrategyView() {
        if (!this.uiElements.strategyRows) return;
        const plan = gameState.productionPlan || {};

        this.uiElements.strategyRows.forEach(row => {
            const recipe = PotionRecipes[row.recipeId];
            if (!recipe) return;

            const quantity = plan[row.recipeId] || 0;
            row.quantityText.setText(`数量: ${quantity}`);

            const materialSummary = recipe.materials
                .map(mat => `${this.formatMaterialLabel(mat.type)} x${mat.amount}`)
                .join(' · ');
            row.materialsText.setText(materialSummary);
        });
    }

    createProcurementTab() {
        const { panelWidth, statsPanelHeight, actionPanelHeight, centerX, statsPanelY } = this.layout;
        const container = this.add.container(centerX, statsPanelY);
        container.setDepth(5);
        container.setVisible(false);

        const panelHeight = statsPanelHeight + actionPanelHeight;
        const panel = this.add.image(0, 0, 'ui_panel');
        panel.setDisplaySize(panelWidth, panelHeight);
        container.add(panel);

        const title = this.add.text(0, -panelHeight / 2 + 30, '材料采购', {
            fontSize: '20px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);
        container.add(title);

        const columnsY = -panelHeight / 2 + 80;

        const materialsTitle = this.add.text(-panelWidth / 2 + 40, columnsY, '库存材料', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#C8F8FF'
        }).setOrigin(0, 0);
        container.add(materialsTitle);

        const offersTitle = this.add.text(panelWidth / 2 - 40, columnsY, '随机商品', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#C8F8FF'
        }).setOrigin(1, 0);
        container.add(offersTitle);

        this.uiElements.procurementMaterials = [];
        this.uiElements.procurementOffers = [];

        const materialsStartY = columnsY + 28;
        const rowGap = (panelHeight - 140) / 6;

        for (let i = 0; i < 6; i++) {
            const y = materialsStartY + i * rowGap;

            const materialText = this.add.text(-panelWidth / 2 + 40, y, '—', {
                fontSize: '14px',
                fontFamily: 'Noto Sans SC',
                color: '#FFF8DC'
            }).setOrigin(0, 0.5);
            container.add(materialText);
            this.uiElements.procurementMaterials.push(materialText);

            const offerText = this.add.text(panelWidth / 2 - 40, y, '—', {
                fontSize: '14px',
                fontFamily: 'Noto Sans SC',
                color: '#FFD7A3'
            }).setOrigin(1, 0.5);
            container.add(offerText);
            this.uiElements.procurementOffers.push(offerText);
        }

        this.procurementOffers = this.generateProcurementOffers();
        this.updateProcurementView();

        return container;
    }

    generateProcurementOffers() {
        const materialKeys = Object.keys(AssetManifest.materials || {});
        if (!materialKeys.length) return [];

        const offers = [];
        for (let i = 0; i < 6; i++) {
            const key = Phaser.Utils.Array.GetRandom(materialKeys);
            const price = 50 + Math.floor(Math.random() * 200);
            offers.push({ key, price });
        }
        return offers;
    }

    updateProcurementView() {
        if (!this.uiElements.procurementMaterials || !this.uiElements.procurementOffers) return;

        const materials = gameState.inventory?.materials || {};
        const materialEntries = Object.entries(materials).slice(0, this.uiElements.procurementMaterials.length);

        this.uiElements.procurementMaterials.forEach((text, index) => {
            if (materialEntries[index]) {
                const [key, value] = materialEntries[index];
                text.setText(`${this.formatMaterialLabel(key)}: ${value}`);
            } else {
                text.setText('—');
            }
        });

        if (!this.procurementOffers || !this.procurementOffers.length) {
            this.procurementOffers = this.generateProcurementOffers();
        }

        this.uiElements.procurementOffers.forEach((text, index) => {
            if (this.procurementOffers[index]) {
                const offer = this.procurementOffers[index];
                text.setText(`${this.formatMaterialLabel(offer.key)}: ${offer.price} 金币`);
            } else {
                text.setText('—');
            }
        });
    }

    createPlayerTab() {
        const { panelWidth, statsPanelHeight, actionPanelHeight, centerX, statsPanelY } = this.layout;
        const container = this.add.container(centerX, statsPanelY);
        container.setDepth(5);
        container.setVisible(false);

        const panelHeight = statsPanelHeight + actionPanelHeight;
        const panel = this.add.image(0, 0, 'ui_panel');
        panel.setDisplaySize(panelWidth, panelHeight);
        container.add(panel);

        const title = this.add.text(0, -panelHeight / 2 + 30, '玩家信息', {
            fontSize: '20px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);
        container.add(title);

        const avatar = this.add.image(-panelWidth / 2 + 100, -panelHeight / 2 + 160, 'character_player');
        avatar.setDisplaySize(96, 96);
        container.add(avatar);

        const infoTexts = {
            name: this.add.text(-panelWidth / 2 + 190, -panelHeight / 2 + 110, '名称: —', {
                fontSize: '16px',
                fontFamily: 'Noto Sans SC',
                color: '#FFF8DC'
            }).setOrigin(0, 0),
            level: this.add.text(-panelWidth / 2 + 190, -panelHeight / 2 + 140, '等级: —', {
                fontSize: '14px',
                fontFamily: 'Noto Sans SC',
                color: '#C8F8FF'
            }).setOrigin(0, 0),
            reputation: this.add.text(-panelWidth / 2 + 190, -panelHeight / 2 + 170, '声誉: —', {
                fontSize: '14px',
                fontFamily: 'Noto Sans SC',
                color: '#C8F8FF'
            }).setOrigin(0, 0),
            gold: this.add.text(-panelWidth / 2 + 190, -panelHeight / 2 + 200, '金币: —', {
                fontSize: '14px',
                fontFamily: 'Noto Sans SC',
                color: '#C8F8FF'
            }).setOrigin(0, 0),
            achievements: this.add.text(-panelWidth / 2 + 190, -panelHeight / 2 + 230, '成就: —', {
                fontSize: '14px',
                fontFamily: 'Noto Sans SC',
                color: '#FFE8A3',
                wordWrap: { width: panelWidth - 240 }
            }).setOrigin(0, 0)
        };

        Object.values(infoTexts).forEach(text => container.add(text));

        this.uiElements.playerInfo = infoTexts;

        return container;
    }

    updatePlayerView() {
        if (!this.uiElements.playerInfo) return;
        const player = gameState.player || {};
        const info = this.uiElements.playerInfo;

        info.name.setText(`名称: ${player.name || '—'}`);
        info.level.setText(`等级: ${player.level || 1}`);
        info.reputation.setText(`声誉: ${Math.floor(player.reputation || 0)}`);
        info.gold.setText(`金币: ${GameUtils.formatGold(player.gold || 0)}`);

        const achievements = player.achievements && player.achievements.length
            ? player.achievements.slice(0, 3).join('、')
            : '暂无成就';
        info.achievements.setText(`成就: ${achievements}`);
    }

    formatMaterialLabel(key) {
        if (!key) return '未知材料';

        const dictionary = {
            moonGrass: '月光草',
            'moon_grass': '月光草',
            fireGrass: '火焰草',
            'fire_grass': '火焰草',
            dewDrop: '晨露滴',
            'dew_drop': '晨露滴',
            springWater: '清泉水',
            'spring_water': '清泉水',
            dragonScale: '龙鳞',
            'dragon_scale': '龙鳞',
            phoenixFeather: '凤凰羽',
            'phoenix_feather': '凤凰羽',
            demonBlood: '魔血',
            'demon_blood': '魔血',
            unicornHorn: '独角碎片',
            'unicorn_horn': '独角碎片',
            timeSand: '时光砂',
            'time_sand': '时光砂',
            soulFragment: '灵魂碎片',
            'soul_fragment': '灵魂碎片',
            eternalFlower: '永恒花',
            'eternal_flower': '永恒花',
            windLeaf: '风之叶',
            'wind_leaf': '风之叶',
            earthRoot: '大地根',
            'earth_root': '大地根',
            lightShard: '光辉碎片',
            'light_shard': '光辉碎片',
            darkEssence: '暗影精华',
            'dark_essence': '暗影精华',
            iceCrystal: '寒冰结晶',
            'ice_crystal': '寒冰结晶',
            thunderStone: '雷霆石',
            'thunder_stone': '雷霆石'
        };

        if (dictionary[key]) return dictionary[key];

        let normalized = key;
        normalized = normalized.replace(/^material_/, '');
        normalized = normalized.replace(/_/g, ' ');
        normalized = normalized.replace(/([A-Z])/g, ' $1');
        normalized = normalized.trim();
        return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    /**
     * 创建时间显示
     */
    createTimeDisplay() {
        const { width } = this.cameras.main;
        const barWidth = Math.min(width * 0.6, 360);
        const container = this.add.container(width / 2, this.layout.topBarHeight + 14);
        container.setDepth(6);

        const barBg = this.add.image(0, 0, 'ui_progress_bar');
        barBg.setDisplaySize(barWidth, 18);
        container.add(barBg);

        const progressFill = this.add.image(-barWidth / 2, 0, 'ui_progress_fill');
        progressFill.setOrigin(0, 0.5);
        const fillHeight = 12;
        progressFill.setDisplaySize(barWidth, fillHeight);
        container.add(progressFill);

        const timeText = this.add.text(0, -24, '06:00', {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC'
        }).setOrigin(0.5);
        container.add(timeText);

        this.uiElements.timeProgressContainer = container;
        this.uiElements.timeProgressFill = progressFill;
        this.uiElements.timeProgressWidth = barWidth;
        this.uiElements.timeProgressHeight = fillHeight;
        this.uiElements.timeDisplay = timeText;
        this.uiElements.timeText = timeText;
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

        const seatCount = 5;
        const horizontalPadding = Math.min(96, width * 0.1);
        const usableWidth = Math.max(160, width - horizontalPadding * 2);
        const baseY = height * 0.55;

        this.customerSeats = [];

        for (let i = 0; i < seatCount; i++) {
            const progress = seatCount === 1 ? 0.5 : i / (seatCount - 1);
            const x = horizontalPadding + usableWidth * progress;
            const y = baseY + (i % 2 === 0 ? 0 : 56);

            this.customerSeats.push({
                id: i,
                x,
                y,
                occupied: false,
                customer: null
            });
        }

        if (!this.customerManager && typeof customerManager !== 'undefined') {
            this.customerManager = customerManager;
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

        if (this.uiElements.timeProgressFill && this.uiElements.timeProgressWidth) {
            const progress = Phaser.Math.Clamp(this.currentTime / 24, 0, 1);
            const width = Math.max(6, this.uiElements.timeProgressWidth * progress);
            const height = this.uiElements.timeProgressHeight || 12;
            this.uiElements.timeProgressFill.setDisplaySize(width, height);
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

        this.procurementOffers = this.generateProcurementOffers();
        this.updateProcurementView();
        this.updateStrategyView();
        this.updatePlayerView();

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
        const staffTexts = this.uiElements.staffList || [];
        const staffInfo = this.staffManager && this.staffManager.getStaffInfo
            ? this.staffManager.getStaffInfo()
            : (gameState.staff || []);

        staffTexts.forEach((text, index) => {
            if (!text) return;
            const info = staffInfo[index];
            if (info) {
                const status = info.status || info.state || '工作中';
                const efficiency = info.efficiency ? ` · 效率 ${Math.floor(info.efficiency * 100)}%` : '';
                text.setText(`${info.name || '员工'} · ${status}${efficiency}`);
            } else {
                text.setText('员工空缺');
            }
        });

        const activeEvents = (gameState.events && gameState.events.active) || [];
        if (this.uiElements.eventSummary) {
            if (activeEvents.length) {
                const current = activeEvents[0];
                this.uiElements.eventSummary.setText(`事件: ${current.title || '未知事件'}`);
            } else {
                this.uiElements.eventSummary.setText('事件: 当前无随机事件');
            }
        }
    }

    /**
     * 更新库存显示
     */
    updateInventoryDisplay() {
        if (!this.potionManager || !this.uiElements.inventoryContent) return;

        const content = this.uiElements.inventoryContent;
        content.removeAll(true);

        const potions = this.potionManager.getAvailablePotions().slice(0, 8);
        const columns = 4;
        const slotSpacingX = this.layout.panelWidth / columns;
        const slotSpacingY = 56;
        const startX = -this.layout.panelWidth / 2 + slotSpacingX / 2;

        potions.forEach((potion, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const slot = this.add.container(startX + col * slotSpacingX, row * slotSpacingY);

            const bg = this.add.image(0, 0, 'ui_button');
            bg.setDisplaySize(this.layout.actionButtonWidth / 1.6, 42);
            bg.setAlpha(0.85);
            slot.add(bg);

            const nameText = this.add.text(-this.layout.actionButtonWidth / 4, -10, potion.name, {
                fontSize: '14px',
                fontFamily: 'Noto Sans SC',
                color: '#FFE8A3'
            }).setOrigin(0, 0);
            slot.add(nameText);

            const quantityText = this.add.text(-this.layout.actionButtonWidth / 4, 12,
                `数量 ${potion.currentCharges || 0}`, {
                fontSize: '12px',
                fontFamily: 'Noto Sans SC',
                color: '#C8F8FF'
            }).setOrigin(0, 0.5);
            slot.add(quantityText);

            content.add(slot);
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
        this.updateResourceText('gold', gameState.player.gold);
        this.updateResourceText('reputation', Math.floor(gameState.player.reputation));
        this.updateResourceText('materials', this.getTotalMaterials());

        const stats = gameState.statistics || {};

        if (this.uiElements.revenueStat) {
            this.uiElements.revenueStat.setText(`${this.revenueToday} 金币`);
        }

        if (this.uiElements.customersStat) {
            this.uiElements.customersStat.setText(`${this.customersServedToday} 位`);
        }

        if (this.uiElements.potionsStat) {
            const crafted = stats.potionsCraftedToday || stats.totalPotionsCrafted || 0;
            this.uiElements.potionsStat.setText(`${crafted} 瓶`);
        }

        if (this.uiElements.efficiencyStat) {
            const efficiency = stats.staffEfficiency ? Math.floor(stats.staffEfficiency * 100) : 100;
            this.uiElements.efficiencyStat.setText(`${efficiency}%`);
        }

        this.customerSprites.forEach(display => {
            if (display.patienceBar) {
                display.patienceBar.update();
            }
        });

        this.updateStaffDisplay();
        this.updateInventoryDisplay();

        if (this.activeTab === 'strategy') {
            this.updateStrategyView();
        }

        if (this.activeTab === 'procurement') {
            this.updateProcurementView();
        }

        if (this.activeTab === 'player') {
            this.updatePlayerView();
        }

        if (this.activeTab === 'battle') {
            this.updateBattleView();
        }
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
