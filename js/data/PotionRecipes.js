/**
 * 魔药配方数据定义
 * 包含所有可制作的魔药配方
 */

const PotionRecipes = {
    // 基础治疗类
    healing: {
        id: 'healing',
        name: '治疗药水',
        description: '恢复30点生命值的基础药水',
        icon: 'potion_healing',
        rarity: 'common',
        materials: [
            { type: 'moonGrass', amount: 2 },
            { type: 'dewDrop', amount: 1 },
            { type: 'springWater', amount: 1 }
        ],
        difficulty: 1,
        brewingTime: 3000,
        effects: {
            heal: 30,
            duration: 0
        },
        price: 120,
        reputation: 5
    },

    greaterHealing: {
        id: 'greaterHealing',
        name: '高级治疗药水',
        description: '恢复60点生命值的强力药水',
        icon: 'potion_greater_healing',
        rarity: 'uncommon',
        materials: [
            { type: 'moonGrass', amount: 3 },
            { type: 'dewDrop', amount: 2 },
            { type: 'springWater', amount: 2 },
            { type: 'phoenixFeather', amount: 1 }
        ],
        difficulty: 3,
        brewingTime: 5000,
        effects: {
            heal: 60,
            duration: 0
        },
        price: 300,
        reputation: 15
    },

    // 攻击类
    fireball: {
        id: 'fireball',
        name: '火球药水',
        description: '造成30点火焰伤害的攻击药水',
        icon: 'potion_fireball',
        rarity: 'common',
        materials: [
            { type: 'fireGrass', amount: 2 },
            { type: 'springWater', amount: 1 }
        ],
        difficulty: 2,
        brewingTime: 4000,
        effects: {
            damage: 30,
            type: 'fire',
            duration: 0
        },
        price: 150,
        reputation: 8
    },

    poison: {
        id: 'poison',
        name: '毒液药水',
        description: '造成20点毒素伤害，并使目标中毒3回合',
        icon: 'potion_poison',
        rarity: 'uncommon',
        materials: [
            { type: 'demonBlood', amount: 1 },
            { type: 'moonGrass', amount: 2 },
            { type: 'dewDrop', amount: 1 }
        ],
        difficulty: 4,
        brewingTime: 6000,
        effects: {
            damage: 20,
            type: 'poison',
            duration: 3,
            dot: 5 // 每回合持续伤害
        },
        price: 200,
        reputation: 12
    },

    lightning: {
        id: 'lightning',
        name: '闪电药水',
        description: '造成40点雷电伤害，有30%几率使目标麻痹',
        icon: 'potion_lightning',
        rarity: 'rare',
        materials: [
            { type: 'dragonScale', amount: 1 },
            { type: 'phoenixFeather', amount: 1 },
            { type: 'springWater', amount: 2 }
        ],
        difficulty: 5,
        brewingTime: 7000,
        effects: {
            damage: 40,
            type: 'lightning',
            paralysisChance: 0.3,
            duration: 0
        },
        price: 400,
        reputation: 25
    },

    // 防御类
    shield: {
        id: 'shield',
        name: '护盾药水',
        description: '生成能吸收40点伤害的魔法护盾，持续2回合',
        icon: 'potion_shield',
        rarity: 'uncommon',
        materials: [
            { type: 'unicornHorn', amount: 1 },
            { type: 'springWater', amount: 2 },
            { type: 'dewDrop', amount: 1 }
        ],
        difficulty: 3,
        brewingTime: 5000,
        effects: {
            shield: 40,
            duration: 2
        },
        price: 180,
        reputation: 10
    },

    resistance: {
        id: 'resistance',
        name: '抗性药水',
        description: '提升20%全元素抗性，持续3回合',
        icon: 'potion_resistance',
        rarity: 'rare',
        materials: [
            { type: 'dragonScale', amount: 2 },
            { type: 'phoenixFeather', amount: 1 },
            { type: 'springWater', amount: 3 }
        ],
        difficulty: 4,
        brewingTime: 6000,
        effects: {
            resistance: 0.2,
            duration: 3
        },
        price: 350,
        reputation: 20
    },

    // 控制类
    freeze: {
        id: 'freeze',
        name: '冰冻药水',
        description: '使目标跳过下回合行动',
        icon: 'potion_freeze',
        rarity: 'rare',
        materials: [
            { type: 'timeSand', amount: 1 },
            { type: 'springWater', amount: 2 },
            { type: 'dewDrop', amount: 3 }
        ],
        difficulty: 5,
        brewingTime: 8000,
        effects: {
            skipTurn: true,
            duration: 1
        },
        price: 300,
        reputation: 18
    },

    confusion: {
        id: 'confusion',
        name: '混乱药水',
        description: '使目标下回合行动随机化',
        icon: 'potion_confusion',
        rarity: 'rare',
        materials: [
            { type: 'soulFragment', amount: 1 },
            { type: 'moonGrass', amount: 3 },
            { type: 'demonBlood', amount: 1 }
        ],
        difficulty: 6,
        brewingTime: 9000,
        effects: {
            randomAction: true,
            duration: 1
        },
        price: 400,
        reputation: 22
    },

    // 特殊类
    copy: {
        id: 'copy',
        name: '复制药水',
        description: '复制对方上回合使用的魔药效果',
        icon: 'potion_copy',
        rarity: 'rare',
        materials: [
            { type: 'soulFragment', amount: 2 },
            { type: 'timeSand', amount: 1 },
            { type: 'springWater', amount: 2 }
        ],
        difficulty: 7,
        brewingTime: 10000,
        effects: {
            copyLastAction: true,
            duration: 1
        },
        price: 500,
        reputation: 30
    },

    counter: {
        id: 'counter',
        name: '反制药水',
        description: '反弹下回合受到的伤害50%',
        icon: 'potion_counter',
        rarity: 'rare',
        materials: [
            { type: 'dragonScale', amount: 2 },
            { type: 'unicornHorn', amount: 1 },
            { type: 'springWater', amount: 2 }
        ],
        difficulty: 6,
        brewingTime: 8500,
        effects: {
            damageReflection: 0.5,
            duration: 1
        },
        price: 450,
        reputation: 28
    },

    // 传说级魔药
    eternalLife: {
        id: 'eternalLife',
        name: '永恒生命药水',
        description: '恢复全部生命值，并在3回合内每回合恢复20点生命',
        icon: 'potion_eternal_life',
        rarity: 'legendary',
        materials: [
            { type: 'eternalFlower', amount: 1 },
            { type: 'phoenixFeather', amount: 3 },
            { type: 'unicornHorn', amount: 2 },
            { type: 'springWater', amount: 5 }
        ],
        difficulty: 10,
        brewingTime: 15000,
        effects: {
            fullHeal: true,
            hot: 20, // heal over time
            duration: 3
        },
        price: 2000,
        reputation: 100
    },

    timeStop: {
        id: 'timeStop',
        name: '时间停止药水',
        description: '停止时间2回合，在此期间可以自由行动',
        icon: 'potion_time_stop',
        rarity: 'legendary',
        materials: [
            { type: 'timeSand', amount: 3 },
            { type: 'soulFragment', amount: 2 },
            { type: 'eternalFlower', amount: 1 }
        ],
        difficulty: 10,
        brewingTime: 20000,
        effects: {
            extraTurns: 2,
            duration: 2
        },
        price: 3000,
        reputation: 150
    },

    // 增益类
    strength: {
        id: 'strength',
        name: '力量药水',
        description: '提升25%攻击力，持续3回合',
        icon: 'potion_strength',
        rarity: 'common',
        materials: [
            { type: 'fireGrass', amount: 2 },
            { type: 'springWater', amount: 1 }
        ],
        difficulty: 2,
        brewingTime: 3500,
        effects: {
            attackBoost: 0.25,
            duration: 3
        },
        price: 100,
        reputation: 5
    },

    speed: {
        id: 'speed',
        name: '敏捷药水',
        description: '提升30%速度，持续3回合',
        icon: 'potion_speed',
        rarity: 'uncommon',
        materials: [
            { type: 'windGrass', amount: 2 },
            { type: 'dewDrop', amount: 2 }
        ],
        difficulty: 3,
        brewingTime: 4000,
        effects: {
            speedBoost: 0.3,
            duration: 3
        },
        price: 140,
        reputation: 8
    },

    intelligence: {
        id: 'intelligence',
        name: '智慧药水',
        description: '提升20%魔药效果，持续3回合',
        icon: 'potion_intelligence',
        rarity: 'rare',
        materials: [
            { type: 'moonGrass', amount: 3 },
            { type: 'phoenixFeather', amount: 1 },
            { type: 'springWater', amount: 2 }
        ],
        difficulty: 4,
        brewingTime: 5500,
        effects: {
            intelligenceBoost: 0.2,
            duration: 3
        },
        price: 250,
        reputation: 15
    },

    luck: {
        id: 'luck',
        name: '幸运药水',
        description: '提升幸运值，增加暴击率和稀有材料掉落率',
        icon: 'potion_luck',
        rarity: 'rare',
        materials: [
            { type: 'fourLeafClover', amount: 1 },
            { type: 'moonGrass', amount: 2 },
            { type: 'dewDrop', amount: 3 }
        ],
        difficulty: 5,
        brewingTime: 6000,
        effects: {
            luckBoost: 50,
            critChance: 0.15,
            duration: 5
        },
        price: 300,
        reputation: 18
    }
};

// 材料数据定义
const MaterialData = {
    // 基础材料
    moonGrass: {
        id: 'moonGrass',
        name: '月光草',
        description: '在月光下生长的草药，具有治愈特性',
        icon: 'herb_moon',
        rarity: 'common',
        basePrice: 10,
        effects: ['healing', 'calming']
    },

    fireGrass: {
        id: 'fireGrass',
        name: '火焰草',
        description: '生长在火山附近的草药，蕴含火元素力量',
        icon: 'herb_fire',
        rarity: 'common',
        basePrice: 15,
        effects: ['fire', 'damage']
    },

    windGrass: {
        id: 'windGrass',
        name: '风息草',
        description: '山顶的草药，常年被风吹拂',
        icon: 'herb_wind',
        rarity: 'uncommon',
        basePrice: 20,
        effects: ['speed', 'agility']
    },

    dewDrop: {
        id: 'dewDrop',
        name: '晨露',
        description: '清晨的露水，纯净的水元素',
        icon: 'material_dew',
        rarity: 'common',
        basePrice: 8,
        effects: ['water', 'purity']
    },

    springWater: {
        id: 'springWater',
        name: '泉水',
        description: '山间的清泉，制作药水的基础材料',
        icon: 'material_water',
        rarity: 'common',
        basePrice: 5,
        effects: ['base', 'dilution']
    },

    fourLeafClover: {
        id: 'fourLeafClover',
        name: '四叶草',
        description: '幸运的象征，很难找到',
        icon: 'herb_clover',
        rarity: 'uncommon',
        basePrice: 50,
        effects: ['luck', 'fortune']
    },

    // 稀有材料
    dragonScale: {
        id: 'dragonScale',
        name: '龙鳞',
        description: '巨龙的鳞片，蕴含强大的魔力',
        icon: 'scale_dragon',
        rarity: 'rare',
        basePrice: 100,
        effects: ['power', 'protection', 'fire']
    },

    phoenixFeather: {
        id: 'phoenixFeather',
        name: '凤凰羽毛',
        description: '不死鸟的羽毛，具有重生之力',
        icon: 'feather_phoenix',
        rarity: 'rare',
        basePrice: 120,
        effects: ['rebirth', 'fire', 'healing']
    },

    demonBlood: {
        id: 'demonBlood',
        name: '恶魔之血',
        description: '恶魔的血液，蕴含黑暗力量',
        icon: 'blood_demon',
        rarity: 'rare',
        basePrice: 150,
        effects: ['dark', 'poison', 'chaos']
    },

    unicornHorn: {
        id: 'unicornHorn',
        name: '独角兽角',
        description: '纯洁的独角兽角，拥有强大的净化力量',
        icon: 'horn_unicorn',
        rarity: 'rare',
        basePrice: 200,
        effects: ['pure', 'protection', 'healing']
    },

    // 传说材料
    timeSand: {
        id: 'timeSand',
        name: '时间砂',
        description: '时间流逝的具象化，极其稀有',
        icon: 'sand_time',
        rarity: 'legendary',
        basePrice: 500,
        effects: ['time', 'control', 'eternity']
    },

    soulFragment: {
        id: 'soulFragment',
        name: '灵魂碎片',
        description: '破碎的灵魂，蕴含生命本质',
        icon: 'fragment_soul',
        rarity: 'legendary',
        basePrice: 800,
        effects: ['soul', 'essence', 'mystery']
    },

    eternalFlower: {
        id: 'eternalFlower',
        name: '永恒之花',
        description: '永不凋谢的花朵，象征永恒',
        icon: 'flower_eternal',
        rarity: 'legendary',
        basePrice: 1000,
        effects: ['eternal', 'life', 'perfection']
    }
};

// 工具函数
const RecipeUtils = {
    /**
     * 根据材料获取可制作的魔药
     */
    getAvailableRecipes(materials) {
        const available = [];

        Object.values(PotionRecipes).forEach(recipe => {
            if (this.canCraftRecipe(recipe, materials)) {
                available.push(recipe);
            }
        });

        return available;
    },

    /**
     * 检查是否可以制作指定魔药
     */
    canCraftRecipe(recipe, materials) {
        return recipe.materials.every(required => {
            return materials[required.type] >= required.amount;
        });
    },

    /**
     * 计算制作成功率
     */
    calculateSuccessRate(recipe, playerLevel, staffBonus = 0) {
        const baseRate = GameConfig.brewing.baseSuccessRate;
        const levelBonus = Math.min(playerLevel * 0.02, 0.2);
        const difficultyPenalty = recipe.difficulty * 0.05;

        return Math.max(0.1, Math.min(0.95,
            baseRate + levelBonus + staffBonus - difficultyPenalty
        ));
    },

    /**
     * 获取魔药稀有度颜色
     */
    getRarityColor(rarity) {
        const colors = {
            common: 0xFFFFFF,    // 白色
            uncommon: 0x00FF00,  // 绿色
            rare: 0x0080FF,      // 蓝色
            legendary: 0xFF8000  // 橙色
        };
        return colors[rarity] || 0xFFFFFF;
    },

    /**
     * 计算制作时间
     */
    calculateBrewingTime(recipe, staffEfficiency = 1.0) {
        const baseTime = recipe.brewingTime;
        const efficiency = Math.max(0.5, staffEfficiency);

        return Math.max(
            GameConfig.brewing.minBrewingTime,
            Math.min(
                GameConfig.brewing.maxBrewingTime,
                baseTime / efficiency
            )
        );
    }
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PotionRecipes, MaterialData, RecipeUtils };
}