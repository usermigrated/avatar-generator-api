const serverless = require('serverless-http');
const express = require('express');
const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

const app = express();


// Default configuration
const DEFAULTS = {
    background: '#dddddd',
    color: '#262626',
    size: 64,
    fontSize: null,
    uppercase: true
};

// Unicode font configuration.
// Put the corresponding Noto font files inside ./fonts/
const FONT_CONFIG = [
    {
        name: 'Arabic',
        family: 'NotoArabic',
        file: 'NotoSansArabic-Regular.ttf',
        regex: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/
    },
    {
        name: 'Armenian',
        family: 'NotoArmenian',
        file: 'NotoSansArmenian-Regular.ttf',
        regex: /[\u0530-\u058F]/
    },
    {
        name: 'Bengali',
        family: 'NotoBengali',
        file: 'NotoSansBengali-Regular.ttf',
        regex: /[\u0980-\u09FF]/
    },
    {
        name: 'Georgian',
        family: 'NotoGeorgian',
        file: 'NotoSansGeorgian-Regular.ttf',
        regex: /[\u10A0-\u10FF\u2D00-\u2D2F]/
    },
    {
        name: 'Hebrew',
        family: 'NotoHebrew',
        file: 'NotoSansHebrew-Regular.ttf',
        regex: /[\u0590-\u05FF]/
    },
    {
        name: 'Chinese',
        family: 'NotoChinese',
        file: 'NotoSansCJKsc-Regular.otf',
        regex: /[\u4E00-\u9FFF]/
    },
    {
        name: 'Japanese',
        family: 'NotoJapanese',
        file: 'NotoSansCJKjp-Regular.otf',
        regex: /[\u3040-\u30FF]/
    },
    {
        name: 'Mongolian',
        family: 'NotoMongolian',
        file: 'NotoSansMongolian-Regular.ttf',
        regex: /[\u1800-\u18AF]/
    },
    {
        name: 'Thai',
        family: 'NotoThai',
        file: 'NotoSansThai-Regular.ttf',
        regex: /[\u0E00-\u0E7F]/
    },
    {
        name: 'Tibetan',
        family: 'NotoTibetan',
        file: 'NotoSansTibetan-Regular.ttf',
        regex: /[\u0F00-\u0FFF]/
    }
];

// Register available Unicode fonts
FONT_CONFIG.forEach(font => {
    const fontPath = path.join(__dirname, 'fonts', font.file);

    if (fs.existsSync(fontPath)) {
        registerFont(fontPath, {
            family: font.family
        });
    }
});

// Detect the appropriate font
function getFontFamily(text) {
    const matchedFont = FONT_CONFIG.find(font => font.regex.test(text));

    return matchedFont ? matchedFont.family : 'Arial';
}

// Get initials using Unicode grapheme segmentation

function getInitials(name, uppercase = true) {
    if (!name || !name.trim()) return '';

    const words = name.trim().split(/\s+/).filter(Boolean);

    const segmenter = new Intl.Segmenter(undefined, {
        granularity: 'grapheme'
    });

    const getCharacters = (word) =>
        [...segmenter.segment(word)].map(item => item.segment);

    let initials;

    if (words.length === 1) {
        // Single name: first two characters
        initials = getCharacters(words[0]).slice(0, 2).join('');
    } else {
        // Multiple names: first character of first and last name
        initials =
            getCharacters(words[0])[0] +
            getCharacters(words[words.length - 1])[0];
    }

    return uppercase ? initials.toLocaleUpperCase() : initials;
}


// Validate hexadecimal colours
function getColor(value, fallback) {
    if (!value) return fallback;

    const color = value.startsWith('#') ? value : `#${value}`;

    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)
        ? color
        : fallback;
}

// Generate random hexadecimal colour
function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
}

// Validate numeric parameters
function getNumber(value, fallback, min, max) {
    if (value === undefined || value === '') return fallback;

    const number = Number(value);

    if (!Number.isFinite(number)) return fallback;

    return Math.min(Math.max(Math.round(number), min), max);
}

app.get('/', (req, res) => {
    try {
        const name = String(req.query.name || '');

        // Read URL parameters
        const uppercase = String(req.query.uppercase ?? 'true')
            .toLowerCase() !== 'false';

        const size = getNumber(
            req.query.size,
            DEFAULTS.size,
            16,
            512
        );

        const fontSize = getNumber(
            req.query['font-size'],
            Math.round(size * 0.44),
            8,
            size
        );

        // Background colour
        let background = DEFAULTS.background;

        if (req.query.background === 'random') {
            background = randomColor();
        } else if (req.query.background) {
            background = getColor(
                String(req.query.background),
                DEFAULTS.background
            );
        }

        // Text colour
        const color = getColor(
            String(req.query.color || ''),
            DEFAULTS.color
        );

        // Generate initials
        const initials = getInitials(name, uppercase);

        // Create image
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, size, size);

        // Select Unicode font
        const fontFamily = getFontFamily(initials);

        // Automatically fit text inside avatar
        let actualFontSize = fontSize;

        ctx.font = `${actualFontSize}px "${fontFamily}"`;

        while (
            ctx.measureText(initials).width > size * 0.85 &&
            actualFontSize > 8
        ) {
            actualFontSize--;
            ctx.font = `${actualFontSize}px "${fontFamily}"`;
        }

        // Text styling
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Right-to-left scripts
        if (/[\u0590-\u08FF]/.test(initials)) {
            ctx.direction = 'rtl';
        }

        // Draw initials
        ctx.fillText(initials, size / 2, size / 2);

        // Return PNG
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600');

        res.send(canvas.toBuffer('image/png'));

    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to generate avatar');
    }
});
exports.handler = serverless(app);
// // Start server
// app.listen(3000, () => {
//     console.log('Avatar server running on port 3000');
// });
