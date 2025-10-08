/**
 * 魔药酒馆事件管理器
 * 管理游戏中的各种随机事件和特殊事件
 */

class EventManager {
    constructor() {
        this.activeEvents = [];
        this.eventHistory = [];
        this.eventQueue = [];
        this.eventListeners = {};

        // 初始化事件系统
        this.initializeEvents();
    }

    initializeEvents() {
        // 注册事件监听器
        gameState.on('timeAdvanced', (data) => {
            this.checkTimedEvents(data);
        });

        gameState.on('newDay', (data) => {
            this.generateDailyEvents(data);
        });

        gameState.on('customerServed', (data) => {
            this.checkCustomerRelatedEvents(data);
        });

        gameState.on('battleEnded', (data) => {
            this.checkBattleRelatedEvents(data);
        });

        gameState.on('potionMade', (data) => {
            this.checkCraftingRelatedEvents(data);
        });
    }

    /**
     * 生成日常事件
     */
    generateDailyEvents(data) {
        const day = data.day;
        const newEvents = [];

        // 基础市场事件
        this.generateMarketEvents(newEvents);

        // 特殊客人事件
        this.generateSpecialCustomerEvents(newEvents);

        // 随机灾难事件
        this.generateDisasterEvents(newEvents);

        // 周常事件
        if (day % 7 === 0) {
            this.generateWeeklyEvents(newEvents);
        }

        // 月常事件
        if (day % 30 === 0) {
            this.generateMonthlyEvents(newEvents);
        }

        // 添加到事件队列
        newEvents.forEach(event => {
            this.addEventToQueue(event);
        });

        console.log(`生成了 ${newEvents.length} 个新事件`);
    }

    /**
     * 生成市场事件
     */
    generateMarketEvents(events) {
        const marketEvents = GameConfig.randomEvents.market;

        // 材料过剩
        if (Math.random() < marketEvents.surplus.chance) {
            events.push({
                id: this.generateEventId(),
                type: 'market_surplus',
                category: 'market',
                title: '材料市场过剩',
                description: '最近冒险者大量返回，材料市场供应充足，价格大幅下降！',
                duration: marketEvents.surplus.duration,
                effects: {
                    materialPriceMultiplier: marketEvents.surplus.priceMultiplier
                },
                startTime: Date.now(),
                endTime: Date.now() + (marketEvents.surplus.duration * 24 * 60 * 60 * 1000)
            });
        }

        // 材料短缺
        if (Math.random() < marketEvents.shortage.chance) {
            events.push({
                id: this.generateEventId(),
                type: 'market_shortage',
                category: 'market',
                title: '材料供应短缺',
                description: '通往材料产地的道路被怪物封锁，材料价格飙升！',
                duration: marketEvents.shortage.duration,
                effects: {
                    materialPriceMultiplier: marketEvents.shortage.priceMultiplier
                },
                startTime: Date.now(),
                endTime: Date.now() + (marketEvents.shortage.duration * 24 * 60 * 60 * 1000)
            });
        }

        // 节日庆典
        if (Math.random() < marketEvents.festival.chance) {
            events.push({
                id: this.generateEventId(),
                type: 'festival',
                category: 'market',
                title: '魔法节庆典',
                description: '王国举办魔法节，客人络绎不绝，是赚钱的好时机！',
                duration: marketEvents.festival.duration,
                effects: {
                    customerSpawnRate: marketEvents.festival.customerMultiplier,
                    reputationMultiplier: 1.2
                },
                startTime: Date.now(),
                endTime: Date.now() + (marketEvents.festival.duration * 24 * 60 * 60 * 1000)
            });
        }
    }

    /**
     * 生成特殊客人事件
     */
    generateSpecialCustomerEvents(events) {
        const specialEvents = GameConfig.randomEvents.special;

        // 大订单
        if (Math.random() < specialEvents.bigOrder.chance) {
            const orderSize = Math.floor(Math.random() * 50) + 20;
            const potionType = this.getRandomPotionType();

            events.push({
                id: this.generateEventId(),
                type: 'big_order',
                category: 'customer',
                title: '神秘大订单',
                description: `神秘商人需要${orderSize}瓶${potionType}药水，愿意支付高价！`,
                data: {
                    potionType: potionType,
                    quantity: orderSize,
                    reward: specialEvents.bigOrder.reward,
                    timeLimit: specialEvents.bigOrder.timeLimit,
                    completed: false,
                    delivered: 0
                },
                startTime: Date.now(),
                endTime: Date.now() + specialEvents.bigOrder.timeLimit * 1000
            });
        }

        // VIP访客
        if (Math.random() < specialEvents.vipVisit.chance) {
            events.push({
                id: this.generateEventId(),
                type: 'vip_visit',
                category: 'customer',
                title: 'VIP客人到访',
                description: '王国贵族即将到访，请准备好最好的魔药！',
                data: {
                    customerType: 'noble',
                    specialRequirements: ['rare', 'high_quality'],
                    reputationBonus: specialEvents.vipVisit.reputationBonus
                },
                startTime: Date.now(),
                endTime: Date.now() + (2 * 60 * 60 * 1000) // 2小时后到访
            });
        }

        // 竞争对手挑战
        if (Math.random() < specialEvents.competition.chance) {
            events.push({
                id: this.generateEventId(),
                type: 'competitor_challenge',
                category: 'battle',
                title: '竞争对手挑战',
                description: '隔壁酒馆老板前来挑战，对战胜利可获得稀有材料！',
                data: {
                    opponent: this.generateCompetitor(),
                    reward: specialEvents.competition.reward,
                    completed: false
                },
                startTime: Date.now(),
                endTime: Date.now() + (24 * 60 * 60 * 1000) // 24小时内接受挑战
            });
        }
    }

    /**
     * 生成灾难事件
     */
    generateDisasterEvents(events) {
        const disasterEvents = GameConfig.randomEvents.disaster;

        // 瘟疫爆发
        if (Math.random() < disasterEvents.plague.chance) {
            events.push({
                id: this.generateEventId(),
                type: 'plague',
                category: 'disaster',
                title: '瘟疫爆发',
                description: '城中爆发瘟疫，大量居民需要治疗药水！',
                duration: disasterEvents.plague.duration,
                effects: {
                    healingPotionDemand: disasterEvents.plague.healingDemand,
                    healingPotionPriceMultiplier: 2.0
                },
                startTime: Date.now(),
                endTime: Date.now() + (disasterEvents.plague.duration * 24 * 60 * 60 * 1000)
            });
        }

        // 怪物攻城
        if (Math.random() < disasterEvents.monsterAttack.chance) {
            events.push({
                id: this.generateEventId(),
                type: 'monster_attack',
                category: 'disaster',
                title: '怪物攻城',
                description: '怪物大军正在逼近，冒险者们需要战斗药水！',
                duration: disasterEvents.monsterAttack.duration,
                effects: {
                    battlePotionDemand: disasterEvents.monsterAttack.battlePotionDemand,
                    battlePotionPriceMultiplier: 1.8
                },
                startTime: Date.now(),
                endTime: Date.now() + (disasterEvents.monsterAttack.duration * 24 * 60 * 60 * 1000)
            });
        }
    }

    /**
     * 生成周常事件
     */
    generateWeeklyEvents(events) {
        // 魔法师公会聚会
        events.push({
            id: this.generateEventId(),
            type: 'guild_gathering',
            category: 'weekly',
            title: '魔法师公会聚会',
            description: '本周的魔法师公会聚会，可以与其他药师交流心得！',
            data: {
                bonus: {
                    experience: 2.0,
                    reputation: 1.5
                }
            },
            startTime: Date.now(),
            endTime: Date.now() + (24 * 60 * 60 * 1000) // 持续1天
        });
    }

    /**
     * 生成月常事件
     */
    generateMonthlyEvents(events) {
        // 魔法师大赛
        events.push({
            id: this.generateEventId(),
            type: 'magic_competition',
            category: 'monthly',
            title: '魔法师大赛',
            description: '本月魔法师大赛开始，获胜者将获得传奇配方！',
            data: {
                rounds: 5,
                currentRound: 0,
                reward: 'legendary_recipe',
                participants: 16
            },
            startTime: Date.now(),
            endTime: Date.now() + (7 * 24 * 60 * 60 * 1000) // 持续1周
        });
    }

    /**
     * 添加事件到队列
     */
    addEventToQueue(event) {
        this.eventQueue.push(event);
        this.triggerEvent('eventQueued', event);
    }

    /**
     * 激活事件
     */
    activateEvent(eventId) {
        const event = this.eventQueue.find(e => e.id === eventId);
        if (event) {
            this.activeEvents.push(event);
            this.eventQueue = this.eventQueue.filter(e => e.id !== eventId);
            this.triggerEvent('eventActivated', event);
            console.log(`事件已激活: ${event.title}`);
            return true;
        }
        return false;
    }

    /**
     * 完成事件
     */
    completeEvent(eventId, success = true) {
        const event = this.activeEvents.find(e => e.id === eventId);
        if (event) {
            event.completed = true;
            event.success = success;
            event.completedTime = Date.now();

            this.activeEvents = this.activeEvents.filter(e => e.id !== eventId);
            this.eventHistory.push(event);

            // 给予奖励
            if (success) {
                this.giveEventReward(event);
            }

            this.triggerEvent('eventCompleted', event);
            console.log(`事件已完成: ${event.title} (${success ? '成功' : '失败'})`);
            return true;
        }
        return false;
    }

    recordEventResult(eventId, success, choice) {
        const choiceSnapshot = choice ? {
            id: choice.id || null,
            text: choice.text || '',
            rewards: choice.rewards || null,
            penalties: choice.penalties || null
        } : null;

        const activeEvent = this.activeEvents.find(event => event.id === eventId);
        if (activeEvent) {
            activeEvent.resultDetails = {
                success,
                choice: choiceSnapshot,
                timestamp: Date.now()
            };

            this.completeEvent(eventId, success);
            return;
        }

        const historyEvent = this.eventHistory.find(event => event.id === eventId);
        if (historyEvent) {
            historyEvent.resultDetails = {
                success,
                choice: choiceSnapshot,
                timestamp: Date.now()
            };
            historyEvent.success = success;
            historyEvent.completed = true;
            historyEvent.completedTime = historyEvent.completedTime || Date.now();
            return;
        }

        this.eventHistory.push({
            id: eventId,
            success,
            completed: true,
            completedTime: Date.now(),
            resultDetails: {
                success,
                choice: choiceSnapshot,
                timestamp: Date.now()
            }
        });
    }

    /**
     * 给予事件奖励
     */
    giveEventReward(event) {
        switch (event.type) {
            case 'big_order':
                gameState.addGold(event.data.reward);
                gameState.addReputation(20);
                break;

            case 'vip_visit':
                gameState.addReputation(event.data.reputationBonus);
                break;

            case 'competitor_challenge':
                gameState.addGold(event.data.reward);
                gameState.addReputation(30);
                // 给予稀有材料
                gameState.addMaterial('dragon_scale', 1);
                break;

            case 'guild_gathering':
                gameState.addExperience(500);
                gameState.addReputation(50);
                break;

            case 'magic_competition':
                // 给予传奇配方
                gameState.discoverRecipe('eternal_life_potion');
                gameState.addReputation(100);
                break;
        }
    }

    /**
     * 检查时间相关事件
     */
    checkTimedEvents(data) {
        const now = Date.now();

        // 检查活跃事件是否过期
        this.activeEvents.forEach(event => {
            if (event.endTime && now >= event.endTime) {
                this.completeEvent(event.id, false); // 超时失败
            }
        });

        // 检查队列事件是否可以激活
        this.eventQueue.forEach(event => {
            if (now >= event.startTime) {
                this.activateEvent(event.id);
            }
        });
    }

    /**
     * 检查客人相关事件
     */
    checkCustomerRelatedEvents(data) {
        // VIP客人到访事件
        const vipEvent = this.activeEvents.find(e => e.type === 'vip_visit');
        if (vipEvent && data.customerType === 'noble') {
            this.completeEvent(vipEvent.id, true);
        }

        // 大订单事件
        const bigOrderEvent = this.activeEvents.find(e => e.type === 'big_order');
        if (bigOrderEvent && data.potionType === bigOrderEvent.data.potionType) {
            bigOrderEvent.data.delivered += data.quantity;
            if (bigOrderEvent.data.delivered >= bigOrderEvent.data.quantity) {
                this.completeEvent(bigOrderEvent.id, true);
            }
        }
    }

    /**
     * 检查对战相关事件
     */
    checkBattleRelatedEvents(data) {
        // 竞争对手挑战事件
        const challengeEvent = this.activeEvents.find(e => e.type === 'competitor_challenge');
        if (challengeEvent && data.won) {
            this.completeEvent(challengeEvent.id, true);
        }
    }

    /**
     * 检查制作相关事件
     */
    checkCraftingRelatedEvents(data) {
        // 瘟疫事件 - 制作治疗药水有额外奖励
        const plagueEvent = this.activeEvents.find(e => e.type === 'plague');
        if (plagueEvent && data.potionType === 'healing') {
            gameState.addGold(data.quantity * 20); // 额外奖励
            gameState.addReputation(data.quantity * 2);
        }
    }

    /**
     * 获取活跃事件
     */
    getActiveEvents() {
        return this.activeEvents.filter(event => !event.completed);
    }

    /**
     * 获取可用事件
     */
    getAvailableEvents() {
        return this.eventQueue.filter(event => event.startTime <= Date.now());
    }

    /**
     * 获取事件历史
     */
    getEventHistory(limit = 50) {
        return this.eventHistory.slice(-limit);
    }

    /**
     * 工具方法
     */
    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateCompetitor() {
        const competitors = [
            { name: '老约翰', rating: 300, specialty: 'attack' },
            { name: '玛丽安', rating: 450, specialty: 'defense' },
            { name: '暗影药剂师', rating: 600, specialty: 'control' },
            { name: '黄金右手', rating: 750, specialty: 'utility' }
        ];
        return competitors[Math.floor(Math.random() * competitors.length)];
    }

    getRandomPotionType() {
        const types = ['healing', 'strength', 'speed', 'intelligence', 'luck'];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * 事件系统
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    off(event, callback) {
        if (this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(callback);
            if (index > -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }
    }

    triggerEvent(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event manager event listener for ${event}:`, error);
                }
            });
        }
    }
}

// 创建全局事件管理器实例
const eventManager = new EventManager();
