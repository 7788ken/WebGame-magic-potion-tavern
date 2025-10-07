/**
 * 魔药实体类
 * 管理魔药的属性、效果和状态
 */

class Potion {
    constructor(potionData) {
        // 基础属性
        this.id = potionData.id || this.generatePotionId();
        this.definition = potionData.definition;
        this.name = potionData.name || potionData.definition.name;
        this.type = potionData.type || potionData.definition.type;
        this.rarity = potionData.rarity || potionData.definition.rarity;
        this.quality = potionData.quality || 'normal'; // poor, normal, good, excellent, perfect

        // 制作信息
        this.crafter = potionData.crafter || null;
        this.craftingTime = potionData.craftingTime || 0;
        this.craftingDifficulty = potionData.craftingDifficulty || 1;
        this.creationTime = potionData.creationTime || Date.now();
        this.expiryTime = potionData.expiryTime || this.calculateExpiryTime();

        // 效果属性
        this.effects = { ...potionData.definition.effects };
        this.potency = potionData.potency || this.calculatePotency();
        this.duration = potionData.duration || this.effects.duration || 0;

        // 外观和描述
        this.color = potionData.color || this.generatePotionColor();
        this.glow = potionData.glow || this.generatePotionGlow();
        this.particles = potionData.particles || this.generatePotionParticles();
        this.description = potionData.description || this.generateDescription();

        // 状态
        this.status = potionData.status || 'fresh'; // fresh, aging, expired
        this.charges = potionData.charges || this.calculateCharges();
        this.currentCharges = this.charges;

        // 特殊属性
        this.isEnhanced = potionData.isEnhanced || false;
        this.enhancements = potionData.enhancements || [];
        this.sideEffects = potionData.sideEffects || this.generateSideEffects();

        // 价值
        this.basePrice = potionData.basePrice || potionData.definition.price;
        this.currentPrice = this.calculateCurrentPrice();

        // 稀有度
        this.rarityScore = this.calculateRarityScore();
    }

    /**
     * 生成魔药ID
     */
    generatePotionId() {
        return 'potion_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 计算魔药效力
     */
    calculatePotency() {
        let basePotency = 1.0;

        // 品质影响
        const qualityMultiplier = {
            poor: 0.7,
            normal: 1.0,
            good: 1.2,
            excellent: 1.5,
            perfect: 2.0
        };

        basePotency *= (qualityMultiplier[this.quality] || 1.0);

        // 稀有度影响
        const rarityMultiplier = {
            common: 1.0,
            uncommon: 1.1,
            rare: 1.3,
            legendary: 1.6
        };

        basePotency *= (rarityMultiplier[this.rarity] || 1.0);

        return Math.round(basePotency * 100) / 100;
    }

    /**
     * 计算使用次数
     */
    calculateCharges() {
        let baseCharges = 1;

        // 稀有度影响使用次数
        switch (this.rarity) {
            case 'common':
                baseCharges = Math.random() < 0.3 ? 2 : 1;
                break;
            case 'uncommon':
                baseCharges = Math.random() < 0.5 ? 2 : 1;
                break;
            case 'rare':
                baseCharges = Math.random() < 0.7 ? 3 : 2;
                break;
            case 'legendary':
                baseCharges = Math.random() < 0.8 ? 5 : 3;
                break;
        }

        // 品质影响
        if (this.quality === 'excellent') baseCharges += 1;
        if (this.quality === 'perfect') baseCharges += 2;

        return baseCharges;
    }

    /**
     * 计算过期时间
     */
    calculateExpiryTime() {
        const baseDuration = 7 * 24 * 60 * 60 * 1000; // 7天基础保质期
        const qualityMultiplier = {
            poor: 0.5,
            normal: 1.0,
            good: 1.2,
            excellent: 1.5,
            perfect: 2.0
        };

        return Date.now() + (baseDuration * (qualityMultiplier[this.quality] || 1.0));
    }

    /**
     * 生成魔药颜色
     */
    generatePotionColor() {
        const colorMap = {
            healing: 0xFF6B6B,      // 红色
            attack: 0xFF4757,       // 深红色
            fire: 0xFF6348,         // 橙红色
            poison: 0x2ED573,       // 绿色
            shield: 0x3742FA,       // 蓝色
            defense: 0x5352ED,      // 深蓝色
            control: 0xA55EEA,      // 紫色
            utility: 0xFF9FF3,      // 粉色
            buff: 0xFFA502,         // 橙色
            special: 0x70A1FF       // 浅蓝色
        };

        const potionType = this.definition.type || 'utility';
        return colorMap[potionType] || 0x70A1FF;
    }

    /**
     * 生成魔药光效
     */
    generatePotionGlow() {
        const glowMap = {
            common: { intensity: 0.3, color: 0xFFFFFF },
            uncommon: { intensity: 0.5, color: 0x00FF00 },
            rare: { intensity: 0.7, color: 0x0080FF },
            legendary: { intensity: 1.0, color: 0xFF8000 }
        };

        return glowMap[this.rarity] || glowMap.common;
    }

    /**
     * 生成魔药粒子效果
     */
    generatePotionParticles() {
        const particleMap = {
            healing: { type: 'hearts', count: 3 },
            attack: { type: 'sparks', count: 5 },
            poison: { type: 'bubbles', count: 4 },
            shield: { type: 'shields', count: 2 },
            control: { type: 'stars', count: 6 }
        };

        const potionType = this.definition.type || 'utility';
        return particleMap[potionType] || { type: 'sparks', count: 3 };
    }

    /**
     * 生成魔药描述
     */
    generateDescription() {
        let description = this.definition.description;

        // 根据品质调整描述
        const qualityDescriptions = {
            poor: '制作粗糙，效果一般。',
            normal: '标准制作的魔药。',
            good: '精心制作，效果良好。',
            excellent: '完美制作，效果显著。',
            perfect: '大师级作品，效果惊人！'
        };

        description += ' ' + (qualityDescriptions[this.quality] || '');

        // 添加使用次数信息
        if (this.charges > 1) {
            description += ` 可使用${this.charges}次。`;
        }

        // 添加稀有度信息
        const rarityDescriptions = {
            rare: ' 这是一件稀有的作品。',
            legendary: ' 传说级的完美魔药！'
        };

        if (rarityDescriptions[this.rarity]) {
            description += rarityDescriptions[this.rarity];
        }

        return description;
    }

    /**
     * 生成副作用
     */
    generateSideEffects() {
        const sideEffects = [];

        // 根据品质生成副作用
        if (this.quality === 'poor') {
            // 劣质魔药可能有副作用
            if (Math.random() < 0.3) {
                sideEffects.push({
                    type: 'minor_nausea',
                    chance: 0.2,
                    duration: 60,
                    description: '可能引起轻微恶心'
                });
            }
        }

        // 根据稀有度生成特殊效果
        if (this.rarity === 'legendary' && this.quality === 'perfect') {
            // 完美传说魔药可能有额外正面效果
            if (Math.random() < 0.5) {
                sideEffects.push({
                    type: 'bonus_effect',
                    chance: 1.0,
                    duration: 0,
                    description: '额外获得经验值加成'
                });
            }
        }

        return sideEffects;
    }

    /**
     * 计算当前价格
     */
    calculateCurrentPrice() {
        let price = this.basePrice;

        // 品质加成
        const qualityMultiplier = {
            poor: 0.7,
            normal: 1.0,
            good: 1.3,
            excellent: 1.8,
            perfect: 2.5
        };

        price *= (qualityMultiplier[this.quality] || 1.0);

        // 稀有度加成
        const rarityMultiplier = {
            common: 1.0,
            uncommon: 1.5,
            rare: 2.5,
            legendary: 5.0
        };

        price *= (rarityMultiplier[this.rarity] || 1.0);

        // 使用次数加成
        price *= Math.sqrt(this.charges);

        // 新鲜度影响（过期降价）
        const freshness = this.getFreshness();
        if (freshness < 0.5) {
            price *= freshness;
        }

        return Math.floor(price);
    }

    /**
     * 计算稀有度评分
     */
    calculateRarityScore() {
        let score = 0;

        // 基础稀有度
        const baseScores = {
            common: 1,
            uncommon: 3,
            rare: 8,
            legendary: 20
        };

        score += baseScores[this.rarity] || 1;

        // 品质加成
        const qualityScores = {
            poor: -1,
            normal: 0,
            good: 2,
            excellent: 5,
            perfect: 10
        };

        score += qualityScores[this.quality] || 0;

        // 使用次数加成
        score += this.charges;

        // 特殊效果加成
        if (this.isEnhanced) score += 5;
        if (this.sideEffects.length === 0) score += 2;

        return score;
    }

    /**
     * 使用魔药
     */
    use(target, battle = null) {
        if (this.currentCharges <= 0) {
            return { success: false, reason: '魔药已用完' };
        }

        if (this.status === 'expired') {
            return { success: false, reason: '魔药已过期' };
        }

        // 应用主要效果
        const effectResult = this.applyEffects(target, battle);

        // 应用副作用
        const sideEffectResult = this.applySideEffects(target);

        // 减少使用次数
        this.currentCharges--;

        // 更新状态
        if (this.currentCharges <= 0) {
            this.status = 'empty';
        }

        return {
            success: true,
            effectResult: effectResult,
            sideEffectResult: sideEffectResult,
            remainingCharges: this.currentCharges
        };
    }

    /**
     * 应用主要效果
     */
    applyEffects(target, battle = null) {
        const results = [];

        Object.entries(this.effects).forEach(([effectType, value]) => {
            const result = this.applyIndividualEffect(effectType, value, target, battle);
            results.push(result);
        });

        return results;
    }

    /**
     * 应用单个效果
     */
    applyIndividualEffect(effectType, value, target, battle = null) {
        const potency = this.potency;

        switch (effectType) {
            case 'heal':
                const healAmount = Math.floor(value * potency);
                target.currentHealth = Math.min(target.maxHealth, target.currentHealth + healAmount);
                return { type: 'heal', amount: healAmount, target: target };

            case 'damage':
                const damageAmount = Math.floor(value * potency);
                target.currentHealth = Math.max(0, target.currentHealth - damageAmount);
                return { type: 'damage', amount: damageAmount, target: target };

            case 'shield':
                const shieldAmount = Math.floor(value * potency);
                if (!target.shield) target.shield = 0;
                target.shield += shieldAmount;
                return { type: 'shield', amount: shieldAmount, target: target };

            case 'dot': // 持续伤害
                if (battle) {
                    battle.applyStatusEffect(target, {
                        type: 'poison',
                        damage: Math.floor(value * potency),
                        duration: this.duration
                    });
                }
                return { type: 'dot', damage: Math.floor(value * potency), duration: this.duration };

            case 'skipTurn':
                if (battle) {
                    battle.skipNextTurn(target);
                }
                return { type: 'skipTurn', target: target };

            case 'damageReflection':
                if (battle) {
                    battle.applyStatusEffect(target, {
                        type: 'damage_reflection',
                        reflection: value,
                        duration: this.duration
                    });
                }
                return { type: 'damageReflection', reflection: value, duration: this.duration };

            default:
                return { type: effectType, value: value, potency: potency };
        }
    }

    /**
     * 应用副作用
     */
    applySideEffects(target) {
        const results = [];

        this.sideEffects.forEach(sideEffect => {
            if (Math.random() < sideEffect.chance) {
                results.push({
                    type: 'sideEffect',
                    effect: sideEffect,
                    applied: true
                });
            }
        });

        return results;
    }

    /**
     * 更新新鲜度
     */
    updateFreshness() {
        const now = Date.now();
        const timePassed = now - this.creationTime;
        const totalLifetime = this.expiryTime - this.creationTime;

        const freshness = 1 - (timePassed / totalLifetime);

        if (freshness <= 0) {
            this.status = 'expired';
        } else if (freshness < 0.3) {
            this.status = 'aging';
        }

        return freshness;
    }

    /**
     * 获取新鲜度
     */
    getFreshness() {
        return this.updateFreshness();
    }

    /**
     * 增强魔药
     */
    enhance(enhancement) {
        this.enhancements.push(enhancement);
        this.isEnhanced = true;

        // 应用增强效果
        switch (enhancement.type) {
            case 'potency':
                this.potency *= (1 + enhancement.value);
                break;
            case 'duration':
                this.duration += enhancement.value;
                break;
            case 'charges':
                this.charges += enhancement.value;
                this.currentCharges += enhancement.value;
                break;
            case 'quality':
                this.quality = this.getHigherQuality(this.quality);
                break;
        }

        // 重新计算价格
        this.currentPrice = this.calculateCurrentPrice();
    }

    /**
     * 获取更高品质
     */
    getHigherQuality(currentQuality) {
        const qualities = ['poor', 'normal', 'good', 'excellent', 'perfect'];
        const currentIndex = qualities.indexOf(currentQuality);
        if (currentIndex < qualities.length - 1) {
            return qualities[currentIndex + 1];
        }
        return currentQuality;
    }

    /**
     * 获取魔药信息
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            rarity: this.rarity,
            quality: this.quality,
            potency: Math.round(this.potency * 100) / 100,
            charges: this.currentCharges,
            maxCharges: this.charges,
            status: this.status,
            effects: this.effects,
            sideEffects: this.sideEffects,
            price: this.currentPrice,
            description: this.description,
            freshness: Math.round(this.getFreshness() * 100) / 100,
            isEnhanced: this.isEnhanced,
            enhancements: this.enhancements,
            rarityScore: this.rarityScore,
            color: this.color,
            expiryTime: this.expiryTime
        };
    }

    /**
     * 转换为JSON
     */
    toJSON() {
        return {
            id: this.id,
            definition: this.definition,
            name: this.name,
            type: this.type,
            rarity: this.rarity,
            quality: this.quality,
            potency: this.potency,
            charges: this.charges,
            currentCharges: this.currentCharges,
            status: this.status,
            effects: this.effects,
            sideEffects: this.sideEffects,
            crafter: this.crafter,
            craftingTime: this.craftingTime,
            craftingDifficulty: this.craftingDifficulty,
            creationTime: this.creationTime,
            expiryTime: this.expiryTime,
            color: this.color,
            glow: this.glow,
            particles: this.particles,
            description: this.description,
            basePrice: this.basePrice,
            currentPrice: this.currentPrice,
            isEnhanced: this.isEnhanced,
            enhancements: this.enhancements,
            rarityScore: this.rarityScore
        };
    }

    /**
     * 从JSON恢复
     */
    static fromJSON(data) {
        return new Potion(data);
    }
}

// 魔药管理器
class PotionManager {
    constructor() {
        this.potions = [];
        this.potionTypes = new Map();
        this.discoveredRecipes = new Set();
        this.masteredRecipes = new Set();

        // 初始化魔药类型
        this.initializePotionTypes();

        // 统计
        this.stats = {
            totalPotionsMade: 0,
            totalPotionsSold: 0,
            averageQuality: 0,
            mostPopularType: null,
            revenue: 0
        };
    }

    /**
     * 初始化魔药类型
     */
    initializePotionTypes() {
        Object.entries(PotionRecipes).forEach(([type, recipe]) => {
            this.potionTypes.set(type, recipe);
        });
    }

    /**
     * 创建新魔药
     */
    createPotion(recipeId, quality = 'normal', crafter = null) {
        const recipe = this.potionTypes.get(recipeId);
        if (!recipe) {
            console.error(`未知的魔药配方: ${recipeId}`);
            return null;
        }

        const potionData = {
            definition: recipe,
            name: recipe.name,
            type: recipe.type,
            rarity: recipe.rarity,
            quality: quality,
            crafter: crafter,
            creationTime: Date.now()
        };

        const potion = new Potion(potionData);
        this.potions.push(potion);
        this.stats.totalPotionsMade++;

        // 记录配方发现
        this.discoverRecipe(recipeId);

        console.log(`创建了魔药: ${potion.name} (${potion.quality})`);
        return potion;
    }

    /**
     * 发现配方
     */
    discoverRecipe(recipeId) {
        if (!this.discoveredRecipes.has(recipeId)) {
            this.discoveredRecipes.add(recipeId);
            console.log(`发现了新配方: ${recipeId}`);

            // 给予经验奖励
            if (gameState) {
                gameState.addExperience(50);
            }

            return true;
        }
        return false;
    }

    /**
     * 掌握配方
     */
    masterRecipe(recipeId) {
        if (this.discoveredRecipes.has(recipeId) && !this.masteredRecipes.has(recipeId)) {
            this.masteredRecipes.add(recipeId);
            console.log(`掌握了配方: ${recipeId}`);

            // 给予经验奖励
            if (gameState) {
                gameState.addExperience(100);
            }

            return true;
        }
        return false;
    }

    /**
     * 使用魔药
     */
    usePotion(potionId, target, battle = null) {
        const potion = this.potions.find(p => p.id === potionId);
        if (!potion) {
            return { success: false, reason: '魔药不存在' };
        }

        const result = potion.use(target, battle);

        if (result.success) {
            // 如果使用次数用完，从库存中移除
            if (potion.currentCharges <= 0) {
                this.removePotion(potionId);
            }

            this.stats.totalPotionsSold++;
        }

        return result;
    }

    /**
     * 移除魔药
     */
    removePotion(potionId) {
        const index = this.potions.findIndex(p => p.id === potionId);
        if (index !== -1) {
            const potion = this.potions[index];
            this.potions.splice(index, 1);
            console.log(`移除了魔药: ${potion.name}`);
            return true;
        }
        return false;
    }

    /**
     * 更新所有魔药状态
     */
    updatePotions() {
        this.potions.forEach(potion => {
            potion.updateFreshness();
        });

        // 清理过期魔药
        this.cleanupExpiredPotions();
    }

    /**
     * 清理过期魔药
     */
    cleanupExpiredPotions() {
        const expiredPotions = this.potions.filter(potion => potion.status === 'expired');

        expiredPotions.forEach(potion => {
            console.log(`清理了过期魔药: ${potion.name}`);
            this.removePotion(potion.id);
        });
    }

    /**
     * 获取可用魔药
     */
    getAvailablePotions() {
        return this.potions.filter(potion =>
            potion.status !== 'expired' && potion.currentCharges > 0
        );
    }

    /**
     * 按类型获取魔药
     */
    getPotionsByType(type) {
        return this.potions.filter(potion => potion.type === type);
    }

    /**
     * 按品质获取魔药
     */
    getPotionsByQuality(quality) {
        return this.potions.filter(potion => potion.quality === quality);
    }

    /**
     * 获取已发现配方
     */
    getDiscoveredRecipes() {
        return Array.from(this.discoveredRecipes);
    }

    /**
     * 获取已掌握配方
     */
    getMasteredRecipes() {
        return Array.from(this.masteredRecipes);
    }

    /**
     * 获取配方信息
     */
    getRecipeInfo(recipeId) {
        const recipe = this.potionTypes.get(recipeId);
        if (!recipe) return null;

        return {
            ...recipe,
            discovered: this.discoveredRecipes.has(recipeId),
            mastered: this.masteredRecipes.has(recipeId)
        };
    }

    /**
     * 更新统计
     */
    updateStats() {
        if (this.potions.length === 0) {
            this.stats.averageQuality = 0;
            return;
        }

        const qualityScores = {
            poor: 1,
            normal: 2,
            good: 3,
            excellent: 4,
            perfect: 5
        };

        const totalQuality = this.potions.reduce((sum, potion) => {
            return sum + (qualityScores[potion.quality] || 2);
        }, 0);

        this.stats.averageQuality = totalQuality / this.potions.length;

        // 计算最受欢迎的类型
        const typeCounts = {};
        this.potions.forEach(potion => {
            typeCounts[potion.type] = (typeCounts[potion.type] || 0) + 1;
        });

        this.stats.mostPopularType = Object.keys(typeCounts).reduce((a, b) =>
            typeCounts[a] > typeCounts[b] ? a : b, 'unknown'
        );
    }

    /**
     * 获取魔药信息
     */
    getPotionsInfo() {
        return this.potions.map(potion => potion.getInfo());
    }

    /**
     * 获取统计信息
     */
    getStats() {
        this.updateStats();
        return {
            ...this.stats,
            totalPotions: this.potions.length,
            discoveredRecipes: this.discoveredRecipes.size,
            masteredRecipes: this.masteredRecipes.size,
            totalRecipes: this.potionTypes.size
        };
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Potion, PotionManager };
}