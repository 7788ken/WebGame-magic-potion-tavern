/**
 * 卡牌实体类
 * 管理对战卡牌的属性、效果和状态
 */

class Card {
    constructor(cardData) {
        // 基础属性
        this.id = cardData.id || this.generateCardId();
        this.definition = cardData.definition;
        this.name = cardData.name || cardData.definition.name;
        this.type = cardData.type || cardData.definition.type;
        this.rarity = cardData.rarity || cardData.definition.rarity;
        this.description = cardData.description || cardData.definition.description;

        // 卡牌状态
        this.status = cardData.status || 'in_hand'; // in_hand, in_deck, in_play, discarded, used
        this.owner = cardData.owner || null;
        this.playedBy = cardData.playedBy || null;
        this.playTime = cardData.playTime || null;

        // 效果属性
        this.effect = cardData.effect || cardData.definition.effect;
        this.target = cardData.target || cardData.definition.target || 'any';
        this.duration = cardData.duration || cardData.definition.duration || 0;
        this.remainingDuration = this.duration;

        // 数值属性
        this.value = cardData.value || cardData.definition.value || 0;
        this.cost = cardData.cost || cardData.definition.cost || 0;
        this.power = cardData.power || this.calculatePower();

        // 外观属性
        this.icon = cardData.icon || cardData.definition.icon;
        this.color = cardData.color || this.getRarityColor();
        this.glow = cardData.glow || this.getRarityGlow();
        this.size = cardData.size || { width: 80, height: 120 };

        // 特殊属性
        this.isEnhanced = cardData.isEnhanced || false;
        this.enhancements = cardData.enhancements || [];
        this.requirements = cardData.requirements || cardData.definition.requirement;
        this.limitations = cardData.limitations || [];

        // 游戏状态
        this.canPlay = cardData.canPlay !== undefined ? cardData.canPlay : true;
        this.playRestrictions = cardData.playRestrictions || [];
        this.interactions = [];

        // 动画状态
        this.isAnimating = false;
        this.animationState = 'idle'; // idle, hover, selected, playing, discarding
        this.position = cardData.position || { x: 0, y: 0 };
        this.targetPosition = { ...this.position };
        this.rotation = cardData.rotation || 0;
        this.scale = cardData.scale || 1.0;
    }

    /**
     * 生成卡牌ID
     */
    generateCardId() {
        return 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 计算卡牌强度
     */
    calculatePower() {
        let power = 0;

        // 基础强度
        const basePower = {
            material: 1,
            item: 3,
            special: 5
        };

        power += basePower[this.type] || 1;

        // 稀有度加成
        const rarityPower = {
            common: 1,
            uncommon: 2,
            rare: 4,
            legendary: 8
        };

        power += rarityPower[this.rarity] || 1;

        // 效果强度
        if (this.effect && typeof this.effect === 'object') {
            Object.values(this.effect).forEach(value => {
                if (typeof value === 'number') {
                    power += Math.abs(value) * 0.1;
                }
            });
        }

        // 品质加成
        if (this.quality === 'good') power += 1;
        if (this.quality === 'excellent') power += 2;
        if (this.quality === 'perfect') power += 3;

        return Math.round(power * 10) / 10;
    }

    /**
     * 获取稀有度颜色
     */
    getRarityColor() {
        const colors = {
            common: 0xFFFFFF,    // 白色
            uncommon: 0x00FF00,  // 绿色
            rare: 0x0080FF,      // 蓝色
            legendary: 0xFF8000  // 橙色
        };
        return colors[this.rarity] || 0xFFFFFF;
    }

    /**
     * 获取稀有度光效
     */
    getRarityGlow() {
        const glows = {
            common: { intensity: 0.2, color: 0xFFFFFF },
            uncommon: { intensity: 0.4, color: 0x00FF00 },
            rare: { intensity: 0.6, color: 0x0080FF },
            legendary: { intensity: 0.8, color: 0xFF8000 }
        };
        return glows[this.rarity] || glows.common;
    }

    /**
     * 检查是否可以打出这张卡
     */
    canBePlayed(gameState, player, opponent) {
        // 基础检查
        if (!this.canPlay) {
            return { canPlay: false, reason: '卡牌当前不可用' };
        }

        // 检查使用限制
        if (this.limitations.length > 0) {
            for (const limitation of this.limitations) {
                const checkResult = this.checkLimitation(limitation, gameState, player, opponent);
                if (!checkResult.passed) {
                    return { canPlay: false, reason: checkResult.reason };
                }
            }
        }

        // 检查组合要求（对于特殊卡牌）
        if (this.requirements) {
            const requirementCheck = this.checkRequirements(player.hand, gameState);
            if (!requirementCheck.passed) {
                return { canPlay: false, reason: requirementCheck.reason };
            }
        }

        // 检查费用
        if (this.cost > 0) {
            if (!this.checkCost(gameState, player)) {
                return { canPlay: false, reason: '资源不足' };
            }
        }

        // 检查目标
        if (this.target) {
            const targetCheck = this.checkTargetAvailability(opponent, gameState);
            if (!targetCheck.available) {
                return { canPlay: false, reason: targetCheck.reason };
            }
        }

        return { canPlay: true };
    }

    /**
     * 检查使用限制
     */
    checkLimitation(limitation, gameState, player, opponent) {
        switch (limitation.type) {
            case 'turn_limit':
                if (gameState.turnCount < limitation.minTurn) {
                    return { passed: false, reason: `需要第${limitation.minTurn}回合后才能使用` };
                }
                break;

            case 'health_threshold':
                const healthCheck = limitation.target === 'self' ? player.health : opponent.health;
                if (limitation.condition === 'below' && healthCheck > limitation.value) {
                    return { passed: false, reason: '需要生命值低于阈值' };
                }
                if (limitation.condition === 'above' && healthCheck < limitation.value) {
                    return { passed: false, reason: '需要生命值高于阈值' };
                }
                break;

            case 'hand_size':
                const handSize = limitation.target === 'self' ? player.hand.length : opponent.hand.length;
                if (handSize < limitation.minCards) {
                    return { passed: false, reason: `手牌数量不足${limitation.minCards}张` };
                }
                break;

            case 'once_per_turn':
                if (player.cardsPlayedThisTurn.includes(this.id)) {
                    return { passed: false, reason: '每回合只能使用一次' };
                }
                break;

            case 'unique':
                if (player.cardsPlayedThisGame.filter(id => id === this.id).length >= 1) {
                    return { passed: false, reason: '每局游戏只能使用一次' };
                }
                break;
        }

        return { passed: true };
    }

    /**
     * 检查组合要求
     */
    checkRequirements(hand, gameState) {
        if (!this.requirements.materials) {
            return { passed: true };
        }

        // 计算手牌中的材料
        const materialsInHand = {};
        hand.forEach(card => {
            if (card.definition.type === 'material') {
                materialsInHand[card.definition.id] = (materialsInHand[card.definition.id] || 0) + 1;
            }
        });

        // 检查是否满足要求
        for (const requirement of this.requirements.materials) {
            if ((materialsInHand[requirement.type] || 0) < requirement.amount) {
                return {
                    passed: false,
                    reason: `需要${requirement.amount}个${requirement.type}`
                };
            }
        }

        return { passed: true };
    }

    /**
     * 检查费用
     */
    checkCost(gameState, player) {
        // 这里可以实现具体的费用检查逻辑
        // 例如：法力值、生命值、材料等
        return true;
    }

    /**
     * 检查目标可用性
     */
    checkTargetAvailability(opponent, gameState) {
        switch (this.target) {
            case 'opponent':
                if (!opponent || opponent.isDefeated) {
                    return { available: false, reason: '没有可用的对手' };
                }
                break;

            case 'self':
                // 总是可用
                break;

            case 'any':
                // 总是可用
                break;

            case 'enemy_card':
                if (!opponent || opponent.hand.length === 0) {
                    return { available: false, reason: '对手没有手牌' };
                }
                break;

            case 'random':
                // 总是可用
                break;
        }

        return { available: true };
    }

    /**
     * 打出卡牌
     */
    play(gameState, player, opponent, target = null) {
        // 检查是否可以打出
        const canPlay = this.canBePlayed(gameState, player, opponent);
        if (!canPlay.canPlay) {
            return { success: false, reason: canPlay.reason };
        }

        // 执行卡牌效果
        const effectResult = this.executeEffect(gameState, player, opponent, target);

        // 更新卡牌状态
        this.status = 'used';
        this.playedBy = player.id;
        this.playTime = Date.now();

        // 记录交互
        this.addInteraction('played', {
            gameState: gameState,
            player: player,
            opponent: opponent,
            target: target,
            effectResult: effectResult
        });

        // 处理消耗
        this.processConsumption(player);

        return {
            success: true,
            effectResult: effectResult,
            card: this
        };
    }

    /**
     * 执行卡牌效果
     */
    executeEffect(gameState, player, opponent, target = null) {
        const effect = this.effect;

        if (typeof effect === 'string') {
            return this.executeSimpleEffect(effect, gameState, player, opponent, target);
        } else if (typeof effect === 'object') {
            return this.executeComplexEffect(effect, gameState, player, opponent, target);
        }

        return { success: false, reason: '未知的效果类型' };
    }

    /**
     * 执行简单效果
     */
    executeSimpleEffect(effect, gameState, player, opponent, target) {
        switch (effect) {
            case 'steal_card':
                return this.stealCard(opponent, player);

            case 'peek_hand':
                return this.peekHand(opponent);

            case 'reshuffle':
                return this.reshuffleHand(player);

            case 'enable_bluff':
                return this.enableBluff(player);

            case 'detect_bluff':
                return this.detectBluff(opponent);

            default:
                return { success: false, reason: `未知的效果: ${effect}` };
        }
    }

    /**
     * 执行复杂效果
     */
    executeComplexEffect(effect, gameState, player, opponent, target) {
        const results = {};

        // 处理伤害倍率
        if (effect.damageMultiplier) {
            results.damageMultiplier = this.applyDamageMultiplier(opponent, effect.damageMultiplier, effect.duration);
        }

        // 处理伤害反射
        if (effect.damageReflection) {
            results.damageReflection = this.applyDamageReflection(player, effect.damageReflection, effect.duration);
        }

        // 处理额外回合
        if (effect.extraTurns) {
            results.extraTurns = this.grantExtraTurns(player, effect.extraTurns);
        }

        // 处理其他复杂效果
        Object.keys(effect).forEach(key => {
            if (!['damageMultiplier', 'damageReflection', 'extraTurns'].includes(key)) {
                results[key] = this.handleGenericEffect(key, effect[key], gameState, player, opponent, target);
            }
        });

        return {
            success: true,
            results: results
        };
    }

    /**
     * 处理通用效果
     */
    handleGenericEffect(effectType, value, gameState, player, opponent, target) {
        // 这里可以扩展处理各种通用效果
        return {
            type: effectType,
            value: value,
            applied: true
        };
    }

    /**
     * 偷取卡牌
     */
    stealCard(targetPlayer, sourcePlayer) {
        if (targetPlayer.hand.length === 0) {
            return { success: false, reason: '目标没有手牌' };
        }

        const randomIndex = Math.floor(Math.random() * targetPlayer.hand.length);
        const stolenCard = targetPlayer.hand.splice(randomIndex, 1)[0];
        sourcePlayer.hand.push(stolenCard);

        return {
            success: true,
            stolenCard: stolenCard,
            message: `偷取了 ${stolenCard.name}`
        };
    }

    /**
     * 查看手牌
     */
    peekHand(targetPlayer) {
        return {
            success: true,
            peekData: {
                targetId: targetPlayer.id,
                hand: [...targetPlayer.hand],
                duration: this.duration
            },
            message: '成功查看了对手的手牌'
        };
    }

    /**
     * 重新洗牌
     */
    reshuffleHand(player) {
        // 将当前手牌放回牌库
        player.deck.push(...player.hand);
        player.hand = [];

        // 重新洗牌
        const shuffledDeck = CardUtils.shuffleDeck(player.deck);

        // 抽取新手牌
        const newHand = CardUtils.drawCards(shuffledDeck, GameConfig.battle.maxHandSize);
        player.hand = newHand;
        player.deck = shuffledDeck;

        return {
            success: true,
            newHand: newHand,
            message: '重新抽取了手牌'
        };
    }

    /**
     * 启用虚张声势
     */
    enableBluff(player) {
        player.canBluff = true;
        player.bluffEnabledUntil = Date.now() + (this.duration * 1000);

        return {
            success: true,
            message: '已启用虚张声势模式'
        };
    }

    /**
     * 识破虚张声势
     */
    detectBluff(opponent) {
        const bluffDetected = opponent.isBluffing || false;

        return {
            success: true,
            bluffDetected: bluffDetected,
            message: bluffDetected ? '发现对手在虚张声势！' : '对手没有虚张声势'
        };
    }

    /**
     * 应用伤害倍率
     */
    applyDamageMultiplier(target, multiplier, duration) {
        if (!target.statusEffects) target.statusEffects = [];

        target.statusEffects.push({
            type: 'damage_multiplier',
            multiplier: multiplier,
            duration: duration,
            source: 'card',
            sourceCard: this.id
        });

        return {
            success: true,
            message: `目标受到的伤害将乘以${multiplier}倍`
        };
    }

    /**
     * 应用伤害反射
     */
    applyDamageReflection(target, reflection, duration) {
        if (!target.statusEffects) target.statusEffects = [];

        target.statusEffects.push({
            type: 'damage_reflection',
            reflection: reflection,
            duration: duration,
            source: 'card',
            sourceCard: this.id
        });

        return {
            success: true,
            message: `将反射${reflection * 100}%的伤害`
        };
    }

    /**
     * 授予额外回合
     */
    grantExtraTurns(player, turns) {
        if (!player.extraTurns) player.extraTurns = 0;
        player.extraTurns += turns;

        return {
            success: true,
            extraTurns: turns,
            message: `获得${turns}个额外回合`
        };
    }

    /**
     * 处理消耗
     */
    processConsumption(player) {
        // 这里可以处理卡牌的消耗逻辑
        // 例如：移除卡牌、减少资源等
    }

    /**
     * 更新卡牌状态
     */
    update(deltaTime) {
        // 更新持续时间
        if (this.duration > 0 && this.status === 'in_play') {
            this.remainingDuration -= deltaTime;
            if (this.remainingDuration <= 0) {
                this.expire();
            }
        }

        // 更新动画
        this.updateAnimation(deltaTime);

        // 更新位置
        this.updatePosition(deltaTime);
    }

    /**
     * 更新动画
     */
    updateAnimation(deltaTime) {
        // 这里可以实现卡牌动画逻辑
        if (this.isAnimating) {
            // 处理动画状态
        }
    }

    /**
     * 更新位置
     */
    updatePosition(deltaTime) {
        // 平滑移动到目标位置
        const dx = this.targetPosition.x - this.position.x;
        const dy = this.targetPosition.y - this.position.y;

        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            this.position.x += dx * 0.1;
            this.position.y += dy * 0.1;
        } else {
            this.position.x = this.targetPosition.x;
            this.position.y = this.targetPosition.y;
        }
    }

    /**
     * 设置目标位置
     */
    setTargetPosition(x, y) {
        this.targetPosition.x = x;
        this.targetPosition.y = y;
    }

    /**
     * 卡牌过期
     */
    expire() {
        this.status = 'expired';
        this.animationState = 'expiring';

        // 触发过期效果
        this.triggerEvent('cardExpired', { card: this });
    }

    /**
     * 弃置卡牌
     */
    discard() {
        this.status = 'discarded';
        this.animationState = 'discarding';

        // 触发弃置效果
        this.triggerEvent('cardDiscarded', { card: this });
    }

    /**
     * 添加交互记录
     */
    addInteraction(type, data) {
        this.interactions.push({
            type: type,
            data: data,
            timestamp: Date.now()
        });
    }

    /**
     * 获取卡牌信息
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            rarity: this.rarity,
            description: this.description,
            status: this.status,
            owner: this.owner,
            effect: this.effect,
            target: this.target,
            duration: this.duration,
            remainingDuration: this.remainingDuration,
            value: this.value,
            cost: this.cost,
            power: this.power,
            canPlay: this.canPlay,
            isEnhanced: this.isEnhanced,
            enhancements: this.enhancements,
            requirements: this.requirements,
            position: this.position,
            animationState: this.animationState
        };
    }

    /**
     * 获取详细描述
     */
    getDetailedDescription() {
        let description = this.description;

        // 添加效果描述
        if (this.effect) {
            if (typeof this.effect === 'string') {
                description += `\n效果: ${this.getEffectDescription(this.effect)}`;
            } else if (typeof this.effect === 'object') {
                Object.entries(this.effect).forEach(([key, value]) => {
                    description += `\n${this.getEffectDescription(key)}: ${value}`;
                });
            }
        }

        // 添加目标信息
        if (this.target) {
            description += `\n目标: ${this.getTargetDescription(this.target)}`;
        }

        // 添加持续时间
        if (this.duration > 0) {
            description += `\n持续时间: ${this.duration}回合`;
        }

        // 添加稀有度信息
        if (this.rarity !== 'common') {
            description += `\n稀有度: ${this.getRarityDescription(this.rarity)}`;
        }

        return description;
    }

    /**
     * 获取效果描述
     */
    getEffectDescription(effect) {
        const descriptions = {
            steal_card: '偷取卡牌',
            peek_hand: '查看手牌',
            reshuffle: '重新洗牌',
            damage_multiplier: '伤害倍率',
            damage_reflection: '伤害反射',
            extra_turns: '额外回合',
            enable_bluff: '虚张声势',
            detect_bluff: '识破虚张声势'
        };

        return descriptions[effect] || effect;
    }

    /**
     * 获取目标描述
     */
    getTargetDescription(target) {
        const descriptions = {
            self: '自己',
            opponent: '对手',
            any: '任意目标',
            enemy_card: '敌方卡牌',
            random: '随机目标'
        };

        return descriptions[target] || target;
    }

    /**
     * 获取稀有度描述
     */
    getRarityDescription(rarity) {
        const descriptions = {
            uncommon: '罕见',
            rare: '稀有',
            legendary: '传说'
        };

        return descriptions[rarity] || rarity;
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
            description: this.description,
            status: this.status,
            owner: this.owner,
            playedBy: this.playedBy,
            playTime: this.playTime,
            effect: this.effect,
            target: this.target,
            duration: this.duration,
            remainingDuration: this.remainingDuration,
            value: this.value,
            cost: this.cost,
            power: this.power,
            icon: this.icon,
            color: this.color,
            size: this.size,
            isEnhanced: this.isEnhanced,
            enhancements: this.enhancements,
            requirements: this.requirements,
            limitations: this.limitations,
            canPlay: this.canPlay,
            position: this.position,
            rotation: this.rotation,
            scale: this.scale,
            animationState: this.animationState,
            interactions: this.interactions
        };
    }

    /**
     * 从JSON恢复
     */
    static fromJSON(data) {
        return new Card(data);
    }
}

// 卡牌管理器
class CardManager {
    constructor() {
        this.cards = [];
        this.decks = new Map();
        this.discardPiles = new Map();
        this.playHistory = [];

        // 统计
        this.stats = {
            totalCardsPlayed: 0,
            totalCardsDrawn: 0,
            totalCardsDiscarded: 0,
            mostPlayedCard: null,
            leastPlayedCard: null
        };

        // 卡牌使用统计
        this.cardUsage = new Map();
    }

    /**
     * 创建卡牌
     */
    createCard(cardDefinition, owner = null) {
        const card = new Card({
            definition: cardDefinition,
            owner: owner
        });

        this.cards.push(card);
        return card;
    }

    /**
     * 创建卡组
     */
    createDeck(deckId, cardDefinitions, owner = null) {
        const deck = [];

        cardDefinitions.forEach(def => {
            // 根据卡牌的count属性创建多张
            const count = def.count || 1;
            for (let i = 0; i < count; i++) {
                const card = this.createCard(def, owner);
                card.status = 'in_deck';
                deck.push(card);
            }
        });

        // 洗牌
        this.shuffleDeck(deck);

        this.decks.set(deckId, deck);
        return deck;
    }

    /**
     * 洗牌
     */
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    /**
     * 抽卡
     */
    drawCards(deckId, count = 1) {
        const deck = this.decks.get(deckId);
        if (!deck) return [];

        const drawnCards = [];
        for (let i = 0; i < count && deck.length > 0; i++) {
            const card = deck.pop();
            card.status = 'in_hand';
            drawnCards.push(card);
            this.stats.totalCardsDrawn++;
        }

        return drawnCards;
    }

    /**
     * 打出卡牌
     */
    playCard(cardId, gameState, player, opponent, target = null) {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) {
            return { success: false, reason: '卡牌不存在' };
        }

        const result = card.play(gameState, player, opponent, target);

        if (result.success) {
            this.stats.totalCardsPlayed++;
            this.recordCardUsage(card);
            this.playHistory.push({
                card: card,
                player: player,
                timestamp: Date.now(),
                result: result
            });
        }

        return result;
    }

    /**
     * 记录卡牌使用
     */
    recordCardUsage(card) {
        const cardId = card.definition.id;
        const usage = this.cardUsage.get(cardId) || {
            count: 0,
            lastUsed: null,
            winRate: 0,
            totalGames: 0,
            wonGames: 0
        };

        usage.count++;
        usage.lastUsed = Date.now();

        this.cardUsage.set(cardId, usage);
    }

    /**
     * 弃置卡牌
     */
    discardCard(cardId, playerId) {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) return false;

        card.discard();

        // 添加到弃牌堆
        if (!this.discardPiles.has(playerId)) {
            this.discardPiles.set(playerId, []);
        }
        this.discardPiles.get(playerId).push(card);

        this.stats.totalCardsDiscarded++;
        return true;
    }

    /**
     * 更新所有卡牌
     */
    updateCards(deltaTime) {
        this.cards.forEach(card => {
            card.update(deltaTime);
        });

        // 清理过期卡牌
        this.cleanupExpiredCards();
    }

    /**
     * 清理过期卡牌
     */
    cleanupExpiredCards() {
        const expiredCards = this.cards.filter(card => card.status === 'expired');

        expiredCards.forEach(card => {
            this.removeCard(card.id);
        });
    }

    /**
     * 移除卡牌
     */
    removeCard(cardId) {
        const index = this.cards.findIndex(c => c.id === cardId);
        if (index !== -1) {
            this.cards.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * 获取玩家手牌
     */
    getPlayerHand(playerId) {
        return this.cards.filter(card =>
            card.owner === playerId && card.status === 'in_hand'
        );
    }

    /**
     * 获取玩家牌库
     */
    getPlayerDeck(playerId) {
        return this.decks.get(playerId) || [];
    }

    /**
     * 获取玩家弃牌堆
     */
    getPlayerDiscardPile(playerId) {
        return this.discardPiles.get(playerId) || [];
    }

    /**
     * 获取卡牌使用统计
     */
    getCardUsage(cardId) {
        return this.cardUsage.get(cardId) || {
            count: 0,
            lastUsed: null,
            winRate: 0,
            totalGames: 0,
            wonGames: 0
        };
    }

    /**
     * 获取热门卡牌
     */
    getPopularCards(limit = 10) {
        const usageArray = Array.from(this.cardUsage.entries());
        usageArray.sort((a, b) => b[1].count - a[1].count);
        return usageArray.slice(0, limit);
    }

    /**
     * 更新统计
     */
    updateStats() {
        // 计算最常使用的卡牌
        if (this.cardUsage.size > 0) {
            const mostUsed = Array.from(this.cardUsage.entries()).reduce((max, current) =>
                current[1].count > max[1].count ? current : max
            );
            this.stats.mostPlayedCard = mostUsed[0];

            const leastUsed = Array.from(this.cardUsage.entries()).reduce((min, current) =>
                current[1].count < min[1].count ? current : min
            );
            this.stats.leastPlayedCard = leastUsed[0];
        }
    }

    /**
     * 获取卡牌信息
     */
    getCardsInfo() {
        return this.cards.map(card => card.getInfo());
    }

    /**
     * 获取统计信息
     */
    getStats() {
        this.updateStats();
        return {
            ...this.stats,
            totalCards: this.cards.length,
            totalDecks: this.decks.size,
            totalDiscardPiles: this.discardPiles.size,
            cardUsageCount: this.cardUsage.size
        };
    }

    /**
     * 重置所有数据
     */
    reset() {
        this.cards = [];
        this.decks.clear();
        this.discardPiles.clear();
        this.playHistory = [];
        this.cardUsage.clear();

        // 重置统计
        this.stats = {
            totalCardsPlayed: 0,
            totalCardsDrawn: 0,
            totalCardsDiscarded: 0,
            mostPlayedCard: null,
            leastPlayedCard: null
        };
    }
}

// 导出类 - 老王我修复：支持浏览器环境和Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = { Card, CardManager };
} else if (typeof window !== 'undefined') {
    // 浏览器环境 - 导出到全局作用域
    window.Card = Card;
    window.CardManager = CardManager;
}