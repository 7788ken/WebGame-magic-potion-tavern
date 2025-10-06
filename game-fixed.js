// 游戏状态
let gameState = {
    gold: 500,
    level: 1,
    rank: '新手',
    day: 1,
    materials: {},
    potions: {},
    recipes: ['healing', 'fire', 'paralysis'],
    staff: ['apprentice'],
    unlockedRecipes: ['healing'],
    battleStats: {
        wins: 0,
        losses: 0,
        rank: '新手',
        stars: 0
    },
    currentBattle: null,
    materialPool: [],
    craftingQueue: [],
    isCrafting: false,
    autoCraftSettings: {},
    craftSpeed: 1
};

// 游戏配置
const GAME_CONFIG = {
    materials: {
        moongrass: { name: '月光草', emoji: '🌙', cost: 5, rarity: 'common' },
        dewdrop: { name: '露珠', emoji: '💧', cost: 8, rarity: 'common' },
        fireflower: { name: '火焰花', emoji: '🔥', cost: 12, rarity: 'common' },
        shadowdust: { name: '暗影粉', emoji: '🌑', cost: 25, rarity: 'rare' },
        stardust: { name: '星辰砂', emoji: '✨', cost: 40, rarity: 'rare' },
        magicgrass: { name: '魔法草', emoji: '🌿', cost: 15, rarity: 'common' },
        thundergrass: { name: '雷电草', emoji: '⚡', cost: 20, rarity: 'uncommon' },
        icecrystal: { name: '冰晶花', emoji: '❄️', cost: 18, rarity: 'uncommon' },
        poisonmushroom: { name: '毒蘑菇', emoji: '☠️', cost: 30, rarity: 'rare' }
    },
    recipes: {
        healing: {
            name: '治疗药剂',
            emoji: '💚',
            type: 'support',
            materials: { moongrass: 1, dewdrop: 1 },
            effect: '恢复15点血量',
            value: 20,
            unlockCondition: 'start'
        },
        fire: {
            name: '火焰药剂',
            emoji: '🔥',
            type: 'attack',
            materials: { fireflower: 1 },
            effect: '造成12点伤害',
            value: 25,
            unlockCondition: 'start'
        },
        paralysis: {
            name: '麻痹药剂',
            emoji: '⚡',
            type: 'control',
            materials: { thundergrass: 1 },
            effect: '使对方1回合无法行动',
            value: 30,
            unlockCondition: 'start'
        },
        explosion: {
            name: '爆燃药剂',
            emoji: '💥',
            type: 'attack',
            materials: { fireflower: 2 },
            effect: '造成28点伤害',
            value: 50,
            unlockCondition: { sales: 10 }
        },
        shield: {
            name: '护盾药剂',
            emoji: '🛡️',
            type: 'support',
            materials: { magicgrass: 2 },
            effect: '生成25点护盾',
            value: 45,
            unlockCondition: { level: 3 }
        },
        sleep: {
            name: '沉睡药剂',
            emoji: '😴',
            type: 'control',
            materials: { moongrass: 2, dewdrop: 1 },
            effect: '使对方2回合无法行动',
            value: 60,
            unlockCondition: { level: 5 }
        },
        frost: {
            name: '冰霜药剂',
            emoji: '❄️',
            type: 'attack',
            materials: { icecrystal: 1, dewdrop: 1 },
            effect: '造成18点伤害，降低攻击力',
            value: 55,
            unlockCondition: { wins: 5 }
        },
        poison: {
            name: '毒药剂',
            emoji: '☠️',
            type: 'attack',
            materials: { poisonmushroom: 1 },
            effect: '造成10点伤害，持续中毒',
            value: 40,
            unlockCondition: { level: 4 }
        }
    },
    staff: {
        apprentice: {
            name: '学徒莉莉',
            emoji: '👩‍🎓',
            effect: '制作速度+10%',
            cost: 0,
            unlocked: true
        },
        senior: {
            name: '资深药师',
            emoji: '👨‍⚕️',
            effect: '成功率+20%',
            cost: 1000,
            unlocked: false,
            condition: { level: 3 }
        },
        alchemist: {
            name: '炼金术士',
            emoji: '🧙‍♂️',
            effect: '高级配方解锁',
            cost: 3000,
            unlocked: false,
            condition: { level: 7 }
        }
    },
    ranks: ['新手', '青铜', '白银', '黄金', '铂金', '钻石', '大师', '宗师'],
    battleRanks: ['新手', '青铜', '白银', '黄金', '铂金', '钻石', '大师', '宗师']
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    initializeParticles();
    initializeAnimations();
    loadGame();
    updateAllDisplays();
    setCraftSpeed(1); // 默认1倍速
});

// 初始化游戏
function initializeGame() {
    // 初始化材料库存
    Object.keys(GAME_CONFIG.materials).forEach(key => {
        gameState.materials[key] = 0;
    });
    
    // 给初始材料
    gameState.materials.moongrass = 5;
    gameState.materials.dewdrop = 3;
    gameState.materials.fireflower = 2;
    
    // 初始化魔药库存
    Object.keys(GAME_CONFIG.recipes).forEach(key => {
        gameState.potions[key] = 0;
    });
    
    // 初始化材料池
    refreshMaterialPool();
    
    // 初始化界面
    initializeMaterialsShop();
    initializeRecipeSelect();
    updateAllDisplays();
}

// 初始化粒子效果
function initializeParticles() {
    const particleContainer = document.getElementById('particles');
    if (!particleContainer) return;
    
    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        backgroundAlpha: 0
    });
    
    particleContainer.appendChild(app.view);
    
    const particleContainerPixi = new PIXI.Container();
    app.stage.addChild(particleContainerPixi);
    
    const particles = [];
    const particleCount = 30;
    
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xFFD700, 0.4);
    graphics.drawCircle(0, 0, 2);
    graphics.endFill();
    const particleTexture = app.renderer.generateTexture(graphics);
    
    for (let i = 0; i < particleCount; i++) {
        const particle = new PIXI.Sprite(particleTexture);
        particle.x = Math.random() * app.screen.width;
        particle.y = Math.random() * app.screen.height;
        particle.vx = (Math.random() - 0.5) * 0.3;
        particle.vy = (Math.random() - 0.5) * 0.3;
        particle.alpha = Math.random() * 0.5 + 0.2;
        
        particles.push(particle);
        particleContainerPixi.addChild(particle);
    }
    
    app.ticker.add(() => {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0) particle.x = app.screen.width;
            if (particle.x > app.screen.width) particle.x = 0;
            if (particle.y < 0) particle.y = app.screen.height;
            if (particle.y > app.screen.height) particle.y = 0;
        });
    });
    
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });
}

// 初始化动画
function initializeAnimations() {
    // 标签切换动画
    const tabButtons = document.querySelectorAll('.game-tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            anime({
                targets: this,
                scale: [1, 1.05, 1],
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
    });
    
    // 按钮悬停效果
    const buttons = document.querySelectorAll('.game-button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.05,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
        
        button.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
    });
}

// 标签切换
function switchTab(tabName) {
    // 隐藏所有标签内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // 移除所有标签的激活状态
    document.querySelectorAll('.game-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 显示选中的标签内容
    document.getElementById(tabName + '-tab').classList.remove('hidden');
    
    // 激活选中的标签
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // 更新对应标签的内容
    switch(tabName) {
        case 'inventory':
            updateInventoryDisplay();
            break;
        case 'staff':
            updateStaffDisplay();
            break;
        case 'battle':
            initializeBattle();
            break;
    }
}

// 初始化材料商店
function initializeMaterialsShop() {
    const shopContainer = document.getElementById('materials-shop');
    shopContainer.innerHTML = '';
    
    // 随机生成5种材料
    const availableMaterials = Object.keys(GAME_CONFIG.materials);
    const shopMaterials = [];
    
    for (let i = 0; i < 5; i++) {
        const randomMaterial = availableMaterials[Math.floor(Math.random() * availableMaterials.length)];
        if (!shopMaterials.includes(randomMaterial)) {
            shopMaterials.push(randomMaterial);
        }
    }
    
    shopMaterials.forEach(materialKey => {
        const material = GAME_CONFIG.materials[materialKey];
        const materialElement = document.createElement('div');
        materialElement.className = 'material-item';
        materialElement.innerHTML = `
            <div class="text-2xl mb-1">${material.emoji}</div>
            <div class="font-bold text-sm">${material.name}</div>
            <div class="text-xs text-gold">${material.cost} 金币</div>
        `;
        materialElement.onclick = () => purchaseMaterial(materialKey);
        shopContainer.appendChild(materialElement);
    });
}

// 初始化配方选择
function initializeRecipeSelect() {
    const recipeSelect = document.getElementById('recipe-select');
    recipeSelect.innerHTML = '<option value="">请选择配方</option>';
    
    gameState.recipes.forEach(recipeKey => {
        const recipe = GAME_CONFIG.recipes[recipeKey];
        const option = document.createElement('option');
        option.value = recipeKey;
        option.textContent = `${recipe.emoji} ${recipe.name} - ${recipe.effect}`;
        recipeSelect.appendChild(option);
    });
    
    recipeSelect.onchange = function() {
        updateRecipeMaterials(this.value);
        updateMaxCraftAmount();
    };
}

// 更新配方材料显示
function updateRecipeMaterials(recipeKey) {
    const materialsDiv = document.getElementById('recipe-materials');
    
    if (!recipeKey) {
        materialsDiv.innerHTML = '请先选择配方';
        return;
    }
    
    const recipe = GAME_CONFIG.recipes[recipeKey];
    let materialsHtml = '';
    
    Object.entries(recipe.materials).forEach(([materialKey, count]) => {
        const material = GAME_CONFIG.materials[materialKey];
        const available = gameState.materials[materialKey] || 0;
        const color = available >= count ? 'text-green-400' : 'text-red-400';
        materialsHtml += `<div class="${color}">${material.emoji} ${material.name} x${count} (拥有: ${available})</div>`;
    });
    
    materialsDiv.innerHTML = materialsHtml;
}

// 更新最大制作数量
function updateMaxCraftAmount() {
    const recipeKey = document.getElementById('recipe-select').value;
    const maxAmountSpan = document.getElementById('max-craft-amount');
    
    if (!recipeKey) {
        maxAmountSpan.textContent = '0';
        return;
    }
    
    const recipe = GAME_CONFIG.recipes[recipeKey];
    let maxAmount = 99; // 最大限制
    
    // 根据材料限制计算最大数量
    Object.entries(recipe.materials).forEach(([materialKey, count]) => {
        const available = gameState.materials[materialKey] || 0;
        const maxForMaterial = Math.floor(available / count);
        maxAmount = Math.min(maxAmount, maxForMaterial);
    });
    
    maxAmountSpan.textContent = maxAmount;
    
    // 调整当前输入值
    const craftAmountInput = document.getElementById('craft-amount');
    const currentAmount = parseInt(craftAmountInput.value);
    if (currentAmount > maxAmount) {
        craftAmountInput.value = maxAmount;
    }
}

// 调整制作数量
function adjustCraftAmount(delta) {
    const input = document.getElementById('craft-amount');
    const maxAmount = parseInt(document.getElementById('max-craft-amount').textContent);
    
    let newValue = parseInt(input.value) + delta;
    newValue = Math.max(1, Math.min(newValue, maxAmount));
    
    input.value = newValue;
}

// 切换自动制作
function toggleAutoCraft() {
    const recipeKey = document.getElementById('recipe-select').value;
    
    if (!recipeKey) {
        showNotification('请先选择要自动制作的配方！', 'error');
        return;
    }
    
    if (gameState.autoCraftSettings[recipeKey]) {
        // 关闭自动制作
        delete gameState.autoCraftSettings[recipeKey];
        document.getElementById('auto-craft-btn').textContent = '🤖 自动制作: 关闭';
        showNotification('自动制作已关闭', 'info');
    } else {
        // 开启自动制作
        gameState.autoCraftSettings[recipeKey] = true;
        document.getElementById('auto-craft-btn').textContent = '🤖 自动制作: 开启';
        showNotification(`已开启 ${GAME_CONFIG.recipes[recipeKey].name} 的自动制作`, 'success');
        
        // 立即尝试制作一次
        if (!gameState.isCrafting) {
            processAutoCraft();
        }
    }
}

// 处理自动制作
function processAutoCraft() {
    if (gameState.isCrafting) return;
    
    // 检查是否有开启自动制作的配方
    const autoCraftRecipes = Object.keys(gameState.autoCraftSettings);
    if (autoCraftRecipes.length === 0) return;
    
    // 尝试制作第一个可制作的配方
    for (const recipeKey of autoCraftRecipes) {
        if (canCraftPotion(recipeKey, 1)) {
            craftPotionWithAmount(recipeKey, 1, true);
            break;
        }
    }
}

// 检查是否可以制作魔药
function canCraftPotion(recipeKey, amount) {
    const recipe = GAME_CONFIG.recipes[recipeKey];
    
    for (const [materialKey, count] of Object.entries(recipe.materials)) {
        if ((gameState.materials[materialKey] || 0) < count * amount) {
            return false;
        }
    }
    
    return true;
}

// 购买材料
function purchaseMaterial(materialKey) {
    const material = GAME_CONFIG.materials[materialKey];
    
    if (gameState.gold >= material.cost) {
        gameState.gold -= material.cost;
        gameState.materials[materialKey] = (gameState.materials[materialKey] || 0) + 1;
        
        updateAllDisplays();
        showNotification(`成功购买 ${material.name}！`, 'success');
        
        // 添加购买动画
        anime({
            targets: event.target,
            scale: [1, 1.2, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    } else {
        showNotification('金币不足！', 'error');
        
        // 添加错误动画
        anime({
            targets: event.target,
            shake: [0, 10, -10, 0],
            duration: 500,
            easing: 'easeOutQuad'
        });
    }
}

// 刷新材料商店
function refreshMaterials() {
    if (gameState.gold >= 50) {
        gameState.gold -= 50;
        initializeMaterialsShop();
        updateAllDisplays();
        showNotification('商品已刷新！', 'success');
    } else {
        showNotification('刷新需要50金币！', 'error');
    }
}

// 制作魔药（主函数）
function craftPotion() {
    const recipeKey = document.getElementById('recipe-select').value;
    const amount = parseInt(document.getElementById('craft-amount').value);
    
    if (!recipeKey) {
        showNotification('请先选择配方！', 'error');
        return;
    }
    
    if (amount <= 0) {
        showNotification('制作数量必须大于0！', 'error');
        return;
    }
    
    craftPotionWithAmount(recipeKey, amount, false);
}

// 带数量的制作函数
function craftPotionWithAmount(recipeKey, amount, isAutoCraft = false) {
    if (gameState.isCrafting && !isAutoCraft) {
        showNotification('正在制作中，请稍候...', 'error');
        return;
    }
    
    const recipe = GAME_CONFIG.recipes[recipeKey];
    
    // 检查材料是否足够
    if (!canCraftPotion(recipeKey, amount)) {
        if (!isAutoCraft) {
            showNotification('材料不足！', 'error');
        }
        return;
    }
    
    // 消耗材料
    for (const [materialKey, count] of Object.entries(recipe.materials)) {
        gameState.materials[materialKey] -= count * amount;
    }
    
    // 立即更新材料显示
    updateRecipeMaterials(recipeKey);
    updateMaxCraftAmount();
    updateInventoryDisplay();
    updateInventoryList();
    
    // 开始制作
    if (!isAutoCraft) {
        startCraftingAnimation(recipeKey, amount);
    } else {
        // 自动制作使用更快的速度
        startCraftingAnimation(recipeKey, amount, true);
    }
}

// 开始制作动画
function startCraftingAnimation(recipeKey, amount, isAutoCraft = false) {
    gameState.isCrafting = true;
    
    const progressBar = document.getElementById('crafting-progress');
    const craftButton = document.getElementById('craft-button');
    
    if (!isAutoCraft) {
        craftButton.disabled = true;
        craftButton.textContent = `制作中 (${amount}个)...`;
    }
    
    const duration = isAutoCraft ? 1500 : 2000 / (gameState.craftSpeed || 1); // 考虑速度倍率
    
    anime({
        targets: progressBar,
        width: '100%',
        duration: duration,
        easing: 'easeInOutQuad',
        complete: function() {
            // 制作完成
            const recipe = GAME_CONFIG.recipes[recipeKey];
            gameState.potions[recipeKey] = (gameState.potions[recipeKey] || 0) + amount;
            
            // 重置界面
            setTimeout(() => {
                progressBar.style.width = '0%';
                
                if (!isAutoCraft) {
                    craftButton.disabled = false;
                    craftButton.textContent = '开始制作';
                }
                
                gameState.isCrafting = false;
                
                // 再次更新显示
                updateRecipeMaterials(recipeKey);
                updateMaxCraftAmount();
                updateAllDisplays();
                
                showNotification(`成功制作 ${recipe.name} x${amount}！`, 'success');
                
                // 检查是否解锁新配方
                checkRecipeUnlocks();
                
                // 如果有自动制作设置，继续制作
                if (gameState.autoCraftSettings[recipeKey]) {
                    setTimeout(() => {
                        if (canCraftPotion(recipeKey, 1)) {
                            craftPotionWithAmount(recipeKey, 1, true);
                        }
                    }, 1000);
                }
            }, 500);
        }
    });
}

// 检查配方解锁
function checkRecipeUnlocks() {
    Object.entries(GAME_CONFIG.recipes).forEach(([recipeKey, recipe]) => {
        if (gameState.recipes.includes(recipeKey)) return;
        
        const condition = recipe.unlockCondition;
        let shouldUnlock = false;
        
        if (condition === 'start') {
            shouldUnlock = true;
        } else if (condition.sales && getTotalSales() >= condition.sales) {
            shouldUnlock = true;
        } else if (condition.level && gameState.level >= condition.level) {
            shouldUnlock = true;
        } else if (condition.wins && gameState.battleStats.wins >= condition.wins) {
            shouldUnlock = true;
        }
        
        if (shouldUnlock) {
            gameState.recipes.push(recipeKey);
            gameState.unlockedRecipes.push(recipeKey);
            initializeRecipeSelect();
            showNotification(`解锁新配方：${recipe.name}！`, 'success');
            
            // 如果有自动制作设置，尝试开启
            if (gameState.autoCraftSettings[recipeKey]) {
                setTimeout(() => {
                    if (canCraftPotion(recipeKey, 1)) {
                        craftPotionWithAmount(recipeKey, 1, true);
                    }
                }, 2000);
            }
        }
    });
}

// 获取总销售量
function getTotalSales() {
    return Object.values(gameState.potions).reduce((sum, count) => sum + count, 0);
}

// 结束今日经营
function nextDay() {
    // 销售魔药
    let totalSales = 0;
    Object.entries(gameState.potions).forEach(([potionKey, count]) => {
        if (count > 0) {
            const recipe = GAME_CONFIG.recipes[potionKey];
            const sold = Math.min(count, Math.floor(Math.random() * 3) + 1);
            const revenue = sold * recipe.value;
            
            gameState.potions[potionKey] -= sold;
            gameState.gold += revenue;
            totalSales += sold;
            
            if (sold > 0) {
                showNotification(`售出 ${sold} 瓶 ${recipe.name}，获得 ${revenue} 金币！`, 'success');
            }
        }
    });
    
    // 增加天数
    gameState.day++;
    
    // 随机获得一些材料
    if (Math.random() < 0.3) {
        const materials = Object.keys(GAME_CONFIG.materials);
        const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
        const count = Math.floor(Math.random() * 3) + 1;
        gameState.materials[randomMaterial] = (gameState.materials[randomMaterial] || 0) + count;
        showNotification(`获得 ${count} 个 ${GAME_CONFIG.materials[randomMaterial].name}！`, 'success');
    }
    
    // 检查等级提升
    if (totalSales > 0 && gameState.day % 5 === 0) {
        gameState.level++;
        showNotification(`等级提升到 ${gameState.level} 级！`, 'success');
    }
    
    // 刷新材料商店
    initializeMaterialsShop();
    
    updateAllDisplays();
    checkRecipeUnlocks();
}

// 初始化战斗
function initializeBattle() {
    if (gameState.currentBattle) return;
    
    gameState.currentBattle = {
        round: 1,
        playerHP: 100,
        opponentHP: 100,
        playerPotions: [],
        opponentPotions: [],
        currentTurn: 'player'
    };
    
    refreshMaterialPool();
    updateBattleDisplay();
}

// 刷新材料池
function refreshMaterialPool() {
    const materials = Object.keys(GAME_CONFIG.materials);
    gameState.materialPool = [];
    
    // 生成10种随机材料
    for (let i = 0; i < 10; i++) {
        const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
        gameState.materialPool.push(randomMaterial);
    }
    
    updateBattleMaterialsDisplay();
}

// 更新战斗材料显示
function updateBattleMaterialsDisplay() {
    const container = document.getElementById('battle-materials');
    container.innerHTML = '';
    
    gameState.materialPool.forEach((materialKey, index) => {
        const material = GAME_CONFIG.materials[materialKey];
        const materialElement = document.createElement('div');
        materialElement.className = 'material-item';
        materialElement.innerHTML = `
            <div class="text-xl">${material.emoji}</div>
            <div class="text-xs">${material.name}</div>
        `;
        materialElement.onclick = () => drawBattleMaterial(index);
        container.appendChild(materialElement);
    });
    
    document.getElementById('material-pool-count').textContent = gameState.materialPool.length;
}

// 抽取战斗材料
function drawBattleMaterial(index) {
    if (!gameState.currentBattle || gameState.currentBattle.currentTurn !== 'player') {
        showNotification('现在不是你的回合！', 'error');
        return;
    }
    
    if (gameState.currentBattle.playerPotions.length >= 3) {
        showNotification('魔药槽已满！', 'error');
        return;
    }
    
    const materialKey = gameState.materialPool[index];
    const material = GAME_CONFIG.materials[materialKey];
    
    // 移除材料
    gameState.materialPool.splice(index, 1);
    
    // 尝试合成魔药
    const potion = tryCraftBattlePotion(materialKey);
    if (potion) {
        gameState.currentBattle.playerPotions.push(potion);
        showNotification(`成功制作 ${potion.name}！`, 'success');
    } else {
        showNotification('材料不足，无法制作魔药！', 'warning');
    }
    
    updateBattleMaterialsDisplay();
    updateBattleDisplay();
}

// 尝试制作战斗魔药
function tryCraftBattlePotion(materialKey) {
    // 简单的制作逻辑
    const possibleRecipes = Object.entries(GAME_CONFIG.recipes).filter(([key, recipe]) => {
        return recipe.materials[materialKey] && gameState.recipes.includes(key);
    });
    
    if (possibleRecipes.length > 0) {
        const [recipeKey, recipe] = possibleRecipes[Math.floor(Math.random() * possibleRecipes.length)];
        return { key: recipeKey, ...recipe };
    }
    
    return null;
}

// 结束战斗回合
function endBattleTurn() {
    if (!gameState.currentBattle) return;
    
    const battle = gameState.currentBattle;
    
    // 玩家回合
    if (battle.currentTurn === 'player') {
        // 玩家使用魔药
        if (battle.playerPotions.length > 0) {
            const potion = battle.playerPotions[Math.floor(Math.random() * battle.playerPotions.length)];
            let damage = 0;
            
            if (potion.type === 'attack') {
                damage = Math.floor(Math.random() * 20) + 10;
                battle.opponentHP = Math.max(0, battle.opponentHP - damage);
                showNotification(`使用 ${potion.name}，对对手造成 ${damage} 点伤害！`, 'success');
            } else if (potion.type === 'control') {
                showNotification(`使用 ${potion.name}，使对手无法行动！`, 'success');
            } else if (potion.type === 'support') {
                const heal = Math.floor(Math.random() * 15) + 10;
                battle.playerHP = Math.min(100, battle.playerHP + heal);
                showNotification(`使用 ${potion.name}，恢复 ${heal} 点血量！`, 'success');
            }
        }
        
        battle.currentTurn = 'opponent';
    } else {
        // 对手回合
        const opponentPotion = getRandomOpponentPotion();
        let damage = Math.floor(Math.random() * 15) + 8;
        battle.playerHP = Math.max(0, battle.playerHP - damage);
        showNotification(`对手攻击，造成 ${damage} 点伤害！`, 'error');
        
        battle.currentTurn = 'player';
        battle.round++;
    }
    
    updateBattleDisplay();
    
    // 检查战斗结束
    if (battle.playerHP <= 0 || battle.opponentHP <= 0 || battle.round > 6) {
        endBattle();
    }
}

// 获取随机对手魔药
function getRandomOpponentPotion() {
    const opponentRecipes = Object.keys(GAME_CONFIG.recipes);
    const randomRecipe = opponentRecipes[Math.floor(Math.random() * opponentRecipes.length)];
    return GAME_CONFIG.recipes[randomRecipe];
}

// 结束战斗
function endBattle() {
    const battle = gameState.currentBattle;
    
    let result = '';
    if (battle.playerHP > battle.opponentHP) {
        result = 'win';
        gameState.battleStats.wins++;
        gameState.gold += 100;
        showNotification('战斗胜利！获得100金币！', 'success');
    } else if (battle.playerHP < battle.opponentHP) {
        result = 'lose';
        gameState.battleStats.losses++;
        gameState.gold += 20;
        showNotification('战斗失败！获得20金币！', 'error');
    } else {
        result = 'draw';
        gameState.gold += 50;
        showNotification('平局！获得50金币！', 'info');
    }
    
    gameState.currentBattle = null;
    updateAllDisplays();
}

// 寻找新对手
function findNewOpponent() {
    if (gameState.currentBattle) {
        showNotification('请先完成当前战斗！', 'error');
        return;
    }
    
    initializeBattle();
    showNotification('找到新对手！', 'success');
}

// 更新战斗显示
function updateBattleDisplay() {
    if (!gameState.currentBattle) return;
    
    const battle = gameState.currentBattle;
    
    // 更新血量
    document.getElementById('player-hp-display').textContent = `${battle.playerHP}/100`;
    document.getElementById('opponent-hp-display').textContent = `${battle.opponentHP}/100`;
    
    document.getElementById('player-hp-bar').style.width = `${battle.playerHP}%`;
    document.getElementById('opponent-hp-bar').style.width = `${battle.opponentHP}%`;
    
    // 更新回合
    document.getElementById('battle-round').textContent = battle.round;
    
    // 更新对手信息
    document.getElementById('opponent-name').textContent = '神秘魔药师';
    document.getElementById('opponent-rank').textContent = gameState.rank;
}

// 更新库存显示
function updateInventoryDisplay() {
    // 更新材料库存
    const materialsContainer = document.getElementById('material-inventory');
    materialsContainer.innerHTML = '';
    
    Object.entries(gameState.materials).forEach(([materialKey, count]) => {
        if (count > 0) {
            const material = GAME_CONFIG.materials[materialKey];
            const materialElement = document.createElement('div');
            materialElement.className = 'material-item';
            materialElement.innerHTML = `
                <div class="text-2xl">${material.emoji}</div>
                <div class="text-sm font-bold">${material.name}</div>
                <div class="text-xs text-gold">x${count}</div>
            `;
            materialsContainer.appendChild(materialElement);
        }
    });
    
    // 更新魔药库存
    const potionsContainer = document.getElementById('potion-inventory');
    potionsContainer.innerHTML = '';
    
    Object.entries(gameState.potions).forEach(([potionKey, count]) => {
        if (count > 0) {
            const recipe = GAME_CONFIG.recipes[potionKey];
            const potionElement = document.createElement('div');
            potionElement.className = 'flex justify-between items-center p-3 bg-gray-800 rounded';
            potionElement.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="text-2xl">${recipe.emoji}</div>
                    <div>
                        <div class="font-bold">${recipe.name}</div>
                        <div class="text-sm text-gray-400">${recipe.effect}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold text-emerald">x${count}</div>
                    <div class="text-sm text-gold">${recipe.value} 金币</div>
                </div>
            `;
            potionsContainer.appendChild(potionElement);
        }
    });
}

// 更新员工显示
function updateStaffDisplay() {
    // 更新现有员工
    const currentStaffContainer = document.getElementById('current-staff');
    currentStaffContainer.innerHTML = '';
    
    gameState.staff.forEach(staffKey => {
        const staff = GAME_CONFIG.staff[staffKey];
        const staffElement = document.createElement('div');
        staffElement.className = 'flex items-center justify-between p-4 bg-gray-800 rounded';
        staffElement.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="text-2xl">${staff.emoji}</div>
                <div>
                    <div class="font-bold">${staff.name}</div>
                    <div class="text-sm text-gray-400">${staff.effect}</div>
                </div>
            </div>
            <div class="text-emerald">已雇佣</div>
        `;
        currentStaffContainer.appendChild(staffElement);
    });
    
    // 更新可招募员工
    const availableStaffContainer = document.getElementById('available-staff');
    availableStaffContainer.innerHTML = '';
    
    Object.entries(GAME_CONFIG.staff).forEach(([staffKey, staff]) => {
        if (!gameState.staff.includes(staffKey) && staff.cost > 0) {
            const canHire = gameState.gold >= staff.cost;
            const staffElement = document.createElement('div');
            staffElement.className = `flex items-center justify-between p-4 bg-gray-800 rounded ${canHire ? '' : 'opacity-50'}`;
            staffElement.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="text-2xl">${staff.emoji}</div>
                    <div>
                        <div class="font-bold">${staff.name}</div>
                        <div class="text-sm text-gray-400">${staff.effect}</div>
                    </div>
                </div>
                <button class="game-button px-4 py-2 rounded text-white font-bold ${canHire ? '' : 'opacity-50'}" 
                        onclick="hireStaff('${staffKey}')" ${canHire ? '' : 'disabled'}>
                    雇佣 (${staff.cost} 金币)
                </button>
            `;
            availableStaffContainer.appendChild(staffElement);
        }
    });
}

// 雇佣员工
function hireStaff(staffKey) {
    const staff = GAME_CONFIG.staff[staffKey];
    
    if (gameState.gold >= staff.cost) {
        gameState.gold -= staff.cost;
        gameState.staff.push(staffKey);
        
        updateAllDisplays();
        showNotification(`成功雇佣 ${staff.name}！`, 'success');
    } else {
        showNotification('金币不足！', 'error');
    }
}

// 更新所有显示
function updateAllDisplays() {
    // 更新资源显示
    document.getElementById('gold-display').textContent = gameState.gold;
    document.getElementById('level-display').textContent = gameState.level;
    document.getElementById('rank-display').textContent = gameState.rank;
    document.getElementById('day-display').textContent = gameState.day;
    
    // 更新库存显示
    updateInventoryDisplay();
    updateInventoryList();
    
    // 更新配方材料显示（如果当前有选中的配方）
    const currentRecipe = document.getElementById('recipe-select').value;
    if (currentRecipe) {
        updateRecipeMaterials(currentRecipe);
        updateMaxCraftAmount();
    }
}

// 更新库存列表
function updateInventoryList() {
    const container = document.getElementById('inventory-list');
    container.innerHTML = '';
    
    let hasItems = false;
    
    Object.entries(gameState.potions).forEach(([potionKey, count]) => {
        if (count > 0) {
            hasItems = true;
            const recipe = GAME_CONFIG.recipes[potionKey];
            const potionElement = document.createElement('div');
            potionElement.className = 'flex justify-between items-center p-3 bg-gray-800 rounded';
            potionElement.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="text-xl">${recipe.emoji}</div>
                    <div>
                        <div class="font-bold">${recipe.name}</div>
                        <div class="text-sm text-gray-400">${recipe.effect}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold text-emerald">x${count}</div>
                    <div class="text-sm text-gold">${recipe.value} 金币</div>
                </div>
            `;
            container.appendChild(potionElement);
        }
    });
    
    if (!hasItems) {
        container.innerHTML = '<div class="text-center text-gray-400 py-8">暂无魔药库存</div>';
    }
}

// 设置制作数量
function setCraftAmount(amount) {
    const input = document.getElementById('craft-amount');
    const maxAmount = parseInt(document.getElementById('max-craft-amount').textContent);
    
    input.value = Math.min(amount, maxAmount);
}

// 设置最大制作数量
function setCraftAmountMax() {
    const maxAmount = parseInt(document.getElementById('max-craft-amount').textContent);
    setCraftAmount(maxAmount);
}

// 设置制作速度
function setCraftSpeed(speed) {
    gameState.craftSpeed = speed || 1;
    document.getElementById('current-speed').textContent = `${speed}x`;
    showNotification(`制作速度设置为 ${speed}x`, 'info');
}

// 通知系统
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>${getNotificationIcon(type)}</span>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

// 保存游戏
function saveGame() {
    localStorage.setItem('potionTavernGame', JSON.stringify(gameState));
    showNotification('游戏已保存！', 'success');
}

// 加载游戏
function loadGame() {
    const savedGame = localStorage.getItem('potionTavernGame');
    if (savedGame) {
        const loadedState = JSON.parse(savedGame);
        gameState = { ...gameState, ...loadedState };
        showNotification('游戏已加载！', 'success');
    }
}

// 重置游戏
function resetGame() {
    if (confirm('确定要重新开始游戏吗？这将清除所有进度。')) {
        localStorage.removeItem('potionTavernGame');
        location.reload();
    }
}

// 游戏循环更新
function gameLoop() {
    // 处理自动制作
    if (!gameState.isCrafting && Object.keys(gameState.autoCraftSettings).length > 0) {
        processAutoCraft();
    }
    
    // 每秒保存一次游戏
    if (Math.random() < 0.01) { // 1% 概率每秒保存
        saveGame();
    }
}

// 启动游戏循环
setInterval(gameLoop, 1000);