/**
 * 像素美术生成脚本
 * 老王用代码虐这堆SB占位图，给游戏穿新衣服。
 */

const fs = require('fs');
const path = require('path');

const palette = {
    deepNight: '#1d133b',
    night: '#241b4f',
    dusky: '#2f255e',
    shadow: '#120d25',
    highlight: '#fdf2d0',
    highlightSoft: '#f5e7b5',
    gold: '#f7c873',
    coin: '#f2ae3d',
    coinShadow: '#b47324',
    woodDark: '#4b2c2f',
    woodMid: '#6c3f3b',
    woodLight: '#8d5547',
    stoneDark: '#4a4f7a',
    stoneMid: '#5b668c',
    stoneLight: '#7c87ab',
    clothRed: '#d45d79',
    clothBlue: '#4a90e2',
    clothTeal: '#3fa7d6',
    clothGreen: '#8bd17c',
    clothPurple: '#a67bd1',
    glassBlue: '#6ec5ff',
    glassPink: '#f58fef',
    glassGreen: '#9be564',
    poison: '#9bde3c',
    poisonDark: '#5a7c1f',
    fire: '#ff944d',
    fireDark: '#bb4f00',
    lightning: '#ffe066',
    heal: '#9ff6d0',
    ice: '#8cd2ff',
    mana: '#5f8bfd',
    uiBase: '#2e2852',
    uiLight: '#473c7a',
    uiHover: '#5a4899',
    uiPressed: '#1f1740',
    uiDisabled: '#2b2b3c',
    uiAccent: '#f0b67f',
    outline: '#0d0818',
    black: '#05040b',
    white: '#ffffff',
    skin: '#eac8a8',
    skinShadow: '#ca9f7d',
    hairDark: '#36232b',
    hairBlonde: '#f2d06a',
    hairRed: '#b13849',
    potionBlue: '#87d4ff',
    potionPink: '#f6a6ff',
    potionGreen: '#9bf0a7',
    potionGold: '#ffe09e'
};

function ensureDir(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function createMatrix(width, height, fill = 'transparent') {
    return Array.from({ length: height }, () => Array(width).fill(fill));
}

function fillRect(matrix, startX, startY, width, height, color) {
    for (let y = startY; y < startY + height; y++) {
        if (y < 0 || y >= matrix.length) continue;
        for (let x = startX; x < startX + width; x++) {
            if (x < 0 || x >= matrix[0].length) continue;
            matrix[y][x] = color;
        }
    }
}

function drawBorderRect(matrix, startX, startY, width, height, color, thickness = 1) {
    for (let t = 0; t < thickness; t++) {
        const top = startY + t;
        const bottom = startY + height - 1 - t;
        const left = startX + t;
        const right = startX + width - 1 - t;

        for (let x = left; x <= right; x++) {
            if (top >= 0 && top < matrix.length) matrix[top][x] = color;
            if (bottom >= 0 && bottom < matrix.length) matrix[bottom][x] = color;
        }

        for (let y = top; y <= bottom; y++) {
            if (left >= 0 && left < matrix[0].length) matrix[y][left] = color;
            if (right >= 0 && right < matrix[0].length) matrix[y][right] = color;
        }
    }
}

function drawLine(matrix, x1, y1, x2, y2, color) {
    const dx = Math.abs(x2 - x1);
    const dy = -Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx + dy;
    let x = x1;
    let y = y1;

    while (true) {
        if (y >= 0 && y < matrix.length && x >= 0 && x < matrix[0].length) {
            matrix[y][x] = color;
        }
        if (x === x2 && y === y2) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
            err += dy;
            x += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y += sy;
        }
    }
}

function drawCircle(matrix, cx, cy, radius, color, filled = true) {
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            const dist = Math.sqrt(x * x + y * y);
            const targetY = cy + y;
            const targetX = cx + x;
            if (targetY < 0 || targetY >= matrix.length || targetX < 0 || targetX >= matrix[0].length) {
                continue;
            }
            if (filled) {
                if (dist <= radius + 0.1) {
                    matrix[targetY][targetX] = color;
                }
            } else {
                if (dist >= radius - 0.6 && dist <= radius + 0.6) {
                    matrix[targetY][targetX] = color;
                }
            }
        }
    }
}

function drawDiamond(matrix, cx, cy, radius, color) {
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            if (Math.abs(x) + Math.abs(y) <= radius) {
                const px = cx + x;
                const py = cy + y;
                if (py >= 0 && py < matrix.length && px >= 0 && px < matrix[0].length) {
                    matrix[py][px] = color;
                }
            }
        }
    }
}

function drawTriangle(matrix, x, y, width, height, color, direction = 'up') {
    if (direction === 'up') {
        for (let row = 0; row < height; row++) {
            const start = Math.floor((width - (row * 2 + 1)) / 2);
            for (let col = 0; col < row * 2 + 1; col++) {
                matrix[y + row][x + start + col] = color;
            }
        }
    } else if (direction === 'down') {
        for (let row = 0; row < height; row++) {
            const start = Math.floor((width - ((height - row) * 2 - 1)) / 2);
            for (let col = 0; col < (height - row) * 2 - 1; col++) {
                matrix[y + row][x + start + col] = color;
            }
        }
    }
}

function matrixToSVG(matrix, scale, options = {}) {
    const height = matrix.length;
    const width = matrix[0].length;
    const svgWidth = width * scale;
    const svgHeight = height * scale;

    let content = '<?xml version="1.0" encoding="UTF-8"?>\n';
    content += `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">\n`;

    if (options.background && options.background !== 'transparent') {
        content += `  <rect width="${svgWidth}" height="${svgHeight}" fill="${options.background}"/>\n`;
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = matrix[y][x];
            if (!color || color === 'transparent') continue;
            content += `  <rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="${color}"/>\n`;
        }
    }

    content += '</svg>\n';
    return content;
}

function writeSVG(filePath, matrix, scale, options = {}) {
    ensureDir(filePath);
    const svg = matrixToSVG(matrix, scale, options);
    fs.writeFileSync(filePath, svg, 'utf8');
    console.log(`🎨 生成像素美术: ${filePath}`);
}

function createVerticalStripes(matrix, startX, startY, width, height, colors) {
    const stripeWidth = Math.ceil(width / colors.length);
    colors.forEach((color, index) => {
        fillRect(matrix, startX + index * stripeWidth, startY, stripeWidth, height, color);
    });
}

function drawBottle(matrix, x, y, bodyColor, glowColor) {
    fillRect(matrix, x + 1, y, 2, 1, palette.highlight);
    fillRect(matrix, x, y + 1, 4, 5, bodyColor);
    fillRect(matrix, x + 1, y + 2, 2, 2, glowColor);
    matrix[y + 1][x] = palette.highlightSoft;
    matrix[y + 1][x + 3] = palette.highlightSoft;
}

function drawHangingLamp(matrix, x, y) {
    drawLine(matrix, x, 0, x, y, palette.shadow);
    fillRect(matrix, x - 1, y, 3, 1, palette.shadow);
    fillRect(matrix, x - 2, y + 1, 5, 3, palette.gold);
    fillRect(matrix, x - 1, y + 4, 3, 1, palette.shadow);
    fillRect(matrix, x, y + 2, 1, 1, palette.highlight);
}

function createTavernBackground() {
    const width = 90;
    const height = 160;
    const matrix = createMatrix(width, height, palette.deepNight);

    fillRect(matrix, 0, 0, width, 36, palette.dusky);
    fillRect(matrix, 0, 36, width, 28, palette.night);
    fillRect(matrix, 0, 64, width, 28, palette.deepNight);
    fillRect(matrix, 0, height - 44, width, 44, palette.woodDark);
    fillRect(matrix, 0, height - 36, width, 4, palette.woodMid);
    fillRect(matrix, 0, height - 18, width, 2, palette.woodLight);

    for (let y = height - 44; y < height; y += 4) {
        for (let x = (y % 8 === 0) ? 0 : 4; x < width; x += 8) {
            fillRect(matrix, x, y, 4, 1, palette.woodMid);
        }
    }

    fillRect(matrix, 6, 72, width - 12, 8, palette.woodMid);
    fillRect(matrix, 6, 80, width - 12, 8, palette.woodLight);
    fillRect(matrix, 6, 88, width - 12, 4, palette.woodDark);
    drawBorderRect(matrix, 6, 72, width - 12, 20, palette.shadow, 1);

    fillRect(matrix, 12, 40, width - 24, 3, palette.woodDark);
    fillRect(matrix, 12, 43, width - 24, 2, palette.woodLight);
    fillRect(matrix, 18, 52, width - 36, 3, palette.woodDark);
    fillRect(matrix, 18, 55, width - 36, 2, palette.woodLight);

    const bottleColors = [palette.glassBlue, palette.glassGreen, palette.glassPink, palette.mana, palette.potionGold];
    let shelfX = 16;
    bottleColors.forEach((color, index) => {
        drawBottle(matrix, shelfX + index * 10, 47, color, palette.highlight);
        drawBottle(matrix, shelfX + index * 10 + 4, 59, color, palette.highlightSoft);
    });

    [20, 45, 70].forEach((x) => {
        drawHangingLamp(matrix, x, 28);
    });

    for (let col = 0; col < width; col += 10) {
        drawLine(matrix, col + 5, height - 44, col + 5, height - 8, palette.woodMid);
        fillRect(matrix, col + 4, height - 24, 2, 6, palette.woodLight);
    }

    return matrix;
}

function createMenuBackground() {
    const width = 90;
    const height = 160;
    const matrix = createMatrix(width, height, palette.night);

    fillRect(matrix, 0, 0, width, 60, palette.dusky);
    fillRect(matrix, 0, 60, width, 40, palette.deepNight);
    fillRect(matrix, 0, 120, width, 40, palette.shadow);

    drawDiamond(matrix, 18, 28, 6, palette.woodLight);
    drawDiamond(matrix, 45, 22, 8, palette.uiAccent);
    drawDiamond(matrix, 72, 28, 6, palette.woodLight);

    drawCircle(matrix, 45, 48, 9, palette.uiBase, false);
    drawCircle(matrix, 45, 48, 7, palette.uiAccent, false);
    drawCircle(matrix, 45, 48, 5, palette.highlightSoft, false);

    fillRect(matrix, 18, 80, 54, 26, palette.uiBase);
    drawBorderRect(matrix, 18, 80, 54, 26, palette.outline, 1);
    fillRect(matrix, 20, 82, 50, 22, palette.uiHover);

    for (let i = 0; i < 5; i++) {
        drawBottle(matrix, 10 + i * 16, 118, i % 2 === 0 ? palette.glassBlue : palette.glassGreen, palette.highlightSoft);
    }

    return matrix;
}

function createBattleBackground() {
    const width = 90;
    const height = 160;
    const matrix = createMatrix(width, height, palette.deepNight);

    fillRect(matrix, 0, 0, width, 50, palette.night);
    fillRect(matrix, 0, 50, width, 40, palette.dusky);
    fillRect(matrix, 0, 90, width, 70, palette.shadow);

    fillRect(matrix, 10, 48, 70, 6, palette.stoneDark);
    fillRect(matrix, 12, 54, 66, 18, palette.stoneMid);
    drawBorderRect(matrix, 12, 54, 66, 18, palette.shadow, 1);

    fillRect(matrix, 4, 100, 12, 40, palette.stoneDark);
    fillRect(matrix, width - 16, 100, 12, 40, palette.stoneDark);
    fillRect(matrix, 6, 102, 8, 34, palette.stoneMid);
    fillRect(matrix, width - 14, 102, 8, 34, palette.stoneMid);

    fillRect(matrix, 10, 120, width - 20, 4, palette.stoneLight);
    fillRect(matrix, 10, 124, width - 20, 4, palette.stoneMid);
    fillRect(matrix, 10, 128, width - 20, 32, palette.shadow);

    createVerticalStripes(matrix, 0, 8, width, 30, [palette.clothRed, palette.deepNight, palette.clothBlue, palette.deepNight, palette.clothRed]);

    drawCircle(matrix, 45, 70, 6, palette.lightning);
    drawDiamond(matrix, 45, 70, 4, palette.highlight);

    return matrix;
}

function createBrewingBackground() {
    const width = 90;
    const height = 160;
    const matrix = createMatrix(width, height, palette.night);

    fillRect(matrix, 0, height - 36, width, 36, palette.woodDark);
    for (let i = 0; i < width; i += 6) {
        fillRect(matrix, i, height - 36, 3, 36, palette.woodMid);
    }

    fillRect(matrix, 8, 60, width - 16, 40, palette.woodDark);
    fillRect(matrix, 10, 62, width - 20, 30, palette.woodMid);
    fillRect(matrix, 14, 84, width - 28, 12, palette.woodLight);

    fillRect(matrix, 35, 80, 20, 26, palette.stoneDark);
    fillRect(matrix, 37, 74, 16, 32, palette.stoneMid);
    drawBorderRect(matrix, 37, 74, 16, 32, palette.shadow, 1);

    drawCircle(matrix, 45, 88, 7, palette.mana);
    fillRect(matrix, 41, 84, 8, 6, palette.glassBlue);
    matrix[80][45] = palette.highlight;
    matrix[82][47] = palette.highlightSoft;

    for (let i = 0; i < 4; i++) {
        drawBottle(matrix, 14 + i * 14, 40, [palette.potionBlue, palette.potionGreen, palette.potionPink, palette.potionGold][i], palette.highlightSoft);
    }

    fillRect(matrix, 65, 38, 12, 12, palette.woodDark);
    fillRect(matrix, 66, 34, 10, 4, palette.fire);
    fillRect(matrix, 67, 32, 8, 2, palette.fireDark);
    fillRect(matrix, 67, 42, 8, 4, palette.fire);

    drawHangingLamp(matrix, 26, 28);
    drawHangingLamp(matrix, 64, 28);

    return matrix;
}

function createShopBackground() {
    const width = 90;
    const height = 160;
    const matrix = createMatrix(width, height, palette.deepNight);

    fillRect(matrix, 0, 0, width, 36, palette.dusky);
    fillRect(matrix, 0, 36, width, 40, palette.night);
    fillRect(matrix, 0, height - 48, width, 48, palette.woodDark);

    fillRect(matrix, 10, 44, width - 20, 4, palette.woodMid);
    fillRect(matrix, 10, 48, width - 20, 2, palette.woodLight);
    fillRect(matrix, 14, 60, width - 28, 4, palette.woodMid);
    fillRect(matrix, 14, 64, width - 28, 2, palette.woodLight);

    const goods = [palette.potionBlue, palette.potionGreen, palette.potionPink, palette.potionGold, palette.glassBlue];
    goods.forEach((color, index) => {
        drawBottle(matrix, 16 + index * 14, 50, color, palette.highlight);
        fillRect(matrix, 18 + index * 14, 70, 6, 6, palette.uiAccent);
        fillRect(matrix, 18 + index * 14, 76, 6, 2, palette.shadow);
    });

    for (let i = 0; i < 5; i++) {
        const x = 12 + i * 15;
        fillRect(matrix, x, 92, 10, 10, i % 2 === 0 ? palette.woodLight : palette.woodMid);
        fillRect(matrix, x + 2, 94, 6, 6, palette.highlight);
    }

    fillRect(matrix, 0, height - 48, width, 8, palette.woodMid);
    for (let x = 0; x < width; x += 6) {
        fillRect(matrix, x, height - 48, 3, 48, palette.woodDark);
    }

    return matrix;
}

function createAmbientBackground() {
    const width = 90;
    const height = 160;
    const matrix = createMatrix(width, height, palette.night);

    fillRect(matrix, 0, 0, width, 46, palette.dusky);
    fillRect(matrix, 0, 46, width, 46, palette.night);
    fillRect(matrix, 0, 92, width, height - 92, palette.shadow);

    drawLine(matrix, 0, 70, width - 1, 70, palette.stoneMid);
    drawLine(matrix, 0, 72, width - 1, 72, palette.stoneLight);
    drawLine(matrix, 0, 74, width - 1, 74, palette.stoneDark);

    for (let i = 0; i < width; i += 12) {
        drawDiamond(matrix, i + 6, 30, 4, palette.lightning);
        drawDiamond(matrix, i + 6, 58, 3, palette.highlightSoft);
    }

    for (let y = 100; y < height; y += 6) {
        for (let x = (y / 6) % 2 === 0 ? 0 : 6; x < width; x += 12) {
            fillRect(matrix, x, y, 6, 2, palette.woodMid);
        }
    }

    return matrix;
}

function generateBackgrounds() {
    writeSVG('assets/images/tavern_background.jpg.svg', createTavernBackground(), 8);
    writeSVG('assets/images/menu_bg.jpg.svg', createMenuBackground(), 8);
    writeSVG('assets/images/battle_bg.jpg.svg', createBattleBackground(), 8);
    writeSVG('assets/images/brewing_bg.jpg.svg', createBrewingBackground(), 8);
    writeSVG('assets/images/shop_bg.jpg.svg', createShopBackground(), 8);
    writeSVG('assets/images/background.jpg.svg', createAmbientBackground(), 8);
}

function createLogo() {
    const size = 64;
    const matrix = createMatrix(size, size, palette.deepNight);

    drawBorderRect(matrix, 0, 0, size, size, palette.outline, 2);
    fillRect(matrix, 2, 2, size - 4, size - 4, palette.night);

    drawCircle(matrix, 32, 24, 12, palette.mana);
    drawCircle(matrix, 32, 24, 11, palette.glassBlue, false);
    drawDiamond(matrix, 32, 24, 5, palette.highlight);

    drawBottle(matrix, 24, 14, palette.potionPink, palette.highlightSoft);
    drawBottle(matrix, 34, 18, palette.potionGreen, palette.highlight);

    drawTriangle(matrix, 14, 40, 36, 14, palette.uiAccent, 'up');
    fillRect(matrix, 18, 42, 28, 6, palette.uiHover);

    const title = [
        [12, 44, palette.highlight],
        [14, 44, palette.highlight],
        [20, 44, palette.highlight],
        [22, 44, palette.highlight],
        [28, 44, palette.highlight],
        [30, 44, palette.highlight],
        [36, 44, palette.highlight],
        [38, 44, palette.highlight]
    ];
    title.forEach(([x, y, color]) => {
        fillRect(matrix, x, y, 2, 6, color);
    });

    return matrix;
}

function generateLogo() {
    writeSVG('assets/images/logo.png.svg', createLogo(), 4);
}

function createButtonVariant(baseColor, highlightColor, shadowColor) {
    const width = 30;
    const height = 12;
    const matrix = createMatrix(width, height, baseColor);

    drawBorderRect(matrix, 0, 0, width, height, palette.outline, 1);
    fillRect(matrix, 1, 1, width - 2, height - 2, baseColor);
    fillRect(matrix, 1, 1, width - 2, 3, highlightColor);
    fillRect(matrix, 1, height - 4, width - 2, 3, shadowColor);

    return matrix;
}

function createButtonDisabled() {
    return createButtonVariant(palette.uiDisabled, '#3a3a4d', '#1d1d2c');
}

function generateUI() {
    writeSVG('assets/ui/button_normal.png.svg', createButtonVariant(palette.uiHover, '#6c55b2', '#30244f'), 4);
    writeSVG('assets/ui/button_hover.png.svg', createButtonVariant('#6c55b2', '#826dd1', '#362860'), 4);
    writeSVG('assets/ui/button_pressed.png.svg', createButtonVariant(palette.uiPressed, '#3c2c66', '#0c081d'), 4);
    writeSVG('assets/ui/button_disabled.png.svg', createButtonDisabled(), 4);

    const slider = createMatrix(60, 10, palette.uiBase);
    drawBorderRect(slider, 0, 0, 60, 10, palette.outline, 1);
    fillRect(slider, 2, 4, 56, 2, palette.uiAccent);
    fillRect(slider, 26, 2, 8, 6, palette.uiHover);
    drawBorderRect(slider, 26, 2, 8, 6, palette.outline, 1);
    writeSVG('assets/ui/slider.png.svg', slider, 4);

    const progress = createMatrix(60, 10, palette.uiBase);
    drawBorderRect(progress, 0, 0, 60, 10, palette.outline, 1);
    fillRect(progress, 2, 2, 56, 6, palette.uiPressed);
    fillRect(progress, 2, 2, 34, 6, palette.uiAccent);
    writeSVG('assets/ui/progress_bar.png.svg', progress, 4);

    const panel = createMatrix(80, 48, palette.uiBase);
    drawBorderRect(panel, 0, 0, 80, 48, palette.outline, 2);
    fillRect(panel, 2, 2, 76, 44, palette.uiHover);
    fillRect(panel, 2, 2, 76, 6, palette.uiAccent);
    writeSVG('assets/ui/panel.png.svg', panel, 4);

    const windowMatrix = createMatrix(84, 60, palette.uiBase);
    drawBorderRect(windowMatrix, 0, 0, 84, 60, palette.outline, 2);
    fillRect(windowMatrix, 2, 2, 80, 56, palette.uiHover);
    fillRect(windowMatrix, 2, 2, 80, 8, palette.uiAccent);
    fillRect(windowMatrix, 4, 12, 76, 44, palette.uiBase);
    writeSVG('assets/ui/window.png.svg', windowMatrix, 4);
}

function createIconBase() {
    const size = 16;
    const matrix = createMatrix(size, size, palette.uiBase);
    drawBorderRect(matrix, 0, 0, size, size, palette.outline, 1);
    fillRect(matrix, 1, 1, size - 2, size - 2, palette.deepNight);
    fillRect(matrix, 2, 2, size - 4, size - 4, palette.night);
    return matrix;
}

function generateIcons() {
    const iconGenerators = {
        attack: () => {
            const icon = createIconBase();
            drawLine(icon, 5, 11, 11, 5, palette.highlight);
            drawLine(icon, 5, 12, 11, 6, palette.highlight);
            fillRect(icon, 10, 4, 2, 2, palette.clothRed);
            fillRect(icon, 4, 10, 3, 2, palette.outline);
            return icon;
        },
        defense: () => {
            const icon = createIconBase();
            drawDiamond(icon, 8, 8, 5, palette.stoneMid);
            drawDiamond(icon, 8, 8, 3, palette.highlightSoft);
            drawDiamond(icon, 8, 10, 2, palette.stoneDark);
            return icon;
        },
        experience: () => {
            const icon = createIconBase();
            drawDiamond(icon, 8, 6, 3, palette.lightning);
            drawDiamond(icon, 8, 10, 3, palette.uiAccent);
            drawDiamond(icon, 8, 8, 5, palette.highlightSoft);
            return icon;
        },
        gold: () => {
            const icon = createIconBase();
            drawCircle(icon, 8, 8, 5, palette.coin);
            drawCircle(icon, 8, 8, 4, palette.gold);
            fillRect(icon, 6, 6, 2, 2, palette.highlight);
            fillRect(icon, 9, 9, 2, 2, palette.coinShadow);
            return icon;
        },
        health: () => {
            const icon = createIconBase();
            const heart = [
                [7, 4], [8, 4],
                [6, 5], [9, 5],
                [5, 6], [10, 6],
                [5, 7], [10, 7],
                [6, 8], [9, 8],
                [7, 9], [8, 9],
                [7, 10], [8, 10]
            ];
            heart.forEach(([x, y]) => {
                icon[y][x] = palette.clothRed;
            });
            icon[5][7] = palette.highlight;
            return icon;
        },
        inventory: () => {
            const icon = createIconBase();
            fillRect(icon, 4, 5, 8, 6, palette.woodLight);
            drawBorderRect(icon, 4, 5, 8, 6, palette.woodDark, 1);
            fillRect(icon, 6, 4, 4, 2, palette.woodDark);
            fillRect(icon, 7, 3, 2, 1, palette.woodLight);
            fillRect(icon, 6, 7, 2, 1, palette.highlight);
            return icon;
        },
        level: () => {
            const icon = createIconBase();
            drawLine(icon, 5, 10, 10, 5, palette.uiAccent);
            drawTriangle(icon, 6, 5, 6, 4, palette.highlight, 'up');
            fillRect(icon, 5, 10, 6, 1, palette.clothBlue);
            return icon;
        },
        mana: () => {
            const icon = createIconBase();
            drawDiamond(icon, 8, 8, 5, palette.mana);
            drawDiamond(icon, 8, 6, 3, palette.glassBlue);
            icon[4][8] = palette.highlight;
            icon[9][9] = palette.mana;
            return icon;
        },
        materials: () => {
            const icon = createIconBase();
            drawDiamond(icon, 7, 9, 5, palette.glassGreen);
            drawLine(icon, 7, 4, 9, 6, palette.glassPink);
            drawLine(icon, 9, 6, 11, 4, palette.potionBlue);
            return icon;
        },
        quest: () => {
            const icon = createIconBase();
            fillRect(icon, 4, 4, 8, 8, palette.highlight);
            drawBorderRect(icon, 4, 4, 8, 8, palette.uiAccent, 1);
            drawLine(icon, 6, 6, 10, 6, palette.uiAccent);
            drawLine(icon, 6, 8, 10, 8, palette.uiAccent);
            return icon;
        },
        reputation: () => {
            const icon = createIconBase();
            drawDiamond(icon, 8, 6, 3, palette.uiAccent);
            fillRect(icon, 5, 9, 6, 3, palette.woodLight);
            fillRect(icon, 6, 8, 4, 1, palette.highlight);
            fillRect(icon, 6, 12, 4, 1, palette.shadow);
            return icon;
        },
        settings: () => {
            const icon = createIconBase();
            drawCircle(icon, 8, 8, 5, palette.stoneDark, false);
            drawCircle(icon, 8, 8, 2, palette.stoneLight, true);
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI / 2) * i;
                const x = 8 + Math.round(Math.cos(angle) * 5);
                const y = 8 + Math.round(Math.sin(angle) * 5);
                if (y >= 0 && y < icon.length && x >= 0 && x < icon[0].length) {
                    icon[y][x] = palette.stoneDark;
                }
            }
            return icon;
        },
        speed: () => {
            const icon = createIconBase();
            drawTriangle(icon, 4, 6, 8, 5, palette.clothTeal, 'up');
            drawLine(icon, 6, 5, 8, 3, palette.highlight);
            drawLine(icon, 8, 7, 10, 9, palette.clothBlue);
            return icon;
        }
    };

    Object.entries(iconGenerators).forEach(([name, generator]) => {
        writeSVG(`assets/icons/${name}.png.svg`, generator(), 4);
    });
}

function createMaterialBase() {
    const size = 24;
    const matrix = createMatrix(size, size, palette.deepNight);
    drawBorderRect(matrix, 0, 0, size, size, palette.outline, 1);
    fillRect(matrix, 1, 1, size - 2, size - 2, palette.night);
    return matrix;
}

function generateMaterials() {
    const materials = {
        moon_grass: () => {
            const mat = createMaterialBase();
            drawDiamond(mat, 12, 12, 8, palette.glassGreen);
            drawLine(mat, 12, 18, 12, 22, palette.glassGreen);
            drawDiamond(mat, 12, 10, 3, palette.highlight);
            return mat;
        },
        fire_grass: () => {
            const mat = createMaterialBase();
            drawTriangle(mat, 6, 6, 12, 10, palette.fire, 'up');
            drawTriangle(mat, 8, 8, 8, 6, palette.fireDark, 'up');
            drawLine(mat, 12, 16, 12, 22, palette.clothRed);
            return mat;
        },
        dew_drop: () => {
            const mat = createMaterialBase();
            drawDiamond(mat, 12, 10, 6, palette.potionBlue);
            drawLine(mat, 12, 16, 12, 22, palette.glassBlue);
            mat[8][11] = palette.highlight;
            return mat;
        },
        earth_root: () => {
            const mat = createMaterialBase();
            fillRect(mat, 8, 6, 8, 12, palette.woodLight);
            fillRect(mat, 10, 8, 4, 8, palette.woodDark);
            drawLine(mat, 12, 18, 12, 22, palette.woodDark);
            return mat;
        },
        wind_leaf: () => {
            const mat = createMaterialBase();
            drawDiamond(mat, 12, 8, 5, palette.clothTeal);
            drawDiamond(mat, 12, 14, 5, palette.clothGreen);
            drawLine(mat, 12, 18, 12, 22, palette.clothBlue);
            return mat;
        },
        light_shard: () => {
            const mat = createMaterialBase();
            drawDiamond(mat, 12, 12, 7, palette.highlightSoft);
            drawDiamond(mat, 12, 12, 4, palette.highlight);
            drawLine(mat, 12, 12, 16, 8, palette.uiAccent);
            return mat;
        },
        dark_essence: () => {
            const mat = createMaterialBase();
            drawDiamond(mat, 12, 12, 7, palette.shadow);
            drawDiamond(mat, 12, 12, 4, palette.poison);
            drawLine(mat, 12, 12, 18, 18, palette.poisonDark);
            return mat;
        },
        ice_crystal: () => {
            const mat = createMaterialBase();
            drawDiamond(mat, 12, 12, 7, palette.ice);
            drawLine(mat, 12, 7, 12, 17, palette.mana);
            drawLine(mat, 7, 12, 17, 12, palette.mana);
            return mat;
        },
        thunder_stone: () => {
            const mat = createMaterialBase();
            drawDiamond(mat, 12, 12, 7, palette.lightning);
            drawLine(mat, 8, 6, 16, 18, palette.gold);
            drawLine(mat, 16, 6, 8, 18, palette.gold);
            return mat;
        }
    };

    Object.entries(materials).forEach(([name, generator]) => {
        writeSVG(`assets/materials/${name}.png.svg`, generator(), 4);
    });
}

function createParticle(size, drawFn) {
    const matrix = createMatrix(size, size, 'transparent');
    drawFn(matrix);
    return matrix;
}

function generateParticles() {
    const particles = {
        spark: () => createParticle(8, (m) => {
            drawDiamond(m, 4, 4, 2, palette.lightning);
            drawDiamond(m, 4, 4, 1, palette.highlight);
        }),
        glow: () => createParticle(8, (m) => {
            drawCircle(m, 4, 4, 3, palette.potionPink);
            drawCircle(m, 4, 4, 2, palette.highlightSoft);
        }),
        magic: () => createParticle(8, (m) => {
            drawDiamond(m, 4, 4, 3, palette.clothPurple);
            drawDiamond(m, 4, 4, 2, palette.highlight);
        }),
        fire: () => createParticle(8, (m) => {
            drawTriangle(m, 2, 2, 4, 4, palette.fire, 'up');
            drawTriangle(m, 3, 3, 2, 2, palette.highlight, 'up');
        }),
        ice: () => createParticle(8, (m) => {
            drawDiamond(m, 4, 3, 2, palette.ice);
            drawDiamond(m, 4, 5, 2, palette.mana);
        }),
        heal: () => createParticle(8, (m) => {
            drawLine(m, 3, 2, 3, 6, palette.heal);
            drawLine(m, 5, 2, 5, 6, palette.heal);
            drawLine(m, 2, 4, 6, 4, palette.heal);
        }),
        lightning: () => createParticle(8, (m) => {
            drawLine(m, 3, 1, 4, 3, palette.lightning);
            drawLine(m, 4, 3, 2, 6, palette.lightning);
            drawLine(m, 2, 6, 5, 4, palette.gold);
        }),
        poison: () => createParticle(8, (m) => {
            drawCircle(m, 3, 3, 2, palette.poison);
            drawCircle(m, 5, 5, 2, palette.poisonDark);
        })
    };

    Object.entries(particles).forEach(([name, generator]) => {
        writeSVG(`assets/particles/${name}.png.svg`, generator(), 6);
    });
}

function createCharacterBase() {
    const size = 32;
    return createMatrix(size, size, 'transparent');
}

function drawHumanoid(matrix, options) {
    const skin = options.skin || palette.skin;
    const skinShadow = options.skinShadow || palette.skinShadow;
    const hair = options.hair || palette.hairDark;
    const outfit = options.outfit || palette.clothBlue;
    const trim = options.trim || palette.uiAccent;

    fillRect(matrix, 12, 6, 8, 6, hair);
    fillRect(matrix, 13, 12, 6, 6, skin);
    fillRect(matrix, 13, 18, 6, 8, outfit);
    fillRect(matrix, 13, 26, 2, 4, palette.stoneDark);
    fillRect(matrix, 17, 26, 2, 4, palette.stoneDark);

    fillRect(matrix, 13, 18, 6, 2, trim);
    fillRect(matrix, 12, 14, 2, 2, skinShadow);
    fillRect(matrix, 18, 14, 2, 2, skinShadow);

    matrix[14][15] = palette.black;
    matrix[14][17] = palette.black;
    matrix[16][16] = skinShadow;

    fillRect(matrix, 17, 22, 6, 4, outfit);
    fillRect(matrix, 9, 22, 6, 4, outfit);
}

function generateCharacters() {
    const player = createCharacterBase();
    drawHumanoid(player, { outfit: palette.clothBlue, trim: palette.uiAccent, hair: palette.hairDark });
    writeSVG('assets/sprites/character_player.png.svg', player, 4);

    const npc = createCharacterBase();
    drawHumanoid(npc, { outfit: palette.clothGreen, trim: palette.potionGold, hair: palette.hairBlonde });
    writeSVG('assets/sprites/character_npc.png.svg', npc, 4);

    const enemy = createCharacterBase();
    drawHumanoid(enemy, { outfit: palette.shadow, trim: palette.fire, hair: palette.hairRed, skin: palette.skinShadow });
    fillRect(enemy, 12, 6, 8, 2, palette.fireDark);
    writeSVG('assets/sprites/character_enemy.png.svg', enemy, 4);

    const boss = createCharacterBase();
    drawHumanoid(boss, { outfit: palette.stoneDark, trim: palette.lightning, hair: palette.shadow, skin: palette.skinShadow });
    fillRect(boss, 10, 4, 12, 4, palette.stoneMid);
    drawLine(boss, 10, 8, 22, 8, palette.lightning);
    writeSVG('assets/sprites/enemy_boss.png.svg', boss, 4);

    const minion = createCharacterBase();
    drawHumanoid(minion, { outfit: palette.poisonDark, trim: palette.poison, hair: palette.shadow, skin: palette.skinShadow });
    writeSVG('assets/sprites/enemy_minion.png.svg', minion, 4);

    const alchemist = createCharacterBase();
    drawHumanoid(alchemist, { outfit: palette.uiBase, trim: palette.potionPink, hair: palette.hairBlonde });
    fillRect(alchemist, 18, 20, 8, 6, palette.potionBlue);
    writeSVG('assets/sprites/npc_alchemist.png.svg', alchemist, 4);

    const blacksmith = createCharacterBase();
    drawHumanoid(blacksmith, { outfit: palette.woodDark, trim: palette.fire, hair: palette.hairRed });
    fillRect(blacksmith, 8, 20, 16, 4, palette.stoneDark);
    writeSVG('assets/sprites/npc_blacksmith.png.svg', blacksmith, 4);

    const merchant = createCharacterBase();
    drawHumanoid(merchant, { outfit: palette.clothPurple, trim: palette.gold, hair: palette.hairDark });
    fillRect(merchant, 10, 20, 12, 4, palette.potionGold);
    writeSVG('assets/sprites/npc_merchant.png.svg', merchant, 4);
}

function generateBuffDebuff() {
    const size = 24;
    const createSheet = (primary, secondary, iconFn) => {
        const matrix = createMatrix(size, size, palette.deepNight);
        drawBorderRect(matrix, 0, 0, size, size, palette.outline, 1);
        fillRect(matrix, 1, 1, size - 2, size - 2, primary);
        iconFn(matrix, secondary);
        return matrix;
    };

    const buffAttack = createSheet(palette.clothRed, palette.highlight, (m, c) => {
        drawLine(m, 6, 16, 18, 8, c);
        drawLine(m, 6, 17, 18, 9, c);
        fillRect(m, 16, 7, 2, 2, palette.highlight);
    });
    writeSVG('assets/sprites/buff_attack.png.svg', buffAttack, 4);

    const buffDefense = createSheet(palette.stoneMid, palette.highlightSoft, (m, c) => {
        drawDiamond(m, 12, 12, 6, palette.stoneDark);
        drawDiamond(m, 12, 12, 4, c);
    });
    writeSVG('assets/sprites/buff_defense.png.svg', buffDefense, 4);

    const debuffPoison = createSheet(palette.poisonDark, palette.poison, (m, c) => {
        drawDiamond(m, 12, 12, 6, palette.poison);
        fillRect(m, 11, 6, 2, 4, c);
        fillRect(m, 10, 16, 4, 6, palette.shadow);
    });
    writeSVG('assets/sprites/debuff_poison.png.svg', debuffPoison, 4);

    const debuffStun = createSheet(palette.stoneDark, palette.lightning, (m, c) => {
        drawLine(m, 10, 6, 14, 18, c);
        drawLine(m, 10, 18, 14, 6, c);
    });
    writeSVG('assets/sprites/debuff_stun.png.svg', debuffStun, 4);
}

function generateCards() {
    const width = 48;
    const height = 64;
    const cardFrame = createMatrix(width, height, palette.deepNight);
    drawBorderRect(cardFrame, 0, 0, width, height, palette.outline, 2);
    fillRect(cardFrame, 2, 2, width - 4, height - 4, palette.uiBase);
    fillRect(cardFrame, 4, 4, width - 8, height - 8, palette.uiHover);
    fillRect(cardFrame, 4, 4, width - 8, 10, palette.uiAccent);
    writeSVG('assets/sprites/card_frame.png.svg', cardFrame, 4);

    const cardBack = createMatrix(width, height, palette.deepNight);
    drawBorderRect(cardBack, 0, 0, width, height, palette.outline, 2);
    fillRect(cardBack, 2, 2, width - 4, height - 4, palette.clothPurple);
    for (let y = 6; y < height - 6; y += 6) {
        drawLine(cardBack, 4, y, width - 5, y, palette.highlightSoft);
    }
    drawDiamond(cardBack, width / 2, height / 2, 10, palette.highlight);
    writeSVG('assets/sprites/card_back.png.svg', cardBack, 4);

    const cardsSheet = createMatrix(width * 3, height, palette.deepNight);
    for (let i = 0; i < 3; i++) {
        const offsetX = i * width;
        drawBorderRect(cardsSheet, offsetX, 0, width, height, palette.outline, 1);
        fillRect(cardsSheet, offsetX + 1, 1, width - 2, height - 2, [palette.uiBase, palette.uiHover, palette.uiAccent][i]);
    }
    writeSVG('assets/sprites/cards.png.svg', cardsSheet, 4);
}

function generateEffectsAndPotions() {
    const effects = createMatrix(48, 48, palette.deepNight);
    drawCircle(effects, 12, 12, 6, palette.fire);
    drawCircle(effects, 24, 18, 5, palette.lightning);
    drawCircle(effects, 36, 24, 6, palette.heal);
    drawCircle(effects, 12, 32, 5, palette.ice);
    writeSVG('assets/sprites/effects.png.svg', effects, 4);

    const particlesSheet = createMatrix(32, 32, palette.deepNight);
    drawDiamond(particlesSheet, 8, 8, 3, palette.lightning);
    drawDiamond(particlesSheet, 16, 8, 2, palette.fire);
    drawDiamond(particlesSheet, 24, 8, 2, palette.heal);
    drawDiamond(particlesSheet, 8, 16, 2, palette.poison);
    drawDiamond(particlesSheet, 16, 16, 2, palette.ice);
    writeSVG('assets/sprites/particles.png.svg', particlesSheet, 4);

    const potions = createMatrix(48, 32, palette.deepNight);
    drawBottle(potions, 6, 12, palette.potionBlue, palette.highlight);
    drawBottle(potions, 20, 12, palette.potionGreen, palette.highlightSoft);
    drawBottle(potions, 34, 12, palette.potionPink, palette.highlight);
    writeSVG('assets/sprites/potions.png.svg', potions, 4);
}

function generateSprites() {
    generateCharacters();
    generateBuffDebuff();
    generateCards();
    generateEffectsAndPotions();
}

function generateAll() {
    generateBackgrounds();
    generateLogo();
    generateUI();
    generateIcons();
    generateMaterials();
    generateParticles();
    generateSprites();
}

if (require.main === module) {
    console.log('⚒️  老王像素炼金术开工，替换这堆SB占位图...');
    generateAll();
    console.log('✅  像素素材生成完事，别再说界面惨不忍睹了。');
}

module.exports = {
    generateAll
};
