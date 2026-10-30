
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

app.get('/', (req, res) => {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0D8ABC';
    ctx.fillRect(0, 0, 200, 200);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('JD', 100, 100);

    const buffer = canvas.toBuffer('image/png');

    res.setHeader('Content-Type', 'image/png');
    res.end(buffer);
});

exports.handler = serverless(app);