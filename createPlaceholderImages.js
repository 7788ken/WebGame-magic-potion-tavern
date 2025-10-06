/**
 * 创建占位图片 - 这个SB脚本生成基础占位图片
 * 老王我先让游戏跑起来，后续再慢慢美化！
 */

const fs = require('fs');
const path = require('path');

// 创建简单的SVG占位图片
function createPlaceholderSVG(width, height, color, text) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${color}"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em"
        font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 8}" fill="white">
    ${text}
  </text>
</svg>`;
}

// 创建Base64图片数据
function createBase64Image(svgContent) {
    return 'data:image/svg+xml;base64,' + Buffer.from(svgContent).toString('base64');
}

// 保存SVG文件
function saveSVGFile(filename, svgContent) {
    fs.writeFileSync(filename, svgContent);
    console.log(`✅ 创建了 ${filename}`);
}

// 主要的占位图片创建函数
function createPlaceholderImages() {
    console.log('🎨 开始创建占位图片...');

    // 确保目录存在
    const dirs = [
        'assets/images',
        'assets/ui',
        'assets/icons',
        'assets/materials',
        'assets/sprites',
        'assets/particles'
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // 1. Logo图片
    const logoSVG = createPlaceholderSVG(256, 256, '#2D1B69', '魔药\n酒馆');
    saveSVGFile('assets/images/logo.png.svg', logoSVG);

    // 2. 背景图片
    const bgSVG = createPlaceholderSVG(800, 600, '#1A1A2E', '酒馆背景');
    saveSVGFile('assets/images/background.jpg.svg', bgSVG);

    const tavernBgSVG = createPlaceholderSVG(800, 600, '#2D1B69', '酒馆内部');
    saveSVGFile('assets/images/tavern_background.jpg.svg', tavernBgSVG);

    // 3. UI按钮
    const buttonNormalSVG = createPlaceholderSVG(120, 40, '#4A4A4A', '按钮');
    saveSVGFile('assets/ui/button_normal.png.svg', buttonNormalSVG);

    const buttonHoverSVG = createPlaceholderSVG(120, 40, '#6A6A6A', '按钮');
    saveSVGFile('assets/ui/button_hover.png.svg', buttonHoverSVG);

    const buttonPressedSVG = createPlaceholderSVG(120, 40, '#2A2A2A', '按钮');
    saveSVGFile('assets/ui/button_pressed.png.svg', buttonPressedSVG);

    // 4. 图标
    const goldIconSVG = createPlaceholderSVG(32, 32, '#FFD700', '💰');
    saveSVGFile('assets/icons/gold.png.svg', goldIconSVG);

    const materialsIconSVG = createPlaceholderSVG(32, 32, '#00FF7F', '🌿');
    saveSVGFile('assets/icons/materials.png.svg', materialsIconSVG);

    const reputationIconSVG = createPlaceholderSVG(32, 32, '#87CEEB', '⭐');
    saveSVGFile('assets/icons/reputation.png.svg', reputationIconSVG);

    // 5. 材料图标
    const moonGrassSVG = createPlaceholderSVG(64, 64, '#9370DB', '月光草');
    saveSVGFile('assets/materials/moon_grass.png.svg', moonGrassSVG);

    const fireGrassSVG = createPlaceholderSVG(64, 64, '#FF6347', '火焰草');
    saveSVGFile('assets/materials/fire_grass.png.svg', fireGrassSVG);

    const dewDropSVG = createPlaceholderSVG(64, 64, '#87CEEB', '露珠');
    saveSVGFile('assets/materials/dew_drop.png.svg', dewDropSVG);

    // 6. 粒子效果
    const sparkParticleSVG = createPlaceholderSVG(4, 4, '#FFD700', '✦');
    saveSVGFile('assets/particles/spark.png.svg', sparkParticleSVG);

    const glowParticleSVG = createPlaceholderSVG(6, 6, '#00FF7F', '◆');
    saveSVGFile('assets/particles/glow.png.svg', glowParticleSVG);

    const magicParticleSVG = createPlaceholderSVG(8, 8, '#9370DB', '★');
    saveSVGFile('assets/particles/magic.png.svg', magicParticleSVG);

    // 7. 角色精灵
    const playerCharacterSVG = createPlaceholderSVG(64, 64, '#4A90E2', '玩家');
    saveSVGFile('assets/sprites/character_player.png.svg', playerCharacterSVG);

    const npcCharacterSVG = createPlaceholderSVG(64, 64, '#F5A623', 'NPC');
    saveSVGFile('assets/sprites/character_npc.png.svg', npcCharacterSVG);

    const enemyCharacterSVG = createPlaceholderSVG(64, 64, '#D0021B', '敌人');
    saveSVGFile('assets/sprites/character_enemy.png.svg', enemyCharacterSVG);

    // 创建占位图片数据文件
    const placeholderData = {
        images: {
            logo: 'assets/images/logo.png.svg',
            background: 'assets/images/background.jpg.svg',
            tavern_background: 'assets/images/tavern_background.jpg.svg'
        },
        ui: {
            button_normal: 'assets/ui/button_normal.png.svg',
            button_hover: 'assets/ui/button_hover.png.svg',
            button_pressed: 'assets/ui/button_pressed.png.svg'
        },
        icons: {
            gold: 'assets/icons/gold.png.svg',
            materials: 'assets/icons/materials.png.svg',
            reputation: 'assets/icons/reputation.png.svg'
        },
        materials: {
            moon_grass: 'assets/materials/moon_grass.png.svg',
            fire_grass: 'assets/materials/fire_grass.png.svg',
            dew_drop: 'assets/materials/dew_drop.png.svg'
        },
        particles: {
            spark: 'assets/particles/spark.png.svg',
            glow: 'assets/particles/glow.png.svg',
            magic: 'assets/particles/magic.png.svg'
        },
        sprites: {
            character_player: 'assets/sprites/character_player.png.svg',
            character_npc: 'assets/sprites/character_npc.png.svg',
            character_enemy: 'assets/sprites/character_enemy.png.svg'
        }
    };

    // 保存占位数据
    fs.writeFileSync('assets/placeholder_data.json', JSON.stringify(placeholderData, null, 2));
    console.log('✅ 创建了占位数据文件');

    // 创建图片转换脚本
    const conversionScript = `
// 图片格式转换脚本 - 老王我写的SB脚本
// 运行这个将SVG转换为PNG格式

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSVGtoPNG() {
    const files = [
        ['assets/images/logo.png.svg', 'assets/images/logo.png'],
        ['assets/images/background.jpg.svg', 'assets/images/background.jpg'],
        ['assets/images/tavern_background.jpg.svg', 'assets/images/tavern_background.jpg'],
        ['assets/ui/button_normal.png.svg', 'assets/ui/button_normal.png'],
        ['assets/ui/button_hover.png.svg', 'assets/ui/button_hover.png'],
        ['assets/ui/button_pressed.png.svg', 'assets/ui/button_pressed.png'],
        ['assets/icons/gold.png.svg', 'assets/icons/gold.png'],
        ['assets/icons/materials.png.svg', 'assets/icons/materials.png'],
        ['assets/icons/reputation.png.svg', 'assets/icons/reputation.png'],
        ['assets/materials/moon_grass.png.svg', 'assets/materials/moon_grass.png'],
        ['assets/materials/fire_grass.png.svg', 'assets/materials/fire_grass.png'],
        ['assets/materials/dew_drop.png.svg', 'assets/materials/dew_drop.png'],
        ['assets/particles/spark.png.svg', 'assets/particles/spark.png'],
        ['assets/particles/glow.png.svg', 'assets/particles/glow.png'],
        ['assets/particles/magic.png.svg', 'assets/particles/magic.png'],
        ['assets/sprites/character_player.png.svg', 'assets/sprites/character_player.png'],
        ['assets/sprites/character_npc.png.svg', 'assets/sprites/character_npc.png'],
        ['assets/sprites/character_enemy.png.svg', 'assets/sprites/character_enemy.png']
    ];

    console.log('🔄 开始转换SVG到PNG...');

    for (const [svgPath, pngPath] of files) {
        try {
            if (fs.existsSync(svgPath)) {
                await sharp(svgPath)
                    .png()
                    .toFile(pngPath);
                console.log(\`✅ 转换完成: \${svgPath} -> \${pngPath}\`);
            } else {
                console.log(\`⚠️ 文件不存在: \${svgPath}\`);
            }
        } catch (error) {
            console.error(\`❌ 转换失败: \${svgPath}\`, error);
        }
    }

    console.log('🎉 所有图片转换完成！');
}

// 运行转换
convertSVGtoPNG().catch(console.error);
`;

    fs.writeFileSync('convert_images.js', conversionScript.trim());
    console.log('✅ 创建了图片转换脚本');

    console.log('\n🎊 占位图片创建完成！');
    console.log('💡 下一步：');
    console.log('1. 运行 node createPlaceholderImages.js 生成SVG文件');
    console.log('2. 安装 sharp: npm install sharp');
    console.log('3. 运行 node convert_images.js 转换为PNG格式');
    console.log('4. 或者直接使用SVG格式的图片文件');
}

// 运行创建
if (require.main === module) {
    createPlaceholderImages();
}

module.exports = { createPlaceholderImages };