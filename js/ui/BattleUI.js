/**
 * 战斗UI组件 - 管理对战系统的界面显示
 * 这个SB组件处理对战界面、血量条、卡牌显示等
 */
class BattleUI {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.container = null;
        this.isActive = false;
        this.playerHP = 100;
        this.enemyHP = 100;
        this.maxHP = 100;
        this.currentTurn = 'player';

        // 卡牌配置
        this.cardConfig = {
            width: 80,
            height: 120,
            margin: 10
        };

        this.playerHand = [];
        this.enemyHand = [];
        this.selectedCard = null;

        this.create();
        console.log('✅ BattleUI: 战斗UI初始化完成');
    }

    create() {
        // 创建主容器
        this.container = this.scene.add.container(this.x, this.y);
        this.container.setVisible(false); // 初始隐藏

        // 创建战斗背景
        this.createBattleBackground();

        // 创建血量条
        this.createHPBars();

        // 创建手牌区域
        this.createHandAreas();

        // 创建控制按钮
        this.createControlButtons();

        // 创建状态显示
        this.createStatusDisplay();
    }

    /**
     * 创建战斗背景 - 这个SB函数创建对战界面背景
     */
    createBattleBackground() {
        // 战斗面板背景
        const bg = this.scene.add.rectangle(0, 0, 900, 600, 0x1A1A2E, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);

        // 分割线（玩家vs对手）
        const divider = this.scene.add.rectangle(0, 0, 3, 500, 0xFFD700, 0.8);

        // 标题
        const title = this.scene.add.text(0, -250, '魔药对战', {
            fontSize: '36px',
            color: '#FFD700',
            fontFamily: 'ZCOOL KuaiLe',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // 回合指示器
        this.turnIndicator = this.scene.add.text(0, -200, '你的回合', {
            fontSize: '24px',
            color: '#00FF7F',
            fontFamily: 'Noto Sans SC',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.container.add([bg, divider, title, this.turnIndicator]);
    }

    /**
     * 创建血量条 - 这个憨批函数处理血量显示
     */
    createHPBars() {
        // 玩家血量条
        const playerHPBg = this.scene.add.rectangle(-200, -150, 200, 20, 0x333333, 0.8);
        this.playerHPBar = this.scene.add.rectangle(-200, -150, 200, 20, 0x00FF00, 1);

        const playerHPText = this.scene.add.text(-200, -130, 'HP: 100/100', {
            fontSize: '16px',
            color: '#FFFFFF',
            fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);

        // 玩家标签
        const playerLabel = this.scene.add.text(-200, -180, '玩家', {
            fontSize: '20px',
            color: '#00FF7F',
            fontFamily: 'ZCOOL KuaiLe',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 敌人血量条
        const enemyHPBg = this.scene.add.rectangle(200, -150, 200, 20, 0x333333, 0.8);
        this.enemyHPBar = this.scene.add.rectangle(200, -150, 200, 20, 0xFF0000, 1);

        const enemyHPText = this.scene.add.text(200, -130, 'HP: 100/100', {
            fontSize: '16px',
            color: '#FFFFFF',
            fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);

        // 敌人标签
        const enemyLabel = this.scene.add.text(200, -180, '对手', {
            fontSize: '20px',
            color: '#FF6347',
            fontFamily: 'ZCOOL KuaiLe',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.playerHPText = playerHPText;
        this.enemyHPText = enemyHPText;

        this.container.add([
            playerHPBg, this.playerHPBar, playerHPText, playerLabel,
            enemyHPBg, this.enemyHPBar, enemyHPText, enemyLabel
        ]);
    }

    /**
     * 创建手牌区域
     */
    createHandAreas() {
        // 玩家手牌区域
        this.playerHandArea = this.scene.add.rectangle(-225, 100, 400, 150, 0x2D1B69, 0.5);
        this.playerHandArea.setStrokeStyle(2, 0x00FF7F);

        const playerHandLabel = this.scene.add.text(-225, 30, '你的手牌', {
            fontSize: '18px',
            color: '#00FF7F',
            fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);

        // 敌人手牌区域
        this.enemyHandArea = this.scene.add.rectangle(225, 100, 400, 150, 0x2D1B69, 0.5);
        this.enemyHandArea.setStrokeStyle(2, 0xFF6347);

        const enemyHandLabel = this.scene.add.text(225, 30, '对手手牌', {
            fontSize: '18px',
            color: '#FF6347',
            fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);

        this.container.add([
            this.playerHandArea, playerHandLabel,
            this.enemyHandArea, enemyHandLabel
        ]);
    }

    /**
     * 创建控制按钮 - 这个SB函数创建战斗控制按钮
     */
    createControlButtons() {
        // 抽牌按钮
        this.drawButton = this.createButton(-100, 250, '抽牌', () => {
            this.drawCard('player');
        });

        // 出牌按钮
        this.playButton = this.createButton(0, 250, '出牌', () => {
            this.playSelectedCard();
        });

        // 结束回合按钮
        this.endTurnButton = this.createButton(100, 250, '结束回合', () => {
            this.endTurn();
        });

        // 逃跑按钮
        this.fleeButton = this.createButton(0, 290, '逃跑', () => {
            this.fleeBattle();
        });

        // 初始状态：只有抽牌按钮可用
        this.setButtonState('draw');
    }

    /**
     * 创建按钮
     */
    createButton(x, y, text, callback) {
        const button = this.scene.add.container(x, y);
        button.setInteractive(new Phaser.Geom.Rectangle(-50, -20, 100, 40), Phaser.Geom.Rectangle.Contains);

        const bg = this.scene.add.rectangle(0, 0, 100, 40, 0x4A4A4A);
        const buttonText = this.scene.add.text(0, 0, text, {
            fontSize: '16px',
            color: '#FFD700',
            fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);

        button.add([bg, buttonText]);

        button.on('pointerover', () => {
            bg.setFillStyle(0x6A6A6A);
            this.scene.tweens.add({
                targets: button,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        button.on('pointerout', () => {
            bg.setFillStyle(0x4A4A4A);
            this.scene.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        button.on('pointerdown', () => {
            bg.setFillStyle(0x2A2A2A);
        });

        button.on('pointerup', () => {
            bg.setFillStyle(0x6A6A6A);
            if (callback) callback();
        });

        this.container.add(button);
        return button;
    }

    /**
     * 创建状态显示
     */
    createStatusDisplay() {
        // 状态效果容器
        this.playerStatusContainer = this.scene.add.container(-225, -50);
        this.enemyStatusContainer = this.scene.add.container(225, -50);

        // 状态标签
        const playerStatusLabel = this.scene.add.text(0, -20, '状态效果', {
            fontSize: '14px',
            color: '#00FF7F',
            fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);

        const enemyStatusLabel = this.scene.add.text(0, -20, '状态效果', {
            fontSize: '14px',
            color: '#FF6347',
            fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);

        this.playerStatusContainer.add(playerStatusLabel);
        this.enemyStatusContainer.add(enemyStatusLabel);

        this.container.add([this.playerStatusContainer, this.enemyStatusContainer]);
    }

    /**
     * 开始战斗 - 这个SB函数初始化战斗
     */
    startBattle(enemyData) {
        this.isActive = true;
        this.container.setVisible(true);
        this.currentTurn = 'player';
        this.playerHP = this.maxHP;
        this.enemyHP = this.maxHP;

        // 初始化手牌
        this.playerHand = [];
        this.enemyHand = [];
        this.selectedCard = null;

        // 更新显示
        this.updateHPBars();
        this.updateTurnIndicator();

        // 初始抽牌
        for (let i = 0; i < 5; i++) {
            this.drawCard('player');
            this.drawCard('enemy');
        }

        console.log('⚔️ BattleUI: 战斗开始！');
    }

    /**
     * 抽牌 - 这个憨批函数处理卡牌抽取
     */
    drawCard(player) {
        if (player === 'player' && this.playerHand.length >= 7) return;
        if (player === 'enemy' && this.enemyHand.length >= 7) return;

        // 创建卡牌数据
        const card = this.createRandomCard();

        if (player === 'player') {
            this.playerHand.push(card);
            this.displayCard(card, 'player', this.playerHand.length - 1);
        } else {
            this.enemyHand.push(card);
            this.displayCard(card, 'enemy', this.enemyHand.length - 1);
        }
    }

    /**
     * 创建随机卡牌
     */
    createRandomCard() {
        const cardTypes = ['attack', 'defense', 'heal', 'special'];
        const type = cardTypes[Math.floor(Math.random() * cardTypes.length)];

        const cards = {
            attack: {
                name: '火球术',
                icon: '🔥',
                type: 'attack',
                value: Math.floor(Math.random() * 20) + 10,
                description: '造成火焰伤害'
            },
            defense: {
                name: '护盾',
                icon: '🛡️',
                type: 'defense',
                value: Math.floor(Math.random() * 15) + 5,
                description: '减少受到的伤害'
            },
            heal: {
                name: '治疗',
                icon: '💚',
                type: 'heal',
                value: Math.floor(Math.random() * 25) + 15,
                description: '恢复生命值'
            },
            special: {
                name: '特殊',
                icon: '✨',
                type: 'special',
                value: Math.floor(Math.random() * 30) + 20,
                description: '特殊效果'
            }
        };

        return cards[type];
    }

    /**
     * 显示卡牌
     */
    displayCard(card, player, index) {
        const isPlayer = player === 'player';
        const startX = isPlayer ? -350 : 50;
        const x = startX + index * (this.cardConfig.width + this.cardConfig.margin);
        const y = isPlayer ? 100 : 100;

        const cardContainer = this.scene.add.container(x, y);
        cardContainer.setInteractive(new Phaser.Geom.Rectangle(-40, -60, 80, 120), Phaser.Geom.Rectangle.Contains);

        // 卡牌背景
        const cardBg = this.scene.add.rectangle(0, 0, this.cardConfig.width, this.cardConfig.height, 0x2D1B69, 0.9);
        cardBg.setStrokeStyle(2, isPlayer ? 0x00FF7F : 0xFF6347);

        // 卡牌图标
        const cardIcon = this.scene.add.text(0, -30, card.icon, {
            fontSize: '30px',
            fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);

        // 卡牌名称
        const cardName = this.scene.add.text(0, 0, card.name, {
            fontSize: '14px',
            color: '#FFD700',
            fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);

        // 卡牌数值
        const cardValue = this.scene.add.text(0, 30, card.value.toString(), {
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: 'Noto Sans SC',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        cardContainer.add([cardBg, cardIcon, cardName, cardValue]);

        // 玩家卡牌交互
        if (isPlayer && this.currentTurn === 'player') {
            cardContainer.on('pointerover', () => {
                cardContainer.setScale(1.1);
                cardBg.setStrokeStyle(3, 0xFFD700);
            });

            cardContainer.on('pointerout', () => {
                cardContainer.setScale(1);
                if (this.selectedCard !== cardContainer) {
                    cardBg.setStrokeStyle(2, 0x00FF7F);
                }
            });

            cardContainer.on('pointerup', () => {
                this.selectCard(cardContainer, card);
            });
        }

        card.container = cardContainer;
        this.container.add(cardContainer);

        // 添加抽取动画
        this.scene.tweens.add({
            targets: cardContainer,
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: 1 },
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    /**
     * 选择卡牌
     */
    selectCard(cardContainer, card) {
        // 取消之前的选择
        if (this.selectedCard) {
            this.selectedCard.list[0].setStrokeStyle(2, 0x00FF7F);
        }

        // 选择新卡牌
        this.selectedCard = cardContainer;
        cardContainer.list[0].setStrokeStyle(3, 0xFFD700);

        // 启用出牌按钮
        this.setButtonState('play');

        console.log(`🃏 BattleUI: 选择了卡牌 ${card.name}`);
    }

    /**
     * 出牌 - 这个SB函数处理卡牌打出
     */
    playSelectedCard() {
        if (!this.selectedCard || this.currentTurn !== 'player') return;

        // 找到选中的卡牌
        const cardIndex = this.playerHand.findIndex(card => card.container === this.selectedCard);
        if (cardIndex === -1) return;

        const card = this.playerHand[cardIndex];

        // 应用卡牌效果
        this.applyCardEffect(card, 'player');

        // 移除打出的卡牌
        this.selectedCard.destroy();
        this.playerHand.splice(cardIndex, 1);

        // 清除选择
        this.selectedCard = null;

        // 更新按钮状态
        this.setButtonState('draw');

        console.log(`⚔️ BattleUI: 打出了 ${card.name}`);
    }

    /**
     * 应用卡牌效果
     */
    applyCardEffect(card, caster) {
        const isPlayer = caster === 'player';
        const target = isPlayer ? 'enemy' : 'player';

        switch (card.type) {
            case 'attack':
                this.dealDamage(target, card.value);
                this.showDamageNumber(target, card.value);
                break;
            case 'defense':
                // 防御逻辑
                this.showEffect(caster, '🛡️', '防御');
                break;
            case 'heal':
                this.healHP(caster, card.value);
                this.showEffect(caster, '💚', `+${card.value}`);
                break;
            case 'special':
                this.dealDamage(target, card.value);
                this.showEffect(target, '✨', '特殊');
                break;
        }

        // 添加震动效果
        this.scene.cameras.main.shake(200, 0.01);
    }

    /**
     * 造成伤害
     */
    dealDamage(target, damage) {
        if (target === 'enemy') {
            this.enemyHP = Math.max(0, this.enemyHP - damage);
        } else {
            this.playerHP = Math.max(0, this.playerHP - damage);
        }
        this.updateHPBars();
        this.checkBattleEnd();
    }

    /**
     * 治疗血量
     */
    healHP(target, heal) {
        if (target === 'player') {
            this.playerHP = Math.min(this.maxHP, this.playerHP + heal);
        } else {
            this.enemyHP = Math.min(this.maxHP, this.enemyHP + heal);
        }
        this.updateHPBars();
    }

    /**
     * 更新血量条
     */
    updateHPBars() {
        const playerProgress = this.playerHP / this.maxHP;
        const enemyProgress = this.enemyHP / this.maxHP;

        this.playerHPBar.setScale(playerProgress, 1);
        this.enemyHPBar.setScale(enemyProgress, 1);

        this.playerHPText.setText(`HP: ${this.playerHP}/${this.maxHP}`);
        this.enemyHPText.setText(`HP: ${this.enemyHP}/${this.maxHP}`);

        // 根据血量改变颜色
        this.playerHPBar.setFillStyle(this.getHPColor(playerProgress));
        this.enemyHPBar.setFillStyle(this.getHPColor(enemyProgress));
    }

    /**
     * 获取血量颜色
     */
    getHPColor(progress) {
        if (progress > 0.6) return 0x00FF00;
        if (progress > 0.3) return 0xFFA500;
        return 0xFF0000;
    }

    /**
     * 显示伤害数字
     */
    showDamageNumber(target, damage) {
        const x = target === 'enemy' ? 200 : -200;
        const y = -100;

        const damageText = this.scene.add.text(x, y, `-${damage}`, {
            fontSize: '32px',
            color: '#FF0000',
            fontFamily: 'ZCOOL KuaiLe',
            fontStyle: 'bold',
            stroke: '#FFFFFF',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: damageText,
            y: y - 50,
            alpha: 0,
            scale: 1.5,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => damageText.destroy()
        });
    }

    /**
     * 显示效果
     */
    showEffect(target, icon, text) {
        const x = target === 'player' ? -200 : 200;
        const y = -50;

        const effectText = this.scene.add.text(x, y, `${icon} ${text}`, {
            fontSize: '24px',
            color: '#FFD700',
            fontFamily: 'ZCOOL KuaiLe',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: effectText,
            y: y - 30,
            alpha: 0,
            duration: 2000,
            onComplete: () => effectText.destroy()
        });
    }

    /**
     * 结束回合 - 这个SB函数处理回合结束
     */
    endTurn() {
        if (this.currentTurn === 'player') {
            this.currentTurn = 'enemy';
            this.updateTurnIndicator();
            this.setButtonState('wait');

            // 敌人回合（简化AI）
            this.scene.time.delayedCall(1500, () => {
                this.enemyTurn();
            });
        }
    }

    /**
     * 敌人回合
     */
    enemyTurn() {
        if (this.enemyHand.length > 0) {
            // 随机出牌
            const randomCard = this.enemyHand[Math.floor(Math.random() * this.enemyHand.length)];
            this.applyCardEffect(randomCard, 'enemy');

            // 移除打出的卡牌
            const cardIndex = this.enemyHand.indexOf(randomCard);
            if (cardIndex !== -1) {
                this.enemyHand.splice(cardIndex, 1);
            }
        }

        // 回到玩家回合
        this.scene.time.delayedCall(1000, () => {
            this.currentTurn = 'player';
            this.updateTurnIndicator();
            this.setButtonState('draw');
            this.drawCard('player');
        });
    }

    /**
     * 更新回合指示器
     */
    updateTurnIndicator() {
        if (this.currentTurn === 'player') {
            this.turnIndicator.setText('你的回合');
            this.turnIndicator.setColor('#00FF7F');
        } else {
            this.turnIndicator.setText('对手回合');
            this.turnIndicator.setColor('#FF6347');
        }
    }

    /**
     * 设置按钮状态 - 这个憨批函数管理按钮可用性
     */
    setButtonState(state) {
        // 重置所有按钮
        [this.drawButton, this.playButton, this.endTurnButton].forEach(btn => {
            btn.alpha = 0.3;
            btn.list[0].setFillStyle(0x2A2A2A);
            btn.removeInteractive();
        });

        switch (state) {
            case 'draw':
                this.drawButton.alpha = 1;
                this.drawButton.list[0].setFillStyle(0x4A4A4A);
                this.drawButton.setInteractive();
                break;
            case 'play':
                this.playButton.alpha = 1;
                this.playButton.list[0].setFillStyle(0x4A4A4A);
                this.playButton.setInteractive();
                this.endTurnButton.alpha = 1;
                this.endTurnButton.list[0].setFillStyle(0x4A4A4A);
                this.endTurnButton.setInteractive();
                break;
            case 'wait':
                // 等待状态，所有按钮禁用
                break;
        }
    }

    /**
     * 检查战斗结束
     */
    checkBattleEnd() {
        if (this.playerHP <= 0) {
            this.endBattle('defeat');
        } else if (this.enemyHP <= 0) {
            this.endBattle('victory');
        }
    }

    /**
     * 逃跑
     */
    fleeBattle() {
        if (Math.random() > 0.3) {
            this.endBattle('flee');
        } else {
            this.showMessage('逃跑失败！', '#FF0000');
        }
    }

    /**
     * 结束战斗 - 这个SB函数处理战斗结束
     */
    endBattle(result) {
        this.isActive = false;

        let message = '';
        let color = '#FFFFFF';
        let rewards = {};

        switch (result) {
            case 'victory':
                message = '🎉 胜利！';
                color = '#00FF00';
                rewards = { gold: 100, reputation: 10 };
                break;
            case 'defeat':
                message = '💀 失败...';
                color = '#FF0000';
                rewards = { gold: 0, reputation: -5 };
                break;
            case 'flee':
                message = '🏃 逃跑成功';
                color = '#FFA500';
                rewards = { gold: 20, reputation: -2 };
                break;
        }

        // 显示结果
        const resultText = this.scene.add.text(0, 0, message, {
            fontSize: '48px',
            color: color,
            fontFamily: 'ZCOOL KuaiLe',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.container.add(resultText);

        // 动画效果
        this.scene.tweens.add({
            targets: resultText,
            scale: { from: 0.5, to: 1.2 },
            duration: 1000,
            ease: 'Back.easeOut'
        });

        // 延迟关闭战斗界面
        this.scene.time.delayedCall(3000, () => {
            this.closeBattle(rewards);
        });
    }

    /**
     * 关闭战斗
     */
    closeBattle(rewards) {
        this.container.setVisible(false);

        // 清理手牌
        [...this.playerHand, ...this.enemyHand].forEach(card => {
            if (card.container) {
                card.container.destroy();
            }
        });

        this.playerHand = [];
        this.enemyHand = [];
        this.selectedCard = null;

        // 返回奖励
        if (this.scene.onBattleEnd) {
            this.scene.onBattleEnd(rewards);
        }

        console.log(`⚔️ BattleUI: 战斗结束，奖励：`, rewards);
    }

    /**
     * 显示消息
     */
    showMessage(text, color) {
        const message = this.scene.add.text(0, -220, text, {
            fontSize: '24px',
            color: color,
            fontFamily: 'ZCOOL KuaiLe',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: message,
            alpha: 0,
            y: -250,
            duration: 2000,
            onComplete: () => message.destroy()
        });
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}