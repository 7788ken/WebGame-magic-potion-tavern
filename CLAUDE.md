# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

魔药酒馆 (Potion Tavern) - 一个基于HTML/CSS/JavaScript的网页游戏项目，融合经营模拟和对战系统。

## 技术栈

- **前端框架**: 纯HTML5 + CSS3 + JavaScript (ES6+)
- **动画库**: Anime.js (页面动画和过渡效果)
- **粒子效果**: Pixi.js (魔法氛围粒子系统)
- **轮播组件**: Splide.js (图片展示)
- **样式框架**: Tailwind CSS (响应式布局)
- **字体**: Google Fonts (Noto Serif SC, Noto Sans SC, ZCOOL KuaiLe)

## 项目结构

```
/Users/lijianqian/svn/Game-MYJG/
├── index.html          # 主页 - 游戏概览和特色展示
├── gameplay.html       # 玩法页 - 经营和对战系统介绍
├── potions.html        # 魔药页 - 魔药图鉴和制作模拟
├── main.js            # 核心交互逻辑和状态管理
├── game.js            # 游戏逻辑 (轻量级版本)
├── game-fixed.js       # 修复版本的游戏逻辑
├── resources/         # 静态资源
│   ├── hero-tavern.jpg
│   ├── potions-collection.jpg
│   ├── battle-scene.jpg
│   └── tavern-interior.jpg
├── design.md          # 设计风格文档
├── interaction.md     # 交互设计文档
└── outline.md         # 项目大纲文档
```

## 核心功能模块

### 1. 魔药制作模拟器 (potions.html)
- 材料选择面板 (月光草、露珠、火焰草等)
- 拖拽合成系统
- 实时效果预览
- 状态管理: `selectedMaterials` 数组

### 2. 酒馆经营系统 (gameplay.html)
- 资源面板: 金币、材料、员工、等级
- 经营状态管理: `gameState` 对象
- 采购、制作、销售流程

### 3. 对战系统 (gameplay.html)
- 分屏显示玩家和对手
- 材料抽取动画
- 魔药使用策略
- 血量状态: `playerHP`, `enemyHP`

### 4. 魔药图鉴 (potions.html)
- 分类展示 (攻击类、控制类、辅助类)
- 搜索和筛选功能
- 悬停详情展示
- 制作动画演示

## 开发要点

### 颜色方案
- 主色调: #2D1B69 (深紫色)
- 辅助色: #FFD700 (金色)
- 强调色: #00FF7F (翠绿色)
- 背景色: #1A1A2E (深灰蓝)
- 文字色: #FFF8DC (象牙白)

### 字体使用
- 标题: ZCOOL KuaiLe (游戏标题专用)
- 正文标题: Noto Serif SC (粗体)
- 正文内容: Noto Sans SC (常规)

### 状态管理
全局状态通过 `gameState` 对象管理:
```javascript
gameState = {
    gold: 1250,      // 金币
    materials: 45,   // 材料数量
    staff: 3,        // 员工数量
    level: 5,        // 经营等级
    playerHP: 100,   // 玩家血量
    enemyHP: 85,     // 敌人血量
    currentRound: 3  // 当前回合
}
```

## 常用开发命令

### 本地开发
由于这是纯前端项目，直接在浏览器中打开HTML文件即可:
```bash
# 使用Python简单HTTP服务器 (可选)
python -m http.server 8000
# 或使用Node.js http-server
npx http-server
```

### 文件检查
```bash
# 检查HTML语法
# 使用浏览器开发者工具或在线验证器

# 检查JavaScript语法
node -c main.js
node -c game.js
node -c game-fixed.js
```

## 关键代码入口点

1. **main.js**: 主要的交互逻辑入口
   - `initializeAnimations()`: 页面动画初始化
   - `initializeParticles()`: 粒子效果初始化
   - `initializeInteractions()`: 交互功能初始化
   - `initializePotionFiltering()`: 魔药筛选功能
   - `initializeBrewingSimulator()`: 制作模拟器

2. **页面特定功能**:
   - index.html: 主页动画和导航
   - gameplay.html: 经营和对战系统演示
   - potions.html: 魔药图鉴和制作模拟

## 注意事项

- 所有动画效果依赖Anime.js，确保CDN加载正常
- 粒子效果使用Pixi.js，注意性能优化
- 响应式设计基于Tailwind CSS，遵循移动优先原则
- 状态管理集中在main.js，避免重复定义