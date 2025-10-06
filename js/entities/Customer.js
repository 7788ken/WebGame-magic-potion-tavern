/**
 * 客人实体类
 * 管理单个客人的状态和行为
 */

class Customer {
    constructor(customerData) {
        this.id = customerData.id;
        this.type = customerData.type;
        this.name = customerData.name;
        this.description = customerData.description;
        this.icon = customerData.icon;

        // 基础属性
        this.maxPatience = customerData.patience;
        this.currentPatience = customerData.currentPatience;
        this.budget = { ...customerData.budget };
        this.preferences = [...customerData.preferences];
        this.behavior = { ...customerData.behavior };
        this.dialogues = { ...customerData.dialogues };

        // 状态
        this.status = customerData.status || 'waiting';
        this.arrivalTime = customerData.arrivalTime;
        this.satisfaction = 50;
        this.order = null;
        this.spending = 0;

        // 临时状态
        this.currentDialogue = null;
        this.mood = 'neutral'; // happy, angry, disappointed, impressed
        this.waitStartTime = Date.now();

        // 行为记录
        this.interactions = [];
        this.complaints = 0;
        this.compliments = 0;
    }

    /**
     * 更新客人状态
     */
    update(deltaTime) {
        // 更新等待时间
        if (this.status === 'waiting') {
            this.updateWaiting(deltaTime);
        }

        // 更新耐心值
        this.updatePatience(deltaTime);

        // 检查状态变化
        this.checkStatusChanges();

        // 随机行为
        this.randomBehavior();
    }

    /**
     * 更新等待状态
     */
    updateWaiting(deltaTime) {
        const waitTime = (Date.now() - this.waitStartTime) / 1000;

        // 耐心衰减
        const patienceDecay = this.behavior.patienceDecay * deltaTime;
        this.currentPatience = Math.max(0, this.currentPatience - patienceDecay);

        // 检查是否失去耐心
        if (this.currentPatience <= 0) {
            this.status = 'leaving_angry';
            this.mood = 'angry';
            this.currentDialogue = this.getRandomDialogue('angry');
            return;
        }

        // 随机抱怨
        if (waitTime > 30 && Math.random() < this.behavior.complaintChance * deltaTime) {
            this.complaints++;
            this.currentDialogue = this.getRandomDialogue('waiting');
        }
    }

    /**
     * 更新耐心值
     */
    updatePatience(deltaTime) {
        // 根据当前状态调整耐心
        switch (this.status) {
            case 'being_served':
                // 服务中耐心下降较慢
                this.currentPatience = Math.max(0, this.currentPatience - this.behavior.patienceDecay * deltaTime * 0.5);
                break;
            case 'happy':
                // 满意时耐心恢复
                this.currentPatience = Math.min(this.maxPatience, this.currentPatience + deltaTime * 2);
                break;
            case 'angry':
                // 愤怒时耐心快速下降
                this.currentPatience = Math.max(0, this.currentPatience - this.behavior.patienceDecay * deltaTime * 2);
                break;
        }
    }

    /**
     * 检查状态变化
     */
    checkStatusChanges() {
        // 根据满意度调整心情
        if (this.satisfaction > 80) {
            this.mood = 'happy';
        } else if (this.satisfaction < 30) {
            this.mood = 'angry';
        } else if (this.satisfaction < 50) {
            this.mood = 'disappointed';
        } else {
            this.mood = 'neutral';
        }
    }

    /**
     * 随机行为
     */
    randomBehavior() {
        // 根据心情和状态产生随机行为
        if (Math.random() < 0.01) { // 1%概率
            this.performRandomAction();
        }
    }

    /**
     * 执行随机动作
     */
    performRandomAction() {
        const actions = [];

        switch (this.mood) {
            case 'happy':
                actions.push(() => this.showHappiness());
                actions.push(() => this.giveCompliment());
                break;
            case 'angry':
                actions.push(() => this.showAnger());
                actions.push(() => this.complain());
                break;
            case 'disappointed':
                actions.push(() => this.showDisappointment());
                break;
            default:
                actions.push(() => this.lookAround());
                actions.push(() => this.checkTime());
                break;
        }

        if (actions.length > 0) {
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            randomAction();
        }
    }

    /**
     * 处理客人订单
     */
    takeOrder(potion, price) {
        this.order = {
            potion: potion,
            requestedPrice: price,
            timestamp: Date.now()
        };

        this.status = 'ordering';
        this.currentDialogue = this.getRandomDialogue('ordering');

        // 检查价格是否合理
        if (price > this.budget.max) {
            this.satisfaction -= 20;
            this.mood = 'disappointed';
        } else if (price < this.budget.min) {
            this.satisfaction += 10;
        }

        this.addInteraction('order_placed', { potion: potion.id, price: price });
    }

    /**
     * 完成订单
     */
    completeOrder(serviceTime, finalPrice) {
        if (!this.order) return;

        const potion = this.order.potion;
        const originalPrice = this.order.requestedPrice;

        // 计算满意度
        this.satisfaction = CustomerBehavior.calculateSatisfaction(
            this,
            potion,
            serviceTime,
            finalPrice
        );

        // 处理购买决策
        const decision = CustomerBehavior.processPurchase(this, potion, finalPrice);

        this.spending = finalPrice;
        this.status = 'served';

        // 记录交互
        this.addInteraction('order_completed', {
            satisfaction: this.satisfaction,
            finalPrice: finalPrice,
            serviceTime: serviceTime,
            decision: decision
        });

        // 触发相应行为
        this.handlePurchaseDecision(decision);

        return {
            success: decision.action === 'buy',
            satisfaction: this.satisfaction,
            spending: this.spending,
            decision: decision
        };
    }

    /**
     * 处理购买决策
     */
    handlePurchaseDecision(decision) {
        switch (decision.action) {
            case 'buy':
                this.status = 'satisfied';
                this.mood = 'happy';
                this.currentDialogue = this.getRandomDialogue('satisfied');
                break;

            case 'haggle':
                this.status = 'haggling';
                this.currentDialogue = `这个价格有点贵，${decision.offeredPrice}金币怎么样？`;
                break;

            case 'refuse':
                this.status = 'refusing';
                this.mood = 'disappointed';
                this.currentDialogue = this.getRandomDialogue('angry');
                break;
        }
    }

    /**
     * 处理讨价还价
     */
    handleHaggling(accepted, finalPrice) {
        if (accepted) {
            this.spending = finalPrice;
            this.status = 'satisfied';
            this.mood = 'happy';
            this.satisfaction += 10; // 成功讨价还价增加满意度
            this.currentDialogue = '成交！你是个不错的商人。';
        } else {
            this.status = 'refusing';
            this.mood = 'disappointed';
            this.satisfaction -= 15;
            this.currentDialogue = '那算了，我去别家看看。';
        }

        this.addInteraction('haggling_result', { accepted: accepted, finalPrice: finalPrice });
    }

    /**
     * 客人离开
     */
    leave(reason = 'normal') {
        this.status = 'leaving';

        // 处理离开时的行为
        const departure = CustomerBehavior.processDeparture(this, this.satisfaction);

        this.addInteraction('departure', {
            reason: reason,
            satisfaction: this.satisfaction,
            spending: this.spending,
            departure: departure
        });

        // 触发事件
        this.triggerCustomerEvent('departed', {
            customer: this,
            reason: reason,
            satisfaction: this.satisfaction,
            spending: this.spending,
            departure: departure
        });

        return departure;
    }

    /**
     * 获取随机对话
     */
    getRandomDialogue(context) {
        const dialogues = this.dialogues[context];
        if (dialogues && dialogues.length > 0) {
            return dialogues[Math.floor(Math.random() * dialogues.length)];
        }
        return '';
    }

    /**
     * 获取客人信息
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            status: this.status,
            mood: this.mood,
            satisfaction: Math.floor(this.satisfaction),
            patience: Math.floor(this.currentPatience),
            maxPatience: this.maxPatience,
            budget: this.budget,
            preferences: this.preferences,
            currentDialogue: this.currentDialogue,
            order: this.order,
            spending: this.spending,
            waitTime: Math.floor((Date.now() - this.waitStartTime) / 1000)
        };
    }

    /**
     * 添加交互记录
     */
    addInteraction(type, data) {
        this.interactions.push({
            type: type,
            data: data,
            timestamp: Date.now(),
            day: gameState.time.day,
            hour: gameState.time.hour
        });
    }

    /**
     * 触发客人相关事件
     */
    triggerCustomerEvent(eventType, data) {
        eventManager.triggerEvent('customerEvent', {
            type: eventType,
            customer: this,
            data: data
        });
    }

    // 情绪表现方法
    showHappiness() {
        this.currentDialogue = '这里的服务真不错！';
        this.addInteraction('emotion', { emotion: 'happiness' });
    }

    showAnger() {
        this.currentDialogue = '这服务太差了！';
        this.addInteraction('emotion', { emotion: 'anger' });
    }

    showDisappointment() {
        this.currentDialogue = '和我想象的不太一样...';
        this.addInteraction('emotion', { emotion: 'disappointment' });
    }

    giveCompliment() {
        this.compliments++;
        this.currentDialogue = '你们这里真不错！';
        this.addInteraction('compliment', { message: 'positive_feedback' });

        // 增加声誉
        gameState.addReputation(2);
    }

    complain() {
        this.complaints++;
        this.currentDialogue = '我要向商会投诉！';
        this.addInteraction('complaint', { message: 'negative_feedback' });

        // 减少声誉
        gameState.addReputation(-3);
    }

    lookAround() {
        this.currentDialogue = '这地方装修得还不错。';
        this.addInteraction('observation', { action: 'looking_around' });
    }

    checkTime() {
        this.currentDialogue = '还要等多久啊？';
        this.addInteraction('time_check', { patience: this.currentPatience });
    }
}

// 客人管理器
class CustomerManager {
    constructor() {
        this.customers = [];
        this.waitingQueue = [];
        this.servedCustomers = [];
        this.customerGenerator = new CustomerGenerator();

        // 统计
        this.stats = {
            totalCustomers: 0,
            satisfiedCustomers: 0,
            totalRevenue: 0,
            averageSatisfaction: 0,
            complaints: 0,
            compliments: 0
        };

        // 生成定时器
        this.spawnTimer = null;
        this.updateTimer = null;
    }

    /**
     * 初始化客人管理器
     */
    initialize() {
        this.startCustomerGeneration();
        this.startCustomerUpdates();
    }

    /**
     * 开始生成客人
     */
    startCustomerGeneration() {
        const spawnInterval = GameConfig.tavern.customerSpawnRate;

        this.spawnTimer = setInterval(() => {
            this.spawnCustomer();
        }, spawnInterval);
    }

    /**
     * 开始客人状态更新
     */
    startCustomerUpdates() {
        this.updateTimer = setInterval(() => {
            this.updateCustomers();
        }, 1000); // 每秒更新一次
    }

    /**
     * 生成新客人
     */
    spawnCustomer() {
        // 检查是否可以生成客人
        if (!this.canSpawnCustomer()) {
            return;
        }

        const timeOfDay = this.getTimeOfDay();
        const customer = this.customerGenerator.generateCustomer(
            timeOfDay,
            gameState.player.reputation
        );

        if (customer) {
            this.addCustomer(customer);
        }
    }

    /**
     * 检查是否可以生成客人
     */
    canSpawnCustomer() {
        // 检查营业时间
        const currentHour = gameState.time.hour;
        if (currentHour < GameConfig.tavern.operatingHours.start ||
            currentHour >= GameConfig.tavern.operatingHours.end) {
            return false;
        }

        // 检查酒馆容量
        if (this.customers.length >= gameState.tavern.capacity) {
            return false;
        }

        // 检查事件影响
        if (gameState.events.active.some(event =>
event.effects.customerReduction)) {
            const reduction = gameState.events.active.find(e =>
event.effects.customerReduction).effects.customerReduction;
            if (Math.random() < reduction) {
                return false;
            }
        }

        return true;
    }

    /**
     * 获取当前时间段
     */
    getTimeOfDay() {
        const hour = gameState.time.hour;
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 24) return 'evening';
        return 'night';
    }

    /**
     * 添加客人
     */
    addCustomer(customer) {
        this.customers.push(customer);
        this.waitingQueue.push(customer);
        this.stats.totalCustomers++;

        // 触发事件
        eventManager.triggerEvent('customerArrived', { customer: customer });

        console.log(`新客人到达: ${customer.name}`);
    }

    /**
     * 更新所有客人
     */
    updateCustomers() {
        const deltaTime = 1; // 1秒

        this.customers.forEach(customer => {
            customer.update(deltaTime);

            // 检查客人状态
            this.checkCustomerStatus(customer);
        });

        // 清理离开的客人
        this.cleanupCustomers();

        // 更新统计
        this.updateStats();
    }

    /**
     * 检查客人状态
     */
    checkCustomerStatus(customer) {
        switch (customer.status) {
            case 'leaving_angry':
            case 'leaving_normal':
                this.processCustomerDeparture(customer);
                break;
            case 'satisfied':
                this.processSatisfiedCustomer(customer);
                break;
        }
    }

    /**
     * 处理客人离开
     */
    processCustomerDeparture(customer) {
        const departure = customer.leave();

        // 更新统计
        if (departure.action === 'tip') {
            gameState.addGold(departure.amount);
            this.stats.compliments++;
        }

        if (departure.reputationPenalty) {
            gameState.addReputation(-departure.reputationPenalty);
            this.stats.complaints++;
        }

        // 从队列中移除
        this.removeCustomer(customer);

        console.log(`客人离开: ${customer.name} - ${departure.message}`);
    }

    /**
     * 处理满意客人
     */
    processSatisfiedCustomer(customer) {
        this.stats.satisfiedCustomers++;
        this.stats.totalRevenue += customer.spending;

        // 增加声誉
        const reputationGain = Math.floor(customer.satisfaction / 10);
        gameState.addReputation(reputationGain);

        // 添加到服务记录
        this.servedCustomers.push({
            customer: customer,
            satisfaction: customer.satisfaction,
            spending: customer.spending,
            timestamp: Date.now()
        });

        // 从队列中移除
        this.removeCustomer(customer);

        console.log(`客人满意离开: ${customer.name} - 消费: ${customer.spending}金币`);
    }

    /**
     * 移除客人
     */
    removeCustomer(customer) {
        // 从客人列表移除
        this.customers = this.customers.filter(c => c.id !== customer.id);

        // 从等待队列移除
        this.waitingQueue = this.waitingQueue.filter(c => c.id !== customer.id);
    }

    /**
     * 清理离开的客人
     */
    cleanupCustomers() {
        this.customers = this.customers.filter(customer => {
            return customer.status !== 'left';
        });
    }

    /**
     * 更新统计
     */
    updateStats() {
        if (this.servedCustomers.length > 0) {
            const totalSatisfaction = this.servedCustomers.reduce((sum, c) =>
                sum + c.satisfaction, 0
            );
            this.stats.averageSatisfaction = totalSatisfaction / this.servedCustomers.length;
        }

        // 保持最近的服务记录
        if (this.servedCustomers.length > 100) {
            this.servedCustomers = this.servedCustomers.slice(-50);
        }
    }

    /**
     * 获取下一个等待的客人
     */
    getNextCustomer() {
        return this.waitingQueue.find(customer =>
customer.status === 'waiting');
    }

    /**
     * 获取客人信息
     */
    getCustomersInfo() {
        return this.customers.map(customer =>
customer.getInfo());
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            ...this.stats,
            currentCustomers: this.customers.length,
            waitingQueue: this.waitingQueue.length,
            servedToday: this.servedCustomers.filter(c => {
                const customerDay = new Date(c.timestamp).getDate();
                const currentDay = gameState.time.day;
                return customerDay === currentDay;
            }).length
        };
    }

    /**
     * 停止管理器
     */
    stop() {
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
            this.spawnTimer = null;
        }

        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Customer, CustomerManager };
}