#!/usr/bin/env node
// Generate a clean ranked list of all 70 leveling radicals
// Sorted by: if movie+book rank available → rankSum, else → reactions count (desc)
// Run: cd chinese-web-app && node scripts/radical-ranking.mjs

import fs from 'fs';
import path from 'path';

// Load radicals.json
const radPath = path.join(process.cwd(), 'radicals.json');
const raw = JSON.parse(fs.readFileSync(radPath, 'utf-8'));
const radicals = raw.radicals || raw;

// Load chinese-lexicon frequency data
async function loadFreq(filepath) {
    const url = new URL('file://' + filepath);
    const mod = await import(url);
    return mod.default;
}

const movieFreq = await loadFreq('/Users/gu2026/Downloads/chinese-lexicon-master/statistics/movieCharFrequency.js');
const bookFreq = await loadFreq('/Users/gu2026/Downloads/chinese-lexicon-master/statistics/bookCharFrequency.js');

// Traditional → Simplified
const TRAD_TO_SIMP = {
    '馬': '马', '鳥': '鸟', '魚': '鱼', '龍': '龙', '見': '见',
    '門': '门', '車': '车', '貝': '贝', '頁': '页', '釒': '钅',
    '糹': '纟', '飠': '饣', '麥': '麦', '齒': '齿', '龜': '龟',
    '塵': '尘', '關': '关', '萬': '万', '開': '开',
    '爾': '尔', '話': '话', '說': '说', '書': '书', '長': '长', '風': '风',
    '絲': '丝',
};

// Doodle God category
function assignDoodleCat(rad) {
    const cat = rad.category || '';
    const char = rad.char;
    const meaning = (rad.meaning || '').toLowerCase();

    const discoveryChars = ['林', '从', '北', '比', '囚', '相', '旦', '古', '分', '合', '同', '占', '包', '加', '召', '周', '告'];
    if (discoveryChars.includes(char)) return 'discovery';
    if (cat === 'body' || cat === 'person' || cat === 'action') return 'body';
    if (cat === 'nature' || cat === 'color') return 'nature';
    if (cat === 'animal') return 'fauna';
    if (cat === 'building') return 'civilization';
    if (cat === 'directions' || cat === 'abstract') return 'abstract';
    if (cat === 'food') return ['酉', '飠', '饣'].includes(char) ? 'civilization' : 'fauna';
    if (cat === 'object') return ['竹', '⺮'].includes(char) ? 'nature' : 'civilization';

    // Heuristics for 'other'
    const natureKws = ['gas', 'air', 'wind', 'cloud', 'water', 'river', 'rock', 'stone', 'root', 'dawn', 'ice', 'snow', 'rain'];
    const bodyKws = ['hand', 'foot', 'tooth', 'tongue', 'hair', 'fur', 'skin', 'blood', 'bone', 'meat', 'flesh', 'walk', 'step'];
    const faunaKws = ['dog', 'ox', 'cow', 'pig', 'boar', 'cattle', 'deer', 'dragon', 'bird', 'fish', 'feather', 'shell', 'grain', 'cereal', 'rice', 'bean', 'sweet', 'fruit', 'food', 'eat', 'drink'];
    const civKws = ['knife', 'axe', 'arrow', 'spear', 'dagger', 'weapon', 'bow', 'net', 'trap', 'container', 'vessel', 'dish', 'towel', 'cloth', 'silk', 'thread', 'roof', 'house', 'door', 'gate', 'cave', 'shelter', 'cliff', 'wall', 'city', 'road', 'table', 'cart', 'vehicle', 'boat', 'ship', 'tool', 'work', 'labor', 'jade', 'metal', 'gold', 'money', 'coin', 'seal', 'pen', 'brush', 'book', 'music', 'drum', 'bell'];
    const absKws = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'thousand', 'number', 'count', 'measure', 'unit', 'inch', 'direction', 'north', 'south', 'east', 'west', 'center', 'middle', 'big', 'small', 'many', 'few', 'new', 'old', 'self', 'common', 'together', 'same', 'different', 'opposite', 'contrary', 'bad', 'evil', 'good', 'true', 'ghost', 'spirit', 'death', 'life'];

    if (natureKws.some(k => meaning.includes(k))) return 'nature';
    if (bodyKws.some(k => meaning.includes(k))) return 'body';
    if (faunaKws.some(k => meaning.includes(k))) return 'fauna';
    if (civKws.some(k => meaning.includes(k))) return 'civilization';
    if (absKws.some(k => meaning.includes(k))) return 'abstract';
    return 'other';
}

// Build data
const allRads = [];
for (const rad of radicals) {
    const char = rad.char;
    const isTrad = char in TRAD_TO_SIMP;
    const key = TRAD_TO_SIMP[char] || char;
    
    const mov = movieFreq[char] || {};
    const bok = bookFreq[char] || {};
    const movRank = mov.rank ? parseInt(mov.rank) : null;
    const bokRank = bok.rank ? parseInt(bok.rank) : null;
    
    allRads.push({
        char, isTrad, key,
        source: rad.source,
        category: rad.category,
        doodleCat: assignDoodleCat(rad),
        meaning: rad.meaning || '',
        frequency: rad.frequency || 0,
        reactions: rad.reactions || 0,
        movRank, bokRank,
        pinyin: rad.pinyin || '',
    });
}

// Deduplicate
const groups = {};
for (const r of allRads) {
    if (!groups[r.key]) groups[r.key] = [];
    groups[r.key].push(r);
}
const deduped = [];
for (const [key, entries] of Object.entries(groups)) {
    if (entries.length === 1) {
        deduped.push(entries[0]);
    } else {
        entries.sort((a, b) => (a.isTrad ? 1 : 0) - (b.isTrad ? 1 : 0));
        deduped.push(entries[0]);
    }
}

// Leveling only
const leveling = deduped.filter(r => r.source === 'leveling');

// Sort: if has frequency rank → sort by rankSum, else → sort by reactions (desc)
// Combined: use reactions as secondary sort within each tier
function sortScore(r) {
    const hasFreq = r.movRank !== null || r.bokRank !== null;
    if (hasFreq) {
        // Rank-based: lower rankSum = more frequent
        const movScore = r.movRank || 9999;
        const bokScore = r.bokRank || 9999;
        return { tier: 0, primary: movScore + bokScore, secondary: -r.reactions };
    } else {
        // No frequency rank — sort by reactions count (desc)
        return { tier: 1, primary: 0, secondary: -r.reactions };
    }
}

leveling.sort((a, b) => {
    const sa = sortScore(a);
    const sb = sortScore(b);
    if (sa.tier !== sb.tier) return sa.tier - sb.tier;
    if (sa.primary !== sb.primary) return sa.primary - sb.primary;
    return sa.secondary - sb.secondary;
});

// Print
console.log('='.repeat(100));
console.log('FULL LEVELING RADICALS — Frequency & Reactions Ordered');
console.log('='.repeat(100));
console.log('Lv  | Char | Doodle Cat      | MovRnk | BkRnk | Reactns | Freq  | Meaning');
console.log('-'.repeat(100));
for (let i = 0; i < leveling.length; i++) {
    const r = leveling[i];
    const hasFreq = r.movRank !== null || r.bokRank !== null;
    const note = hasFreq ? '' : ' (reaction-sorted)';
    console.log(
        `${String(i + 1).padStart(3)} | ${r.char.padEnd(4)} | ${r.doodleCat.padEnd(15)} | ` +
        `${String(r.movRank || '—').padStart(6)} | ${String(r.bokRank || '—').padStart(5)} | ` +
        `${String(r.reactions).padStart(7)} | ${String(r.frequency).padStart(5)} | ${r.meaning.slice(0, 30)}${note}`
    );
}

// Category summary
console.log(`\n${'='.repeat(100)}`);
console.log('CATEGORY DISTRIBUTION');
console.log('-'.repeat(100));
const cats = {};
for (const r of leveling) {
    cats[r.doodleCat] = (cats[r.doodleCat] || 0) + 1;
}
for (const [c, n] of Object.entries(cats).sort((a, b) => b[1] - a[1])) {
    const chars = leveling.filter(r => r.doodleCat === c).map(r => r.char).join(' ');
    console.log(`  ${c.padEnd(15)} ${String(n).padStart(2)}: ${chars}`);
}
