/**
 * 顾客UI组件 - 管理顾客相关的界面显示
 * 这个SB组件处理顾客头像、需求、满意度等
 */
class CustomerUI {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.container = null;
        this.customers = [];
        this.maxCustomers = 5;

        // 顾客配置
        this.customerTypes = {
            merchant: {
                name: '商人',
                icon: '🧑‍💼',
                color: '#FFD700',
                patience: 100,
                payment: 1.2
            },
            noble: {
                name: '贵族',
                icon: '👑',
                color: '#9370DB',
                patience: 80,
                payment: 2.0
            },
            adventurer: {
                name: '冒险者',
                icon: '🗡️',
                color: '#FF6347',
                patience: 60,
                payment: 1.5
            },
            scholar: {
                name: '学者',
                icon: '🧙‍♂️',
                color: '#87CEEB',
                patience: 120,
                payment: 1.8
            },
            commoner: {
                name: '平民',
                icon: '👨‍🌾',
                color: '#90EE90',
                patience: 150,
                payment: 1.0
            }
        };

        this.create();
        console.log('✅ CustomerUI: 顾客UI初始化完成');
    }

    create() {
        // 创建主容器
        this.container = this.scene.add.container(this.x, this.y);

        // 标题
        const title = this.scene.add.text(0, -100, '顾客队列', {
            fontSize: '24px',
            color: '#FFD700',
            fontFamily: 'ZCOOL KuaiLe',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.container.add(title);

        // 创建顾客槽位
        this.createCustomerSlots();
    }

    /**
     * 创建顾客槽位 - 这个SB函数创建顾客显示位置
     */
    createCustomerSlots() {
        this.customerSlots = [];

        for (let i = 0; i < this.maxCustomers; i++) {
            const slotX = -200 + (i * 100);

            // 槽位背景
            const slotBg = this.scene.add.rectangle(slotX, 0, 80, 120, 0x2D1B69, 0.5);
            slotBg.setStrokeStyle(2, 0xFFD700);

            // 顾客头像占位符
            const avatar = this.scene.add.text(slotX, -30, '?', {
                fontSize: '40px',
                fontFamily: 'Noto Sans SC'
            }).setOrigin(0.5);

            // 顾客名字
            const nameText = this.scene.add.text(slotX, 10, '空位', {
                fontSize: '14px',
                color: '#FFFFFF',
                fontFamily: 'Noto Sans SC'
            }).setOrigin(0.5);

            // 耐心条背景
            const patienceBg = this.scene.add.rectangle(slotX, 35, 60, 8, 0x333333, 0.8);

            // 耐心条
            const patienceBar = this.scene.add.rectangle(slotX, 35, 60, 8, 0x00FF00, 1);

            // 需求图标
            const needIcon = this.scene.add.text(slotX, 50, '?', {
                fontSize: '20px',
                fontFamily: 'Noto Sans SC'
            }).setOrigin(0.5);

            // 等待时间
            const waitTime = this.scene.add.text(slotX, 70, '', {
                fontSize: '12px',
                color: '#FFD700',
                fontFamily: 'Noto Sans SC'
            }).setOrigin(0.5);

            const slot = {
                background: slotBg,
                avatar: avatar,
                name: nameText,
                patienceBg: patienceBg,
                patienceBar: patienceBar,
                needIcon: needIcon,
                waitTime: waitTime,
                customer: null,
                patience: 100,
                maxPatience: 100
            };

            this.customerSlots.push(slot);
            this.container.add([
                slotBg, avatar, nameText, patienceBg, patienceBar, needIcon, waitTime
            ]);
        }
    }

    /**
     * 添加顾客 - 这个憨批函数处理新顾客到来
     */
    addCustomer(customerData) {
        // 找到空槽位
        const emptySlot = this.customerSlots.find(slot => !slot.customer);
        if (!emptySlot) {
            console.log('⚠️ CustomerUI: 没有空槽位了！');
            return false;
        }

        const customerType = this.customerTypes[customerData.type] || this.customerTypes.commoner;

        // 填充顾客数据
        emptySlot.customer = customerData;
        emptySlot.patience = customerData.patience || customerType.patience;
        emptySlot.maxPatience = emptySlot.patience;

        // 更新显示
        emptySlot.avatar.setText(customerType.icon);
        emptySlot.name.setText(customerType.name);
        emptySlot.name.setColor(customerType.color);

        // 设置需求
        if (customerData.needs) {
            const needEmoji = this.getNeedEmoji(customerData.needs[0]);
            emptySlot.needIcon.setText(needEmoji);
        }

        // 更新耐心条
        this.updatePatienceBar(emptySlot);

        // 开始耐心倒计时
        this.startPatienceTimer(emptySlot);

        console.log(`✅ CustomerUI: 添加了${customerType.name}顾客`);
        return true;
    }

    /**
     * 获取需求表情符号
     */
    getNeedEmoji(need) {
        const needEmojis = {
            'healing': '💚',
            'mana': '💙',
            'strength': '💪',
            'speed': '⚡',
            'luck': '🍀',
            'wisdom': '🧠',
            'love': '💕',
            'sleep': '😴'
        };
        return needEmojis[need] || '❓';
    }

    /**
     * 更新耐心条 - 这个SB函数处理耐心值显示
     */
    updatePatienceBar(slot) {
        const progress = slot.patience / slot.maxPatience;
        slot.patienceBar.setScale(progress, 1);

        // 根据耐心值改变颜色
        if (progress > 0.6) {
            slot.patienceBar.setFillStyle(0x00FF00); // 绿色
        } else if (progress > 0.3) {
            slot.patienceBar.setFillStyle(0xFFA500); // 橙色
        } else {
            slot.patienceBar.setFillStyle(0xFF0000); // 红色
        }
    }

    /**
     * 开始耐心计时器
     */
    startPatienceTimer(slot) {
        if (slot.patienceTimer) {
            slot.patienceTimer.destroy();
        }

        slot.patienceTimer = this.scene.time.addEvent({
            delay: 1000, // 每秒减少
            callback: () => {
                if (slot.customer && slot.patience > 0) {
                    slot.patience -= 5; // 每秒减少5点耐心
                    this.updatePatienceBar(slot);

                    // 更新等待时间显示
                    const waitSeconds = Math.floor((slot.maxPatience - slot.patience) / 5);
                    slot.waitTime.setText(`${waitSeconds}s`);

                    // 检查耐心是否耗尽
                    if (slot.patience <= 0) {
                        this.customerLeave(slot, 'impatient');
                    }
                }
            },
            repeat: -1
        });
    }

    /**
     * 顾客离开 - 这个憨批函数处理顾客离开逻辑
     */
    customerLeave(slot, reason = 'served') {
        if (!slot.customer) return;

        const customer = slot.customer;
        const customerType = this.customerTypes[customer.type] || this.customerTypes.commoner;

        // 显示离开效果
        let message = '';
        let color = '#FFFFFF';

        switch (reason) {
            case 'served':
                message = `+${Math.floor(customerType.payment * 100)}💰`;
                color = '#00FF00';
                break;
            case 'impatient':
                message = '❌失去耐心';
                color = '#FF0000';
                break;
            case 'angry':
                message = '😡生气离开';
                color = '#FF4500';
                break;
        }

        // 显示离开消息
        const leaveText = this.scene.add.text(slot.background.x, slot.background.y - 50, message, {
            fontSize: '18px',
            color: color,
            fontFamily: 'ZCOOL KuaiLe',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // 飞升动画
        this.scene.tweens.add({
            targets: leaveText,
            y: leaveText.y - 80,
            alpha: 0,
            scale: 1.2,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => leaveText.destroy()
        });

        // 清理槽位
        this.clearSlot(slot);

        console.log(`👋 CustomerUI: ${customerType.name}顾客离开（${reason}）`);
    }

    /**
     * 清理槽位
     */
    clearSlot(slot) {
        if (slot.patienceTimer) {
            slot.patienceTimer.destroy();
        }

        slot.customer = null;
        slot.patience = 100;
        slot.maxPatience = 100;

        // 重置显示
        slot.avatar.setText('?');
        slot.name.setText('空位');
        slot.name.setColor('#FFFFFF');
        slot.patienceBar.setScale(1, 1);
        slot.patienceBar.setFillStyle(0x00FF00);
        slot.needIcon.setText('?');
        slot.waitTime.setText('');
    }

    /**
     * 服务顾客 - 当玩家完成魔药制作时调用
     */
    serveCustomer(slotIndex, potionType) {
        const slot = this.customerSlots[slotIndex];
        if (!slot.customer) return false;

        const customer = slot.customer;
        const customerType = this.customerTypes[customer.type] || this.customerTypes.commoner;

        // 检查是否满足需求
        const needsMet = this.checkNeeds(customer.needs, potionType);

        if (needsMet) {
            this.customerLeave(slot, 'served');
            return {
                success: true,
                payment: Math.floor(customerType.payment * 100),
                reputation: 5
            };
        } else {
            // 需求不匹配，顾客生气
            this.customerLeave(slot, 'angry');
            return {
                success: false,
                payment: 0,
                reputation: -2
            };
        }
    }

    /**
     * 检查需求匹配
     */
    checkNeeds(customerNeeds, potionType) {
        if (!customerNeeds || customerNeeds.length === 0) return true;

        // 简单的需求匹配逻辑
        return customerNeeds.includes(potionType) || Math.random() > 0.3;
    }

    /**
     * 获取可服务的顾客列表
     */
    getServableCustomers() {
        return this.customerSlots
            .filter(slot => slot.customer && slot.patience > 0)
            .map((slot, index) => ({
                index: index,
                customer: slot.customer,
                patience: slot.patience,
                maxPatience: slot.maxPatience
            }));
    }

    /**
     * 更新所有顾客
     */
    update() {
        // 这里可以添加每帧更新的逻辑
        // 比如检查是否需要添加新顾客等
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.customerSlots.forEach(slot => {
            if (slot.patienceTimer) {
                slot.patienceTimer.destroy();
            }
        });

        if (this.container) {
            this.container.destroy();
        }
    }
}