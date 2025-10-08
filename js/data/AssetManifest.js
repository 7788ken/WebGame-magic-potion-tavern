const AssetManifest = {
    categories: {
        backgrounds: {
            tavern_interior: {
                type: 'image',
                path: 'resources/tavern-interior.jpg', // 酒馆: 竖屏主界面像素背景
                usage: '酒馆主界面背景'
            },
            brewing_background: {
                type: 'image',
                path: 'resources/potions-collection.jpg', // 炼制: 魔药工作台背景
                usage: '炼制场景背景'
            },
            battle_background: {
                type: 'image',
                path: 'resources/battle-scene.jpg', // 战斗: 对战竞技场背景
                usage: '对战场景背景'
            },
            menu_background: {
                type: 'image',
                path: 'resources/hero-tavern.jpg', // 菜单: 开场宣传像素插画
                usage: '主菜单背景'
            }
        },
        ui: {
            ui_panel: {
                type: 'image',
                path: 'assets/ui/panel.png.svg', // UI: 像素金属面板底板
                usage: '通用信息面板'
            },
            ui_window: {
                type: 'image',
                path: 'assets/ui/window.png.svg', // UI: 像素玻璃窗框
                usage: '顶部窗口镶边'
            },
            ui_button: {
                type: 'image',
                path: 'assets/ui/button_normal.png.svg', // UI: 常规按钮底板
                usage: '默认按钮状态'
            },
            ui_button_hover: {
                type: 'image',
                path: 'assets/ui/button_hover.png.svg', // UI: 按钮悬停高亮
                usage: '按钮悬停状态'
            },
            ui_button_pressed: {
                type: 'image',
                path: 'assets/ui/button_pressed.png.svg', // UI: 按钮按下反馈
                usage: '按钮按下状态'
            },
            ui_progress_bar: {
                type: 'image',
                path: 'assets/ui/progress_bar.png.svg', // UI: 进度条外框
                usage: '时间进度条外框'
            },
            ui_progress_fill: {
                type: 'image',
                path: 'assets/ui/slider.png.svg', // UI: 进度条填充块
                usage: '进度条填充材质'
            }
        },
        icons: {
            icon_gold: {
                type: 'image',
                path: 'assets/icons/gold.png.svg', // 图标: 货币金币标识
                usage: '资源栏金币图标'
            },
            icon_reputation: {
                type: 'image',
                path: 'assets/icons/reputation.png.svg', // 图标: 声望星标
                usage: '资源栏声望图标'
            },
            icon_materials: {
                type: 'image',
                path: 'assets/icons/materials.png.svg', // 图标: 材料箱图案
                usage: '资源栏材料图标'
            },
            icon_customers: {
                type: 'image',
                path: 'assets/icons/inventory.png.svg', // 图标: 客人排队卡片
                usage: '通知客户入口'
            },
            icon_staff: {
                type: 'image',
                path: 'assets/icons/experience.png.svg', // 图标: 员工经验徽章
                usage: '员工列表按钮'
            },
            icon_battle: {
                type: 'image',
                path: 'assets/icons/attack.png.svg', // 图标: 战斗交叉剑
                usage: '战斗功能图标'
            },
            icon_potion: {
                type: 'image',
                path: 'assets/icons/mana.png.svg', // 图标: 魔药瓶图示
                usage: '魔药功能图标'
            },
            icon_palette: {
                type: 'image',
                path: 'assets/icons/settings.png.svg', // 图标: 设置齿轮代替调色盘
                usage: '快捷设置入口'
            },
            icon_bell: {
                type: 'image',
                path: 'assets/icons/quest.png.svg', // 图标: 任务卷轴代替通知铃
                usage: '消息提示入口'
            }
        },
        characters: {
            character_player: {
                type: 'image',
                path: 'assets/sprites/character_player.png.svg', // 角色: 玩家立绘像素稿
                usage: '玩家信息头像'
            },
            character_npc: {
                type: 'image',
                path: 'assets/sprites/character_npc.png.svg', // 角色: NPC店员像素稿
                usage: '员工信息头像'
            },
            character_enemy: {
                type: 'image',
                path: 'assets/sprites/character_enemy.png.svg', // 角色: 对手像素头像
                usage: '战斗敌方头像'
            }
        },
        sprites: {
            potions: {
                type: 'image',
                path: 'assets/sprites/potions.png.svg', // 精灵: 魔药组合像素贴图
                usage: '魔药展示贴图'
            },
            effects: {
                type: 'image',
                path: 'assets/sprites/effects.png.svg', // 精灵: 魔法特效贴图
                usage: '战斗特效贴图'
            },
            cards: {
                type: 'image',
                path: 'assets/sprites/cards.png.svg', // 精灵: 卡牌正面集合
                usage: '战斗卡牌资源'
            },
            particles: {
                type: 'image',
                path: 'assets/sprites/particles.png.svg', // 精灵: 粒子散射素材
                usage: '通用粒子效果'
            },
            potion_base: {
                type: 'image',
                path: 'assets/materials/dew_drop.png.svg', // 精灵: 魔药基础瓶体
                usage: '魔药合成底图'
            },
            card_back: {
                type: 'image',
                path: 'assets/sprites/card_back.png.svg', // 精灵: 卡牌背面像素纹理
                usage: '战斗卡牌背面'
            },
            button_normal: {
                type: 'image',
                path: 'assets/ui/button_normal.png.svg', // 精灵: 旧版按钮底图
                usage: '兼容旧按钮资源'
            },
            button_hover: {
                type: 'image',
                path: 'assets/ui/button_hover.png.svg', // 精灵: 旧版按钮悬停
                usage: '兼容旧按钮悬停'
            },
            button_pressed: {
                type: 'image',
                path: 'assets/ui/button_pressed.png.svg', // 精灵: 旧版按钮按压
                usage: '兼容旧按钮按压'
            },
            panel: {
                type: 'image',
                path: 'assets/ui/panel.png.svg', // 精灵: 旧版面板占位
                usage: '兼容旧面板引用'
            },
            window: {
                type: 'image',
                path: 'assets/ui/window.png.svg', // 精灵: 旧版窗口占位
                usage: '兼容旧窗口引用'
            },
            particle_spark: {
                type: 'image',
                path: 'assets/particles/spark.png.svg', // 精灵: 火花粒子
                usage: '粒子闪光效果'
            },
            particle_glow: {
                type: 'image',
                path: 'assets/particles/glow.png.svg', // 精灵: 光晕粒子
                usage: '粒子光晕效果'
            },
            particle_magic: {
                type: 'image',
                path: 'assets/particles/magic.png.svg', // 精灵: 魔法烟雾
                usage: '粒子魔法特效'
            }
        },
        materials: {
            material_moon_grass: {
                type: 'image',
                path: 'assets/materials/moon_grass.png.svg', // 材料: 月光草图标
                usage: '材料-月光草'
            },
            material_fire_grass: {
                type: 'image',
                path: 'assets/materials/fire_grass.png.svg', // 材料: 火焰草图标
                usage: '材料-火焰草'
            },
            material_dew_drop: {
                type: 'image',
                path: 'assets/materials/dew_drop.png.svg', // 材料: 晨露滴图标
                usage: '材料-晨露滴'
            },
            material_spring_water: {
                type: 'image',
                path: 'assets/materials/wind_leaf.png.svg', // 材料: 以风叶替代泉水图标
                usage: '材料-清泉水'
            },
            material_dragon_scale: {
                type: 'image',
                path: 'assets/materials/dark_essence.png.svg', // 材料: 以暗影精华代替龙鳞
                usage: '材料-龙鳞'
            },
            material_phoenix_feather: {
                type: 'image',
                path: 'assets/materials/light_shard.png.svg', // 材料: 以光辉碎片代替凤凰羽
                usage: '材料-凤凰羽'
            },
            material_demon_blood: {
                type: 'image',
                path: 'assets/materials/fire_grass.png.svg', // 材料: 复用火焰草作恶魔血
                usage: '材料-恶魔血'
            },
            material_unicorn_horn: {
                type: 'image',
                path: 'assets/materials/earth_root.png.svg', // 材料: 以大地根代替独角碎片
                usage: '材料-独角碎片'
            },
            material_time_sand: {
                type: 'image',
                path: 'assets/materials/moon_grass.png.svg', // 材料: 复用月光草作时光砂
                usage: '材料-时光砂'
            },
            material_soul_fragment: {
                type: 'image',
                path: 'assets/materials/ice_crystal.png.svg', // 材料: 以寒冰结晶代替灵魂碎片
                usage: '材料-灵魂碎片'
            },
            material_eternal_flower: {
                type: 'image',
                path: 'assets/materials/thunder_stone.png.svg', // 材料: 以雷霆石代替永恒花
                usage: '材料-永恒花'
            }
        }
    },
    audio: {
        bgm_main: {
            type: 'audio',
            path: 'assets/audio/bgm/main-bgm.mp3', // 音频: 主界面背景音乐
            usage: '主菜单背景音乐'
        },
        bgm_tavern: {
            type: 'audio',
            path: 'assets/audio/tavern_theme.wav', // 音频: 酒馆日常氛围
            usage: '酒馆场景背景乐'
        },
        bgm_brewing: {
            type: 'audio',
            path: 'assets/audio/brewing_theme.wav', // 音频: 炼制工作节奏
            usage: '炼制场景背景乐'
        },
        bgm_battle: {
            type: 'audio',
            path: 'assets/audio/battle_theme.wav', // 音频: 战斗紧张配乐
            usage: '战斗场景背景乐'
        },
        bgm_victory: {
            type: 'audio',
            path: 'assets/audio/victory_theme.wav', // 音频: 胜利庆典旋律
            usage: '结算胜利配乐'
        },
        sfx_click: {
            type: 'audio',
            path: 'assets/audio/click.wav', // 音频: UI像素点击声
            usage: 'UI点击反馈'
        },
        sfx_hover: {
            type: 'audio',
            path: 'assets/audio/hover_sound.mp3', // 音频: UI悬停提示
            usage: 'UI悬停反馈'
        },
        sfx_success: {
            type: 'audio',
            path: 'assets/audio/success.wav', // 音频: 成功音效
            usage: '成功提示音'
        },
        sfx_fail: {
            type: 'audio',
            path: 'assets/audio/fail.wav', // 音频: 失败音效
            usage: '失败提示音'
        },
        sfx_potion_create: {
            type: 'audio',
            path: 'assets/audio/potion_create.wav', // 音频: 魔药制作完成
            usage: '炼制完成提示'
        },
        sfx_potion_use: {
            type: 'audio',
            path: 'assets/audio/potion_use.wav', // 音频: 魔药使用声
            usage: '魔药使用反馈'
        },
        sfx_card_draw: {
            type: 'audio',
            path: 'assets/audio/card_draw.wav', // 音频: 抽卡滑动声
            usage: '战斗抽卡音'
        },
        sfx_card_play: {
            type: 'audio',
            path: 'assets/audio/card_play.wav', // 音频: 出牌敲击声
            usage: '战斗出牌音'
        },
        sfx_coin: {
            type: 'audio',
            path: 'assets/audio/coin.wav', // 音频: 金币叮当声
            usage: '金币结算音'
        },
        sfx_level_up: {
            type: 'audio',
            path: 'assets/audio/level_up.wav', // 音频: 升级提示音
            usage: '升级反馈音'
        },
        sfx_notification: {
            type: 'audio',
            path: 'assets/audio/notification.wav', // 音频: 通知提示音
            usage: '消息提示音'
        }
    },
    data: {
        potion_recipes: {
            type: 'json',
            path: 'assets/data/potion_recipes.json', // 数据: 魔药配方配置
            usage: '魔药配方数据'
        },
        card_definitions: {
            type: 'json',
            path: 'assets/data/card_definitions.json', // 数据: 卡牌属性表
            usage: '战斗卡牌数据'
        },
        customer_types: {
            type: 'json',
            path: 'assets/data/customer_types.json', // 数据: 客人行为模型
            usage: '客人类型数据'
        },
        random_events: {
            type: 'json',
            path: 'assets/data/random_events.json', // 数据: 随机事件库
            usage: '事件定义数据'
        },
        dialogues: {
            type: 'json',
            path: 'assets/data/dialogues.json', // 数据: 对话脚本集合
            usage: '客人对话数据'
        },
        achievements: {
            type: 'json',
            path: 'assets/data/achievements.json', // 数据: 成就条件表
            usage: '成就系统数据'
        },
        game_config: {
            type: 'json',
            path: 'assets/config/game_config.json', // 数据: 游戏平衡配置
            usage: '全局游戏配置'
        },
        localization: {
            type: 'json',
            path: 'assets/localization/zh_cn.json', // 数据: 中文本地化文本
            usage: '本地化文本'
        },
        animations: {
            type: 'json',
            path: 'assets/animations/animations.json', // 数据: 战斗动画帧配置
            usage: '动画曲线数据'
        }
    },
    boot: {
        images: [
            'ui_panel',
            'ui_window',
            'ui_button',
            'ui_button_hover',
            'ui_button_pressed',
            'ui_progress_bar',
            'ui_progress_fill',
            'icon_gold',
            'icon_reputation',
            'icon_materials',
            'icon_battle',
            'icon_potion',
            'icon_palette',
            'icon_bell'
        ],
        audio: [
            'sfx_click',
            'sfx_hover'
        ]
    }
};

AssetManifest.materials = AssetManifest.categories.materials;

AssetManifest.resolve = function (key) {
    for (const group of Object.values(this.categories)) {
        if (group[key]) {
            return group[key];
        }
    }
    if (this.audio[key]) {
        return this.audio[key];
    }
    if (this.data[key]) {
        return this.data[key];
    }
    return null;
};

AssetManifest.collectKeys = function (groups) {
    const keys = new Set();
    groups.forEach(groupName => {
        const group = this.categories[groupName];
        if (group) {
            Object.keys(group).forEach(key => keys.add(key));
        }
    });
    return Array.from(keys);
};

AssetManifest.loadAsset = function (scene, key, definition) {
    if (!definition) {
        console.warn('[AssetManifest] 未找到资源定义:', key);
        return;
    }

    switch (definition.type) {
        case 'image':
            scene.load.image(key, definition.path);
            break;
        case 'audio':
            scene.load.audio(key, definition.path);
            break;
        case 'json':
            scene.load.json(key, definition.path);
            break;
        default:
            console.warn('[AssetManifest] 未处理的资源类型:', definition.type, key);
            break;
    }
};

AssetManifest.loadCategory = function (scene, categoryName) {
    const group = this.categories[categoryName];
    if (!group) return;
    Object.entries(group).forEach(([key, definition]) => {
        this.loadAsset(scene, key, definition);
    });
};

AssetManifest.loadAudioGroup = function (scene) {
    Object.entries(this.audio).forEach(([key, definition]) => {
        this.loadAsset(scene, key, definition);
    });
};

AssetManifest.loadDataGroup = function (scene) {
    Object.entries(this.data).forEach(([key, definition]) => {
        this.loadAsset(scene, key, definition);
    });
};

AssetManifest.loadByKeys = function (scene, keys) {
    keys.forEach(key => {
        const definition = this.resolve(key);
        this.loadAsset(scene, key, definition);
    });
};

AssetManifest.loadAllCategories = function (scene) {
    Object.keys(this.categories).forEach(categoryName => {
        this.loadCategory(scene, categoryName);
    });
};

AssetManifest.loadAll = function (scene) {
    this.loadAllCategories(scene);
    this.loadAudioGroup(scene);
    this.loadDataGroup(scene);
};

if (typeof window !== 'undefined') {
    window.AssetManifest = AssetManifest;
}
