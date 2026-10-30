
const serverless = require('serverless-http');
const express = require('express');
const { createCanvas } = require('canvas');

const app = express();

// Default configuration
const DEFAULTS = {
    background: '#dddddd',
    color: '#262626',
    size: 64,
    uppercase: true
};

// Get initials using Unicode grapheme segmentation
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

app.get('/api', (req, res) => {
        try {
        const name = String(req.query.name || '');

        // Uppercase setting
        const uppercase = String(req.query.uppercase ?? 'true')
            .toLowerCase() !== 'false';

        // Image size
        const size = getNumber(
            req.query.size,
            DEFAULTS.size,
            16,
            512
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

        // Automatically fit text inside avatar
        let fontSize = Math.round(size * 0.44);

        ctx.font = `${fontSize}px Arial`;

        while (
            ctx.measureText(initials).width > size * 0.85 &&
            fontSize > 8
        ) {
            fontSize--;
            ctx.font = `${fontSize}px Arial`;
        }

        // Text styling
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw initials
        if (initials) {
            ctx.fillText(initials, size / 2, size / 2);
        }

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
