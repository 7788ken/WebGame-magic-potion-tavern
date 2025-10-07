/**
 * 老王SB错误管理系统
 * 专门收集和汇报各种SB报错
 */

class ErrorManager {
    constructor() {
        this.errors = [];
        this.maxErrors = 100; // 最多保存100个错误
        this.errorCategories = {
            SYNTAX: '语法错误',
            RUNTIME: '运行时错误',
            NETWORK: '网络错误',
            RESOURCE: '资源加载错误',
            LOGIC: '逻辑错误',
            TYPE: '类型错误',
            API: 'API错误',
            UNKNOWN: '未知错误'
        };
        this.isInitialized = false;
        this.errorReportCallback = null;

        this.init();
    }

    /**
     * 初始化错误处理系统
     */
    init() {
        if (this.isInitialized) return;

        // 设置全局错误处理
        this.setupGlobalErrorHandlers();

        // 设置Promise错误处理
        this.setupPromiseRejectionHandlers();

        // 从localStorage加载之前的错误
        this.loadErrorsFromStorage();

        this.isInitialized = true;
        console.log('✅ 老王错误管理系统初始化完成');
    }

    /**
     * 设置全局错误处理器
     */
    setupGlobalErrorHandlers() {
        // 处理常规错误
        window.addEventListener('error', (event) => {
            this.handleGlobalError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                stack: event.error?.stack,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });
        });

        // 处理资源加载错误
        window.addEventListener('error', (event) => {
            if (event.target && (event.target.src || event.target.href)) {
                this.handleResourceError({
                    type: 'resource',
                    tagName: event.target.tagName,
                    src: event.target.src || event.target.href,
                    timestamp: Date.now(),
                    url: window.location.href
                });
            }
        }, true);
    }

    /**
     * 设置Promise拒绝处理器
     */
    setupPromiseRejectionHandlers() {
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError({
                type: 'promise',
                message: event.reason?.message || 'Promise被拒绝',
                stack: event.reason?.stack,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });
        });
    }

    /**
     * 处理全局错误
     */
    handleGlobalError(errorInfo) {
        const categorizedError = this.categorizeError(errorInfo);
        this.addError(categorizedError);

        // 实时汇报严重错误
        if (categorizedError.severity === 'high') {
            this.reportErrorImmediately(categorizedError);
        }

        // 调用用户定义的错误回调
        if (this.errorReportCallback) {
            this.errorReportCallback(categorizedError);
        }
    }

    /**
     * 处理资源加载错误
     */
    handleResourceError(resourceInfo) {
        const error = {
            ...resourceInfo,
            category: this.errorCategories.RESOURCE,
            severity: 'medium',
            title: `资源加载失败: ${resourceInfo.src}`,
            description: `无法加载${resourceInfo.tagName}资源: ${resourceInfo.src}`
        };

        this.addError(error);
    }

    /**
     * 分类错误
     */
    categorizeError(errorInfo) {
        const message = errorInfo.message || '';
        const stack = errorInfo.stack || '';

        let category = this.errorCategories.UNKNOWN;
        let severity = 'low';
        let title = '未知错误';

        // 语法错误
        if (message.includes('SyntaxError') || message.includes('Unexpected token')) {
            category = this.errorCategories.SYNTAX;
            severity = 'high';
            title = '语法错误';
        }
        // 类型错误
        else if (message.includes('TypeError')) {
            category = this.errorCategories.TYPE;
            severity = 'high';
            title = '类型错误';
        }
        // 引用错误
        else if (message.includes('ReferenceError')) {
            category = this.errorCategories.RUNTIME;
            severity = 'high';
            title = '引用错误';
        }
        // 网络错误
        else if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
            category = this.errorCategories.NETWORK;
            severity = 'medium';
            title = '网络错误';
        }
        // 资源加载错误
        else if (errorInfo.type === 'resource') {
            category = this.errorCategories.RESOURCE;
            severity = 'medium';
            title = '资源加载错误';
        }
        // API错误
        else if (message.includes('API') || message.includes('xhr')) {
            category = this.errorCategories.API;
            severity = 'medium';
            title = 'API错误';
        }
        // 运行时错误
        else if (message.includes('Error')) {
            category = this.errorCategories.RUNTIME;
            severity = 'medium';
            title = '运行时错误';
        }

        return {
            ...errorInfo,
            category,
            severity,
            title,
            description: message || title,
            id: this.generateErrorId()
        };
    }

    /**
     * 添加错误到集合
     */
    addError(error) {
        this.errors.push(error);

        // 限制错误数量
        if (this.errors.length > this.maxErrors) {
            this.errors.shift(); // 移除最老的错误
        }

        // 保存到本地存储
        this.saveErrorsToStorage();

        // 控制台输出
        this.logError(error);
    }

    /**
     * 记录错误到控制台（老王风格）
     */
    logError(error) {
        const time = new Date(error.timestamp).toLocaleTimeString();
        const level = error.severity.toUpperCase();

        console.group(`🚨 ${level} - ${error.title} [${time}]`);
        console.error(`📍 位置: ${error.filename || '未知文件'}:${error.lineno || 0}:${error.colno || 0}`);
        console.error(`💬 描述: ${error.description}`);
        console.error(`🏷️  分类: ${error.category}`);

        if (error.stack) {
            console.error('📋 堆栈跟踪:');
            console.error(error.stack);
        }

        if (error.url) {
            console.error(`🔗 页面: ${error.url}`);
        }

        console.groupEnd();
    }

    /**
     * 实时汇报严重错误
     */
    reportErrorImmediately(error) {
        // 显示用户友好的错误提示
        this.showUserNotification(error);

        // 可以在这里添加服务器上报逻辑
        // this.reportToServer(error);
    }

    /**
     * 显示用户通知
     */
    showUserNotification(error) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            animation: slideIn 0.3s ease-out;
        `;

        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">🚨 游戏出错啦！</div>
            <div style="margin-bottom: 10px;">${error.title}</div>
            <div style="font-size: 12px; opacity: 0.8;">${error.description}</div>
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                top: 5px;
                right: 10px;
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
            ">×</button>
        `;

        document.body.appendChild(notification);

        // 5秒后自动移除
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * 生成错误ID
     */
    generateErrorId() {
        return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 保存错误到本地存储
     */
    saveErrorsToStorage() {
        try {
            const errorsToSave = this.errors.slice(-50); // 只保存最近50个
            localStorage.setItem('game_errors', JSON.stringify(errorsToSave));
        } catch (e) {
            console.warn('无法保存错误到本地存储:', e);
        }
    }

    /**
     * 从本地存储加载错误
     */
    loadErrorsFromStorage() {
        try {
            const saved = localStorage.getItem('game_errors');
            if (saved) {
                this.errors = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('无法从本地存储加载错误:', e);
        }
    }

    /**
     * 获取所有错误
     */
    getAllErrors() {
        return [...this.errors];
    }

    /**
     * 按分类获取错误
     */
    getErrorsByCategory(category) {
        return this.errors.filter(error => error.category === category);
    }

    /**
     * 按严重程度获取错误
     */
    getErrorsBySeverity(severity) {
        return this.errors.filter(error => error.severity === severity);
    }

    /**
     * 获取最近的错误
     */
    getRecentErrors(count = 10) {
        return this.errors.slice(-count);
    }

    /**
     * 获取错误统计
     */
    getErrorStats() {
        const stats = {
            total: this.errors.length,
            byCategory: {},
            bySeverity: {},
            recent: this.getRecentErrors(5)
        };

        Object.values(this.errorCategories).forEach(category => {
            stats.byCategory[category] = this.getErrorsByCategory(category).length;
        });

        ['high', 'medium', 'low'].forEach(severity => {
            stats.bySeverity[severity] = this.getErrorsBySeverity(severity).length;
        });

        return stats;
    }

    /**
     * 生成错误报告
     */
    generateReport() {
        const stats = this.getErrorStats();
        const report = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            stats: stats,
            allErrors: this.getAllErrors()
        };

        return report;
    }

    /**
     * 显示错误报告
     */
    showErrorReport() {
        const report = this.generateReport();
        const reportHtml = this.createReportHTML(report);

        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'error-report-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 20000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
        `;

        modal.innerHTML = reportHtml;
        document.body.appendChild(modal);

        // 添加关闭事件
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.className === 'close-report') {
                modal.remove();
            }
        });
    }

    /**
     * 创建报告HTML
     */
    createReportHTML(report) {
        const errorRows = report.allErrors.map(error => `
            <tr>
                <td>${new Date(error.timestamp).toLocaleString()}</td>
                <td>${error.category}</td>
                <td><span class="severity-${error.severity}">${error.severity}</span></td>
                <td>${error.title}</td>
                <td>${error.description}</td>
                <td>${error.filename || 'N/A'}:${error.lineno || 0}</td>
            </tr>
        `).join('');

        return `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 90%;
                max-height: 90%;
                overflow: auto;
                position: relative;
            ">
                <button class="close-report" style="
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                ">×</button>

                <h2 style="margin-bottom: 20px; color: #e74c3c;">🚨 老王错误报告</h2>

                <div style="margin-bottom: 20px;">
                    <h3>📊 错误统计</h3>
                    <p>总错误数: <strong>${report.stats.total}</strong></p>
                    <div style="display: flex; gap: 20px; margin: 10px 0;">
                        <div>🔴 高危: ${report.stats.bySeverity.high}</div>
                        <div>🟡 中危: ${report.stats.bySeverity.medium}</div>
                        <div>🟢 低危: ${report.stats.bySeverity.low}</div>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3>📋 错误详情</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <thead>
                            <tr style="background: #f5f5f5;">
                                <th style="padding: 8px; border: 1px solid #ddd;">时间</th>
                                <th style="padding: 8px; border: 1px solid #ddd;">分类</th>
                                <th style="padding: 8px; border: 1px solid #ddd;">级别</th>
                                <th style="padding: 8px; border: 1px solid #ddd;">标题</th>
                                <th style="padding: 8px; border: 1px solid #ddd;">描述</th>
                                <th style="padding: 8px; border: 1px solid #ddd;">位置</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${errorRows}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 20px;">
                    <button onclick="errorManager.exportReport()" style="
                        background: #3498db;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-right: 10px;
                    ">📥 导出报告</button>

                    <button onclick="errorManager.clearErrors()" style="
                        background: #e74c3c;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">🗑️ 清空错误</button>
                </div>
            </div>
        `;
    }

    /**
     * 导出错误报告
     */
    exportReport() {
        const report = this.generateReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-report-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * 清空所有错误
     */
    clearErrors() {
        this.errors = [];
        this.saveErrorsToStorage();
        console.log('🗑️ 所有错误已清空');

        // 刷新报告界面
        const modal = document.querySelector('.error-report-modal');
        if (modal) {
            modal.remove();
            this.showErrorReport();
        }
    }

    /**
     * 设置错误汇报回调
     */
    setErrorReportCallback(callback) {
        this.errorReportCallback = callback;
    }
}

// 创建全局错误管理器实例
const errorManager = new ErrorManager();

// 添加到window对象，方便全局访问
if (typeof window !== 'undefined') {
    window.errorManager = errorManager;
}

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorManager, errorManager };
}

/**
 * 添加CSS样式
 */
const errorManagerStyles = `
<style>
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.error-notification {
    animation: slideIn 0.3s ease-out;
}

.severity-high {
    color: #e74c3c;
    font-weight: bold;
}

.severity-medium {
    color: #f39c12;
}

.severity-low {
    color: #27ae60;
}

.error-report-modal table {
    font-size: 12px;
}

.error-report-modal th,
.error-report-modal td {
    padding: 8px;
    border: 1px solid #ddd;
    text-align: left;
}

.error-report-modal th {
    background: #f5f5f5;
    font-weight: bold;
}

.error-report-modal tr:nth-child(even) {
    background: #f9f9f9;
}

.error-report-modal button:hover {
    opacity: 0.8;
}
</style>
`;

// 注入样式
document.addEventListener('DOMContentLoaded', () => {
    document.head.insertAdjacentHTML('beforeend', errorManagerStyles);
});