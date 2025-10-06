/**
 * 魔药对战卡牌数据定义
 * 包含所有对战卡牌的定义和效果
 */

const CardDefinitions = {
    // 材料卡 - 每回合抽取
    materials: {
        // 基础材料卡
        moonGrass: {
            id: 'moonGrass',
            name: '月光草',
            type: 'material',
            rarity: 'common',
            icon: 'card_moon_grass',
            description: '基础治疗材料',
            count: 3,
            effect: '可用于制作治疗类魔药'
        },

        fireGrass: {
            id: 'fireGrass',
            name: '火焰草',
            type: 'material',
            rarity: 'common',
            icon: 'card_fire_grass',
            description: '基础攻击材料',
            count: 3,
            effect: '可用于制作攻击类魔药'
        },

        dewDrop: {
            id: 'dewDrop',
            name: '晨露',
            type: 'material',
            rarity: 'common',
            icon: 'card_dew_drop',
            description: '基础辅助材料',
            count: 4,
            effect: '可用于制作各种魔药'
        },

        springWater: {
            id: 'springWater',
            name: '泉水',
            type: 'material',
            rarity: 'common',
            icon: 'card_spring_water',
            description: '基础稀释材料',
            count: 5,
            effect: '制作魔药的基础材料'
        },

        // 稀有材料卡
        dragonScale: {
            id: 'dragonScale',
            name: '龙鳞',
            type: 'material',
            rarity: 'rare',
            icon: 'card_dragon_scale',
            description: '稀有强力材料',
            count: 2,
            effect: '制作高级攻击魔药'
        },

        phoenixFeather: {
            id: 'phoenixFeather',
            name: '凤凰羽毛',
            type: 'material',
            rarity: 'rare',
            icon: 'card_phoenix_feather',
            description: '稀有重生材料',
            count: 2,
            effect: '制作高级治疗魔药'
        },

        demonBlood: {
            id: 'demonBlood',
            name: '恶魔之血',
            type: 'material',
            rarity: 'rare',
            icon: 'card_demon_blood',
            description: '稀有诅咒材料',
            count: 1,
            effect: '制作毒系和控制魔药'
        },

        unicornHorn: {
            id: 'unicornHorn',
            name: '独角兽角',
            type: 'material',
            rarity: 'rare',
            icon: 'card_unicorn_horn',
            description: '稀有净化材料',
            count: 1,
            effect: '制作防护和净化魔药'
        },

        // 传说材料卡
        timeSand: {
            id: 'timeSand',
            name: '时间砂',
            type: 'material',
            rarity: 'legendary',
            icon: 'card_time_sand',
            description: '传说时间材料',
            count: 1,
            effect: '制作控制类魔药'
        },

        soulFragment: {
            id: 'soulFragment',
            name: '灵魂碎片',
            type: 'material',
            rarity: 'legendary',
            icon: 'card_soul_fragment',
            description: '传说灵魂材料',
            count: 1,
            effect: '制作特殊效果魔药'
        },

        eternalFlower: {
            id: 'eternalFlower',
            name: '永恒之花',
            type: 'material',
            rarity: 'legendary',
            icon: 'card_eternal_flower',
            description: '传说永恒材料',
            count: 1,
            effect: '制作最强魔药'
        }
    },

    // 道具卡 - 特殊效果
    items: {
        // 基础道具
        steal: {
            id: 'steal',
            name: '妙手空空',
            type: 'item',
            rarity: 'common',
            icon: 'card_steal',
            description: '随机抽取对方一张手牌',
            count: 2,
            effect: 'steal_card',
            target: 'opponent'
        },

        peek: {
            id: 'peek',
            name: '透视之眼',
            type: 'item',
            rarity: 'common',
            icon: 'card_peek',
            description: '查看对方手牌3秒',
            count: 2,
            effect: 'peek_hand',
            duration: 3000,
            target: 'opponent'
        },

        shuffle: {
            id: 'shuffle',
            name: '重新洗牌',
            type: 'item',
            rarity: 'common',
            icon: 'card_shuffle',
            description: '弃掉当前手牌，重新抽取5张',
            count: 1,
            effect: 'reshuffle',
            target: 'self'
        },

        trap: {
            id: 'trap',
            name: '陷阱卡',
            type: 'item',
            rarity: 'uncommon',
            icon: 'card_trap',
            description: '对方下回合受到伤害翻倍',
            count: 1,
            effect: 'damage_multiplier',
            multiplier: 2,
            duration: 1,
            target: 'opponent'
        },

        // 高级道具
        counter: {
            id: 'counter',
            name: '反击',
            type: 'item',
            rarity: 'rare',
            icon: 'card_counter',
            description: '反弹下回合50%伤害',
            count: 1,
            effect: 'damage_reflection',
            reflection: 0.5,
            duration: 1,
            target: 'self'
        },

        timeStop: {
            id: 'timeStop',
            name: '时间停止',
            type: 'item',
            rarity: 'legendary',
            icon: 'card_time_stop',
            description: '额外获得一个回合',
            count: 1,
            effect: 'extra_turn',
            value: 1,
            target: 'self'
        },

        // 骗子酒馆特殊道具
        bluff: {
            id: 'bluff',
            name: '虚张声势',
            type: 'item',
            rarity: 'uncommon',
            icon: 'card_bluff',
            description: '可以打出虚假的材料组合',
            count: 1,
            effect: 'enable_bluff',
            duration: 1,
            target: 'self'
        },

        detect: {
            id: 'detect',
            name: '识破',
            type: 'item',
            rarity: 'uncommon',
            icon: 'card_detect',
            description: '识破对方的虚张声势',
            count: 1,
            effect: 'detect_bluff',
            target: 'opponent'
        }
    },

    // 特殊卡牌 - 组合效果
    specials: {
        // 组合攻击
        fireStorm: {
            id: 'fireStorm',
            name: '火焰风暴',
            type: 'special',
            rarity: 'rare',
            icon: 'card_fire_storm',
            description: '需要3个火焰草，造成60点火焰伤害',
            requirement: {
                materials: [{ type: 'fireGrass', amount: 3 }]
            },
            effect: {
                damage: 60,
                type: 'fire',
                aoe: true
            },
            price: 0 // 不能直接使用，需要组合
        },

        // 组合防御
        holyShield: {
            id: 'holyShield',
            name: '神圣护盾',
            type: 'special',
            rarity: 'rare',
            icon: 'card_holy_shield',
            description: '需要独角兽角+凤凰羽毛，生成100点护盾',
            requirement: {
                materials: [
                    { type: 'unicornHorn', amount: 1 },
                    { type: 'phoenixFeather', amount: 1 }
                ]
            },
            effect: {
                shield: 100,
                duration: 3,
                holy: true
            },
            price: 0
        },

        // 组合控制
        soulBind: {
            id: 'soulBind',
            name: '灵魂束缚',
            type: 'special',
            rarity: 'legendary',
            icon: 'card_soul_bind',
            description: '需要灵魂碎片+恶魔之血，封印对方2回合',
            requirement: {
                materials: [
                    { type: 'soulFragment', amount: 1 },
                    { type: 'demonBlood', amount: 1 }
                ]
            },
            effect: {
                seal: true,
                duration: 2
            },
            price: 0
        }
    }
};

// 卡牌工具类
const CardUtils = {
    /**
     * 创建一副完整的卡牌
     */
    createFullDeck() {
        const deck = [];

        // 添加材料卡
        Object.values(CardDefinitions.materials).forEach(cardDef => {
            for (let i = 0; i < cardDef.count; i++) {
                deck.push(this.createCard(cardDef));
            }
        });

        // 添加道具卡
        Object.values(CardDefinitions.items).forEach(cardDef => {
            for (let i = 0; i < cardDef.count; i++) {
                deck.push(this.createCard(cardDef));
            }
        });

        return this.shuffleDeck(deck);
    },

    /**
     * 创建单张卡牌
     */
    createCard(cardDef) {
        return {
            id: this.generateCardId(),
            definition: cardDef,
            name: cardDef.name,
            type: cardDef.type,
            rarity: cardDef.rarity,
            description: cardDef.description,
            used: false,
            created: Date.now()
        };
    },

    /**
     * 洗牌
     */
    shuffleDeck(deck) {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * 生成唯一卡牌ID
     */
    generateCardId() {
        return 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * 从牌堆抽牌
     */
    drawCards(deck, count) {
        return deck.splice(0, Math.min(count, deck.length));
    },

    /**
     * 获取卡牌的稀有度颜色
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
     * 检查是否可以打出特殊组合
     */
    canPlaySpecialCombination(hand, specialCard) {
        if (!specialCard.requirement || !specialCard.requirement.materials) {
            return false;
        }

        const materialsInHand = {};
        hand.forEach(card => {
            if (card.definition.type === 'material') {
                materialsInHand[card.definition.id] = (materialsInHand[card.definition.id] || 0) + 1;
            }
        });

        return specialCard.requirement.materials.every(req => {
            return materialsInHand[req.type] >= req.amount;
        });
    },

    /**
     * 执行卡牌效果
     */
    executeCardEffect(card, target, game) {
        const effect = card.definition.effect;

        switch (effect) {
            case 'steal_card':
                return this.stealCard(target, game);
            case 'peek_hand':
                return this.peekHand(target, effect.duration);
            case 'reshuffle':
                return this.reshuffleHand(game);
            case 'damage_multiplier':
                return this.applyDamageMultiplier(target, effect.multiplier, effect.duration);
            case 'damage_reflection':
                return this.applyDamageReflection(target, effect.reflection, effect.duration);
            case 'extra_turn':
                return this.grantExtraTurn(target, effect.value);
            case 'enable_bluff':
                return this.enableBluff(target);
            case 'detect_bluff':
                return this.detectBluff(target);
            default:
                console.warn(`Unknown card effect: ${effect}`);
                return false;
        }
    },

    // 具体的卡牌效果实现
    stealCard(target, game) {
        if (target.hand.length > 0) {
            const stolenCard = target.hand.splice(Math.floor(Math.random() * target.hand.length), 1)[0];
            game.currentPlayer.hand.push(stolenCard);
            return { success: true, stolenCard: stolenCard };
        }
        return { success: false, reason: '目标没有手牌' };
    },

    peekHand(target, duration) {
        // 这个效果需要UI支持，返回peek信息
        return {
            success: true,
            peekData: {
                targetId: target.id,
                hand: [...target.hand],
                duration: duration
            }
        };
    },

    reshuffleHand(game) {
        const currentPlayer = game.currentPlayer;
        const deck = currentPlayer.deck;

        // 将手牌放回牌库
        deck.push(...currentPlayer.hand);
        currentPlayer.hand = [];

        // 重新洗牌
        const shuffledDeck = this.shuffleDeck(deck);

        // 抽5张新牌
        const newHand = this.drawCards(shuffledDeck, 5);
        currentPlayer.hand = newHand;
        currentPlayer.deck = shuffledDeck;

        return { success: true, newHand: newHand };
    },

    applyDamageMultiplier(target, multiplier, duration) {
        if (!target.statusEffects) target.statusEffects = [];
        target.statusEffects.push({
            type: 'damage_multiplier',
            multiplier: multiplier,
            duration: duration,
            source: 'card'
        });
        return { success: true };
    },

    applyDamageReflection(target, reflection, duration) {
        if (!target.statusEffects) target.statusEffects = [];
        target.statusEffects.push({
            type: 'damage_reflection',
            reflection: reflection,
            duration: duration,
            source: 'card'
        });
        return { success: true };
    },

    grantExtraTurn(target, turns) {
        if (!target.extraTurns) target.extraTurns = 0;
        target.extraTurns += turns;
        return { success: true, extraTurns: turns };
    },

    enableBluff(target) {
        target.canBluff = true;
        return { success: true };
    },

    detectBluff(target) {
        return {
            success: true,
            bluffDetection: {
                targetId: target.id,
                active: target.isBluffing || false
            }
        };
    }
};

// 对战游戏状态类
class BattleGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.turnCount = 0;
        this.phase = 'setup'; // setup, playing, finished
        this.winner = null;
        this.battleLog = [];
    }

    initialize(player1Data, player2Data) {
        // 创建玩家对象
        this.players = [
            this.createPlayer(player1Data, 1),
            this.createPlayer(player2Data, 2)
        ];

        this.phase = 'playing';
        this.currentPlayerIndex = 0;
        this.turnCount = 1;
    }

    createPlayer(data, id) {
        const deck = CardUtils.createFullDeck();
        const hand = CardUtils.drawCards(deck, GameConfig.battle.maxHandSize);

        return {
            id: id,
            name: data.name || `玩家${id}`,
            maxHealth: GameConfig.battle.maxHealth,
            currentHealth: GameConfig.battle.maxHealth,
            hand: hand,
            deck: deck,
            discardPile: [],
            materials: {},
            statusEffects: [],
            extraTurns: 0,
            canBluff: false,
            isBluffing: false
        };
    }

    get currentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    get opponent() {
        return this.players[1 - this.currentPlayerIndex];
    }

    nextTurn() {
        this.turnCount++;

        // 处理额外回合
        if (this.currentPlayer.extraTurns > 0) {
            this.currentPlayer.extraTurns--;
            return; // 继续当前玩家的回合
        }

        // 切换到下一个玩家
        this.currentPlayerIndex = 1 - this.currentPlayerIndex;

        // 新回合开始
        this.startTurn();
    }

    startTurn() {
        const player = this.currentPlayer;

        // 抽卡
        const drawCount = GameConfig.battle.baseDrawCount;
        const newCards = CardUtils.drawCards(player.deck, drawCount);
        player.hand.push(...newCards);

        // 抽材料
        this.drawMaterials(player);

        // 重置状态
        player.canBluff = false;
        player.isBluffing = false;

        // 处理状态效果
        this.processStatusEffects(player);
    }

    drawMaterials(player) {
        // 这里需要根据材料系统实现具体的材料抽取逻辑
        const materialCount = GameConfig.battle.materialDrawCount;
        // 简化实现：随机给一些基础材料
        for (let i = 0; i < materialCount; i++) {
            const materials = ['moonGrass', 'fireGrass', 'dewDrop', 'springWater'];
            const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
            player.materials[randomMaterial] = (player.materials[randomMaterial] || 0) + 1;
        }
    }

    processStatusEffects(player) {
        if (!player.statusEffects) return;

        player.statusEffects = player.statusEffects.filter(effect => {
            effect.duration--;
            return effect.duration > 0;
        });
    }

    addBattleLog(message) {
        this.battleLog.push({
            turn: this.turnCount,
            player: this.currentPlayer.name,
            message: message,
            timestamp: Date.now()
        });
    }
}

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CardDefinitions, CardUtils, BattleGame };
}