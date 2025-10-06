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
                console.log(`✅ 转换完成: ${svgPath} -> ${pngPath}`);
            } else {
                console.log(`⚠️ 文件不存在: ${svgPath}`);
            }
        } catch (error) {
            console.error(`❌ 转换失败: ${svgPath}`, error);
        }
    }

    console.log('🎉 所有图片转换完成！');
}

// 运行转换
convertSVGtoPNG().catch(console.error);