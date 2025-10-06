/**
 * 资源条组件 - 显示金币、材料、声望等游戏资源
 * 这个SB组件负责顶部资源显示
 */
class ResourceBar {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.container = null;
        this.resourceTexts = {};
        this.resourceIcons = {};

        // 资源配置
        this.resourceConfig = {
            gold: {
                icon: '💰',
                color: '#FFD700',
                name: '金币'
            },
            materials: {
                icon: '🌿',
                color: '#00FF7F',
                name: '材料'
            },
            reputation: {
                icon: '⭐',
                color: '#87CEEB',
                name: '声望'
            },
            customers: {
                icon: '👥',
                color: '#DDA0DD',
                name: '顾客'
            },
            staff: {
                icon: '👨‍🍳',
                color: '#F4A460',
                name: '员工'
            }
        };

        this.create();
        console.log('✅ ResourceBar: 资源条初始化完成');
    }

    create() {
        // 创建容器
        this.container = this.scene.add.container(this.x, this.y);

        // 背景条
        const bgBar = this.scene.add.rectangle(0, 0, 800, 40, 0x1A1A2E, 0.9);
        bgBar.setStrokeStyle(2, 0xFFD700);

        this.container.add(bgBar);

        // 创建资源显示
        let xOffset = -300;
        Object.keys(this.resourceConfig).forEach((key, index) => {
            const config = this.resourceConfig[key];

            // 图标
            const icon = this.scene.add.text(xOffset, 0, config.icon, {
                fontSize: '24px',
                fontFamily: 'Noto Sans SC'
            }).setOrigin(0.5);

            // 文字
            const text = this.scene.add.text(xOffset + 20, 0, '0', {
                fontSize: '18px',
                color: config.color,
                fontFamily: 'Noto Sans SC',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            this.container.add([icon, text]);
            this.resourceIcons[key] = icon;
            this.resourceTexts[key] = text;

            xOffset += 150;
        });

        // 添加时间显示
        const timeIcon = this.scene.add.text(250, 0, '⏰', {
            fontSize: '24px',
            fontFamily: 'Noto Sans SC'
        }).setOrigin(0.5);

        this.timeText = this.scene.add.text(280, 0, '白天', {
            fontSize: '18px',
            color: '#87CEEB',
            fontFamily: 'Noto Sans SC',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.container.add([timeIcon, this.timeText]);
    }

    /**
     * 更新资源显示 - 这个SB函数更新资源数值
     */
    updateResource(type, value, animated = true) {
        if (!this.resourceTexts[type]) return;

        const text = this.resourceTexts[type];
        const oldValue = parseInt(text.text) || 0;
        const newValue = typeof value === 'number' ? value : parseInt(value) || 0;

        if (animated && oldValue !== newValue) {
            // 数字变化动画
            const diff = newValue - oldValue;
            const steps = 20;
            const stepValue = diff / steps;
            let currentStep = 0;

            const timer = this.scene.time.addEvent({
                delay: 50,
                callback: () => {
                    currentStep++;
                    const currentValue = Math.round(oldValue + stepValue * currentStep);
                    text.setText(currentValue.toString());

                    // 变化效果
                    if (diff > 0) {
                        text.setColor('#00FF00'); // 增加时绿色
                    } else {
                        text.setColor('#FF0000'); // 减少时红色
                    }

                    if (currentStep >= steps) {
                        timer.destroy();
                        text.setText(newValue.toString());
                        text.setColor(this.resourceConfig[type].color);

                        // 播放音效（如果有的话）
                        this.playResourceSound(type, diff);
                    }
                },
                repeat: steps - 1
            });
        } else {
            text.setText(newValue.toString());
        }
    }

    /**
     * 批量更新资源
     */
    updateResources(resources) {
        Object.keys(resources).forEach(type => {
            if (this.resourceTexts[type]) {
                this.updateResource(type, resources[type]);
            }
        });
    }

    /**
     * 更新时间显示
     */
    updateTime(timeOfDay) {
        if (this.timeText) {
            this.timeText.setText(timeOfDay);

            // 根据时间改变颜色
            switch (timeOfDay) {
                case '白天':
                    this.timeText.setColor('#87CEEB');
                    break;
                case '黄昏':
                    this.timeText.setColor('#FFA500');
                    break;
                case '夜晚':
                    this.timeText.setColor('#9370DB');
                    break;
                default:
                    this.timeText.setColor('#FFFFFF');
            }
        }
    }

    /**
     * 播放资源变化音效（占位符）
     */
    playResourceSound(type, diff) {
        // 这里可以添加音效播放逻辑
        // 暂时用控制台输出代替
        if (diff > 0) {
            console.log(`💰 ${type} 增加了 ${diff}`);
        } else {
            console.log(`💸 ${type} 减少了 ${Math.abs(diff)}`);
        }
    }

    /**
     * 显示资源获得动画
     */
    showResourceGain(type, amount, x, y) {
        const config = this.resourceConfig[type];
        const text = `+${amount} ${config.icon}`;

        const gainText = this.scene.add.text(x, y, text, {
            fontSize: '20px',
            color: config.color,
            fontFamily: 'ZCOOL KuaiLe',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // 飞升动画
        this.scene.tweens.add({
            targets: gainText,
            y: y - 50,
            alpha: 0,
            scale: 1.2,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => gainText.destroy()
        });
    }

    /**
     * 销毁资源条
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}