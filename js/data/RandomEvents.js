/**
 * 随机事件数据定义
 * 包含所有随机事件的详细配置和效果
 */

const RandomEvents = {
    // 市场事件
    market: {
        surplus: {
            id: 'market_surplus',
            name: '材料市场过剩',
            description: '最近冒险者大量返回，材料市场供应充足，价格大幅下降！',
            icon: 'event_surplus',
            category: 'economic',
            rarity: 'common',
            duration: 1, // 天
            chance: 0.1,
            effects: {
                materialPriceMultiplier: 0.5,
                materialAvailability: 2.0
            },
            notification: {
                title: '市场消息',
                message: '材料价格大幅下降，是采购的好时机！',
                type: 'info'
            },
            dialogues: [
                '听说了吗？冒险者们带回了大量材料！',
                '市场上的材料价格降了很多。',
                '现在采购材料可以省不少钱。'
            ]
        },

        shortage: {
            id: 'market_shortage',
            name: '材料供应短缺',
            description: '通往材料产地的道路被怪物封锁，材料价格飙升！',
            icon: 'event_shortage',
            category: 'economic',
            rarity: 'common',
            duration: 1,
            chance: 0.08,
            effects: {
                materialPriceMultiplier: 2.0,
                materialAvailability: 0.5
            },
            notification: {
                title: '紧急消息',
                message: '材料供应紧张，价格大幅上涨！',
                type: 'warning'
            },
            dialogues: [
                '不好了，通往矿山的道路被怪物占领了！',
                '材料价格涨得太快了。',
                '听说有几个商队被袭击了。'
            ]
        },

        priceSpike: {
            id: 'price_spike',
            name: '价格暴涨',
            description: '某种材料突然变得非常稀有，价格飞涨',
            icon: 'event_price_spike',
            category: 'economic',
            rarity: 'uncommon',
            duration: 2,
            chance: 0.05,
            effects: {
                specificMaterialMultiplier: 3.0,
                affectedMaterials: ['dragonScale', 'phoenixFeather', 'unicornHorn']
            },
            notification: {
                title: '市场异动',
                message: '稀有材料价格暴涨！',
                type: 'warning'
            }
        },

        festival: {
            id: 'festival',
            name: '魔法节庆典',
            description: '王国举办魔法节，客人络绎不绝，是赚钱的好时机！',
            icon: 'event_festival',
            category: 'social',
            rarity: 'uncommon',
            duration: 3,
            chance: 0.05,
            effects: {
                customerSpawnRate: 1.5,
                customerBudgetMultiplier: 1.2,
                reputationMultiplier: 1.2,
                potionPriceMultiplier: 1.1
            },
            notification: {
                title: '庆典消息',
                message: '魔法节期间客人增多，收入将大幅提升！',
                type: 'success'
            },
            dialogues: [
                '魔法节到了，大家都想要些特别的药水！',
                '今天客人真多啊，都是来参加庆典的。',
                '节日期间，人们更愿意花钱。'
            ]
        }
    },

    // 特殊客人事件
    specialCustomers: {
        bigOrder: {
            id: 'big_order',
            name: '神秘大订单',
            description: '神秘商人需要大量特定药水，愿意支付高价',
            icon: 'event_big_order',
            category: 'business',
            rarity: 'rare',
            duration: 1,
            chance: 0.03,
            requirements: {
                reputation: 30,
                tavernLevel: 2
            },
            data: {
                orderSize: { min: 20, max: 50 },
                timeLimit: 86400, // 24小时
                baseReward: 5000,
                bonusMultiplier: 1.5
            },
            effects: {
                specialOrderActive: true
            },
            notification: {
                title: '大订单',
                message: '神秘商人有大订单，完成后可获得丰厚奖励！',
                type: 'success'
            },
            dialogues: [
                '我需要大量的{orderType}药水，你能完成吗？',
                '时间紧迫，但我愿意支付高价。',
                '完成这个订单，你会得到丰厚的报酬。'
            ]
        },

        vipVisit: {
            id: 'vip_visit',
            name: 'VIP客人到访',
            description: '王国贵族即将到访，请准备好最好的魔药',
            icon: 'event_vip_visit',
            category: 'social',
            rarity: 'rare',
            duration: 1,
            chance: 0.02,
            requirements: {
                reputation: 50,
                tavernLevel: 3
            },
            data: {
                customerType: 'noble',
                specialRequirements: ['rare', 'high_quality'],
                reputationBonus: 50,
                goldBonus: 1000
            },
            effects: {
                vipCustomerIncoming: true
            },
            notification: {
                title: 'VIP通知',
                message: '王国贵族即将到访，请准备好最好的服务！',
                type: 'info'
            }
        },

        royalCommission: {
            id: 'royal_commission',
            name: '王室委托',
            description: '王室需要特殊的魔药，成功将获得巨大荣誉',
            icon: 'event_royal_commission',
            category: 'official',
            rarity: 'legendary',
            duration: 3,
            chance: 0.01,
            requirements: {
                reputation: 100,
                tavernLevel: 4
            },
            data: {
                commissionType: 'love_potion',
                difficulty: 8,
                reward: 10000,
                reputationReward: 200,
                failurePenalty: 100
            },
            effects: {
                royalPressure: true
            },
            notification: {
                title: '王室委托',
                message: '王室有特殊委托，完成后将获得巨大荣誉！',
                type: 'success'
            }
        }
    },

    // 竞争对手事件
    competition: {
        competitorChallenge: {
            id: 'competitor_challenge',
            name: '竞争对手挑战',
            description: '隔壁酒馆老板前来挑战，对战胜利可获得稀有材料',
            icon: 'event_competitor',
            category: 'competition',
            rarity: 'uncommon',
            duration: 1,
            chance: 0.04,
            requirements: {
                reputation: 40,
                battleRating: 100
            },
            data: {
                opponent: {
                    name: '老约翰',
                    rating: 300,
                    specialty: 'attack',
                    dialogue: '让我看看你的水平如何！'
                },
                reward: 5000,
                materialReward: 'dragon_scale',
                reputationBonus: 30
            },
            effects: {
                challengeActive: true
            },
            notification: {
                title: '挑战书',
                message: '竞争对手来挑战，胜利可获得稀有材料！',
                type: 'warning'
            }
        },

        priceWar: {
            id: 'price_war',
            name: '价格战',
            description: '竞争对手开始价格战，必须调整策略应对',
            icon: 'event_price_war',
            category: 'economic',
            rarity: 'uncommon',
            duration: 2,
            chance: 0.06,
            requirements: {
                reputation: 60
            },
            effects: {
                pricePressure: true,
                profitMarginReduction: 0.2
            },
            notification: {
                title: '价格战',
                message: '竞争对手开始价格战，利润受到影响！',
                type: 'warning'
            }
        }
    },

    // 灾难事件
    disasters: {
        plague: {
            id: 'plague',
            name: '瘟疫爆发',
            description: '城中爆发瘟疫，大量居民需要治疗药水',
            icon: 'event_plague',
            category: 'disaster',
            rarity: 'rare',
            duration: 7,
            chance: 0.005,
            effects: {
                healingPotionDemand: 3.0,
                healingPotionPriceMultiplier: 2.0,
                customerHealthConcern: true,
                reputationDecay: 0.02
            },
            notification: {
                title: '紧急疫情',
                message: '瘟疫爆发，需要大量治疗药水！',
                type: 'danger'
            },
            dialogues: [
                '城里爆发了可怕的瘟疫！',
                '我们需要更多的治疗药水。',
                '愿神明保佑我们度过这次灾难。'
            ]
        },

        monsterAttack: {
            id: 'monster_attack',
            name: '怪物攻城',
            description: '怪物大军正在逼近，冒险者们需要战斗药水',
            icon: 'event_monster_attack',
            category: 'disaster',
            rarity: 'rare',
            duration: 3,
            chance: 0.003,
            effects: {
                battlePotionDemand: 2.5,
                battlePotionPriceMultiplier: 1.8,
                guardCustomerIncrease: 2.0,
                reputationBonus: 20
            },
            notification: {
                title: '怪物攻城',
                message: '怪物来犯，需要战斗药水支援守军！',
                type: 'danger'
            }
        },

        fire: {
            id: 'fire',
            name: '火灾',
            description: '酒馆附近发生火灾，可能影响生意',
            icon: 'event_fire',
            category: 'disaster',
            rarity: 'uncommon',
            duration: 1,
            chance: 0.02,
            effects: {
                customerReduction: 0.5,
                repairCost: 1000,
                reputationPenalty: 10
            },
            notification: {
                title: '火灾警告',
                message: '附近发生火灾，生意受到影响！',
                type: 'danger'
            }
        }
    },

    // 周常事件
    weekly: {
        guildGathering: {
            id: 'guild_gathering',
            name: '魔法师公会聚会',
            description: '本周的魔法师公会聚会，可以与其他药师交流心得',
            icon: 'event_guild',
            category: 'social',
            rarity: 'common',
            duration: 1,
            chance: 1.0, // 每周必定发生
            schedule: 'weekly',
            effects: {
                experienceMultiplier: 2.0,
                reputationMultiplier: 1.5,
                recipeDiscoveryChance: 2.0
            },
            notification: {
                title: '公会聚会',
                message: '魔法师公会聚会，经验获取翻倍！',
                type: 'info'
            }
        }
    },

    // 月常事件
    monthly: {
        magicCompetition: {
            id: 'magic_competition',
            name: '魔法师大赛',
            description: '本月魔法师大赛开始，获胜者将获得传奇配方',
            icon: 'event_competition',
            category: 'competition',
            rarity: 'rare',
            duration: 7,
            chance: 1.0, // 每月必定发生
            schedule: 'monthly',
            data: {
                rounds: 5,
                currentRound: 0,
                reward: 'legendary_recipe',
                participants: 16,
                entryFee: 500
            },
            effects: {
                competitionActive: true,
                battleRewardMultiplier: 2.0
            },
            notification: {
                title: '魔法师大赛',
                message: '本月魔法师大赛开始，获胜将获得传奇配方！',
                type: 'success'
            }
        },

        taxCollection: {
            id: 'tax_collection',
            name: '税收日',
            description: '王国税收官来收税，需要支付本月税款',
            icon: 'event_tax',
            category: 'official',
            rarity: 'common',
            duration: 1,
            chance: 1.0,
            schedule: 'monthly',
            effects: {
                taxRate: 0.1,
                penaltyRate: 0.05
            },
            notification: {
                title: '税收通知',
                message: '税收官即将到访，请准备好税款！',
                type: 'warning'
            }
        }
    },

    // 随机小事件
    minor: {
        wanderingMerchant: {
            id: 'wandering_merchant',
            name: '流浪商人',
            description: '流浪商人路过，提供稀有材料交易',
            icon: 'event_merchant',
            category: 'opportunity',
            rarity: 'common',
            duration: 1,
            chance: 0.15,
            effects: {
                rareMaterialOffer: true,
                specialDiscount: 0.8
            },
            notification: {
                title: '流浪商人',
                message: '流浪商人到访，有稀有材料出售！',
                type: 'info'
            }
        },

        customerCompliment: {
            id: 'customer_compliment',
            name: '客人好评',
            description: '满意的客人向朋友推荐你的酒馆',
            icon: 'event_compliment',
            category: 'social',
            rarity: 'common',
            duration: 1,
            chance: 0.2,
            effects: {
                reputationBonus: 10,
                customerIncrease: 1.2
            },
            notification: {
                title: '好评如潮',
                message: '客人好评让声誉提升！',
                type: 'success'
            }
        },

        recipeDiscovery: {
            id: 'recipe_discovery',
            name: '配方发现',
            description: '在整理材料时意外发现新配方',
            icon: 'event_discovery',
            category: 'discovery',
            rarity: 'uncommon',
            duration: 1,
            chance: 0.08,
            effects: {
                newRecipe: true,
                experienceBonus: 100
            },
            notification: {
                title: '新发现',
                message: '意外发现新魔药配方！',
                type: 'success'
            }
        }
    }
};

// 事件工具类
const EventUtils = {
    /**
     * 计算事件触发概率
     */
    calculateEventChance(event, gameState) {
        let baseChance = event.chance;

        // 声誉影响
        const reputation = gameState.player.reputation;
        if (reputation > 500) {
            baseChance *= 1.2; // 高声誉增加特殊事件
        }

        // 酒馆等级影响
        const tavernLevel = gameState.tavern.level;
        baseChance *= (1 + (tavernLevel - 1) * 0.1);

        return Math.min(1.0, baseChance);
    },

    /**
     * 检查事件是否满足触发条件
     */
    checkRequirements(event, gameState) {
        if (!event.requirements) return true;

        const req = event.requirements;

        // 声誉要求
        if (req.reputation && gameState.player.reputation < req.reputation) {
            return false;
        }

        // 酒馆等级要求
        if (req.tavernLevel && gameState.tavern.level < req.tavernLevel) {
            return false;
        }

        // 对战评分要求
        if (req.battleRating && gameState.battle.rating < req.battleRating) {
            return false;
        }

        return true;
    },

    /**
     * 生成事件效果描述
     */
    generateEffectDescription(event) {
        const effects = event.effects;
        const descriptions = [];

        if (effects.materialPriceMultiplier) {
            const multiplier = effects.materialPriceMultiplier;
            const change = multiplier > 1 ? '上涨' : '下降';
            const percent = Math.abs((multiplier - 1) * 100);
            descriptions.push(`材料价格${change}${percent.toFixed(0)}%`);
        }

        if (effects.customerSpawnRate) {
            const rate = effects.customerSpawnRate;
            const change = rate > 1 ? '增加' : '减少';
            descriptions.push(`客人数量${change}`);
        }

        if (effects.reputationBonus) {
            descriptions.push(`声誉+${effects.reputationBonus}`);
        }

        return descriptions.join('，');
    },

    /**
     * 应用事件效果到游戏状态
     */
    applyEventEffects(event, gameState) {
        const effects = event.effects;

        // 经济效果
        if (effects.materialPriceMultiplier) {
            gameState.marketMultiplier = effects.materialPriceMultiplier;
        }

        if (effects.customerSpawnRate) {
            gameState.customerSpawnRate = effects.customerSpawnRate;
        }

        if (effects.potionPriceMultiplier) {
            gameState.potionPriceMultiplier = effects.potionPriceMultiplier;
        }

        // 声誉效果
        if (effects.reputationBonus) {
            gameState.addReputation(effects.reputationBonus);
        }

        if (effects.reputationPenalty) {
            gameState.addReputation(-effects.reputationPenalty);
        }

        // 特殊状态
        if (effects.specialOrderActive) {
            gameState.specialOrderActive = true;
        }

        if (effects.competitionActive) {
            gameState.competitionActive = true;
        }
    },

    /**
     * 移除事件效果
     */
    removeEventEffects(event, gameState) {
        const effects = event.effects;

        // 重置经济倍率
        if (effects.materialPriceMultiplier) {
            gameState.marketMultiplier = 1.0;
        }

        if (effects.customerSpawnRate) {
            gameState.customerSpawnRate = 1.0;
        }

        if (effects.potionPriceMultiplier) {
            gameState.potionPriceMultiplier = 1.0;
        }

        // 重置特殊状态
        if (effects.specialOrderActive) {
            gameState.specialOrderActive = false;
        }

        if (effects.competitionActive) {
            gameState.competitionActive = false;
        }
    }
};

// 事件生成器
class EventGenerator {
    constructor() {
        this.eventHistory = [];
        this.activeEvents = [];
    }

    /**
     * 生成每日事件
     */
    generateDailyEvents(gameState) {
        const events = [];
        const allEvents = this.getAllEvents();

        // 检查每个事件的触发条件
        Object.values(allEvents).forEach(category => {
            Object.values(category).forEach(event => {
                if (this.shouldTriggerEvent(event, gameState)) {
                    events.push(this.createEventInstance(event));
                }
            });
        });

        return events;
    }

    /**
     * 检查是否应该触发事件
     */
    shouldTriggerEvent(event, gameState) {
        // 检查调度要求
        if (event.schedule) {
            if (!this.checkSchedule(event.schedule, gameState)) {
                return false;
            }
        }

        // 检查触发条件
        if (!EventUtils.checkRequirements(event, gameState)) {
            return false;
        }

        // 检查概率
        const chance = EventUtils.calculateEventChance(event, gameState);
        return Math.random() < chance;
    }

    /**
     * 检查调度要求
     */
    checkSchedule(schedule, gameState) {
        const day = gameState.time.day;

        switch (schedule) {
            case 'weekly':
                return day % 7 === 0;
            case 'monthly':
                return day % 30 === 0;
            default:
                return true;
        }
    }

    /**
     * 创建事件实例
     */
    createEventInstance(eventDef) {
        return {
            ...eventDef,
            id: this.generateEventId(),
            startTime: Date.now(),
            endTime: Date.now() + (eventDef.duration * 24 * 60 * 60 * 1000),
            active: true,
            completed: false
        };
    }

    /**
     * 获取所有事件定义
     */
    getAllEvents() {
        return RandomEvents;
    }

    /**
     * 生成事件ID
     */
    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RandomEvents, EventUtils, EventGenerator };
}