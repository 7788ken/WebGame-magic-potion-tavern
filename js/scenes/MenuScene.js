/**
 * 主菜单场景
 * 游戏主菜单界面
 */

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });

        this.menuButtons = [];
        this.selectedButton = 0;
        this.backgroundMusic = null;
        this.particleEffects = [];
    }

    preload() {
        console.log('🎮 MenuScene: 加载主菜单资源...');
    }

    create() {
        console.log('🎮 MenuScene: 创建主菜单界面');

        // 创建背景
        this.createBackground();

        // 创建标题
        this.createTitle();

        // 创建菜单按钮
        this.createMenuButtons();

        // 创建装饰元素
        this.createDecorativeElements();

        // 创建粒子效果
        this.createParticleEffects();

        // 设置键盘控制
        this.setupKeyboardControls();

        // 播放背景音乐
        this.playBackgroundMusic();

        // 检查存档
        this.checkSaveData();

        // 显示欢迎消息
        this.showWelcomeMessage();
    }

    /**
     * 创建背景
     */
    createBackground() {
        const { width, height } = this.cameras.main;

        // 主背景
        const bg = this.add.image(width / 2, height / 2, 'menu_background');
        bg.setDisplaySize(width, height);
        bg.setAlpha(0.8);

        // 添加暗色遮罩
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.4);
        overlay.fillRect(0, 0, width, height);

        // 添加渐变效果
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(
            0x2D1B69, 0x2D1B69,
            0x1A1A2E, 0x1A1A2E,
            0.3, 0.7
        );
        gradient.fillRect(0, 0, width, height);
    }

    /**
     * 创建标题
     */
    createTitle() {
        const { width, height } = this.cameras.main;

        // 主标题
        const titleStyle = {
            fontSize: '64px',
            fontFamily: 'ZCOOL KuaiLe',
            color: '#FFD700',
            align: 'center',
            stroke: '#2D1B69',
            strokeThickness: 4,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000000',
                blur: 8,
                stroke: true,
                fill: true
            }
        };

        const title = this.add.text(width / 2, 120, '魔药酒馆', titleStyle)
            .setOrigin(0.5);

        // 标题动画
        this.tweens.add({
            targets: title,
            scale: { from: 0.8, to: 1 },
            duration: 1000,
            ease: 'Back.easeOut'
        });

        // 副标题
        const subtitleStyle = {
            fontSize: '24px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            align: 'center',
            alpha: 0.9
        };

        const subtitle = this.add.text(width / 2, 180, '经营你的魔法酒馆，成为最强大的魔药大师', subtitleStyle)
            .setOrigin(0.5);

        // 副标题淡入动画
        subtitle.setAlpha(0);
        this.tweens.add({
            targets: subtitle,
            alpha: 0.9,
            duration: 1500,
            delay: 500,
            ease: 'Power2'
        });
    }

    /**
     * 创建菜单按钮
     */
    createMenuButtons() {
        const { width, height } = this.cameras.main;
        const buttonWidth = 250;
        const buttonHeight = 60;
        const buttonSpacing = 80;
        const startY = height / 2 - 100;

        const buttons = [
            { id: 'new_game', text: '🎮 新游戏', action: () => this.startNewGame() },
            { id: 'continue', text: '💾 继续游戏', action: () => this.continueGame(), disabled: !saveManager.hasAutoSave() },
            { id: 'settings', text: '⚙️ 游戏设置', action: () => this.openSettings() },
            { id: 'credits', text: '👥 制作团队', action: () => this.showCredits() },
            { id: 'exit', text: '🚪 退出游戏', action: () => this.exitGame() }
        ];

        buttons.forEach((button, index) => {
            const y = startY + index * buttonSpacing;

            const menuButton = this.createMenuButton(
                width / 2, y,
                button.text,
                button.action,
                button.disabled
            );

            menuButton.buttonData = button;
            this.menuButtons.push(menuButton);

            // 按钮出现动画
            menuButton.container.setAlpha(0);
            menuButton.container.setScale(0.8);

            this.tweens.add({
                targets: menuButton.container,
                alpha: 1,
                scale: 1,
                duration: 500,
                delay: 200 + index * 100,
                ease: 'Back.easeOut'
            });
        });

        // 默认选中第一个可用按钮
        this.updateButtonSelection();
    }

    /**
     * 创建菜单按钮
     */
    createMenuButton(x, y, text, onClick, disabled = false) {
        const container = this.add.container(x, y);

        // 按钮背景
        const bg = this.add.graphics();
        const buttonWidth = 250;
        const buttonHeight = 60;

        // 正常状态背景
        bg.fillStyle(disabled ? 0x666666 : 0x2D1B69, 0.8);
        bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);

        // 边框
        bg.lineStyle(2, disabled ? 0x888888 : 0xFFD700, 0.8);
        bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);

        // 按钮文本
        const textStyle = {
            fontSize: '20px',
            fontFamily: 'Noto Sans SC',
            color: disabled ? '#888888' : '#FFF8DC',
            align: 'center'
        };

        const buttonText = this.add.text(0, 0, text, textStyle).setOrigin(0.5);

        container.add([bg, buttonText]);

        if (!disabled) {
            // 设置交互
            container.setInteractive(
                new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
                Phaser.Geom.Rectangle.Contains
            );

            // 鼠标悬停效果
            container.on('pointerover', () => {
                this.tweens.add({
                    targets: container,
                    scale: 1.05,
                    duration: 200,
                    ease: 'Power2'
                });

                // 改变颜色
                bg.clear();
                bg.fillStyle(0x3742FA, 0.9);
                bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
                bg.lineStyle(2, 0xFFD700, 1);
                bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);

                // 播放悬停音效
                this.sound.play('sfx_hover', { volume: 0.3 });
            });

            container.on('pointerout', () => {
                this.tweens.add({
                    targets: container,
                    scale: 1,
                    duration: 200,
                    ease: 'Power2'
                });

                // 恢复颜色
                bg.clear();
                bg.fillStyle(0x2D1B69, 0.8);
                bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
                bg.lineStyle(2, 0xFFD700, 0.8);
                bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            });

            // 点击效果
            container.on('pointerdown', () => {
                this.tweens.add({
                    targets: container,
                    scale: 0.95,
                    duration: 100,
                    ease: 'Power2'
                });
            });

            container.on('pointerup', () => {
                this.tweens.add({
                    targets: container,
                    scale: 1.05,
                    duration: 100,
                    ease: 'Power2'
                });

                // 播放点击音效
                this.sound.play('sfx_click', { volume: 0.5 });

                // 执行按钮动作
                onClick();
            });
        }

        return {
            container: container,
            background: bg,
            text: buttonText,
            buttonData: { disabled: disabled }
        };
    }

    /**
     * 创建装饰元素
     */
    createDecorativeElements() {
        const { width, height } = this.cameras.main;

        // 创建魔法书装饰
        const magicBook = this.add.text(100, height - 100, '📚', {
            fontSize: '48px'
        });

        this.tweens.add({
            targets: magicBook,
            y: '+=10',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 创建药瓶装饰
        const potion = this.add.text(width - 100, 100, '🧪', {
            fontSize: '48px'
        });

        this.tweens.add({
            targets: potion,
            rotation: Math.PI * 2,
            duration: 4000,
            repeat: -1,
            ease: 'Linear'
        });

        // 创建金币装饰
        const coins = this.add.text(150, 150, '💰', {
            fontSize: '32px'
        });

        this.tweens.add({
            targets: coins,
            alpha: { from: 0.5, to: 1 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 创建星星装饰
        for (let i = 0; i < 5; i++) {
            const star = this.add.text(
                Phaser.Math.Between(50, width - 50),
                Phaser.Math.Between(50, height - 50),
                '⭐', {
                fontSize: '24px',
                alpha: 0.6
            });

            this.tweens.add({
                targets: star,
                alpha: { from: 0.3, to: 0.8 },
                duration: 2000 + i * 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    /**
     * 创建粒子效果
     */
    createParticleEffects() {
        const { width, height } = this.cameras.main;

        // 创建魔法粒子
        const particles = this.add.particles(0, 0, null, {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: 4000,
            speed: { min: 20, max: 40 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: [0xFFD700, 0x00FF7F, 0x3742FA],
            frequency: 500,
            quantity: 2,
            gravityY: -10
        });

        // 创建粒子纹理
        const particleGraphics = this.add.graphics();
        particleGraphics.fillStyle(0xFFD700);
        particleGraphics.fillCircle(2, 2, 2);
        particleGraphics.generateTexture('menuParticle', 4, 4);
        particleGraphics.destroy();

        particles.setTexture('menuParticle');
    }

    /**
     * 设置键盘控制
     */
    setupKeyboardControls() {
        // 键盘导航
        this.input.keyboard.on('keydown-UP', () => {
            this.navigateMenu(-1);
        });

        this.input.keyboard.on('keydown-DOWN', () => {
            this.navigateMenu(1);
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            this.activateSelectedButton();
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.activateSelectedButton();
        });

        // ESC键返回
        this.input.keyboard.on('keydown-ESC', () => {
            this.showExitConfirm();
        });
    }

    /**
     * 导航菜单
     */
    navigateMenu(direction) {
        // 找到可用的按钮
        const availableButtons = this.menuButtons.filter(btn => !btn.buttonData.disabled);

        if (availableButtons.length === 0) return;

        // 取消当前选中
        if (this.selectedButton >= 0 && this.selectedButton < this.menuButtons.length) {
            const currentBtn = this.menuButtons[this.selectedButton];
            if (!currentBtn.buttonData.disabled) {
                this.setButtonSelected(currentBtn, false);
            }
        }

        // 计算新的选中索引
        const currentIndex = availableButtons.indexOf(this.menuButtons[this.selectedButton]);
        const newIndex = (currentIndex + direction + availableButtons.length) % availableButtons.length;

        this.selectedButton = this.menuButtons.indexOf(availableButtons[newIndex]);
        this.setButtonSelected(availableButtons[newIndex], true);

        // 播放导航音效
        this.sound.play('sfx_hover', { volume: 0.2 });
    }

    /**
     * 设置按钮选中状态
     */
    setButtonSelected(button, selected) {
        if (!button || button.buttonData.disabled) return;

        const scale = selected ? 1.1 : 1.0;
        const alpha = selected ? 1.0 : 0.9;

        this.tweens.add({
            targets: button.container,
            scale: scale,
            alpha: alpha,
            duration: 200,
            ease: 'Power2'
        });

        // 改变边框颜色
        const bg = button.background;
        const buttonWidth = 250;
        const buttonHeight = 60;

        bg.clear();
        bg.fillStyle(selected ? 0x3742FA : 0x2D1B69, selected ? 0.9 : 0.8);
        bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
        bg.lineStyle(selected ? 3 : 2, selected ? 0x00FF7F : 0xFFD700, 1);
        bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    }

    /**
     * 激活选中的按钮
     */
    activateSelectedButton() {
        if (this.selectedButton >= 0 && this.selectedButton < this.menuButtons.length) {
            const button = this.menuButtons[this.selectedButton];
            if (!button.buttonData.disabled) {
                button.container.emit('pointerup');
            }
        }
    }

    /**
     * 更新按钮选择状态
     */
    updateButtonSelection() {
        const availableButtons = this.menuButtons.filter(btn => !btn.buttonData.disabled);
        if (availableButtons.length > 0) {
            const firstAvailable = this.menuButtons.indexOf(availableButtons[0]);
            this.selectedButton = firstAvailable;
            this.setButtonSelected(availableButtons[0], true);
        }
    }

    /**
     * 播放背景音乐
     */
    playBackgroundMusic() {
        if (this.sound.get('bgm_main')) {
            this.backgroundMusic = this.sound.play('bgm_main', {
                loop: true,
                volume: 0.4
            });
        }
    }

    /**
     * 检查存档数据
     */
    checkSaveData() {
        const hasSave = saveManager.hasAutoSave();

        // 更新继续游戏按钮状态
        const continueButton = this.menuButtons.find(btn => btn.buttonData.id === 'continue');
        if (continueButton) {
            if (hasSave) {
                continueButton.buttonData.disabled = false;
                continueButton.text.setColor('#FFF8DC');
            } else {
                continueButton.buttonData.disabled = true;
                continueButton.text.setColor('#888888');
            }
        }
    }

    /**
     * 显示欢迎消息
     */
    showWelcomeMessage() {
        const { width, height } = this.cameras.main;

        const welcomeStyle = {
            fontSize: '16px',
            fontFamily: 'Noto Sans SC',
            color: '#00FF7F',
            align: 'center',
            backgroundColor: '#2D1B69',
            padding: { x: 20, y: 10 }
        };

        const message = saveManager.hasAutoSave() ?
            '欢迎回来，酒馆老板！继续你的魔药事业吧！' :
            '欢迎来到魔药酒馆！开始你的经营之旅吧！';

        const welcomeText = this.add.text(width / 2, height - 80, message, welcomeStyle)
            .setOrigin(0.5);

        // 淡入动画
        welcomeText.setAlpha(0);
        this.tweens.add({
            targets: welcomeText,
            alpha: 1,
            duration: 2000,
            ease: 'Power2'
        });

        // 3秒后淡出
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: welcomeText,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => welcomeText.destroy()
            });
        });
    }

    /**
     * 菜单按钮动作
     */
    startNewGame() {
        console.log('🎮 开始新游戏');

        // 确认对话框
        if (saveManager.hasAutoSave()) {
            this.showConfirmDialog(
                '开始新游戏将覆盖现有存档，是否继续？',
                () => {
                    // 重置游戏状态
                    gameState.initializeState();
                    saveManager.quickSave();

                    // 进入酒馆场景
                    this.scene.start('TavernScene');
                },
                () => {
                    // 取消操作
                }
            );
        } else {
            // 直接进入游戏
            this.scene.start('TavernScene');
        }
    }

    continueGame() {
        console.log('💾 继续游戏');

        if (saveManager.hasAutoSave()) {
            const success = saveManager.quickLoad();
            if (success) {
                this.scene.start('TavernScene');
            } else {
                this.showMessage('存档加载失败，请尝试其他存档', 'error');
            }
        } else {
            this.showMessage('没有找到可加载的存档', 'warning');
        }
    }

    openSettings() {
        console.log('⚙️ 打开设置');
        // 这里可以实现设置界面
        this.showMessage('设置功能开发中...', 'info');
    }

    showCredits() {
        console.log('👥 显示制作团队');

        const { width, height } = this.cameras.main;

        const creditsStyle = {
            fontSize: '18px',
            fontFamily: 'Noto Sans SC',
            color: '#FFF8DC',
            align: 'center',
            backgroundColor: '#2D1B69',
            padding: { x: 30, y: 20 }
        };

        const creditsText = `
🧪 魔药酒馆制作团队 🧪

🎨 美术设计: Claude AI
💻 程序开发: Claude AI
🎵 音效制作: Claude AI
📊 游戏设计: Claude AI

🎯 游戏引擎: Phaser.js 3.70
🎨 UI框架: 原生Canvas
🔊 音频: Web Audio API
💾 存储: LocalStorage

© 2024 魔药酒馆 - 保留所有权利
        `;

        const credits = this.add.text(width / 2, height / 2, creditsText, creditsStyle)
            .setOrigin(0.5);

        // 淡入动画
        credits.setAlpha(0);
        this.tweens.add({
            targets: credits,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });

        // 点击关闭
        credits.setInteractive();
        credits.on('pointerdown', () => {
            this.tweens.add({
                targets: credits,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => credits.destroy()
            });
        });
    }

    exitGame() {
        console.log('🚪 退出游戏');
        this.showExitConfirm();
    }

    /**
     * 显示确认对话框
     */
    showConfirmDialog(message, onConfirm, onCancel) {
        const { width, height } = this.cameras.main;

        // 创建对话框背景
        const dialogBg = this.add.graphics();
        dialogBg.fillStyle(0x000000, 0.7);
        dialogBg.fillRect(0, 0, width, height);

        // 对话框
        const dialogStyle = {
            fontSize: '20px',
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
                // 清理对话框
                dialogBg.destroy();
                dialog.destroy();
                confirmButton.container.destroy();
                cancelButton.container.destroy();

                // 执行确认操作
                onConfirm();
            }
        );

        // 取消按钮
        const cancelButton = this.createMenuButton(
            width / 2 + 80, height / 2 + 30,
            '❌ 取消',
            () => {
                // 清理对话框
                dialogBg.destroy();
                dialog.destroy();
                confirmButton.container.destroy();
                cancelButton.container.destroy();

                // 执行取消操作
                onCancel();
            }
        );
    }

    /**
     * 显示退出确认
     */
    showExitConfirm() {
        this.showConfirmDialog(
            '确定要退出游戏吗？',
            () => {
                // 保存游戏
                saveManager.quickSave();

                // 关闭窗口
                if (typeof window !== 'undefined' && window.close) {
                    window.close();
                } else {
                    // 如果无法关闭窗口，显示消息
                    this.showMessage('请手动关闭浏览器标签页', 'info');
                }
            },
            () => {
                // 取消退出
            }
        );
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
            align: 'center',
            backgroundColor: '#2D1B69',
            padding: { x: 20, y: 10 }
        };

        const messageText = this.add.text(width / 2, 50, message, messageStyle)
            .setOrigin(0.5);

        // 淡入动画
        messageText.setAlpha(0);
        this.tweens.add({
            targets: messageText,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });

        // 自动淡出
        this.time.delayedCall(duration, () => {
            this.tweens.add({
                targets: messageText,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => messageText.destroy()
            });
        });
    }

    /**
     * 更新函数
     */
    update(time, delta) {
        // 更新粒子效果
        this.updateParticleEffects(time, delta);
    }

    /**
     * 更新粒子效果
     */
    updateParticleEffects(time, delta) {
        // 这里可以添加粒子效果的动态更新
    }

    /**
     * 场景销毁
     */
    shutdown() {
        console.log('🛑 MenuScene: 场景销毁');

        // 停止背景音乐
        if (this.backgroundMusic) {
            this.sound.stopByKey('bgm_main');
        }

        // 清理按钮
        this.menuButtons.forEach(btn => {
            if (btn.container) {
                btn.container.removeAll(true);
                btn.container.destroy();
            }
        });
        this.menuButtons = [];

        // 清理粒子效果
        this.particleEffects.forEach(effect => {
            if (effect.destroy) {
                effect.destroy();
            }
        });
        this.particleEffects = [];
    }
}

// 导出场景类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuScene;
}