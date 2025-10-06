/**
 * 员工实体类
 * 管理员工的工作状态、技能和效率
 */

class Staff {
    constructor(staffData) {
        this.id = staffData.id;
        this.name = staffData.name;
        this.type = staffData.type;
        this.level = staffData.level || 1;
        this.experience = staffData.experience || 0;
        this.skill = staffData.skill || 1.0;
        this.salary = staffData.salary || 50;
        this.efficiency = staffData.efficiency || 1.0;

        // 员工状态
        this.status = 'available'; // available, working, resting, sick
        this.currentTask = null;
        this.workStartTime = null;
        this.restStartTime = null;
        this.sickStartTime = null;

        // 工作统计
        this.stats = {
            totalWorkTime: 0,
            potionsMade: 0,
            customersServed: 0,
            successfulBrews: 0,
            failedBrews: 0,
            efficiencyRating: 0
        };

        // 员工特性
        this.traits = staffData.traits || this.generateRandomTraits();
        this.specializations = staffData.specializations || [];
        this.fatigue = 0;
        this.happiness = 80;
        this.loyalty = 70;

        // 工资和合同
        this.contract = {
            type: 'full_time', // full_time, part_time, temporary
            duration: null, // null表示无固定期限
            salary: this.salary,
            benefits: [],
            startDate: Date.now()
        };
    }

    /**
     * 生成随机特性
     */
    generateRandomTraits() {
        const allTraits = {
            positive: [
                { id: 'fast_learner', name: '快速学习者', effect: 'exp_gain +20%' },
                { id: 'careful', name: '细心', effect: 'brew_success +10%' },
                { id: 'friendly', name: '友善', effect: 'customer_satisfaction +15%' },
                { id: 'efficient', name: '高效', effect: 'work_speed +15%' },
                { id: 'creative', name: '创造力', effect: 'recipe_discovery +10%' },
                { id: 'patient', name: '耐心', effect: 'patience_bonus +20%' },
                { id: 'reliable', name: '可靠', effect: 'absent_rate -50%' },
                { id: 'skilled', name: '熟练', effect: 'base_skill +0.2' }
            ],
            negative: [
                { id: 'slow', name: '缓慢', effect: 'work_speed -10%' },
                { id: 'careless', name: '粗心', effect: 'brew_success -5%' },
                { id: 'greedy', name: '贪婪', effect: 'salary_demand +20%' },
                { id: 'lazy', name: '懒惰', effect: 'efficiency -15%' },
                { id: 'moody', name: '情绪化', effect: 'happiness_variance +30%' },
                { id: 'sickly', name: '体弱', effect: 'sick_rate +100%' }
            ]
        };

        const traits = [];

        // 随机选择1-2个正面特性
        const positiveCount = Math.random() < 0.7 ? 2 : 1;
        const shuffledPositive = [...allTraits.positive].sort(() => Math.random() - 0.5);
        traits.push(...shuffledPositive.slice(0, positiveCount));

        // 随机选择0-1个负面特性
        if (Math.random() < 0.4) {
            const shuffledNegative = [...allTraits.negative].sort(() => Math.random() - 0.5);
            traits.push(shuffledNegative[0]);
        }

        return traits;
    }

    /**
     * 更新员工状态
     */
    update(deltaTime) {
        // 更新疲劳度
        this.updateFatigue(deltaTime);

        // 更新心情
        this.updateHappiness(deltaTime);

        // 更新忠诚度
        this.updateLoyalty(deltaTime);

        // 处理当前状态
        this.handleCurrentStatus(deltaTime);

        // 检查状态变化
        this.checkStatusChanges();

        // 随机事件
        this.randomEvents(deltaTime);
    }

    /**
     * 更新疲劳度
     */
    updateFatigue(deltaTime) {
        if (this.status === 'working') {
            this.fatigue += deltaTime * 0.5; // 工作时增加疲劳
        } else if (this.status === 'resting') {
            this.fatigue -= deltaTime * 2; // 休息时恢复疲劳
            this.fatigue = Math.max(0, this.fatigue);
        } else {
            this.fatigue -= deltaTime * 0.3; // 空闲时缓慢恢复
            this.fatigue = Math.max(0, this.fatigue);
        }

        // 疲劳影响效率
        if (this.fatigue > 80) {
            this.efficiency *= 0.8;
        } else if (this.fatigue > 60) {
            this.efficiency *= 0.9;
        } else if (this.fatigue > 40) {
            this.efficiency *= 0.95;
        }
    }

    /**
     * 更新心情
     */
    updateHappiness(deltaTime) {
        let happinessChange = 0;

        // 工作满意度
        if (this.status === 'working') {
            happinessChange += 0.1; // 工作带来满足感
        }

        // 疲劳影响
        if (this.fatigue > 70) {
            happinessChange -= 0.3; // 过度疲劳降低心情
        }

        // 工资满意度
        const expectedSalary = this.getExpectedSalary();
        if (this.salary > expectedSalary * 1.2) {
            happinessChange += 0.2; // 高工资提升心情
        } else if (this.salary < expectedSalary * 0.8) {
            happinessChange -= 0.3; // 低工资降低心情
        }

        // 特性影响
        this.traits.forEach(trait => {
            if (trait.id === 'moody') {
                happinessChange += (Math.random() - 0.5) * 0.5; // 情绪波动
            }
        });

        this.happiness += happinessChange * deltaTime;
        this.happiness = Math.max(0, Math.min(100, this.happiness));
    }

    /**
     * 更新忠诚度
     */
    updateLoyalty(deltaTime) {
        let loyaltyChange = 0;

        // 心情影响忠诚度
        if (this.happiness > 80) {
            loyaltyChange += 0.1;
        } else if (this.happiness < 40) {
            loyaltyChange -= 0.2;
        }

        // 工资影响忠诚度
        const expectedSalary = this.getExpectedSalary();
        if (this.salary > expectedSalary * 1.5) {
            loyaltyChange += 0.15;
        } else if (this.salary < expectedSalary * 0.7) {
            loyaltyChange -= 0.25;
        }

        this.loyalty += loyaltyChange * deltaTime;
        this.loyalty = Math.max(0, Math.min(100, this.loyalty));
    }

    /**
     * 处理当前状态
     */
    handleCurrentStatus(deltaTime) {
        switch (this.status) {
            case 'working':
                this.handleWorking(deltaTime);
                break;
            case 'resting':
                this.handleResting(deltaTime);
                break;
            case 'sick':
                this.handleSick(deltaTime);
                break;
        }
    }

    /**
     * 处理工作状态
     */
    handleWorking(deltaTime) {
        if (this.currentTask) {
            this.currentTask.progress += deltaTime * this.efficiency;

            // 检查任务是否完成
            if (this.currentTask.progress >= this.currentTask.duration) {
                this.completeTask();
            }
        }

        // 更新工作统计
        this.stats.totalWorkTime += deltaTime;
    }

    /**
     * 处理休息状态
     */
    handleResting(deltaTime) {
        // 休息恢复疲劳和心情
        this.fatigue = Math.max(0, this.fatigue - deltaTime * 3);
        this.happiness = Math.min(100, this.happiness + deltaTime * 0.5);

        // 检查是否休息完毕
        if (this.fatigue < 20) {
            this.status = 'available';
            this.restStartTime = null;
        }
    }

    /**
     * 处理生病状态
     */
    handleSick(deltaTime) {
        // 疾病持续时间
        const sickDuration = (Date.now() - this.sickStartTime) / 1000;

        // 自然恢复概率
        const recoveryChance = 0.01 * deltaTime; // 每秒1%恢复概率
        if (Math.random() < recoveryChance) {
            this.recoverFromSickness();
        }

        // 长期生病影响忠诚度
        if (sickDuration > 86400) { // 超过1天
            this.loyalty -= deltaTime * 0.1;
        }
    }

    /**
     * 检查状态变化
     */
    checkStatusChanges() {
        // 疲劳过高时强制休息
        if (this.status === 'working' && this.fatigue > 90) {
            this.forceRest();
        }

        // 心情过低时可能罢工
        if (this.status === 'working' && this.happiness < 20) {
            if (Math.random() < 0.01) { // 1%概率罢工
                this.goOnStrike();
            }
        }

        // 忠诚度极低时可能辞职
        if (this.loyalty < 10) {
            if (Math.random() < 0.005) { // 0.5%概率辞职
                this.resign();
            }
        }

        // 随机生病
        if (this.status !== 'sick' && Math.random() < 0.001) {
            this.getSick();
        }
    }

    /**
     * 随机事件
     */
    randomEvents(deltaTime) {
        // 随机特性事件
        this.traits.forEach(trait => {
            switch (trait.id) {
                case 'sickly':
                    if (Math.random() < 0.001 * deltaTime) {
                        this.getSick();
                    }
                    break;
                case 'moody':
                    if (Math.random() < 0.002 * deltaTime) {
                        this.randomMoodSwing();
                    }
                    break;
            }
        });
    }

    /**
     * 分配工作任务
     */
    assignTask(task) {
        if (this.status !== 'available') {
            return false;
        }

        this.currentTask = {
            type: task.type,
            description: task.description,
            duration: task.duration,
            progress: 0,
            requirements: task.requirements || [],
            rewards: task.rewards || {}
        };

        this.status = 'working';
        this.workStartTime = Date.now();

        return true;
    }

    /**
     * 完成任务
     */
    completeTask() {
        if (!this.currentTask) return;

        const task = this.currentTask;

        // 计算成功率
        const successRate = this.calculateTaskSuccessRate(task);
        const success = Math.random() < successRate;

        // 处理任务结果
        this.processTaskResult(task, success);

        // 更新统计
        this.updateTaskStats(task, success);

        // 给予经验
        this.gainExperience(task.experience || 10);

        // 清理任务
        this.currentTask = null;
        this.workStartTime = null;
        this.status = 'available';

        // 触发事件
        this.triggerStaffEvent('taskCompleted', {
            staff: this,
            task: task,
            success: success
        });

        return { success: success, task: task };
    }

    /**
     * 计算任务成功率
     */
    calculateTaskSuccessRate(task) {
        let baseRate = 0.8;

        // 技能影响
        baseRate *= this.skill;

        // 疲劳影响
        if (this.fatigue > 70) {
            baseRate *= 0.7;
        } else if (this.fatigue > 50) {
            baseRate *= 0.85;
        }

        // 心情影响
        if (this.happiness < 30) {
            baseRate *= 0.8;
        } else if (this.happiness > 80) {
            baseRate *= 1.1;
        }

        // 特性影响
        this.traits.forEach(trait => {
            if (trait.id === 'careful') {
                baseRate += 0.1;
            } else if (trait.id === 'careless') {
                baseRate -= 0.05;
            }
        });

        return Math.max(0.1, Math.min(0.95, baseRate));
    }

    /**
     * 处理任务结果
     */
    processTaskResult(task, success) {
        if (success) {
            // 成功奖励
            if (task.rewards.gold) {
                // 这里可以给员工奖金，但暂时直接给玩家
                gameState.addGold(task.rewards.gold);
            }

            if (task.rewards.materials) {
                // 给予材料奖励
                Object.entries(task.rewards.materials).forEach(([material, amount]) => {
                    gameState.addMaterial(material, amount);
                });
            }

            // 心情提升
            this.happiness = Math.min(100, this.happiness + 5);
        } else {
            // 失败惩罚
            this.happiness = Math.max(0, this.happiness - 10);

            // 材料损失（如果是制作任务）
            if (task.type === 'brewing' && task.requirements.materials) {
                // 这里可以实现材料损失逻辑
            }
        }
    }

    /**
     * 更新任务统计
     */
    updateTaskStats(task, success) {
        switch (task.type) {
            case 'brewing':
                this.stats.potionsMade++;
                if (success) {
                    this.stats.successfulBrews++;
                } else {
                    this.stats.failedBrews++;
                }
                break;
            case 'serving':
                this.stats.customersServed++;
                break;
        }

        // 更新效率评级
        this.updateEfficiencyRating();
    }

    /**
     * 更新效率评级
     */
    updateEfficiencyRating() {
        const successRate = this.stats.successfulBrews / Math.max(1, this.stats.potionsMade);
        const workEfficiency = Math.max(0, 1 - (this.fatigue / 100));
        const happinessFactor = this.happiness / 100;

        this.stats.efficiencyRating = (successRate * 0.4 + workEfficiency * 0.3 + happinessFactor * 0.3) * 100;
    }

    /**
     * 获得经验
     */
    gainExperience(exp) {
        const baseExp = exp;

        // 特性加成
        let expMultiplier = 1;
        this.traits.forEach(trait => {
            if (trait.id === 'fast_learner') {
                expMultiplier += 0.2;
            }
        });

        this.experience += baseExp * expMultiplier;

        // 检查升级
        this.checkLevelUp();
    }

    /**
     * 检查升级
     */
    checkLevelUp() {
        const requiredExp = this.getRequiredExperience(this.level);
        if (this.experience >= requiredExp) {
            this.levelUp();
        }
    }

    /**
     * 升级
     */
    levelUp() {
        this.level++;
        this.experience -= this.getRequiredExperience(this.level - 1);

        // 提升属性
        this.skill += 0.1;
        this.efficiency += 0.05;

        // 期望工资增长
        this.salary = Math.floor(this.salary * 1.2);

        // 心情提升
        this.happiness = Math.min(100, this.happiness + 10);

        console.log(`${this.name} 升级到等级 ${this.level}！`);

        this.triggerStaffEvent('levelUp', {
            staff: this,
            newLevel: this.level
        });
    }

    /**
     * 获取升级所需经验
     */
    getRequiredExperience(level) {
        return level * level * 50;
    }

    /**
     * 获取期望工资
     */
    getExpectedSalary() {
        const baseSalary = 50;
        const levelMultiplier = 1 + (this.level - 1) * 0.3;
        const skillMultiplier = 1 + (this.skill - 1) * 0.5;

        return Math.floor(baseSalary * levelMultiplier * skillMultiplier);
    }

    /**
     * 强制休息
     */
    forceRest() {
        if (this.status === 'working') {
            this.currentTask = null;
            this.workStartTime = null;
        }

        this.status = 'resting';
        this.restStartTime = Date.now();

        console.log(`${this.name} 过度疲劳，强制休息。`);
    }

    /**
     * 生病
     */
    getSick() {
        this.status = 'sick';
        this.sickStartTime = Date.now();

        // 取消当前任务
        if (this.currentTask) {
            this.currentTask = null;
            this.workStartTime = null;
        }

        console.log(`${this.name} 生病了！`);
    }

    /**
     * 从疾病中恢复
     */
    recoverFromSickness() {
        this.status = 'available';
        this.sickStartTime = null;

        console.log(`${this.name} 康复了！`);
    }

    /**
     * 罢工
     */
    goOnStrike() {
        this.status = 'striking';
        this.currentTask = null;
        this.workStartTime = null;

        console.log(`${this.name} 罢工了！`);
    }

    /**
     * 辞职
     */
    resign() {
        this.status = 'resigned';
        this.currentTask = null;
        this.workStartTime = null;

        console.log(`${this.name} 辞职了！`);

        this.triggerStaffEvent('resigned', {
            staff: this,
            reason: 'low_loyalty'
        });
    }

    /**
     * 随机情绪波动
     */
    randomMoodSwing() {
        const swing = (Math.random() - 0.5) * 20;
        this.happiness = Math.max(0, Math.min(100, this.happiness + swing));
    }

    /**
     * 触发员工事件
     */
    triggerStaffEvent(eventType, data) {
        eventManager.triggerEvent('staffEvent', {
            type: eventType,
            staff: this,
            data: data
        });
    }

    /**
     * 获取员工信息
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            level: this.level,
            experience: this.experience,
            skill: Math.round(this.skill * 100) / 100,
            efficiency: Math.round(this.efficiency * 100) / 100,
            salary: this.salary,
            status: this.status,
            fatigue: Math.floor(this.fatigue),
            happiness: Math.floor(this.happiness),
            loyalty: Math.floor(this.loyalty),
            traits: this.traits,
            currentTask: this.currentTask,
            stats: { ...this.stats }
        };
    }

    /**
     * 获取员工状态描述
     */
    getStatusDescription() {
        const descriptions = {
            available: '空闲',
            working: this.currentTask ? `正在工作: ${this.currentTask.description}` : '工作中',
            resting: '休息中',
            sick: '生病中',
            striking: '罢工中',
            resigned: '已辞职'
        };

        return descriptions[this.status] || '未知状态';
    }

    /**
     * 获取员工心情描述
     */
    getMoodDescription() {
        if (this.happiness >= 90) return '非常开心';
        if (this.happiness >= 80) return '开心';
        if (this.happiness >= 70) return '愉快';
        if (this.happiness >= 60) return '一般';
        if (this.happiness >= 50) return '平淡';
        if (this.happiness >= 40) return '不太高兴';
        if (this.happiness >= 30) return '不高兴';
        if (this.happiness >= 20) return '沮丧';
        if (this.happiness >= 10) return '非常沮丧';
        return '绝望';
    }

    /**
     * 转换为JSON
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            level: this.level,
            experience: this.experience,
            skill: this.skill,
            salary: this.salary,
            efficiency: this.efficiency,
            status: this.status,
            currentTask: this.currentTask,
            workStartTime: this.workStartTime,
            restStartTime: this.restStartTime,
            sickStartTime: this.sickStartTime,
            stats: this.stats,
            traits: this.traits,
            specializations: this.specializations,
            fatigue: this.fatigue,
            happiness: this.happiness,
            loyalty: this.loyalty,
            contract: this.contract
        };
    }

    /**
     * 从JSON恢复
     */
    static fromJSON(data) {
        const staff = new Staff(data);
        // 恢复状态
        staff.fatigue = data.fatigue || 0;
        staff.happiness = data.happiness || 80;
        staff.loyalty = data.loyalty || 70;
        return staff;
    }
}

// 员工管理器
class StaffManager {
    constructor() {
        this.staff = [];
        this.hiringQueue = [];
        this.firedStaff = [];

        // 管理设置
        this.settings = {
            autoRest: true,
            maxFatigue: 80,
            minHappiness: 40,
            autoHire: false,
            salaryBudget: 1000
        };

        // 统计
        this.stats = {
            totalHired: 0,
            totalFired: 0,
            totalResigned: 0,
            averageEfficiency: 0,
            totalSalaries: 0,
            monthlySalaries: 0
        };

        // 更新定时器
        this.updateTimer = null;
    }

    /**
     * 初始化员工管理器
     */
    initialize() {
        this.startStaffUpdates();
    }

    /**
     * 开始员工状态更新
     */
    startStaffUpdates() {
        this.updateTimer = setInterval(() => {
            this.updateAllStaff();
        }, 1000); // 每秒更新一次
    }

    /**
     * 更新所有员工
     */
    updateAllStaff() {
        this.staff.forEach(staff => {
            staff.update(1); // 1秒更新间隔
        });

        // 自动管理
        this.autoManageStaff();

        // 更新统计
        this.updateStats();
    }

    /**
     * 自动管理员工
     */
    autoManageStaff() {
        if (!this.settings.autoRest) return;

        this.staff.forEach(staff => {
            // 强制休息
            if (staff.fatigue > this.settings.maxFatigue && staff.status === 'available') {
                staff.assignTask({
                    type: 'rest',
                    description: '强制休息',
                    duration: 3600 // 1小时
                });
            }

            // 处理不高兴的员工
            if (staff.happiness < this.settings.minHappiness) {
                this.handleUnhappyStaff(staff);
            }
        });
    }

    /**
     * 处理不高兴的员工
     */
    handleUnhappyStaff(staff) {
        // 可以尝试提高工资或改善工作条件
        const expectedSalary = staff.getExpectedSalary();
        if (staff.salary < expectedSalary * 0.8) {
            // 自动加薪
            staff.salary = Math.floor(expectedSalary * 0.9);
            staff.happiness += 10;
            console.log(`自动给 ${staff.name} 加薪到 ${staff.salary} 金币`);
        }
    }

    /**
     * 雇佣员工
     */
    hireStaff(staffData) {
        const staff = new Staff(staffData);
        this.staff.push(staff);
        this.stats.totalHired++;

        // 触发事件
        eventManager.triggerEvent('staffEvent', {
            type: 'hired',
            staff: staff
        });

        console.log(`雇佣了新员工: ${staff.name}`);
        return staff;
    }

    /**
     * 解雇员工
     */
    fireStaff(staffId, reason = 'unspecified') {
        const staff = this.staff.find(s => s.id === staffId);
        if (!staff) return false;

        // 从列表中移除
        this.staff = this.staff.filter(s => s.id !== staffId);

        // 添加到解雇列表
        this.firedStaff.push({
            staff: staff,
            firedTime: Date.now(),
            reason: reason
        });

        this.stats.totalFired++;

        // 触发事件
        eventManager.triggerEvent('staffEvent', {
            type: 'fired',
            staff: staff,
            reason: reason
        });

        console.log(`解雇了员工: ${staff.name} - 原因: ${reason}`);
        return true;
    }

    /**
     * 支付工资
     */
    paySalaries() {
        let totalSalaries = 0;

        this.staff.forEach(staff => {
            if (staff.status !== 'sick' && staff.status !== 'resigned') {
                totalSalaries += staff.salary;
            }
        });

        // 从游戏状态扣除工资
        const success = gameState.spendGold(totalSalaries);

        if (success) {
            this.stats.monthlySalaries = totalSalaries;
            console.log(`支付工资总计: ${totalSalaries} 金币`);
        } else {
            // 资金不足，员工心情下降
            this.staff.forEach(staff => {
                staff.happiness -= 20;
                staff.loyalty -= 10;
            });
            console.log('资金不足支付工资，员工士气下降！');
        }

        return success;
    }

    /**
     * 获取可用员工
     */
    getAvailableStaff() {
        return this.staff.filter(staff => staff.status === 'available');
    }

    /**
     * 分配任务给员工
     */
    assignTaskToStaff(task) {
        const availableStaff = this.getAvailableStaff();

        if (availableStaff.length === 0) {
            return null;
        }

        // 选择最合适的员工
        const bestStaff = this.selectBestStaffForTask(task, availableStaff);
        if (bestStaff) {
            bestStaff.assignTask(task);
            return bestStaff;
        }

        return null;
    }

    /**
     * 选择最适合的员工
     */
    selectBestStaffForTask(task, availableStaff) {
        return availableStaff.reduce((best, staff) => {
            const staffScore = this.calculateStaffTaskScore(staff, task);
            const bestScore = best ? this.calculateStaffTaskScore(best, task) : 0;

            return staffScore > bestScore ? staff : best;
        }, null);
    }

    /**
     * 计算员工任务评分
     */
    calculateStaffTaskScore(staff, task) {
        let score = staff.skill * 50; // 技能占50分

        // 效率加成
        score += staff.efficiency * 30; // 效率占30分

        // 疲劳惩罚
        score -= (staff.fatigue / 100) * 20; // 疲劳最多扣20分

        // 心情加成
        score += (staff.happiness / 100) * 10; // 心情占10分

        // 特殊化加成
        if (staff.specializations.includes(task.type)) {
            score += 20;
        }

        return Math.max(0, score);
    }

    /**
     * 更新统计
     */
    updateStats() {
        if (this.staff.length === 0) {
            this.stats.averageEfficiency = 0;
            return;
        }

        const totalEfficiency = this.staff.reduce((sum, staff) =>
            sum + staff.stats.efficiencyRating, 0
        );
        this.stats.averageEfficiency = totalEfficiency / this.staff.length;
    }

    /**
     * 获取员工信息
     */
    getStaffInfo() {
        return this.staff.map(staff => staff.getInfo());
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            ...this.stats,
            totalStaff: this.staff.length,
            availableStaff: this.getAvailableStaff().length,
            averageHappiness: this.staff.length > 0 ?
                this.staff.reduce((sum, s) => sum + s.happiness, 0) / this.staff.length : 0,
            averageLoyalty: this.staff.length > 0 ?
                this.staff.reduce((sum, s) => sum + s.loyalty, 0) / this.staff.length : 0
        };
    }

    /**
     * 停止管理器
     */
    stop() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Staff, StaffManager };
}