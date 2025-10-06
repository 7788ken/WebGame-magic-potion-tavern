/**
 * 魔药酒馆存档管理器
 * 处理游戏的保存和加载功能
 */

class SaveManager {
    constructor() {
        this.saveKey = 'potionTavern_saveData';
        this.autoSaveInterval = GameConfig.save.autoSaveInterval;
        this.maxSaveSlots = GameConfig.save.maxSaveSlots;
        this.currentSlot = 0;

        // 开始自动保存
        this.startAutoSave();
    }

    /**
     * 保存游戏到本地存储
     * @param {number} slot - 存档槽位 (0-4)
     * @param {string} description - 存档描述
     * @returns {boolean} 保存是否成功
     */
    save(slot = 0, description = '') {
        try {
            // 获取现有存档
            const saveData = this.getAllSaves();

            // 创建新存档
            const saveSlot = {
                slot: slot,
                timestamp: Date.now(),
                description: description || this.generateDescription(),
                gameData: gameState.toJSON(),
                version: GameConfig.save.version
            };

            // 更新存档槽
            saveData.slots[slot] = saveSlot;
            saveData.lastSaved = Date.now();
            saveData.currentSlot = slot;

            // 保存到本地存储
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));

            this.currentSlot = slot;
            this.triggerEvent('saveCompleted', { slot: slot, success: true });
            console.log(`游戏已保存到槽位 ${slot}`);
            return true;

        } catch (error) {
            console.error('保存游戏失败:', error);
            this.triggerEvent('saveCompleted', { slot: slot, success: false, error: error });
            return false;
        }
    }

    /**
     * 加载指定槽位的游戏
     * @param {number} slot - 存档槽位
     * @returns {boolean} 加载是否成功
     */
    load(slot = 0) {
        try {
            const saveData = this.getAllSaves();
            const saveSlot = saveData.slots[slot];

            if (!saveSlot || !saveSlot.gameData) {
                console.warn(`存档槽位 ${slot} 为空`);
                return false;
            }

            // 检查版本兼容性
            if (saveSlot.version !== GameConfig.save.version) {
                console.warn(`存档版本不匹配: ${saveSlot.version} vs ${GameConfig.save.version}`);
                // 这里可以添加版本迁移逻辑
            }

            // 加载游戏状态
            const success = gameState.fromJSON(saveSlot.gameData);

            if (success) {
                this.currentSlot = slot;
                saveData.currentSlot = slot;
                localStorage.setItem(this.saveKey, JSON.stringify(saveData));

                this.triggerEvent('loadCompleted', { slot: slot, success: true });
                console.log(`游戏已从槽位 ${slot} 加载`);
                return true;
            } else {
                throw new Error('游戏状态加载失败');
            }

        } catch (error) {
            console.error('加载游戏失败:', error);
            this.triggerEvent('loadCompleted', { slot: slot, success: false, error: error });
            return false;
        }
    }

    /**
     * 快速保存到当前槽位
     * @returns {boolean} 保存是否成功
     */
    quickSave() {
        return this.save(this.currentSlot, '快速保存');
    }

    /**
     * 快速加载当前槽位
     * @returns {boolean} 加载是否成功
     */
    quickLoad() {
        return this.load(this.currentSlot);
    }

    /**
     * 获取所有存档数据
     * @returns {Object} 存档数据对象
     */
    getAllSaves() {
        try {
            const savedData = localStorage.getItem(this.saveKey);
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.error('读取存档数据失败:', error);
        }

        // 返回默认结构
        return {
            version: GameConfig.save.version,
            lastSaved: 0,
            currentSlot: 0,
            slots: Array(this.maxSaveSlots).fill(null)
        };
    }

    /**
     * 获取指定槽位的存档信息
     * @param {number} slot - 存档槽位
     * @returns {Object|null} 存档信息
     */
    getSaveInfo(slot) {
        const saveData = this.getAllSaves();
        const saveSlot = saveData.slots[slot];

        if (saveSlot) {
            return {
                slot: slot,
                exists: true,
                timestamp: saveSlot.timestamp,
                description: saveSlot.description,
                day: saveSlot.gameData.time.day,
                gold: saveSlot.gameData.player.gold,
                reputation: saveSlot.gameData.player.reputation,
                level: saveSlot.gameData.player.level,
                tavernLevel: saveSlot.gameData.tavern.level
            };
        }

        return {
            slot: slot,
            exists: false
        };
    }

    /**
     * 获取所有存档槽位的信息
     * @returns {Array} 存档信息数组
     */
    getAllSaveInfo() {
        const info = [];
        for (let i = 0; i < this.maxSaveSlots; i++) {
            info.push(this.getSaveInfo(i));
        }
        return info;
    }

    /**
     * 删除指定槽位的存档
     * @param {number} slot - 存档槽位
     * @returns {boolean} 删除是否成功
     */
    deleteSave(slot) {
        try {
            const saveData = this.getAllSaves();
            saveData.slots[slot] = null;

            localStorage.setItem(this.saveKey, JSON.stringify(saveData));

            this.triggerEvent('saveDeleted', { slot: slot, success: true });
            console.log(`存档槽位 ${slot} 已删除`);
            return true;

        } catch (error) {
            console.error('删除存档失败:', error);
            this.triggerEvent('saveDeleted', { slot: slot, success: false, error: error });
            return false;
        }
    }

    /**
     * 导出存档数据
     * @param {number} slot - 存档槽位
     * @returns {string|null} JSON字符串
     */
    exportSave(slot) {
        const saveData = this.getAllSaves();
        const saveSlot = saveData.slots[slot];

        if (saveSlot) {
            return JSON.stringify(saveSlot, null, 2);
        }
        return null;
    }

    /**
     * 导入存档数据
     * @param {string} jsonData - JSON字符串
     * @param {number} slot - 目标槽位
     * @returns {boolean} 导入是否成功
     */
    importSave(jsonData, slot) {
        try {
            const saveSlot = JSON.parse(jsonData);

            // 验证数据格式
            if (!saveSlot.gameData || !saveSlot.timestamp) {
                throw new Error('无效的存档格式');
            }

            const saveData = this.getAllSaves();
            saveData.slots[slot] = saveSlot;

            localStorage.setItem(this.saveKey, JSON.stringify(saveData));

            this.triggerEvent('saveImported', { slot: slot, success: true });
            console.log(`存档已导入到槽位 ${slot}`);
            return true;

        } catch (error) {
            console.error('导入存档失败:', error);
            this.triggerEvent('saveImported', { slot: slot, success: false, error: error });
            return false;
        }
    }

    /**
     * 检查是否有自动保存可用
     * @returns {boolean}
     */
    hasAutoSave() {
        const saveData = this.getAllSaves();
        return saveData.lastSaved > 0 && Date.now() - saveData.lastSaved < 86400000; // 24小时内
    }

    /**
     * 生成存档描述
     * @returns {string}
     */
    generateDescription() {
        const time = new Date().toLocaleString('zh-CN');
        const day = gameState.time.day;
        const gold = gameState.player.gold;
        const reputation = Math.floor(gameState.player.reputation);

        return `${time} - 第${day}天 - 金币:${gold} - 声誉:${reputation}`;
    }

    /**
     * 开始自动保存
     */
    startAutoSave() {
        if (this.autoSaveIntervalId) {
            clearInterval(this.autoSaveIntervalId);
        }

        this.autoSaveIntervalId = setInterval(() => {
            if (gameState.settings.autoSave) {
                this.quickSave();
            }
        }, this.autoSaveInterval);
    }

    /**
     * 停止自动保存
     */
    stopAutoSave() {
        if (this.autoSaveIntervalId) {
            clearInterval(this.autoSaveIntervalId);
            this.autoSaveIntervalId = null;
        }
    }

    /**
     * 清理过期存档（超过30天）
     */
    cleanupOldSaves() {
        try {
            const saveData = this.getAllSaves();
            const now = Date.now();
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;

            let cleaned = 0;
            for (let i = 0; i < saveData.slots.length; i++) {
                const slot = saveData.slots[i];
                if (slot && (now - slot.timestamp) > thirtyDays) {
                    saveData.slots[i] = null;
                    cleaned++;
                }
            }

            if (cleaned > 0) {
                localStorage.setItem(this.saveKey, JSON.stringify(saveData));
                console.log(`清理了 ${cleaned} 个过期存档`);
            }

        } catch (error) {
            console.error('清理过期存档失败:', error);
        }
    }

    /**
     * 验证存档完整性
     * @param {Object} saveData - 存档数据
     * @returns {boolean}
     */
    validateSaveData(saveData) {
        try {
            if (!saveData || typeof saveData !== 'object') {
                return false;
            }

            // 检查必需字段
            const requiredFields = ['version', 'timestamp', 'gameData'];
            for (const field of requiredFields) {
                if (!saveData[field]) {
                    return false;
                }
            }

            // 检查游戏数据完整性
            const gameData = saveData.gameData;
            const requiredGameFields = ['player', 'tavern', 'inventory', 'time'];
            for (const field of requiredGameFields) {
                if (!gameData[field]) {
                    return false;
                }
            }

            return true;

        } catch (error) {
            console.error('存档验证失败:', error);
            return false;
        }
    }

    /**
     * 事件系统
     */
    on(event, callback) {
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    off(event, callback) {
        if (this.eventListeners && this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(callback);
            if (index > -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }
    }

    triggerEvent(event, data) {
        if (this.eventListeners && this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in save manager event listener for ${event}:`, error);
                }
            });
        }
    }
}

// 创建全局存档管理器实例
const saveManager = new SaveManager();