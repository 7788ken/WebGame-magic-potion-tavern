/**
 * 批量修复音频播放调用 - 老王我的自动化脚本
 * 将所有 this.sound.play() 替换为 GameConfig.audio.playSafe()
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
    'js/scenes/MenuScene.js',
    'js/scenes/BrewingScene.js',
    'js/scenes/BattleScene.js',
    'js/scenes/EventScene.js',
    'js/scenes/TavernScene.js'
];

// 音频播放替换规则
const replacementRules = [
    {
        pattern: /this\.sound\.play\('(sfx_[a-zA-Z_]+)'\s*,\s*\{([^}]+)\}\)/g,
        replacement: "GameConfig.audio.playSafe(this, '$1', {$2})"
    },
    {
        pattern: /this\.sound\.play\('(bgm_[a-zA-Z_]+)'\s*,\s*\{([^}]+)\}\)/g,
        replacement: "GameConfig.audio.playSafe(this, '$1', {$2})"
    },
    {
        pattern: /this\.sound\.play\('(sfx_[a-zA-Z_]+)'\)/g,
        replacement: "GameConfig.audio.playSafe(this, '$1')"
    },
    {
        pattern: /this\.sound\.play\('(bgm_[a-zA-Z_]+)'\)/g,
        replacement: "GameConfig.audio.playSafe(this, '$1')"
    },
    {
        pattern: /this\.sound\.play\((soundKey)\s*,\s*\{([^}]+)\}\)/g,
        replacement: "GameConfig.audio.playSafe(this, $1, {$2})"
    },
    {
        pattern: /this\.sound\.play\((soundKey)\)/g,
        replacement: "GameConfig.audio.playSafe(this, $1)"
    }
];

// 批量修复文件
function fixAudioCalls() {
    console.log('🔧 开始批量修复音频播放调用...');

    let totalFixes = 0;

    filesToFix.forEach(filePath => {
        console.log(`\n📄 处理文件: ${filePath}`);

        try {
            // 读取文件内容
            let content = fs.readFileSync(filePath, 'utf8');
            let fileFixes = 0;
            let originalContent = content;

            // 应用替换规则
            replacementRules.forEach((rule, index) => {
                const matches = content.match(rule.pattern);
                if (matches) {
                    content = content.replace(rule.pattern, rule.replacement);
                    const ruleFixes = matches.length;
                    fileFixes += ruleFixes;
                    console.log(`  规则${index + 1}: 修复了 ${ruleFixes} 处`);
                }
            });

            // 如果有修改，写回文件
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                totalFixes += fileFixes;
                console.log(`✅ 完成修复: ${fileFixes} 处`);
            } else {
                console.log(`⏭️  无需修复`);
            }

        } catch (error) {
            console.error(`❌ 处理文件失败: ${filePath}`, error.message);
        }
    });

    console.log(`\n🎉 批量修复完成！总共修复了 ${totalFixes} 处音频播放调用`);
    console.log('💡 现在游戏应该不会再出现音频缓存错误了！');
}

// 运行修复
if (require.main === module) {
    fixAudioCalls();
}

module.exports = { fixAudioCalls };