/**
 * 魔药制作场景
 * 制作魔药的小游戏，包含拖拽、计时、成功率等元素
 */

class BrewingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BrewingScene' });

        // 制作状态
        this.isBrewing = false;
        this.currentRecipe = null;
        this.selectedMaterials = [];
        this.brewingStartTime = null;
        this.brewingProgress = 0;
        this.brewingTimer = null;

        // UI元素
        this.uiElements = {};
        this.materialSlots = [];
        this.cauldronSprite = null;
        this.progressBar = null;
        this.timerText = null;

        // 拖拽系统
        this.dragSystem = null;
        this.draggedMaterial = null;
        this.dropZones = [];

        // 效果
        this.particleEffects = [];
        this.steamEffects = [];
        this.glowEffects = [];

        // 结果
        this.brewingResult = null;
        this.successRate = 0;
    }

    create() {
        console.log('🧪 BrewingScene: 创建魔药制作场景');

        // 创建背景
        this.createBackground();

        // 创建UI界面
        this.createUI();

        // 创建制作台
        this.createBrewingStation();

        // 创建材料区域
        this.createMaterialArea();

        // 创建坩埚区域
        this.createCauldronArea();

        // 创建配方面板
        this.createRecipePanel();

        // 创建效果系统
        this.createEffectSystem();

        // 创建拖拽系统
        this.createDragSystem();

        // 创建控制按钮
        this.createControlButtons();

        // 设置键盘控制
        this.setupKeyboardControls();

        // 显示帮助信息
        this.showHelpMessage();
    }

    /**
     * 创建背景
     */
    createBackground() {
        const { width, height } = this.cameras.main;

        // 主背景
        const bg = this.add.image(width / 2, height / 2, 'brewing_background');
        bg.setDisplaySize(width, height);
        bg.setAlpha(0.8);

        // 添加魔法氛围
        const magicAtmosphere = this.add.graphics();
        magicAtmosphere.fillGradientStyle(
            0x2D1B69, 0x2D1B69,
            0x1A1A2E, 0x1A1A2E,
            0.3, 0.6
        );
        magicAtmosphere.fillRect(0, 0, width, height);

        // 添加环境光
        this.createAmbientLighting();
    }

    /**
     * 创建环境光
     */
    createAmbientLighting() {
        const { width, height } = this.cameras.main;

        // 中央工作光源
        const workLight = this.add.pointlight(width / 2, height / 2, 0xFFD700, 400, 0.6);
        workLight.setAttenuation(0.05);

        // 坩埚光源
        const cauldronLight = this.add.pointlight(width / 2, height - 200, 0xFF6348, 200, 0.8);
        cauldronLight.setAttenuation(0.1);

        // 材料光源
        const materialLight = this.add.pointlight(150, height / 2, 0x00FF7F, 150, 0.5);
        materialLight.setAttenuation(0.15);
    }

    /**
     * 创建UI界面
     */
    createUI() {
        const { width, height } = this.cameras.main;

        // 顶部标题栏
        this.createTitleBar();

        // 左侧材料面板
        this.createMaterialPanel();

        // 右侧配方面板
        this.createRecipePanelUI();

        // 底部控制面板
        this.createControlPanel();

        // 状态显示
        this.createStatusDisplay();

        // 进度显示
        this.createProgressDisplay();
    }

    /**
     * 创建标题栏
     */
    createTitleBar() {
        const { width } = this.cameras.main;

        // 背景条
        const titleBar = this.add.graphics();
        titleBar.fillStyle(0x2D1B69, 0.9);
        titleBar.fillRect(0, 0, width, 60);
        titleBar.lineStyle(2, 0xFFD700, 0.8);
        titleBar.strokeRect(0, 0, width, 60);

        // 标题
        const titleStyle = {
            fontSize: '28px',
            fontFamily: 'ZCOOL KuaiLe',
            color: '#FFD700'
        };

        this.add.text(width / 2, 30, '魔药制作', titleStyle)
            .setOrigin(0.5);

        // 返回按钮
        this.createBackButton(20, 30);
    }

    /**
     * 创建返回按钮
     */
    createBackButton(x, y) {
        const button = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x3742FA, 0.8);
        bg.fillRoundedRect(-40, -15, 80, 30, 5);
        bg.lineStyle(1, 0xFFD700, 0.8);
        bg.strokeRoundedRect(-40, -15, 80, 30, 5);

        const text = this.add.text(0, 0, '返回', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        button.add([bg, text]);
        button.setInteractive(new Phaser.Geom.Rectangle(-40, -15, 80, 30),
            Phaser.Geom.Rectangle.Contains);

        button.on('pointerdown', () => {
            this.sound.play('sfx_click', { volume: 0.5 });
            this.scene.stop();
            this.scene.resume('TavernScene');
        });

        return button;
    }

    /**
     * 创建材料面板
     */
    createMaterialPanel() {
        const panel = this.add.graphics();
        panel.fillStyle(0x2D1B69, 0.8);
        panel.fillRoundedRect(20, 80, 200, 500, 10);
        panel.lineStyle(2, 0xFFD700, 0.8);
        panel.strokeRoundedRect(20, 80, 200, 500, 10);

        // 面板标题
        this.add.text(120, 100, '材料', {
            fontSize: '20px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);

        // 创建材料槽位
        this.createMaterialSlots();

        // 创建材料显示
        this.updateMaterialDisplay();
    }

    /**
     * 创建材料槽位
     */
    createMaterialSlots() {
        const slotSize = 40;
        const slotsPerRow = 4;
        const startX = 40;
        const startY = 140;

        this.materialSlots = [];

        // 获取可用材料
        const availableMaterials = this.getAvailableMaterials();

        availableMaterials.forEach((material, index) => {
            const row = Math.floor(index / slotsPerRow);
            const col = index % slotsPerRow;
            const x = startX + col * (slotSize + 10);
            const y = startY + row * (slotSize + 10);

            const slot = this.createMaterialSlot(x, y, material);
            this.materialSlots.push(slot);
        });
    }

    /**
     * 创建单个材料槽位
     */
    createMaterialSlot(x, y, material) {
        const slot = this.add.container(x, y);

        // 槽位背景
        const bg = this.add.graphics();
        bg.fillStyle(0x3742FA, 0.6);
        bg.fillRoundedRect(-20, -20, 40, 40, 5);
        bg.lineStyle(2, 0xFFD700, 0.5);
        bg.strokeRoundedRect(-20, -20, 40, 40, 5);

        // 材料图标
        const icon = this.add.text(0, 0, this.getMaterialEmoji(material.id), {
            fontSize: '20px'
        }).setOrigin(0.5);

        // 数量显示
        const countText = this.add.text(15, 15, material.count.toString(), {
            fontSize: '10px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF',
            backgroundColor: '#2D1B69',
            padding: { x: 2, y: 1 }
        }).setOrigin(0.5);

        slot.add([bg, icon, countText]);
        slot.setInteractive(new Phaser.Geom.Rectangle(-20, -20, 40, 40),
            Phaser.Geom.Rectangle.Contains);

        // 拖拽功能
        slot.on('pointerdown', (pointer) => {
            this.startDragMaterial(material, slot, pointer);
        });

        // 悬停效果
        slot.on('pointerover', () => {
            this.showMaterialTooltip(material, x, y - 30);
            this.tweens.add({
                targets: slot,
                scale: 1.1,
                duration: 200
            });
        });

        slot.on('pointerout', () => {
            this.hideMaterialTooltip();
            this.tweens.add({
                targets: slot,
                scale: 1,
                duration: 200
            });
        });

        slot.materialData = material;
        slot.bg = bg;
        slot.icon = icon;
        slot.countText = countText;

        return slot;
    }

    /**
     * 获取材料表情符号
     */
    getMaterialEmoji(materialId) {
        const emojiMap = {
            'moonGrass': '🌙',
            'fireGrass': '🔥',
            'dewDrop': '💧',
            'springWater': '🌊',
            'dragonScale': '🐉',
            'phoenixFeather': '🔥',
            'demonBlood': '🩸',
            'unicornHorn': '🦄',
            'timeSand': '⏳',
            'soulFragment': '👻',
            'eternalFlower': '🌸'
        };

        return emojiMap[materialId] || '💎';
    }

    /**
     * 获取可用材料
     */
    getAvailableMaterials() {
        const materials = [];
        const inventory = gameState.inventory.materials;

        Object.entries(inventory).forEach(([id, count]) => {
            if (count > 0) {
                const materialData = MaterialData[id];
                if (materialData) {
                    materials.push({
                        id: id,
                        name: materialData.name,
                        count: count,
                        rarity: materialData.rarity
                    });
                }
            }
        });

        return materials;
    }

    /**
     * 显示材料提示
     */
    showMaterialTooltip(material, x, y) {
        if (this.materialTooltip) {
            this.materialTooltip.destroy();
        }

        const tooltipStyle = {
            fontSize: '12px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF',
            backgroundColor: '#2D1B69',
            padding: { x: 8, y: 4 }
        };

        const tooltip = this.add.text(x, y,
            `${material.name}\n数量: ${material.count}\n稀有度: ${material.rarity}`,
            tooltipStyle
        ).setOrigin(0.5, 1);

        this.materialTooltip = tooltip;
    }

    /**
     * 隐藏材料提示
     */
    hideMaterialTooltip() {
        if (this.materialTooltip) {
            this.materialTooltip.destroy();
            this.materialTooltip = null;
        }
    }

    /**
     * 更新材料显示
     */
    updateMaterialDisplay() {
        this.materialSlots.forEach(slot => {
            const material = slot.materialData;
            const currentCount = gameState.getMaterialCount(material.id);

            if (currentCount !== material.count) {
                material.count = currentCount;
                slot.countText.setText(currentCount.toString());

                // 数量变化动画
                if (currentCount > 0) {
                    this.tweens.add({
                        targets: slot,
                        scale: { from: 1.2, to: 1 },
                        duration: 300,
                        ease: 'Back.easeOut'
                    });
                }
            }

            // 如果数量为0，降低透明度
            const alpha = currentCount > 0 ? 1.0 : 0.3;
            slot.setAlpha(alpha);
        });
    }

    /**
     * 创建制作台
     */
    createBrewingStation() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2 + 50;

        // 制作台背景
        const stationBg = this.add.graphics();
        stationBg.fillStyle(0x8B4513, 0.8);
        stationBg.fillRoundedRect(centerX - 200, centerY - 100, 400, 200, 15);
        stationBg.lineStyle(3, 0xFFD700, 0.8);
        stationBg.strokeRoundedRect(centerX - 200, centerY - 100, 400, 200, 15);

        // 制作台标题
        this.add.text(centerX, centerY - 80, '制作台', {
            fontSize: '18px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);
    }

    /**
     * 创建材料区域
     */
    createMaterialArea() {
        const { width, height } = this.cameras.main;

        // 材料放置区
        this.materialDropZone = this.add.zone(width / 2, height / 2, 200, 100);
        this.materialDropZone.setInteractive();

        // 放置区边框
        const dropZoneBorder = this.add.graphics();
        dropZoneBorder.lineStyle(3, 0xFFD700, 0.6);
        dropZoneBorder.strokeRoundedRect(width / 2 - 100, height / 2 - 50, 200, 100, 10);

        // 放置区标签
        this.add.text(width / 2, height / 2 - 70, '材料放置区', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);

        this.dropZones.push(this.materialDropZone);
    }

    /**
     * 创建坩埚区域
     */
    createCauldronArea() {
        const { width, height } = this.cameras.main;
        const cauldronX = width / 2;
        const cauldronY = height - 150;

        // 坩埚底座
        const cauldronBase = this.add.graphics();
        cauldronBase.fillStyle(0x654321, 0.9);
        cauldronBase.fillRoundedRect(cauldronX - 60, cauldronY + 20, 120, 20, 5);

        // 坩埚精灵
        this.cauldronSprite = this.add.text(cauldronX, cauldronY, '⚗️', {
            fontSize: '64px'
        }).setOrigin(0.5);

        // 坩埚交互区域
        this.cauldronZone = this.add.zone(cauldronX, cauldronY, 120, 120);
        this.cauldronZone.setInteractive();

        // 坩埚光源
        const cauldronLight = this.add.pointlight(cauldronX, cauldronY, 0xFF6348, 100, 0.8);
        cauldronLight.setAttenuation(0.1);

        // 创建蒸汽效果
        this.createCauldronSteam(cauldronX, cauldronY - 30);

        // 创建魔法粒子效果
        this.createMagicParticles(cauldronX, cauldronY);

        // 坩埚交互
        this.cauldronZone.on('pointerover', () => {
            this.showCauldronTooltip(cauldronX, cauldronY - 60);
            this.cauldronSprite.setScale(1.1);
        });

        this.cauldronZone.on('pointerout', () => {
            this.hideCauldronTooltip();
            this.cauldronSprite.setScale(1);
        });

        this.cauldronZone.on('pointerdown', () => {
            this.startBrewing();
        });
    }

    /**
     * 创建坩埚蒸汽效果
     */
    createCauldronSteam(x, y) {
        this.steamEffects = this.add.particles(x, y, null, {
            y: { min: -20, max: -50 },
            lifespan: 3000,
            speed: { min: 15, max: 35 },
            scale: { start: 0.3, end: 1.2 },
            alpha: { start: 0.7, end: 0 },
            tint: 0xFFFFFF,
            frequency: 800,
            quantity: 2,
            gravityY: -15
        });

        // 创建蒸汽纹理
        const steamGraphics = this.add.graphics();
        steamGraphics.fillStyle(0xFFFFFF, 0.4);
        steamGraphics.fillCircle(3, 3, 3);
        steamGraphics.generateTexture('steamParticle', 6, 6);
        steamGraphics.destroy();

        this.steamEffects.setTexture('steamParticle');
        this.steamEffects.stop();
    }

    /**
     * 创建魔法粒子效果
     */
    createMagicParticles(x, y) {
        this.particleEffects = this.add.particles(x, y, null, {
            x: { min: -30, max: 30 },
            y: { min: -30, max: 30 },
            lifespan: 2000,
            speed: { min: 20, max: 40 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: [0xFFD700, 0x00FF7F, 0xFF6348],
            frequency: 500,
            quantity: 1
        });

        // 创建粒子纹理
        const particleGraphics = this.add.graphics();
        particleGraphics.fillStyle(0xFFD700);
        particleGraphics.fillCircle(2, 2, 2);
        particleGraphics.generateTexture('magicParticle', 4, 4);
        particleGraphics.destroy();

        this.particleEffects.setTexture('magicParticle');
        this.particleEffects.stop();
    }

    /**
     * 显示坩埚提示
     */
    showCauldronTooltip(x, y) {
        if (this.cauldronTooltip) {
            this.cauldronTooltip.destroy();
        }

        const tooltipStyle = {
            fontSize: '12px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF',
            backgroundColor: '#2D1B69',
            padding: { x: 8, y: 4 }
        };

        const tooltipText = this.selectedMaterials.length > 0 ?
            `点击开始制作 (${this.selectedMaterials.length}种材料)` :
            '请先选择材料再点击制作';

        const tooltip = this.add.text(x, y, tooltipText, tooltipStyle)
            .setOrigin(0.5, 1);

        this.cauldronTooltip = tooltip;
    }

    /**
     * 隐藏坩埚提示
     */
    hideCauldronTooltip() {
        if (this.cauldronTooltip) {
            this.cauldronTooltip.destroy();
            this.cauldronTooltip = null;
        }
    }

    /**
     * 创建配方面板
     */
    createRecipePanel() {
        const panel = this.add.graphics();
        panel.fillStyle(0x2D1B69, 0.8);
        panel.fillRoundedRect(980, 80, 280, 500, 10);
        panel.lineStyle(2, 0xFFD700, 0.8);
        panel.strokeRoundedRect(980, 80, 280, 500, 10);

        // 面板标题
        this.add.text(1120, 100, '配方', {
            fontSize: '20px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);

        // 创建配方列表
        this.createRecipeList();
    }

    /**
     * 创建配方列表UI
     */
    createRecipePanelUI() {
        // 这个方法与createRecipePanel合并
    }

    /**
     * 创建配方列表
     */
    createRecipeList() {
        const discoveredRecipes = gameState.getAvailableRecipes();

        this.recipeButtons = [];

        discoveredRecipes.forEach((recipeId, index) => {
            const recipe = PotionRecipes[recipeId];
            if (!recipe) return;

            const y = 140 + index * 60;
            const button = this.createRecipeButton(1120, y, recipe);
            this.recipeButtons.push(button);
        });
    }

    /**
     * 创建配方按钮
     */
    createRecipeButton(x, y, recipe) {
        const button = this.add.container(x, y);

        // 按钮背景
        const bg = this.add.graphics();
        bg.fillStyle(0x3742FA, 0.6);
        bg.fillRoundedRect(-120, -20, 240, 40, 8);
        bg.lineStyle(2, 0xFFD700, 0.5);
        bg.strokeRoundedRect(-120, -20, 240, 40, 8);

        // 配方图标
        const icon = this.add.text(-100, 0, this.getPotionEmoji(recipe.type), {
            fontSize: '16px'
        }).setOrigin(0.5);

        // 配方名称
        const name = this.add.text(-20, 0, recipe.name, {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF'
        }).setOrigin(0, 0.5);

        // 难度指示
        const difficulty = this.add.text(80, 0, '★'.repeat(recipe.difficulty), {
            fontSize: '12px',
            color: '#FFD700'
        }).setOrigin(0.5);

        button.add([bg, icon, name, difficulty]);
        button.setInteractive(new Phaser.Geom.Rectangle(-120, -20, 240, 40),
            Phaser.Geom.Rectangle.Contains);

        // 配方选择
        button.on('pointerdown', () => {
            this.selectRecipe(recipe);
        });

        // 悬停效果
        button.on('pointerover', () => {
            this.showRecipeTooltip(recipe, x, y - 40);
            this.tweens.add({
                targets: button,
                scale: 1.05,
                duration: 200
            });
        });

        button.on('pointerout', () => {
            this.hideRecipeTooltip();
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 200
            });
        });

        button.recipeData = recipe;

        return button;
    }

    /**
     * 获取魔药表情符号
     */
    getPotionEmoji(potionType) {
        const emojiMap = {
            'healing': '❤️',
            'attack': '⚔️',
            'defense': '🛡️',
            'control': '🎮',
            'utility': '🔧',
            'buff': '💪'
        };

        return emojiMap[potionType] || '🧪';
    }

    /**
     * 显示配方提示
     */
    showRecipeTooltip(recipe, x, y) {
        if (this.recipeTooltip) {
            this.recipeTooltip.destroy();
        }

        const tooltipStyle = {
            fontSize: '11px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF',
            backgroundColor: '#2D1B69',
            padding: { x: 6, y: 3 }
        };

        let tooltipText = `${recipe.name}\n`;
        tooltipText += `难度: ${recipe.difficulty}\n`;
        tooltipText += `材料: ${recipe.materials.map(m => MaterialData[m.type]?.name || m.type).join(', ')}`;

        const tooltip = this.add.text(x, y, tooltipText, tooltipStyle)
            .setOrigin(0.5, 1);

        this.recipeTooltip = tooltip;
    }

    /**
     * 隐藏配方提示
     */
    hideRecipeTooltip() {
        if (this.recipeTooltip) {
            this.recipeTooltip.destroy();
            this.recipeTooltip = null;
        }
    }

    /**
     * 创建效果系统
     */
    createEffectSystem() {
        // 成功效果
        this.successEffect = this.add.particles(0, 0, null, {
            speed: { min: 100, max: 200 },
            lifespan: 1000,
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0x00FF7F, 0xFFD700],
            quantity: 20
        });

        // 失败效果
        this.failEffect = this.add.particles(0, 0, null, {
            speed: { min: 50, max: 100 },
            lifespan: 1500,
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: [0xFF4757, 0xFFA502],
            quantity: 10
        });

        // 创建效果纹理
        this.createEffectTextures();
    }

    /**
     * 创建效果纹理
     */
    createEffectTextures() {
        // 成功粒子
        const successGraphics = this.add.graphics();
        successGraphics.fillStyle(0x00FF7F);
        successGraphics.fillStar(4, 4, 4, 3);
        successGraphics.generateTexture('successParticle', 8, 8);
        successGraphics.destroy();

        // 失败粒子
        const failGraphics = this.add.graphics();
        failGraphics.fillStyle(0xFF4757);
        failGraphics.fillCircle(3, 3, 3);
        failGraphics.generateTexture('failParticle', 6, 6);
        failGraphics.destroy();

        this.successEffect.setTexture('successParticle');
        this.failEffect.setTexture('failParticle');

        this.successEffect.stop();
        this.failEffect.stop();
    }

    /**
     * 创建拖拽系统
     */
    createDragSystem() {
        this.dragSystem = {
            isDragging: false,
            draggedObject: null,
            dragOffset: { x: 0, y: 0 }
        };

        // 设置全局拖拽监听
        this.input.on('pointermove', (pointer) => {
            if (this.dragSystem.isDragging) {
                this.updateDragPosition(pointer);
            }
        });

        this.input.on('pointerup', (pointer) => {
            if (this.dragSystem.isDragging) {
                this.endDrag(pointer);
            }
        });
    }

    /**
     * 开始拖拽材料
     */
    startDragMaterial(material, slot, pointer) {
        if (this.isBrewing) return;

        this.dragSystem.isDragging = true;
        this.dragSystem.draggedObject = {
            type: 'material',
            data: material,
            sourceSlot: slot
        };

        // 创建拖拽副本
        const dragSprite = this.add.text(pointer.x, pointer.y,
            this.getMaterialEmoji(material.id), {
            fontSize: '24px'
        }).setOrigin(0.5);

        this.dragSystem.dragSprite = dragSprite;

        // 高亮可放置区域
        this.highlightDropZones(true);

        // 播放音效
        this.sound.play('sfx_click', { volume: 0.3 });
    }

    /**
     * 更新拖拽位置
     */
    updateDragPosition(pointer) {
        if (this.dragSystem.dragSprite) {
            this.dragSystem.dragSprite.x = pointer.x;
            this.dragSystem.dragSprite.y = pointer.y;
        }

        // 检查悬停的目标
        this.checkDropZoneHover(pointer);
    }

    /**
     * 结束拖拽
     */
    endDrag(pointer) {
        if (!this.dragSystem.isDragging) return;

        const draggedObj = this.dragSystem.draggedObject;

        // 检查是否放置在有效区域
        const dropResult = this.checkDropResult(pointer);

        if (dropResult.success) {
            this.handleSuccessfulDrop(draggedObj, dropResult);
        } else {
            this.handleFailedDrop(draggedObj);
        }

        // 清理拖拽状态
        this.cleanupDrag();
    }

    /**
     * 检查放置结果
     */
    checkDropResult(pointer) {
        // 检查是否在材料放置区
        if (this.materialDropZone.getBounds().contains(pointer.x, pointer.y)) {
            return { success: true, zone: 'material' };
        }

        return { success: false };
    }

    /**
     * 处理成功放置
     */
    handleSuccessfulDrop(draggedObj, result) {
        if (draggedObj.type === 'material') {
            this.addMaterialToRecipe(draggedObj.data);
        }

        // 播放成功音效
        this.sound.play('sfx_success', { volume: 0.4 });

        // 显示成功效果
        this.showDropSuccessEffect(pointer.x, pointer.y);
    }

    /**
     * 处理失败放置
     */
    handleFailedDrop(draggedObj) {
        // 材料返回原位置
        if (draggedObj.type === 'material') {
            this.returnMaterialToSlot(draggedObj);
        }

        // 播放失败音效
        this.sound.play('sfx_fail', { volume: 0.3 });
    }

    /**
     * 添加材料到配方
     */
    addMaterialToRecipe(material) {
        // 检查是否已经添加了该材料
        const existingMaterial = this.selectedMaterials.find(m => m.id === material.id);
        if (existingMaterial) {
            existingMaterial.count++;
        } else {
            this.selectedMaterials.push({
                id: material.id,
                name: material.name,
                count: 1
            });
        }

        this.updateSelectedMaterialsDisplay();
        this.updateRecipeMatching();
    }

    /**
     * 更新选中的材料显示
     */
    updateSelectedMaterialsDisplay() {
        if (this.selectedMaterialsDisplay) {
            this.selectedMaterialsDisplay.destroy();
        }

        if (this.selectedMaterials.length === 0) return;

        const { width } = this.cameras.main;
        const x = width / 2;
        const y = height / 2 + 80;

        let displayText = '已选材料:\n';
        this.selectedMaterials.forEach(material => {
            displayText += `${material.name} x${material.count}\n`;
        });

        this.selectedMaterialsDisplay = this.add.text(x, y, displayText, {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            align: 'center'
        }).setOrigin(0.5);
    }

    /**
     * 更新配方匹配
     */
    updateRecipeMatching() {
        // 检查当前选择的材料是否能制作什么配方
        const matchingRecipes = this.findMatchingRecipes();

        // 高亮匹配的配方
        this.recipeButtons.forEach(button => {
            const isMatching = matchingRecipes.some(recipe => recipe.id === button.recipeData.id);
            if (isMatching) {
                button.bg.clear();
                button.bg.fillStyle(0x00FF7F, 0.8);
                button.bg.fillRoundedRect(-120, -20, 240, 40, 8);
                button.bg.lineStyle(2, 0xFFD700, 1);
                button.bg.strokeRoundedRect(-120, -20, 240, 40, 8);
            }
        });
    }

    /**
     * 查找匹配的配方
     */
    findMatchingRecipes() {
        const selectedMaterialIds = this.selectedMaterials.map(m => m.id);

        return Object.values(PotionRecipes).filter(recipe => {
            const requiredMaterials = recipe.materials.map(m => m.type);
            return requiredMaterials.every(material => selectedMaterialIds.includes(material));
        });
    }

    /**
     * 高亮放置区域
     */
    highlightDropZones(highlight) {
        if (highlight) {
            // 高亮材料放置区
            if (this.materialDropZoneBorder) {
                this.materialDropZoneBorder.clear();
                this.materialDropZoneBorder.lineStyle(4, 0x00FF7F, 1);
                this.materialDropZoneBorder.strokeRoundedRect(
                    this.cameras.main.width / 2 - 100,
                    this.cameras.main.height / 2 - 50,
                    200,
                    100,
                    10
                );
            }
        } else {
            // 恢复正常显示
            if (this.materialDropZoneBorder) {
                this.materialDropZoneBorder.clear();
                this.materialDropZoneBorder.lineStyle(3, 0xFFD700, 0.6);
                this.materialDropZoneBorder.strokeRoundedRect(
                    this.cameras.main.width / 2 - 100,
                    this.cameras.main.height / 2 - 50,
                    200,
                    100,
                    10
                );
            }
        }
    }

    /**
     * 显示放置成功效果
     */
    showDropSuccessEffect(x, y) {
        // 创建成功光环
        const successRing = this.add.graphics();
        successRing.lineStyle(3, 0x00FF7F, 0.8);
        successRing.strokeCircle(x, y, 30);

        // 光环扩散动画
        this.tweens.add({
            targets: successRing,
            scale: 2,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => successRing.destroy()
        });

        // 粒子效果
        this.successEffect.emitParticleAt(x, y, 5);
    }

    /**
     * 创建控制按钮
     */
    createControlButtons() {
        const { width, height } = this.cameras.main;

        // 清空按钮
        this.createClearButton(width / 2 - 80, height - 80);

        // 制作按钮
        this.createBrewButton(width / 2 + 80, height - 80);

        // 随机配方按钮
        this.createRandomRecipeButton(width / 2, height - 120);
    }

    /**
     * 创建清空按钮
     */
    createClearButton(x, y) {
        const button = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0xFF4757, 0.8);
        bg.fillRoundedRect(-60, -20, 120, 40, 8);
        bg.lineStyle(2, 0xFFD700, 0.8);
        bg.strokeRoundedRect(-60, -20, 120, 40, 8);

        const text = this.add.text(0, 0, '清空', {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        button.add([bg, text]);
        button.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40),
            Phaser.Geom.Rectangle.Contains);

        button.on('pointerdown', () => {
            this.clearSelectedMaterials();
        });

        return button;
    }

    /**
     * 创建制作按钮
     */
    createBrewButton(x, y) {
        const button = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x00FF7F, 0.8);
        bg.fillRoundedRect(-60, -20, 120, 40, 8);
        bg.lineStyle(2, 0xFFD700, 0.8);
        bg.strokeRoundedRect(-60, -20, 120, 40, 8);

        const text = this.add.text(0, 0, '开始制作', {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        button.add([bg, text]);
        button.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40),
            Phaser.Geom.Rectangle.Contains);

        button.on('pointerdown', () => {
            this.startBrewing();
        });

        this.brewButton = button;

        return button;
    }

    /**
     * 创建随机配方按钮
     */
    createRandomRecipeButton(x, y) {
        const button = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0xFFA502, 0.8);
        bg.fillRoundedRect(-50, -15, 100, 30, 5);
        bg.lineStyle(2, 0xFFD700, 0.8);
        bg.strokeRoundedRect(-50, -15, 100, 30, 5);

        const text = this.add.text(0, 0, '随机配方', {
            fontSize: '12px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        button.add([bg, text]);
        button.setInteractive(new Phaser.Geom.Rectangle(-50, -15, 100, 30),
            Phaser.Geom.Rectangle.Contains);

        button.on('pointerdown', () => {
            this.selectRandomRecipe();
        });

        return button;
    }

    /**
     * 创建状态显示
     */
    createStatusDisplay() {
        const { width } = this.cameras.main;
        const x = width / 2;
        const y = 80;

        // 状态面板
        const statusPanel = this.add.graphics();
        statusPanel.fillStyle(0x2D1B69, 0.7);
        statusPanel.fillRoundedRect(x - 150, y - 20, 300, 40, 8);
        statusPanel.lineStyle(2, 0xFFD700, 0.6);
        statusPanel.strokeRoundedRect(x - 150, y - 20, 300, 40, 8);

        // 状态文本
        this.statusText = this.add.text(x, y, '选择材料开始制作', {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC'
        }).setOrigin(0.5);
    }

    /**
     * 创建进度显示
     */
    createProgressDisplay() {
        const { width, height } = this.cameras.main;
        const x = width / 2;
        const y = height - 200;

        // 进度条背景
        const progressBg = this.add.graphics();
        progressBg.fillStyle(0x333333, 0.8);
        progressBg.fillRoundedRect(x - 100, y - 5, 200, 10, 5);

        // 进度条
        this.progressBar = this.add.graphics();

        // 进度文本
        this.progressText = this.add.text(x, y + 15, '', {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        // 计时器文本
        this.timerText = this.add.text(x, y - 20, '', {
            fontSize: '12px',
            fontFamily: 'Noto Sans SC',
            color: '#FFD700'
        }).setOrigin(0.5);
    }

    /**
     * 创建键盘控制
     */
    setupKeyboardControls() {
        // ESC键返回
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop();
            this.scene.resume('TavernScene');
        });

        // R键随机配方
        this.input.keyboard.on('keydown-R', () => {
            this.selectRandomRecipe();
        });

        // C键清空
        this.input.keyboard.on('keydown-C', () => {
            this.clearSelectedMaterials();
        });

        // 空格键开始制作
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.isBrewing) {
                this.startBrewing();
            }
        });
    }

    /**
     * 显示帮助信息
     */
    showHelpMessage() {
        const { width } = this.cameras.main;

        const helpStyle = {
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            align: 'center',
            backgroundColor: '#2D1B69',
            padding: { x: 15, y: 10 }
        };

        const helpText = this.add.text(width / 2, 650,
            '💡 拖拽材料到制作区 → 选择配方 → 点击坩埚开始制作\n' +
            '快捷键: [R]随机配方 [C]清空 [SPACE]开始制作 [ESC]返回',
            helpStyle
        ).setOrigin(0.5);

        // 3秒后淡出
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: helpText,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => helpText.destroy()
            });
        });
    }

    /**
     * 选择配方
     */
    selectRecipe(recipe) {
        if (this.isBrewing) return;

        this.currentRecipe = recipe;

        // 高亮选中的配方
        this.recipeButtons.forEach(button => {
            const isSelected = button.recipeData.id === recipe.id;
            const bgColor = isSelected ? 0x00FF7F : 0x3742FA;
            const borderAlpha = isSelected ? 1 : 0.5;

            button.bg.clear();
            button.bg.fillStyle(bgColor, 0.8);
            button.bg.fillRoundedRect(-120, -20, 240, 40, 8);
            button.bg.lineStyle(2, 0xFFD700, borderAlpha);
            button.bg.strokeRoundedRect(-120, -20, 240, 40, 8);
        });

        // 自动选择所需材料
        this.autoSelectMaterialsForRecipe(recipe);

        this.updateStatus(`已选择配方: ${recipe.name}`);

        // 播放音效
        this.sound.play('sfx_click', { volume: 0.3 });
    }

    /**
     * 自动选择配方材料
     */
    autoSelectMaterialsForRecipe(recipe) {
        this.clearSelectedMaterials();

        recipe.materials.forEach(required => {
            const availableCount = gameState.getMaterialCount(required.type);
            const neededCount = Math.min(required.amount, availableCount);

            if (neededCount > 0) {
                this.selectedMaterials.push({
                    id: required.type,
                    name: MaterialData[required.type]?.name || required.type,
                    count: neededCount
                });
            }
        });

        this.updateSelectedMaterialsDisplay();
        this.updateRecipeMatching();
    }

    /**
     * 选择随机配方
     */
    selectRandomRecipe() {
        const availableRecipes = gameState.getAvailableRecipes();
        if (availableRecipes.length === 0) {
            this.updateStatus('没有可用的配方');
            return;
        }

        const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
        const recipe = PotionRecipes[randomRecipe];

        if (recipe) {
            this.selectRecipe(recipe);
            this.updateStatus('已随机选择配方');
        }
    }

    /**
     * 清空选中的材料
     */
    clearSelectedMaterials() {
        this.selectedMaterials = [];
        this.currentRecipe = null;

        this.updateSelectedMaterialsDisplay();
        this.updateRecipeMatching();

        // 重置配方高亮
        this.recipeButtons.forEach(button => {
            button.bg.clear();
            button.bg.fillStyle(0x3742FA, 0.6);
            button.bg.fillRoundedRect(-120, -20, 240, 40, 8);
            button.bg.lineStyle(2, 0xFFD700, 0.5);
            button.bg.strokeRoundedRect(-120, -20, 240, 40, 8);
        });

        this.updateStatus('材料已清空');
    }

    /**
     * 开始制作
     */
    startBrewing() {
        if (this.isBrewing) return;
        if (this.selectedMaterials.length === 0) {
            this.updateStatus('请先选择材料');
            return;
        }

        // 检查是否有匹配的配方
        const matchingRecipes = this.findMatchingRecipes();
        if (matchingRecipes.length === 0) {
            this.updateStatus('当前材料组合没有对应的配方');
            return;
        }

        // 使用第一个匹配的配方
        const recipe = matchingRecipes[0];
        this.currentRecipe = recipe;

        // 消耗材料
        const canCraft = this.consumeMaterialsForRecipe(recipe);
        if (!canCraft) {
            this.updateStatus('材料不足');
            return;
        }

        this.isBrewing = true;
        this.brewingStartTime = Date.now();
        this.brewingProgress = 0;

        // 计算成功率
        this.successRate = this.calculateBrewingSuccessRate(recipe);

        // 显示制作进度
        this.showBrewingProgress();

        // 开始制作动画
        this.startBrewingAnimation();

        // 启动计时器
        this.startBrewingTimer(recipe);

        this.updateStatus(`开始制作 ${recipe.name}...`);

        // 禁用UI
        this.setUIEnabled(false);

        // 播放制作音效
        this.sound.play('sfx_potion_create', { volume: 0.5, loop: true });
    }

    /**
     * 消耗配方材料
     */
    consumeMaterialsForRecipe(recipe) {
        for (const required of recipe.materials) {
            if (!gameState.consumeMaterial(required.type, required.amount)) {
                return false;
            }
        }
        return true;
    }

    /**
     * 计算制作成功率
     */
    calculateBrewingSuccessRate(recipe) {
        let baseRate = RecipeUtils.calculateSuccessRate(
            recipe,
            gameState.player.level,
            this.getStaffBonus()
        );

        // 材料品质加成
        let qualityBonus = 0;
        this.selectedMaterials.forEach(material => {
            const materialData = MaterialData[material.id];
            if (materialData) {
                const qualityMultiplier = {
                    common: 0,
                    uncommon: 0.05,
                    rare: 0.1,
                    legendary: 0.15
                };
                qualityBonus += qualityMultiplier[materialData.rarity] || 0;
            }
        });

        baseRate += qualityBonus;

        return Math.max(0.1, Math.min(0.95, baseRate));
    }

    /**
     * 获取员工加成
     */
    getStaffBonus() {
        if (!staffManager) return 0;

        const availableStaff = staffManager.getAvailableStaff();
        if (availableStaff.length === 0) return 0;

        // 获得最佳员工的加成
        const bestStaff = availableStaff.reduce((best, staff) => {
            return staff.skill > best.skill ? staff : best;
        });

        return bestStaff.skill * 0.1;
    }

    /**
     * 显示制作进度
     */
    showBrewingProgress() {
        if (this.progressBar) {
            this.progressBar.clear();
            this.progressBar.fillStyle(0x00FF7F, 0.8);
        }

        if (this.progressText) {
            this.progressText.setText('制作中...');
        }

        if (this.timerText) {
            this.timerText.setText('准备中');
        }
    }

    /**
     * 开始制作动画
     */
    startBrewingAnimation() {
        // 坩埚动画
        this.tweens.add({
            targets: this.cauldronSprite,
            rotation: { from: 0, to: Math.PI * 2 },
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });

        // 蒸汽效果
        if (this.steamEffects) {
            this.steamEffects.start();
        }

        // 魔法粒子效果
        if (this.particleEffects) {
            this.particleEffects.start();
        }

        // 发光效果
        this.createBrewingGlow();
    }

    /**
     * 创建制作发光效果
     */
    createBrewingGlow() {
        const { width, height } = this.cameras.main;

        this.brewingGlow = this.add.pointlight(width / 2, height - 150, 0xFFD700, 150, 0.9);
        this.brewingGlow.setAttenuation(0.05);

        // 发光脉动动画
        this.tweens.add({
            targets: this.brewingGlow,
            intensity: { from: 0.7, to: 1.0 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 启动制作计时器
     */
    startBrewingTimer(recipe) {
        const brewingTime = RecipeUtils.calculateBrewingTime(recipe, this.getStaffBonus());
        const startTime = Date.now();

        this.brewingTimer = this.time.addEvent({
            delay: 100, // 每100ms更新一次
            callback: () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / brewingTime, 1);

                this.updateBrewingProgress(progress, elapsed, brewingTime);

                if (progress >= 1) {
                    this.completeBrewing();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    /**
     * 更新制作进度
     */
    updateBrewingProgress(progress, elapsed, totalTime) {
        this.brewingProgress = progress;

        // 更新进度条
        if (this.progressBar) {
            this.progressBar.clear();
            this.progressBar.fillStyle(0x00FF7F, 0.8);
            this.progressBar.fillRoundedRect(
                this.cameras.main.width / 2 - 100,
                this.cameras.main.height - 200 - 5,
                200 * progress,
                10,
                5
            );
        }

        // 更新进度文本
        if (this.progressText) {
            this.progressText.setText(`${Math.floor(progress * 100)}%`);
        }

        // 更新计时器文本
        if (this.timerText) {
            const remainingTime = Math.max(0, totalTime - elapsed);
            this.timerText.setText(`${(remainingTime / 1000).toFixed(1)}s`);
        }

        // 随机添加制作效果
        if (Math.random() < 0.1) {
            this.addRandomBrewingEffect();
        }
    }

    /**
     * 添加随机制作效果
     */
    addRandomBrewingEffect() {
        const { width, height } = this.cameras.main;
        const x = width / 2 + (Math.random() - 0.5) * 100;
        const y = height - 150 + (Math.random() - 0.5) * 50;

        // 随机颜色火花
        const colors = [0xFFD700, 0x00FF7F, 0xFF6348, 0x3742FA];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const spark = this.add.circle(x, y, 3, color, 0.8);

        this.tweens.add({
            targets: spark,
            y: y - 50,
            alpha: 0,
            scale: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => spark.destroy()
        });
    }

    /**
     * 完成制作
     */
    completeBrewing() {
        if (this.brewingTimer) {
            this.brewingTimer.destroy();
        }

        // 停止音效
        this.sound.stopByKey('sfx_potion_create');

        // 确定制作结果
        const success = Math.random() < this.successRate;

        if (success) {
            this.handleBrewingSuccess();
        } else {
            this.handleBrewingFailure();
        }

        // 重置状态
        this.resetBrewingState();
    }

    /**
     * 处理制作成功
     */
    handleBrewingSuccess() {
        const recipe = this.currentRecipe;
        const quality = this.calculatePotionQuality();

        // 创建魔药
        const potion = potionManager.createPotion(recipe.id, quality, 'player');

        // 给予奖励
        const experience = recipe.difficulty * 10;
        const reputation = recipe.difficulty * 2;

        gameState.addExperience(experience);
        gameState.addReputation(reputation);

        // 显示成功效果
        this.showBrewingSuccessEffect(potion);

        // 播放成功音效
        this.sound.play('sfx_success', { volume: 0.6 });

        // 更新状态
        this.updateStatus(`成功制作 ${potion.name} (${potion.quality})！`);

        // 检查配方掌握
        if (Math.random() < 0.3) {
            gameState.masterRecipe(recipe.id);
            this.updateStatus(`掌握了 ${recipe.name} 配方！`);
        }

        // 触发事件
        eventManager.triggerEvent('potionMade', {
            potion: potion,
            recipe: recipe,
            quality: quality,
            success: true
        });
    }

    /**
     * 处理制作失败
     */
    handleBrewingFailure() {
        const recipe = this.currentRecipe;

        // 损失一些经验
        gameState.addExperience(-5);

        // 显示失败效果
        this.showBrewingFailureEffect();

        // 播放失败音效
        this.sound.play('sfx_fail', { volume: 0.6 });

        // 更新状态
        this.updateStatus(`制作失败！材料浪费了。`);

        // 触发事件
        eventManager.triggerEvent('potionMade', {
            recipe: recipe,
            success: false
        });
    }

    /**
     * 计算魔药品质
     */
    calculatePotionQuality() {
        const baseQuality = 0.7; // 70%基础品质
        const skillBonus = gameState.player.level * 0.02;
        const luckBonus = (Math.random() - 0.5) * 0.3;

        const qualityScore = baseQuality + skillBonus + luckBonus;

        if (qualityScore >= 0.9) return 'perfect';
        if (qualityScore >= 0.8) return 'excellent';
        if (qualityScore >= 0.6) return 'good';
        if (qualityScore >= 0.4) return 'normal';
        return 'poor';
    }

    /**
     * 显示制作成功效果
     */
    showBrewingSuccessEffect(potion) {
        const { width, height } = this.cameras.main;

        // 成功粒子效果
        this.successEffect.emitParticleAt(width / 2, height - 150, 15);

        // 成功光环
        const successRing = this.add.graphics();
        successRing.lineStyle(4, 0x00FF7F, 0.9);
        successRing.strokeCircle(width / 2, height - 150, 50);

        this.tweens.add({
            targets: successRing,
            scale: 2,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => successRing.destroy()
        });

        // 品质颜色
        const qualityColors = {
            poor: 0x888888,
            normal: 0xFFFFFF,
            good: 0x00FF7F,
            excellent: 0xFFD700,
            perfect: 0xFF69B4
        };

        // 品质光环
        const qualityGlow = this.add.pointlight(width / 2, height - 150,
            qualityColors[potion.quality], 100, 0.8);
        qualityGlow.setAttenuation(0.1);

        this.time.delayedCall(2000, () => {
            qualityGlow.destroy();
        });
    }

    /**
     * 显示制作失败效果
     */
    showBrewingFailureEffect() {
        const { width, height } = this.cameras.main;

        // 失败粒子效果
        this.failEffect.emitParticleAt(width / 2, height - 150, 10);

        // 失败烟雾
        const failSmoke = this.add.particles(width / 2, height - 150, null, {
            y: { min: -50, max: -100 },
            lifespan: 2000,
            speed: { min: 20, max: 40 },
            scale: { start: 0.5, end: 2 },
            alpha: { start: 0.6, end: 0 },
            tint: [0xFF4757, 0x888888],
            quantity: 5
        });

        // 创建失败烟雾纹理
        const failGraphics = this.add.graphics();
        failGraphics.fillStyle(0xFF4757, 0.4);
        failGraphics.fillCircle(4, 4, 4);
        failGraphics.generateTexture('failSmoke', 8, 8);
        failGraphics.destroy();

        failSmoke.setTexture('failSmoke');

        this.time.delayedCall(3000, () => {
            failSmoke.destroy();
        });
    }

    /**
     * 重置制作状态
     */
    resetBrewingState() {
        this.isBrewing = false;
        this.brewingStartTime = null;
        this.brewingProgress = 0;
        this.currentRecipe = null;

        // 清空选中的材料
        this.selectedMaterials = [];

        // 停止动画
        this.tweens.killTweensOf(this.cauldronSprite);
        this.cauldronSprite.setRotation(0);
        this.cauldronSprite.setScale(1);

        // 停止效果
        if (this.steamEffects) this.steamEffects.stop();
        if (this.particleEffects) this.particleEffects.stop();
        if (this.brewingGlow) this.brewingGlow.destroy();

        // 重置UI
        this.setUIEnabled(true);
        this.updateSelectedMaterialsDisplay();
        this.updateRecipeMatching();

        // 重置进度显示
        if (this.progressBar) {
            this.progressBar.clear();
        }
        if (this.progressText) {
            this.progressText.setText('');
        }
        if (this.timerText) {
            this.timerText.setText('');
        }

        this.updateStatus('制作完成');
    }

    /**
     * 设置UI启用状态
     */
    setUIEnabled(enabled) {
        // 这里可以禁用/启用所有UI元素
        this.input.enabled = enabled;

        // 更新按钮状态
        if (this.brewButton) {
            this.brewButton.setAlpha(enabled ? 1 : 0.5);
        }
    }

    /**
     * 更新状态文本
     */
    updateStatus(message) {
        if (this.statusText) {
            this.statusText.setText(message);
        }
    }

    /**
     * 清理拖拽状态
     */
    cleanupDrag() {
        this.dragSystem.isDragging = false;
        this.dragSystem.draggedObject = null;

        if (this.dragSystem.dragSprite) {
            this.dragSystem.dragSprite.destroy();
            this.dragSystem.dragSprite = null;
        }

        this.highlightDropZones(false);
    }

    /**
     * 返回材料到槽位
     */
    returnMaterialToSlot(draggedObj) {
        // 这里可以实现材料返回动画
        // 暂时不需要，因为材料不会被消耗直到制作开始
    }

    /**
     * 检查放置区域悬停
     */
    checkDropZoneHover(pointer) {
        // 这里可以添加悬停效果
    }

    /**
     * 更新函数
     */
    update(time, delta) {
        // 更新材料显示（检查库存变化）
        this.updateMaterialDisplay();

        // 更新拖拽系统
        this.updateDragSystem(delta);

        // 更新效果
        this.updateEffects(delta);
    }

    /**
     * 更新拖拽系统
     */
    updateDragSystem(delta) {
        // 这里可以添加拖拽相关的更新逻辑
    }

    /**
     * 更新效果
     */
    updateEffects(delta) {
        // 更新各种视觉效果
    }

    /**
     * 场景销毁
     */
    shutdown() {
        console.log('🛑 BrewingScene: 场景销毁');

        // 停止所有定时器
        if (this.brewingTimer) this.brewingTimer.destroy();

        // 停止所有效果
        if (this.steamEffects) this.steamEffects.destroy();
        if (this.particleEffects) this.particleEffects.destroy();
        if (this.successEffect) this.successEffect.destroy();
        if (this.failEffect) this.failEffect.destroy();
        if (this.brewingGlow) this.brewingGlow.destroy();

        // 停止音效
        this.sound.stopByKey('sfx_potion_create');

        // 清理拖拽状态
        this.cleanupDrag();

        // 清理提示
        this.hideMaterialTooltip();
        this.hideRecipeTooltip();
        this.hideCauldronTooltip();
    }
}

// 导出场景类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrewingScene;
}