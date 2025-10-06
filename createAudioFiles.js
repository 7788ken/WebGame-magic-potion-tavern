/**
 * 创建占位音频文件 - 老王我的快速解决方案
 * 使用Web Audio API生成基础音效
 */

const fs = require('fs');
const path = require('path');

// 创建简单的WAV音频文件
function createWAVFile(frequency, duration, filename, volume = 0.3) {
    const sampleRate = 44100;
    const numSamples = sampleRate * duration;
    const buffer = Buffer.allocUnsafe(44 + numSamples * 2); // 16-bit PCM

    // WAV文件头
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + numSamples * 2, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // 单声道
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(numSamples * 2, 40);

    // 生成音频数据 - 简单的正弦波
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const value = Math.sin(2 * Math.PI * frequency * t) * volume * 32767;
        buffer.writeInt16LE(Math.floor(value), 44 + i * 2);
    }

    fs.writeFileSync(filename, buffer);
    console.log(`✅ 创建了 ${filename}`);
}

// 创建不同频率和时长的音效
function createAudioFiles() {
    console.log('🔊 开始创建占位音频文件...');

    // 背景音乐 - 较长的音调
    createWAVFile(220, 2, 'assets/audio/main_theme.wav', 0.2);     // A3
    createWAVFile(246, 2, 'assets/audio/tavern_theme.wav', 0.2);   // B3
    createWAVFile(261, 2, 'assets/audio/brewing_theme.wav', 0.2);  // C4
    createWAVFile(293, 2, 'assets/audio/battle_theme.wav', 0.2);   // D4
    createWAVFile(329, 2, 'assets/audio/victory_theme.wav', 0.2);  // E4

    // UI音效 - 短促音调
    createWAVFile(800, 0.1, 'assets/audio/click.wav', 0.3);        // 点击音
    createWAVFile(600, 0.15, 'assets/audio/hover.wav', 0.2);       // 悬停音
    createWAVFile(500, 0.3, 'assets/audio/success.wav', 0.4);      // 成功音
    createWAVFile(200, 0.3, 'assets/audio/fail.wav', 0.3);         // 失败音

    // 游戏音效
    createWAVFile(400, 0.5, 'assets/audio/potion_create.wav', 0.3); // 制作药水
    createWAVFile(450, 0.3, 'assets/audio/potion_use.wav', 0.4);    // 使用药水
    createWAVFile(350, 0.2, 'assets/audio/card_draw.wav', 0.3);     // 抽卡
    createWAVFile(550, 0.15, 'assets/audio/card_play.wav', 0.4);    // 出牌
    createWAVFile(700, 0.1, 'assets/audio/coin.wav', 0.5);          // 金币音
    createWAVFile(880, 0.4, 'assets/audio/level_up.wav', 0.5);      // 升级音
    createWAVFile(660, 0.2, 'assets/audio/notification.wav', 0.3);  // 通知音

    console.log('\n🎵 占位音频文件创建完成！');
    console.log('💡 注意：这些是基础占位音频，后续可以替换为更专业的音效');
}

// 运行创建
if (require.main === module) {
    createAudioFiles();
}

module.exports = { createAudioFiles };