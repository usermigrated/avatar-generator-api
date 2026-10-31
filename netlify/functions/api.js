
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

// Escape special characters for SVG/XML
function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Generate SVG avatar
function generateAvatar(initials, size, background, color) {
    const fontSize = Math.round(size * 0.44);
    const safeInitials = escapeXml(initials);

    return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${size}"
     height="${size}"
     viewBox="0 0 ${size} ${size}">

    <rect
        width="${size}"
        height="${size}"
        fill="${background}"
    />

    <text
        x="50%"
        y="50%"
        fill="${color}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}px"
        font-weight="400"
        text-anchor="middle"
        dominant-baseline="central"
        textLength="${Math.round(size * 0.85)}"
        lengthAdjust="spacingAndGlyphs"
    >${safeInitials}</text>

</svg>`.trim();
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

        // Generate SVG
        const svg = generateAvatar(
            initials,
            size,
            background,
            color
        );

        // Return SVG response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/svg+xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600'
            },
            body: svg
        };

    } catch (error) {
        console.error('Avatar generation error:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            },
            body: 'Unable to generate avatar'
        };
    }
};
