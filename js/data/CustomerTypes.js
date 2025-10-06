/**
 * 客人类型数据定义
 * 包含所有客人类型及其行为模式
 */

const CustomerTypes = {
    // 普通客人
    common: {
        adventurer: {
            id: 'adventurer',
            name: '冒险者',
            description: '四处旅行的冒险者，需要基础的治疗和增益药水',
            icon: 'customer_adventurer',
            patience: 60,
            budget: { min: 50, max: 150 },
            preferences: ['healing', 'strength', 'speed'],
            reputationRequirement: 0,
            spawnRate: 0.4,
            behavior: {
                patienceDecay: 1.0,
                haggleChance: 0.3,
                tipChance: 0.1,
                complaintChance: 0.05
            },
            dialogues: {
                greeting: ['你好，我需要一些药水准备下次冒险', '有治疗药水吗？上次冒险我伤得不轻'],
                waiting: ['能快点吗？我赶时间', '希望这里的药水质量不错'],
                satisfied: ['谢谢！这瓶药水看起来很不错', '价格合理，我会再来的'],
                angry: ['太慢了！我要去别家', '这是什么服务态度！']
            }
        },

        merchant: {
            id: 'merchant',
            name: '商人',
            description: '精明的商人，会仔细比较价格和品质',
            icon: 'customer_merchant',
            patience: 45,
            budget: { min: 100, max: 300 },
            preferences: ['intelligence', 'luck', 'utility'],
            reputationRequirement: 10,
            spawnRate: 0.25,
            behavior: {
                patienceDecay: 1.2,
                haggleChance: 0.6,
                tipChance: 0.05,
                complaintChance: 0.1
            },
            dialogues: {
                greeting: ['我听说这里的药水质量不错', '给我看看你们最好的药水'],
                waiting: ['时间就是金钱，朋友', '我希望这个价格值得等待'],
                satisfied: ['不错的交易，下次我还会来', '品质确实配得上这个价格'],
                angry: ['太贵了！这是抢劫', '我要向其他商人推荐不要来这里']
            }
        },

        villager: {
            id: 'villager',
            name: '村民',
            description: '附近的村民，需要基础的药水治疗日常疾病',
            icon: 'customer_villager',
            patience: 80,
            budget: { min: 30, max: 80 },
            preferences: ['healing', 'cheap'],
            reputationRequirement: 0,
            spawnRate: 0.3,
            behavior: {
                patienceDecay: 0.8,
                haggleChance: 0.2,
                tipChance: 0.15,
                complaintChance: 0.02
            },
            dialogues: {
                greeting: ['你好，我妻子生病了，需要治疗药水', '有便宜的药水吗？'],
                waiting: ['没关系，我可以等', '希望不要太贵'],
                satisfied: ['太感谢了！你救了我家人', '愿神明保佑你'],
                angry: ['太贵了，我买不起', '我要去请牧师治疗']
            }
        },

        guard: {
            id: 'guard',
            name: '守卫',
            description: '城镇守卫，需要战斗相关的药水',
            icon: 'customer_guard',
            patience: 50,
            budget: { min: 80, max: 200 },
            preferences: ['attack', 'defense', 'strength'],
            reputationRequirement: 15,
            spawnRate: 0.2,
            behavior: {
                patienceDecay: 1.1,
                haggleChance: 0.1,
                tipChance: 0.2,
                complaintChance: 0.03
            },
            dialogues: {
                greeting: ['队长派我来采购战斗药水', '我们需要强力的攻击药水'],
                waiting: ['快点，城墙那边需要支援', '希望你们的药水能帮上忙'],
                satisfied: ['很好，这正是我们需要的', '下次战斗我们会更强大'],
                angry: ['这药水效果太差了！', '我要向上级报告这个问题']
            }
        }
    },

    // VIP客人
    vip: {
        noble: {
            id: 'noble',
            name: '贵族',
            description: '傲慢的贵族，要求最高品质的服务',
            icon: 'customer_noble',
            patience: 30,
            budget: { min: 500, max: 1000 },
            preferences: ['legendary', 'rare', 'expensive'],
            reputationRequirement: 50,
            spawnRate: 0.05,
            behavior: {
                patienceDecay: 2.0,
                haggleChance: 0.1,
                tipChance: 0.5,
                complaintChance: 0.2
            },
            dialogues: {
                greeting: ['我是王国贵族，给我最好的药水', '不要拿劣质货色糊弄我'],
                waiting: ['你知道我是谁吗？让我等这么久', '我的时间非常宝贵'],
                satisfied: ['不错，配得上我的身份', '我会向其他贵族推荐这里'],
                angry: ['粗俗！我要向国王投诉', '你这破店别想再开下去了']
            }
        },

        wizard: {
            id: 'wizard',
            name: '魔法师',
            description: '博学的魔法师，对魔药有深入了解',
            icon: 'customer_wizard',
            patience: 90,
            budget: { min: 200, max: 500 },
            preferences: ['complex', 'powerful', 'experimental'],
            reputationRequirement: 30,
            spawnRate: 0.08,
            behavior: {
                patienceDecay: 0.5,
                haggleChance: 0.2,
                tipChance: 0.3,
                complaintChance: 0.05
            },
            dialogues: {
                greeting: ['我研究魔药学已经50年了', '让我看看你的配方是否合理'],
                waiting: ['没关系，好魔药需要时间', '我在分析你的制作工艺'],
                satisfied: ['完美的配比！你是真正的药剂师', '这个配方很有创意'],
                angry: ['这个配方完全错误！', '浪费了我宝贵的时间']
            }
        },

        merchantPrince: {
            id: 'merchantPrince',
            name: '商会长老',
            description: '商会的重要人物，订单量巨大',
            icon: 'customer_merchant_prince',
            patience: 40,
            budget: { min: 1000, max: 2000 },
            preferences: ['bulk', 'quality', 'reliable'],
            reputationRequirement: 80,
            spawnRate: 0.02,
            behavior: {
                patienceDecay: 1.5,
                haggleChance: 0.4,
                tipChance: 0.3,
                complaintChance: 0.15
            },
            dialogues: {
                greeting: ['商会需要大量药水供应', '我们要建立长期合作关系'],
                waiting: ['时间就是金钱，但也是品质', '商会不会接受劣质产品'],
                satisfied: ['很好，商会会考虑长期合作', '这个价格还算合理'],
                angry: ['商会不会忘记这次失败的交易', '我要取消所有未来的订单']
            }
        }
    },

    // 特殊客人
    special: {
        mysteriousStranger: {
            id: 'mysteriousStranger',
            name: '神秘陌生人',
            description: '深夜出现的神秘人物，需求诡异',
            icon: 'customer_mysterious',
            patience: 120,
            budget: { min: 300, max: 800 },
            preferences: ['dark', 'forbidden', 'cursed'],
            reputationRequirement: 20,
            spawnRate: 0.03,
            spawnTime: 'night', // 只在晚上出现
            behavior: {
                patienceDecay: 0.3,
                haggleChance: 0.1,
                tipChance: 0.4,
                complaintChance: 0.02
            },
            dialogues: {
                greeting: ['我需要一些...特别的药水', '你能保守秘密吗？'],
                waiting: ['时间对我来说没有意义', '黑暗会等待'],
                satisfied: ['很好，这是你的奖励', '我们会再见面的'],
                angry: ['你让我感到失望', '这不是我想要的结果']
            }
        },

        royalEnvoy: {
            id: 'royalEnvoy',
            name: '王室使者',
            description: '代表王室来采购药水，非常重要',
            icon: 'customer_royal_envoy',
            patience: 60,
            budget: { min: 800, max: 1500 },
            preferences: ['royal', 'official', 'urgent'],
            reputationRequirement: 100,
            spawnRate: 0.01,
            behavior: {
                patienceDecay: 1.0,
                haggleChance: 0.05,
                tipChance: 0.6,
                complaintChance: 0.1
            },
            dialogues: {
                greeting: ['我代表王室来采购药水', '这是紧急需求，请优先处理'],
                waiting: ['王室的时间不容浪费', '希望你的效率配得上王室的信任'],
                satisfied: ['王室会记住你的贡献', '这是王室的赏赐'],
                angry: ['王室不会容忍这种服务', '我要向国王报告你的无能']
            }
        },

        competitor: {
            id: 'competitor',
            name: '竞争对手',
            description: '隔壁酒馆的老板，来挑衅或学习',
            icon: 'customer_competitor',
            patience: 45,
            budget: { min: 200, max: 400 },
            preferences: ['competitive', 'challenging', 'inspection'],
            reputationRequirement: 40,
            spawnRate: 0.04,
            behavior: {
                patienceDecay: 1.3,
                haggleChance: 0.7,
                tipChance: 0.0,
                complaintChance: 0.3
            },
            dialogues: {
                greeting: ['让我看看你的水平如何', '听说你这里生意不错'],
                waiting: ['哼，不过如此', '我会找出你的弱点'],
                satisfied: ['还不错，但不如我的配方', '学到了一些技巧'],
                angry: ['这种水平也敢开店？', '等着关门吧！']
            }
        }
    }
};

// 客人行为模式
const CustomerBehavior = {
    /**
     * 计算客人满意度
     */
    calculateSatisfaction(customer, potion, serviceTime, price) {
        let satisfaction = 50; // 基础满意度

        // 魔药品质
        if (customer.preferences.includes(potion.type)) {
            satisfaction += 30;
        }

        // 服务时间
        const patience = customer.patience;
        if (serviceTime < patience * 0.5) {
            satisfaction += 20;
        } else if (serviceTime > patience) {
            satisfaction -= 40;
        }

        // 价格合理性
        const budget = customer.budget;
        if (price <= budget.min) {
            satisfaction += 10;
        } else if (price > budget.max) {
            satisfaction -= 30;
        }

        // 声誉影响
        const reputation = gameState.player.reputation;
        satisfaction += reputation * 0.02;

        return Math.max(0, Math.min(100, satisfaction));
    },

    /**
     * 客人决策逻辑
     */
    makeDecision(customer, availablePotions, prices) {
        const decisions = [];

        // 根据偏好筛选
        const preferredPotions = availablePotions.filter(potion =>
            customer.preferences.some(pref => potion.type.includes(pref))
        );

        // 根据预算筛选
        const affordablePotions = availablePotions.filter(potion => {
            const price = prices[potion.id] || potion.price;
            return price >= customer.budget.min && price <= customer.budget.max;
        });

        // 决策权重
        preferredPotions.forEach(potion => {
            decisions.push({
                action: 'buy',
                potion: potion,
                weight: 0.7
            });
        });

        affordablePotions.forEach(potion => {
            decisions.push({
                action: 'buy',
                potion: potion,
                weight: 0.5
            });
        });

        // 离开选项
        decisions.push({
            action: 'leave',
            weight: 0.3
        });

        return this.weightedRandomDecision(decisions);
    },

    /**
     * 加权随机选择
     */
    weightedRandomDecision(decisions) {
        const totalWeight = decisions.reduce((sum, d) => sum + d.weight, 0);
        let random = Math.random() * totalWeight;

        for (const decision of decisions) {
            random -= decision.weight;
            if (random <= 0) {
                return decision;
            }
        }

        return decisions[decisions.length - 1];
    },

    /**
     * 客人等待行为
     */
    updateWaiting(customer, waitTime) {
        // 耐心递减
        customer.currentPatience = Math.max(0, customer.patience - waitTime * customer.behavior.patienceDecay);

        // 检查是否离开
        if (customer.currentPatience <= 0) {
            return {
                action: 'leave_angry',
                reason: '等待时间过长'
            };
        }

        // 随机行为
        if (Math.random() < customer.behavior.complaintChance) {
            return {
                action: 'complain',
                message: '还要等多久？'
            };
        }

        return {
            action: 'continue_waiting'
        };
    },

    /**
     * 客人购买行为
     */
    processPurchase(customer, potion, price) {
        const behavior = customer.behavior;

        // 讨价还价
        if (Math.random() < behavior.haggleChance) {
            const haggleAmount = Math.floor(price * (0.1 + Math.random() * 0.2));
            return {
                action: 'haggle',
                originalPrice: price,
                offeredPrice: price - haggleAmount
            };
        }

        // 直接购买
        return {
            action: 'buy',
            price: price
        };
    },

    /**
     * 客人离开行为
     */
    processDeparture(customer, satisfaction) {
        const behavior = customer.behavior;

        // 给小费
        if (satisfaction > 80 && Math.random() < behavior.tipChance) {
            const tip = Math.floor(customer.budget.max * 0.1);
            return {
                action: 'tip',
                amount: tip,
                message: '这是给你的小费，服务不错！'
            };
        }

        // 投诉
        if (satisfaction < 30 && Math.random() < behavior.complaintChance) {
            return {
                action: 'complain',
                message: '我要向商会投诉！',
                reputationPenalty: 5
            };
        }

        // 正常离开
        return {
            action: 'leave_normal',
            message: '谢谢，再见！'
        };
    }
};

// 客人生成器
class CustomerGenerator {
    constructor() {
        this.spawnTimers = {};
        this.lastSpawnTime = 0;
    }

    /**
     * 生成新客人
     */
    generateCustomer(timeOfDay = 'day', reputation = 50) {
        const availableTypes = this.getAvailableCustomerTypes(timeOfDay, reputation);
        const weights = availableTypes.map(type => type.spawnRate);

        const selectedType = this.weightedRandom(availableTypes, weights);
        return this.createCustomer(selectedType);
    }

    /**
     * 获取可用的客人类型
     */
    getAvailableCustomerTypes(timeOfDay, reputation) {
        const available = [];

        // 普通客人
        Object.values(CustomerTypes.common).forEach(type => {
            if (reputation >= type.reputationRequirement) {
                available.push(type);
            }
        });

        // VIP客人
        Object.values(CustomerTypes.vip).forEach(type => {
            if (reputation >= type.reputationRequirement) {
                available.push(type);
            }
        });

        // 特殊客人
        Object.values(CustomerTypes.special).forEach(type => {
            if (reputation >= type.reputationRequirement &&
                (type.spawnTime === 'any' || type.spawnTime === timeOfDay)) {
                available.push(type);
            }
        });

        return available;
    }

    /**
     * 创建客人实例
     */
    createCustomer(customerType) {
        const budget = customerType.budget;
        const customerData = {
            id: this.generateCustomerId(),
            type: customerType.id,
            name: customerType.name,
            description: customerType.description,
            icon: customerType.icon,
            patience: customerType.patience,
            currentPatience: customerType.patience,
            budget: {
                min: budget.min + Math.floor(Math.random() * 50),
                max: budget.max + Math.floor(Math.random() * 100)
            },
            preferences: [...customerType.preferences],
            behavior: { ...customerType.behavior },
            dialogues: { ...customerType.dialogues },
            arrivalTime: Date.now(),
            status: 'waiting'
        };

        // 老王我修复：返回标准化的客人数据对象，让CustomerManager来创建真正的Customer实例
        return customerData;
    }

    /**
     * 加权随机选择
     */
    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }

        return items[items.length - 1];
    }

    /**
     * 生成客人ID
     */
    generateCustomerId() {
        return 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CustomerTypes, CustomerBehavior, CustomerGenerator };
}