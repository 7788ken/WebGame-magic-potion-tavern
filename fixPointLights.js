/**
 * 批量修复PointLight的setAttenuation API错误 - 老王我的自动化脚本
 * 将 attenuation 从 setAttenuation() 方法改为构造函数的第6个参数
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
    'js/scenes/TavernScene.js',
    'js/scenes/BrewingScene.js',
    'js/scenes/EventScene.js',
    'js/scenes/BattleScene.js'
];

/**
 * 修复单个文件的PointLight API错误
 */
function fixFile(filePath) {
    console.log(`\n📄 处理文件: ${filePath}`);

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let fixes = 0;

        // 正则表达式匹配：pointlight创建后紧接着的setAttenuation调用
        const pattern = /this\.add\.pointlight\(([^)]+)\);\s*\n\s*(\w+)\.setAttenuation\(([^)]+)\);/g;

        content = content.replace(pattern, (match, constructorArgs, lightVar, attenuationValue) => {
            fixes++;
            console.log(`  修复: ${lightVar}.setAttenuation(${attenuationValue})`);

            // 将attenuation添加到构造函数的第6个参数
            const args = constructorArgs.split(',').map(arg => arg.trim());

            // 确保有5个参数（x, y, color, radius, intensity）
            while (args.length < 5) {
                args.push('1.0'); // 默认intensity
            }

            // 添加attenuation作为第6个参数
            args.push(attenuationValue);

            // 返回修复后的代码
            return `this.add.pointlight(${args.join(', ')});`;
        });

        // 处理内联的pointlight + setAttenuation（同一行）
        const inlinePattern = /this\.add\.pointlight\(([^;]+)\);\s*(\w+)\.setAttenuation\(([^;]+)\);/g;
        content = content.replace(inlinePattern, (match, constructorArgs, lightVar, attenuationValue) => {
            fixes++;
            console.log(`  修复内联: ${lightVar}.setAttenuation(${attenuationValue})`);

            const args = constructorArgs.split(',').map(arg => arg.trim());
            while (args.length < 5) {
                args.push('1.0');
            }
            args.push(attenuationValue);

            return `this.add.pointlight(${args.join(', ')});`;
        });

        // 如果有修改，写回文件
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 完成修复: ${fixes} 处`);
            return fixes;
        } else {
            console.log(`⏭️  无需修复`);
            return 0;
        }

    } catch (error) {
        console.error(`❌ 处理文件失败: ${filePath}`, error.message);
        return 0;
    }
}

/**
 * 批量修复所有文件
 */
function fixPointLights() {
    console.log('🔧 开始批量修复PointLight API错误...');
    console.log('📋 修复规则：将 setAttenuation() 改为构造函数的第6个参数');

    let totalFixes = 0;

    filesToFix.forEach(filePath => {
        const fixes = fixFile(filePath);
        totalFixes += fixes;
    });

    console.log(`\n🎉 PointLight API修复完成！总共修复了 ${totalFixes} 处`);
    console.log('💡 现在游戏应该不会再出现 setAttenuation 方法错误了！');
}

// 运行修复
if (require.main === module) {
    fixPointLights();
}

module.exports = { fixPointLights };