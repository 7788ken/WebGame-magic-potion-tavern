// 全局变量
let selectedMaterials = [];
let gameState = {
    gold: 1250,
    materials: 45,
    staff: 3,
    level: 5,
    playerHP: 100,
    enemyHP: 85,
    currentRound: 3
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeParticles();
    initializeInteractions();
    initializePotionFiltering();
    initializePotionModal();
    initializeBrewingSimulator();
});

// 初始化动画
function initializeAnimations() {
    // 主页英雄区域动画
    if (document.getElementById('main-title')) {
        anime.timeline({
            easing: 'easeOutExpo',
            duration: 1000
        })
        .add({
            targets: '#main-title',
            opacity: [0, 1],
            translateY: [50, 0],
            delay: 500
        })
        .add({
            targets: '#subtitle',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: 200
        }, '-=700')
        .add({
            targets: '#hero-buttons',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: 300
        }, '-=600');
    }
    
    // 卡片悬停动画
    const cards = document.querySelectorAll('.magic-card, .potion-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.02,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
        
        card.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });
    
    // 滚动动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    duration: 800,
                    easing: 'easeOutQuad',
                    delay: anime.stagger(100)
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 观察所有需要动画的元素
    document.querySelectorAll('.magic-card, .potion-card, .step-indicator').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// 初始化粒子效果
function initializeParticles() {
    const particleContainer = document.getElementById('particles');
    if (!particleContainer) return;
    
    // 创建PIXI应用
    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        backgroundAlpha: 0
    });
    
    particleContainer.appendChild(app.view);
    
    // 创建粒子容器
    const particleContainerPixi = new PIXI.Container();
    app.stage.addChild(particleContainerPixi);
    
    // 粒子数组
    const particles = [];
    const particleCount = 50;
    
    // 创建粒子纹理
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xFFD700, 0.6);
    graphics.drawCircle(0, 0, 2);
    graphics.endFill();
    const particleTexture = app.renderer.generateTexture(graphics);
    
    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
        const particle = new PIXI.Sprite(particleTexture);
        particle.x = Math.random() * app.screen.width;
        particle.y = Math.random() * app.screen.height;
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vy = (Math.random() - 0.5) * 0.5;
        particle.alpha = Math.random() * 0.5 + 0.3;
        particle.scale.set(Math.random() * 0.5 + 0.5);
        
        particles.push(particle);
        particleContainerPixi.addChild(particle);
    }
    
    // 动画循环
    app.ticker.add(() => {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 边界检查
            if (particle.x < 0) particle.x = app.screen.width;
            if (particle.x > app.screen.width) particle.x = 0;
            if (particle.y < 0) particle.y = app.screen.height;
            if (particle.y > app.screen.height) particle.y = 0;
            
            // 闪烁效果
            particle.alpha += Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.01;
        });
    });
    
    // 窗口大小调整
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });
}

// 初始化交互功能
function initializeInteractions() {
    // 导航链接平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 按钮悬停效果
    const buttons = document.querySelectorAll('.glow-button, button');
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

// 经营系统功能
function purchaseMaterial(materialName, cost) {
    if (gameState.gold >= cost) {
        gameState.gold -= cost;
        gameState.materials += 1;
        
        // 更新显示
        document.getElementById('gold-count').textContent = gameState.gold;
        document.getElementById('material-count').textContent = gameState.materials;
        
        // 显示购买成功动画
        showNotification(`成功购买 ${materialName}！`, 'success');
        
        // 添加购买动画
        anime({
            targets: event.target,
            scale: [1, 1.1, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    } else {
        showNotification('金币不足！', 'error');
    }
}

function craftPotion() {
    const recipe = document.getElementById('potion-recipe').value;
    const progressBar = document.getElementById('crafting-progress');
    
    if (gameState.materials >= 2) {
        gameState.materials -= 2;
        document.getElementById('material-count').textContent = gameState.materials;
        
        // 制作进度动画
        anime({
            targets: progressBar,
            width: '100%',
            duration: 2000,
            easing: 'easeInOutQuad',
            complete: function() {
                setTimeout(() => {
                    progressBar.style.width = '0%';
                    showNotification('魔药制作完成！', 'success');
                }, 500);
            }
        });
    } else {
        showNotification('材料不足！', 'error');
    }
}

// 对战系统功能
function drawMaterial(element) {
    if (element.classList.contains('selected')) return;
    
    element.classList.add('selected');
    element.style.opacity = '0.5';
    element.style.pointerEvents = 'none';
    
    // 添加抽取动画
    anime({
        targets: element,
        scale: [1, 1.2, 0.8],
        duration: 500,
        easing: 'easeOutQuad'
    });
    
    showNotification('材料抽取成功！', 'success');
}

function endTurn() {
    gameState.currentRound++;
    document.getElementById('current-round').textContent = gameState.currentRound;
    
    // 模拟战斗结果
    const damage = Math.floor(Math.random() * 20) + 10;
    gameState.enemyHP = Math.max(0, gameState.enemyHP - damage);
    document.getElementById('enemy-hp').textContent = `${gameState.enemyHP}/100`;
    
    // 更新血条
    const hpPercent = (gameState.enemyHP / 100) * 100;
    document.getElementById('enemy-hp-bar').style.setProperty('--hp-percent', `${hpPercent}%`);
    
    showNotification(`对敌人造成 ${damage} 点伤害！`, 'success');
    
    if (gameState.currentRound >= 6 || gameState.enemyHP <= 0) {
        setTimeout(() => {
            showNotification('战斗结束！', 'info');
        }, 1000);
    }
}

function synthesizePotion() {
    const selectedSlots = document.querySelectorAll('.material-slot.selected');
    if (selectedSlots.length === 0) {
        showNotification('请先选择材料！', 'error');
        return;
    }
    
    // 模拟合成
    anime({
        targets: '#cauldron',
        rotate: [0, 360],
        scale: [1, 1.2, 1],
        duration: 1000,
        easing: 'easeOutQuad',
        complete: function() {
            showNotification('魔药合成成功！', 'success');
        }
    });
}

// 魔药图鉴功能
function initializePotionFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');
    const potionCards = document.querySelectorAll('.potion-card');
    
    // 筛选按钮
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 更新按钮状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            filterPotions(category, searchInput.value);
        });
    });
    
    // 搜索功能
    searchInput.addEventListener('input', function() {
        const activeCategory = document.querySelector('.filter-btn.active').dataset.category;
        filterPotions(activeCategory, this.value);
    });
    
    // 魔药卡片点击事件
    potionCards.forEach(card => {
        card.addEventListener('click', function() {
            const name = this.dataset.name;
            const effect = this.dataset.effect;
            const category = this.dataset.category;
            showPotionModal(this);
        });
    });
}

function filterPotions(category, searchTerm) {
    const potionCards = document.querySelectorAll('.potion-card');
    
    potionCards.forEach(card => {
        const cardCategory = card.dataset.category;
        const cardName = card.dataset.name.toLowerCase();
        const cardEffect = card.dataset.effect.toLowerCase();
        const matchesCategory = category === 'all' || cardCategory === category;
        const matchesSearch = searchTerm === '' || 
                            cardName.includes(searchTerm.toLowerCase()) || 
                            cardEffect.includes(searchTerm.toLowerCase());
        
        if (matchesCategory && matchesSearch) {
            card.style.display = 'block';
            anime({
                targets: card,
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });
        } else {
            anime({
                targets: card,
                opacity: [1, 0],
                scale: [1, 0.8],
                duration: 200,
                easing: 'easeOutQuad',
                complete: function() {
                    card.style.display = 'none';
                }
            });
        }
    });
}

// 魔药详情模态框
function initializePotionModal() {
    const modal = document.getElementById('potion-modal');
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function showPotionModal(card) {
    const modal = document.getElementById('potion-modal');
    const icon = card.querySelector('.potion-icon').textContent;
    const name = card.querySelector('h3').textContent;
    const effect = card.querySelector('p').textContent;
    const type = card.dataset.category;
    
    document.getElementById('modal-icon').textContent = icon;
    document.getElementById('modal-title').textContent = name;
    document.getElementById('modal-effect').textContent = effect;
    document.getElementById('modal-type').textContent = getTypeText(type);
    
    // 显示模态框
    modal.classList.add('active');
    
    // 模态框动画
    anime({
        targets: '.modal-content',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
}

function closeModal() {
    const modal = document.getElementById('potion-modal');
    
    anime({
        targets: '.modal-content',
        scale: [1, 0.8],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeOutQuad',
        complete: function() {
            modal.classList.remove('active');
        }
    });
}

function getTypeText(type) {
    const typeMap = {
        'attack': '攻击类',
        'control': '控制类',
        'support': '辅助类'
    };
    return typeMap[type] || '未知';
}

// 魔药制作模拟器
function initializeBrewingSimulator() {
    selectedMaterials = [];
    updateSelectedMaterials();
}

function selectMaterial(element, material, name) {
    if (selectedMaterials.length >= 3) {
        showNotification('最多只能选择3种材料！', 'error');
        return;
    }
    
    if (element.classList.contains('filled')) {
        showNotification('该材料已被选择！', 'error');
        return;
    }
    
    element.classList.add('filled');
    selectedMaterials.push({ material, name });
    updateSelectedMaterials();
    
    // 添加选择动画
    anime({
        targets: element,
        scale: [1, 1.2, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
}

function updateSelectedMaterials() {
    const container = document.getElementById('selected-materials');
    
    if (selectedMaterials.length === 0) {
        container.innerHTML = '<div class="text-gray-500">点击材料添加到坩埚</div>';
        return;
    }
    
    container.innerHTML = selectedMaterials.map((item, index) => 
        `<div class="flex items-center space-x-1 bg-gold bg-opacity-20 px-2 py-1 rounded">
            <span class="text-lg">${item.material}</span>
            <span class="text-sm">${item.name}</span>
            <button onclick="removeMaterial(${index})" class="text-red-400 hover:text-red-300">×</button>
        </div>`
    ).join('');
}

function removeMaterial(index) {
    const materialSlots = document.querySelectorAll('.material-slot');
    const removedMaterial = selectedMaterials[index];
    
    // 找到对应的材料槽并移除填充状态
    materialSlots.forEach(slot => {
        if (slot.dataset.material === removedMaterial.material) {
            slot.classList.remove('filled');
        }
    });
    
    selectedMaterials.splice(index, 1);
    updateSelectedMaterials();
}

function brewPotion() {
    if (selectedMaterials.length === 0) {
        showNotification('请先选择材料！', 'error');
        return;
    }
    
    // 坩埚动画
    anime({
        targets: '#cauldron',
        rotate: [0, 360],
        scale: [1, 1.3, 1],
        duration: 1500,
        easing: 'easeOutQuad'
    });
    
    // 模拟制作结果
    setTimeout(() => {
        const result = getBrewingResult(selectedMaterials);
        document.getElementById('brewing-result').innerHTML = result;
        
        // 清空选择
        selectedMaterials = [];
        updateSelectedMaterials();
        
        // 重置材料槽
        document.querySelectorAll('.material-slot').forEach(slot => {
            slot.classList.remove('filled');
        });
        
        showNotification('魔药制作完成！', 'success');
    }, 1500);
}

function getBrewingResult(materials) {
    const materialCount = materials.length;
    const materialTypes = materials.map(m => m.name);
    
    // 简单的配方逻辑
    if (materialTypes.includes('火焰花')) {
        if (materialCount === 1) {
            return '<div class="text-red-400">制作成功！获得了 <strong>火焰药剂</strong> 🔥</div>';
        } else if (materialCount === 2) {
            return '<div class="text-red-400">制作成功！获得了 <strong>爆燃药剂</strong> 💥</div>';
        }
    }
    
    if (materialTypes.includes('月光草') && materialTypes.includes('露珠')) {
        return '<div class="text-green-400">制作成功！获得了 <strong>治疗药剂</strong> 💚</div>';
    }
    
    if (materialTypes.includes('暗影粉')) {
        return '<div class="text-purple-400">制作成功！获得了 <strong>控制类魔药</strong> 🌀</div>';
    }
    
    // 随机结果
    const randomResults = [
        '<div class="text-gray-400">制作失败，材料浪费了...</div>',
        '<div class="text-yellow-400">制作出了神秘的药剂！</div>',
        '<div class="text-blue-400">制作成功！获得了基础魔药</div>'
    ];
    
    return randomResults[Math.floor(Math.random() * randomResults.length)];
}

// 通知系统
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300`;
    
    // 根据类型设置样式
    const styles = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        warning: 'bg-yellow-600 text-black',
        info: 'bg-blue-600 text-white'
    };
    
    notification.className += ` ${styles[type] || styles.info}`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>${getNotificationIcon(type)}</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
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

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 导出函数供HTML调用
window.purchaseMaterial = purchaseMaterial;
window.craftPotion = craftPotion;
window.drawMaterial = drawMaterial;
window.endTurn = endTurn;
window.synthesizePotion = synthesizePotion;
window.selectMaterial = selectMaterial;
window.removeMaterial = removeMaterial;
window.brewPotion = brewPotion;
window.closeModal = closeModal;