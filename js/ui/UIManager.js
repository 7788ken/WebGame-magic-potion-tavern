/**
 * UI管理器 - 负责所有UI组件的创建和管理
 * 这个SB文件管理整个游戏的UI系统
 */
class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.panels = {};
        this.buttons = {};
        this.texts = {};
        this.containers = {};

        // 初始化UI配置
        this.config = {
            panel: {
                width: 300,
                height: 200,
                backgroundColor: 0x2D1B69,
                borderColor: 0xFFD700,
                borderWidth: 2,
                alpha: 0.9
            },
            button: {
                width: 120,
                height: 40,
                normalColor: 0x4A4A4A,
                hoverColor: 0x6A6A6A,
                pressedColor: 0x2A2A2A,
                textColor: '#FFD700',
                fontSize: '16px'
            }
        };

        console.log('✅ UIManager: UI管理器初始化完成');
    }

    /**
     * 创建面板 - 这个SB函数创建各种UI面板
     */
    createPanel(x, y, width, height, config = {}) {
        const panelConfig = { ...this.config.panel, ...config };

        // 创建面板容器
        const panel = this.scene.add.container(x, y);

        // 背景
        const background = this.scene.add.rectangle(
            0, 0, width, height,
            panelConfig.backgroundColor,
            panelConfig.alpha
        );

        // 边框
        const border = this.scene.add.rectangle(
            0, 0, width + panelConfig.borderWidth,
            height + panelConfig.borderWidth,
            panelConfig.borderColor, 0
        );
        border.setStrokeStyle(panelConfig.borderWidth, panelConfig.borderColor);

        panel.add([border, background]);

        return panel;
    }

    /**
     * 创建按钮 - 这个憨批函数处理按钮创建
     */
    createButton(x, y, text, callback, config = {}) {
        const buttonConfig = { ...this.config.button, ...config };

        // 创建按钮容器
        const button = this.scene.add.container(x, y);
        button.setInteractive(new Phaser.Geom.Rectangle(
            -buttonConfig.width/2, -buttonConfig.height/2,
            buttonConfig.width, buttonConfig.height
        ), Phaser.Geom.Rectangle.Contains);

        // 按钮背景
        const bg = this.scene.add.rectangle(
            0, 0, buttonConfig.width, buttonConfig.height,
            buttonConfig.normalColor
        );

        // 按钮文字
        const buttonText = this.scene.add.text(0, 0, text, {
            fontSize: buttonConfig.fontSize,
            color: buttonConfig.textColor,
            fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);

        button.add([bg, buttonText]);

        // 交互效果
        button.on('pointerover', () => {
            bg.setFillStyle(buttonConfig.hoverColor);
            this.scene.tweens.add({
                targets: button,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        button.on('pointerout', () => {
            bg.setFillStyle(buttonConfig.normalColor);
            this.scene.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        button.on('pointerdown', () => {
            bg.setFillStyle(buttonConfig.pressedColor);
        });

        button.on('pointerup', () => {
            bg.setFillStyle(buttonConfig.hoverColor);
            if (callback) callback();
        });

        return button;
    }

    /**
     * 创建资源条 - 显示金币、材料等
     */
    createResourceBar(x, y, resources) {
        const container = this.scene.add.container(x, y);

        resources.forEach((resource, index) => {
            const icon = this.scene.add.image(-50, index * 30, resource.icon);
            icon.setScale(0.3);

            const text = this.scene.add.text(-20, index * 30, resource.value, {
                fontSize: '18px',
                color: '#FFD700',
                fontFamily: 'Noto Sans SC'
            }).setOrigin(0, 0.5);

            container.add([icon, text]);
        });

        return container;
    }

    /**
     * 创建进度条 - 这个SB函数处理进度显示
     */
    createProgressBar(x, y, width, height, progress, config = {}) {
        const container = this.scene.add.container(x, y);

        // 背景
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x333333, 0.8);

        // 进度条
        const progressWidth = width * progress;
        const progressBar = this.scene.add.rectangle(
            -(width - progressWidth) / 2, 0,
            progressWidth, height - 4,
            config.color || 0x00FF7F, 0.9
        );

        // 文字
        const text = this.scene.add.text(0, 0, `${Math.round(progress * 100)}%`, {
            fontSize: '14px',
            color: '#FFFFFF',
            fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);

        container.add([bg, progressBar, text]);

        return {
            container,
            progressBar,
            text,
            setProgress: (newProgress) => {
                const newWidth = width * newProgress;
                progressBar.setSize(newWidth, height - 4);
                progressBar.setX(-(width - newWidth) / 2);
                text.setText(`${Math.round(newProgress * 100)}%`);
            }
        };
    }

    /**
     * 显示消息提示
     */
    showMessage(text, x, y, duration = 2000) {
        const message = this.scene.add.text(x, y, text, {
            fontSize: '20px',
            color: '#FFD700',
            fontFamily: 'ZCOOL KuaiLe',
            backgroundColor: '#2D1B69',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // 动画效果
        this.scene.tweens.add({
            targets: message,
            alpha: 0,
            y: y - 50,
            duration: duration,
            onComplete: () => message.destroy()
        });
    }

    /**
     * 清理所有UI元素
     */
    destroy() {
        Object.values(this.panels).forEach(panel => panel.destroy());
        Object.values(this.buttons).forEach(button => button.destroy());
        Object.values(this.texts).forEach(text => text.destroy());
        Object.values(this.containers).forEach(container => container.destroy());

        this.panels = {};
        this.buttons = {};
        this.texts = {};
        this.containers = {};
    }
}