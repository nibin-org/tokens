const fs = require('fs');
const path = require('path');
const { getFlattenedTokens } = require('../dist/index.cjs');
const tokens = require('../tokens.json');

console.log('Loading tokens...');
const flattened = getFlattenedTokens(tokens);

console.log('--- Font Size Tokens ---');
const fontSizes = flattened.filter(t => t.name.includes('font-size'));
console.log(fontSizes);

console.log('--- Line Height Tokens ---');
const lineHeights = flattened.filter(t => t.name.includes('line-height'));
console.log(lineHeights);

console.log('--- Height Tokens ---');
const heights = flattened.filter(t => t.name.includes('height'));
console.log(heights);

console.log('--- All Token Names Sample ---');
console.log(flattened.slice(0, 10).map(t => t.name));
