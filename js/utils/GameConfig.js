/**
 * 魔药酒馆游戏配置
 * 包含游戏的所有基础配置参数
 */

const GameConfig = {
    // 游戏基本配置
    game: {
        width: 1280,
        height: 720,
        backgroundColor: 0x1A1A2E,
        antialias: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        }
    },

    // 酒馆经营配置
    tavern: {
        baseCapacity: 5,
        baseIncome: 50,
        operatingHours: {
            start: 6,
            end: 24
        },
        customerSpawnRate: 3000, // 每3秒一个客人
        vipCustomerChance: 0.15, // 15%概率VIP客人
        reputationDecay: 0.01 // 声誉每日衰减
    },

    // 魔药制作配置
    brewing: {
        baseSuccessRate: 0.8,
        staffBonus: 0.1,
        materialQualityBonus: 0.05,
        minBrewingTime: 2000, // 最少2秒
        maxBrewingTime: 8000  // 最多8秒
    },

    // 对战系统配置
    battle: {
        maxHealth: 100,
        maxHandSize: 7,
        maxMaterials: 3,
        turnTimeLimit: 30000, // 30秒回合限制
        baseDrawCount: 2,     // 每回合抽2张
        materialDrawCount: 1  // 每回合抽1个材料
    },

    // 经济系统配置
    economy: {
        startingGold: 500,
        materialBasePrice: 10,
        potionBasePrice: 50,
        staffWage: 100,
        rent: 200,
        taxRate: 0.1 // 10%税率
    },

    // 声誉系统配置
    reputation: {
        startingReputation: 50,
        maxReputation: 1000,
        customerSatisfactionBonus: 5,
        battleVictoryBonus: 20,
        specialEventBonus: 50,
        failedOrderPenalty: 10
    },

    // 材料系统配置
    materials: {
        common: {
            moonGrass: { price: 10, quality: 1, rarity: 0.4 },
            fireGrass: { price: 15, quality: 1, rarity: 0.3 },
            dewDrop: { price: 8, quality: 1, rarity: 0.5 },
            springWater: { price: 5, quality: 1, rarity: 0.6 }
        },
        rare: {
            dragonScale: { price: 100, quality: 3, rarity: 0.1 },
            phoenixFeather: { price: 120, quality: 3, rarity: 0.08 },
            demonBlood: { price: 150, quality: 4, rarity: 0.05 },
            unicornHorn: { price: 200, quality: 5, rarity: 0.03 }
        },
        legendary: {
            timeSand: { price: 500, quality: 10, rarity: 0.01 },
            soulFragment: { price: 800, quality: 15, rarity: 0.005 },
            eternalFlower: { price: 1000, quality: 20, rarity: 0.001 }
        }
    },

    // 魔药配方配置
    potions: {
        // 攻击类
        attack: {
            fireball: {
                materials: ['fireGrass', 'dragonScale', 'springWater'],
                difficulty: 3,
                effect: { damage: 30, type: 'fire' },
                price: 150
            },
            poison: {
                materials: ['demonBlood', 'moonGrass', 'dewDrop'],
                difficulty: 4,
                effect: { damage: 20, type: 'poison', duration: 3 },
                price: 200
            }
        },
        // 防御类
        defense: {
            shield: {
                materials: ['unicornHorn', 'springWater', 'dewDrop'],
                difficulty: 3,
                effect: { block: 40, duration: 2 },
                price: 180
            },
            healing: {
                materials: ['moonGrass', 'dewDrop', 'springWater'],
                difficulty: 2,
                effect: { heal: 30 },
                price: 120
            }
        },
        // 控制类
        control: {
            freeze: {
                materials: ['timeSand', 'springWater', 'dewDrop'],
                difficulty: 5,
                effect: { skipTurn: true },
                price: 300
            },
            confusion: {
                materials: ['soulFragment', 'moonGrass', 'demonBlood'],
                difficulty: 6,
                effect: { randomEffect: true },
                price: 400
            }
        }
    },

    // 客人配置
    customers: {
        common: {
            adventurer: {
                patience: 60,
                budget: { min: 50, max: 150 },
                preferences: ['healing', 'strength'],
                reputationBonus: 5
            },
            merchant: {
                patience: 45,
                budget: { min: 100, max: 300 },
                preferences: ['buff', 'utility'],
                reputationBonus: 8
            }
        },
        vip: {
            noble: {
                patience: 30,
                budget: { min: 500, max: 1000 },
                preferences: ['rare', 'legendary'],
                reputationBonus: 20
            },
            wizard: {
                patience: 90,
                budget: { min: 200, max: 500 },
                preferences: ['complex', 'powerful'],
                reputationBonus: 15
            }
        }
    },

    // 随机事件配置
    randomEvents: {
        market: {
            surplus: { chance: 0.1, duration: 1, priceMultiplier: 0.5 },
            shortage: { chance: 0.08, duration: 1, priceMultiplier: 2.0 },
            festival: { chance: 0.05, duration: 3, customerMultiplier: 1.5 }
        },
        special: {
            bigOrder: { chance: 0.03, reward: 5000, timeLimit: 86400 },
            vipVisit: { chance: 0.02, reputationBonus: 50 },
            competition: { chance: 0.01, reward: 10000 }
        },
        disaster: {
            plague: { chance: 0.005, duration: 7, healingDemand: 3.0 },
            monsterAttack: { chance: 0.003, duration: 3, battlePotionDemand: 2.5 }
        }
    },

    // 保存配置
    save: {
        autoSaveInterval: 300000, // 5分钟自动保存
        maxSaveSlots: 5,
        version: "1.0.0"
    },

    // UI配置
    ui: {
        animationSpeed: 300,
        tooltipDelay: 500,
        notificationDuration: 3000,
        colors: {
            primary: 0x2D1B69,
            secondary: 0xFFD700,
            accent: 0x00FF7F,
            background: 0x1A1A2E,
            text: 0xFFF8DC
        }
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}