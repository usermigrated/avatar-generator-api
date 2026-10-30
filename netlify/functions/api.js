
// const { createCanvas } = require('canvas');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');

const fontPath = path.join(
    __dirname,
    '../../fonts/DejaVuSans.ttf'
);

registerFont(fontPath, {
    family: 'AvatarFont'
});
// Default configuration
const DEFAULTS = {
    background: '#dddddd',
    color: '#262626',
    size: 64,
    uppercase: true
};

// Get initials
function getInitials(name, uppercase = true) {
    if (!name || !name.trim()) return '';

    const words = name.trim().split(/\s+/).filter(Boolean);

    const segmenter = new Intl.Segmenter(undefined, {
        granularity: 'grapheme'
    });

    const getCharacters = word =>
        [...segmenter.segment(word)].map(item => item.segment);

    let initials;

    if (words.length === 1) {
        initials = getCharacters(words[0]).slice(0, 2).join('');
    } else {
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

// Generate random colour
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

// Netlify Function
exports.handler = async (event) => {
    try {
        const params = event.queryStringParameters || {};

        const name = String(params.name || '');

        const uppercase = String(params.uppercase ?? 'true')
            .toLowerCase() !== 'false';

        const size = getNumber(
            params.size,
            DEFAULTS.size,
            16,
            512
        );

        // Background colour
        let background = DEFAULTS.background;

        if (params.background === 'random') {
            background = randomColor();
        } else if (params.background) {
            background = getColor(
                String(params.background),
                DEFAULTS.background
            );
        }

        // Text colour
        const color = getColor(
            String(params.color || ''),
            DEFAULTS.color
        );

        // Generate initials
        const initials = getInitials(name, uppercase);

        // Create canvas
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, size, size);

        // Automatically fit text
        let fontSize = Math.round(size * 0.44);


        ctx.font = `${fontSize}px AvatarFont`;


        while (
            initials &&
            ctx.measureText(initials).width > size * 0.85 &&
            fontSize > 8
        ) {
            fontSize--;
            ctx.font = `${fontSize}px AvatarFont`;
        }

        // Text styling
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw initials
        if (initials) {
            ctx.fillText(initials, size / 2, size / 2);
        }

        // Generate PNG buffer
        const buffer = canvas.toBuffer('image/png');

        // Return Base64-encoded binary image
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=3600'
            },
            body: buffer.toString('base64'),
            isBase64Encoded: true
        };

    } catch (error) {
        console.error('Avatar generation error:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'text/plain'
            },
            body: 'Unable to generate avatar'
        };
    }
};
