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

// 全局函数
window.switchTab = switchTab;
window.purchaseMaterial = purchaseMaterial;
window.refreshMaterials = refreshMaterials;
window.craftPotion = craftPotion;
window.nextDay = nextDay;
window.drawBattleMaterial = drawBattleMaterial;
window.endBattleTurn = endBattleTurn;
window.findNewOpponent = findNewOpponent;
window.hireStaff = hireStaff;
window.saveGame = saveGame;
window.resetGame = resetGame;
window.adjustCraftAmount = adjustCraftAmount;
window.setCraftAmount = setCraftAmount;
window.setCraftAmountMax = setCraftAmountMax;
window.setCraftSpeed = setCraftSpeed;
window.toggleAutoCraft = toggleAutoCraft;