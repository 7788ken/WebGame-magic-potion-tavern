/**
 * 魔药酒馆游戏状态管理器
 * 管理所有游戏数据和状态
 */

class GameState {
    constructor() {
        this.initializeState();
    }

    initializeState() {
        // 玩家基础数据
        this.player = {
            level: 1,
            experience: 0,
            gold: GameConfig.economy.startingGold,
            reputation: GameConfig.reputation.startingReputation,
            battleRating: 0,
            winRate: 0,
            totalBattles: 0,
            battlesWon: 0
        };

        // 酒馆数据
        this.tavern = {
            level: 1,
            name: "魔药小馆",
            capacity: GameConfig.tavern.baseCapacity,
            reputation: 50,
            dailyIncome: 0,
            operating: true,
            upgrades: {
                seats: 0,
                equipment: 0,
                decoration: 0
            }
        };

        // 库存系统
        this.inventory = {
            materials: {
                moonGrass: 10,
                fireGrass: 5,
                dewDrop: 15,
                springWater: 20
            },
            potions: {
                healing: 3,
                strength: 1
            },
            cards: [] // 对战卡牌
        };

        // 员工系统
        this.staff = [
            {
                id: 1,
                name: "小精灵助手",
                type: "assistant",
                level: 1,
                skill: 1.0,
                salary: 50,
                efficiency: 1.0
            }
        ];

        // 配方系统
        this.recipes = {
            discovered: [
                'healing', // 治疗药水
                'strength' // 力量药水
            ],
            mastered: [],
            experimental: []
        };

        // 时间系统
        this.time = {
            day: 1,
            hour: 6,
            minute: 0,
            isPaused: false,
            gameSpeed: 1
        };

        // 客人系统
        this.customers = {
            served: 0,
            satisfied: 0,
            current: [],
            queue: []
        };

        // 对战系统
        this.battle = {
            rank: "新手药师",
            rating: 0,
            streak: 0,
            maxStreak: 0,
            dailyWins: 0,
            dailyLimit: 10
        };

        // 事件系统
        this.events = {
            active: [],
            completed: [],
            available: [],
            lastEventTime: 0, // 上次事件发生时间
            eventCooldown: 300 // 事件冷却时间（游戏时间）
        };

        // 统计系统
        this.statistics = {
            totalCustomers: 0,
            totalPotionsMade: 0,
            totalGoldEarned: 0,
            totalBattles: 0,
            playTime: 0,
            achievements: []
        };

        // 设置系统
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            notifications: true,
            autoSave: true,
            language: 'zh-CN'
        };
    }

    // 玩家相关方法
    addGold(amount) {
        this.player.gold += amount;
        this.statistics.totalGoldEarned += amount;
        this.triggerEvent('goldChanged', { amount: amount, total: this.player.gold });
    }

    spendGold(amount) {
        if (this.player.gold >= amount) {
            this.player.gold -= amount;
            this.triggerEvent('goldChanged', { amount: -amount, total: this.player.gold });
            return true;
        }
        return false;
    }

    addExperience(exp) {
        this.player.experience += exp;
        this.checkLevelUp();
        this.triggerEvent('experienceGained', { amount: exp, total: this.player.experience });
    }

    checkLevelUp() {
        const requiredExp = this.getRequiredExperience(this.player.level);
        if (this.player.experience >= requiredExp) {
            this.player.level++;
            this.player.experience -= requiredExp;
            this.triggerEvent('levelUp', { newLevel: this.player.level });
            return true;
        }
        return false;
    }

    getRequiredExperience(level) {
        return level * level * 100;
    }

    addReputation(amount) {
        this.player.reputation = Math.max(0, Math.min(1000, this.player.reputation + amount));
        this.triggerEvent('reputationChanged', { amount: amount, total: this.player.reputation });
    }

    // 材料相关方法
    addMaterial(material, amount) {
        if (!this.inventory.materials[material]) {
            this.inventory.materials[material] = 0;
        }
        this.inventory.materials[material] += amount;
        this.triggerEvent('materialAdded', { material: material, amount: amount });
    }

    consumeMaterial(material, amount) {
        if (this.inventory.materials[material] && this.inventory.materials[material] >= amount) {
            this.inventory.materials[material] -= amount;
            this.triggerEvent('materialConsumed', { material: material, amount: amount });
            return true;
        }
        return false;
    }

    getMaterialCount(material) {
        return this.inventory.materials[material] || 0;
    }

    // 魔药相关方法
    addPotion(potion, amount) {
        if (!this.inventory.potions[potion]) {
            this.inventory.potions[potion] = 0;
        }
        this.inventory.potions[potion] += amount;
        this.statistics.totalPotionsMade += amount;
        this.triggerEvent('potionAdded', { potion: potion, amount: amount });
    }

    consumePotion(potion, amount) {
        if (this.inventory.potions[potion] && this.inventory.potions[potion] >= amount) {
            this.inventory.potions[potion] -= amount;
            this.triggerEvent('potionConsumed', { potion: potion, amount: amount });
            return true;
        }
        return false;
    }

    discoverRecipe(recipe) {
        if (!this.recipes.discovered.includes(recipe)) {
            this.recipes.discovered.push(recipe);
            this.triggerEvent('recipeDiscovered', { recipe: recipe });
            return true;
        }
        return false;
    }

    masterRecipe(recipe) {
        if (this.recipes.discovered.includes(recipe) && !this.recipes.mastered.includes(recipe)) {
            this.recipes.mastered.push(recipe);
            this.triggerEvent('recipeMastered', { recipe: recipe });
            return true;
        }
        return false;
    }

    // 时间相关方法
    advanceTime(minutes) {
        this.time.minute += minutes;
        while (this.time.minute >= 60) {
            this.time.minute -= 60;
            this.time.hour++;
        }
        while (this.time.hour >= 24) {
            this.time.hour -= 24;
            this.time.day++;
            this.newDay();
        }
        this.triggerEvent('timeAdvanced', { day: this.time.day, hour: this.time.hour, minute: this.time.minute });
    }

    newDay() {
        this.dailyReset();
        this.generateDailyEvents();
        this.triggerEvent('newDay', { day: this.time.day });
    }

    dailyReset() {
        // 重置日常数据
        this.tavern.dailyIncome = 0;
        this.battle.dailyWins = 0;
        this.customers.served = 0;
        this.customers.satisfied = 0;

        // 支付员工工资
        this.payStaffSalaries();

        // 支付租金
        this.payRent();

        // 声誉衰减
        this.addReputation(-GameConfig.reputation.reputationDecay);
    }

    payStaffSalaries() {
        let totalSalary = 0;
        this.staff.forEach(staff => {
            totalSalary += staff.salary;
        });
        this.spendGold(totalSalary);
    }

    payRent() {
        this.spendGold(GameConfig.economy.rent);
    }

    // 对战相关方法
    recordBattleResult(won, opponentRating) {
        this.player.totalBattles++;
        if (won) {
            this.player.battlesWon++;
            this.battle.dailyWins++;
            this.battle.streak++;
            this.battle.maxStreak = Math.max(this.battle.maxStreak, this.battle.streak);
            this.addReputation(GameConfig.reputation.battleVictoryBonus);
        } else {
            this.battle.streak = 0;
        }

        this.player.winRate = this.player.battlesWon / this.player.totalBattles;
        this.updateBattleRating(won, opponentRating);

        this.triggerEvent('battleEnded', { won: won, opponentRating: opponentRating });
    }

    updateBattleRating(won, opponentRating) {
        const kFactor = 32;
        const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - this.battle.rating) / 400));
        const actualScore = won ? 1 : 0;
        this.battle.rating += kFactor * (actualScore - expectedScore);
        this.updateBattleRank();
    }

    updateBattleRank() {
        const rating = this.battle.rating;
        if (rating < 100) {
            this.battle.rank = "新手药师";
        } else if (rating < 500) {
            this.battle.rank = "资深药师";
        } else if (rating < 1000) {
            this.battle.rank = "魔药大师";
        } else {
            this.battle.rank = "传说药师";
        }
    }

    // 事件系统
    on(event, callback) {
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    off(event, callback) {
        if (this.eventListeners && this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(callback);
            if (index > -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }
    }

    triggerEvent(event, data) {
        if (this.eventListeners && this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    // 存档相关方法
    toJSON() {
        return {
            version: GameConfig.save.version,
            timestamp: Date.now(),
            player: this.player,
            tavern: this.tavern,
            inventory: this.inventory,
            staff: this.staff,
            recipes: this.recipes,
            time: this.time,
            customers: this.customers,
            battle: this.battle,
            events: this.events,
            statistics: this.statistics,
            settings: this.settings
        };
    }

    fromJSON(data) {
        try {
            if (data.version !== GameConfig.save.version) {
                console.warn('Save data version mismatch, attempting migration...');
                // 这里可以添加数据迁移逻辑
            }

            Object.assign(this, data);
            this.triggerEvent('stateLoaded', { data: data });
            return true;
        } catch (error) {
            console.error('Failed to load game state:', error);
            return false;
        }
    }

    // 工具方法
    generateDailyEvents() {
        // 生成日常事件的逻辑
        const events = [];

        // 市场事件
        if (Math.random() < GameConfig.randomEvents.market.surplus.chance) {
            events.push({
                type: 'market_surplus',
                duration: GameConfig.randomEvents.market.surplus.duration,
                priceMultiplier: GameConfig.randomEvents.market.surplus.priceMultiplier
            });
        }

        // 特殊事件
        if (Math.random() < GameConfig.randomEvents.special.bigOrder.chance) {
            events.push({
                type: 'big_order',
                reward: GameConfig.randomEvents.special.bigOrder.reward,
                timeLimit: GameConfig.randomEvents.special.bigOrder.timeLimit
            });
        }

        this.events.available = events;
    }

    // 获取当前游戏时间字符串
    getTimeString() {
        return `${this.time.day}日 ${this.time.hour.toString().padStart(2, '0')}:${this.time.minute.toString().padStart(2, '0')}`;
    }

    // 获取当前游戏时间（分钟）
    getCurrentTime() {
        return this.time.day * 24 * 60 + this.time.hour * 60 + this.time.minute;
    }

    // 获取上次事件时间
    getLastEventTime() {
        return this.events.lastEventTime;
    }

    // 设置上次事件时间
    setLastEventTime(time) {
        this.events.lastEventTime = time;
    }

    // 检查是否可以使用事件系统
    canTriggerEvent() {
        const currentTime = this.getCurrentTime();
        const timeSinceLastEvent = currentTime - this.events.lastEventTime;
        return timeSinceLastEvent >= this.events.eventCooldown;
    }

    // 检查是否可以进行对战
    canBattle() {
        return this.battle.dailyWins < this.battle.dailyLimit;
    }

    // 获取可用配方
    getAvailableRecipes() {
        return this.recipes.discovered.filter(recipe => {
            const recipeData = GameConfig.potions[recipe];
            return recipeData && this.hasMaterialsForRecipe(recipeData);
        });
    }

    // 检查是否有足够材料制作魔药
    hasMaterialsForRecipe(recipeData) {
        if (!recipeData.materials) return false;

        return recipeData.materials.every(material => {
            return this.getMaterialCount(material) > 0;
        });
    }
}

// 创建全局游戏状态实例
const gameState = new GameState();