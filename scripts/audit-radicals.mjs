#!/usr/bin/env node
// Cross-reference radicals.json with chinese-lexicon frequency data
// Run: cd chinese-web-app && node scripts/audit-radicals.mjs

import fs from 'fs';
import path from 'path';

// Load radicals.json
const radPath = path.join(process.cwd(), 'radicals.json');
const raw = JSON.parse(fs.readFileSync(radPath, 'utf-8'));
const radicals = raw.radicals || raw;
console.log(`Loaded ${radicals.length} radicals from radicals.json`);

// Load chinese-lexicon frequency data
const moviePath = '/Users/gu2026/Downloads/chinese-lexicon-master/statistics/movieCharFrequency.js';
const bookPath = '/Users/gu2026/Downloads/chinese-lexicon-master/statistics/bookCharFrequency.js';

async function loadFreq(filepath) {
    const url = new URL('file://' + filepath);
    const mod = await import(url);
    return mod.default;
}

const movieFreq = await loadFreq(moviePath);
const bookFreq = await loadFreq(bookPath);

// Traditional → Simplified mappings
const TRAD_TO_SIMP = {
    '馬': '马', '鳥': '鸟', '魚': '鱼', '龍': '龙', '見': '见',
    '門': '门', '車': '车', '貝': '贝', '頁': '页', '釒': '钅',
    '糹': '纟', '飠': '饣', '麥': '麦', '齒': '齿', '龜': '龟',
    '塵': '尘', '關': '关', '萬': '万', '開': '开',
    '爾': '尔', '話': '话', '說': '说', '書': '书', '長': '长', '風': '风',
    '絲': '丝',
};

// Obscure entries to flag
const OBSCURE = new Set([
    '䜌', '雚', '尞', '堇', '曷', '昜', '僉', '佥', '監', '夂',
    '巠', '廾', '甬', '彡', '聿', '亥', '䜌',
]);

// Doodle God category assignment
function assignDoodleCat(rad) {
    const cat = rad.category || '';
    const char = rad.char;
    const meaning = (rad.meaning || '').toLowerCase();

    // Discovery compounds — characters that are clearly multi-radical compounds
    const discoveryChars = ['林', '从', '北', '比', '囚', '相', '旦', '古', '分', '合', '同', '占', '包', '加', '召', '周', '告', '林'];
    if (discoveryChars.includes(char)) return 'discovery';

    if (cat === 'body') return 'body';
    if (cat === 'person') return 'body';
    if (cat === 'action') return 'body';
    if (cat === 'nature') return 'nature';
    if (cat === 'animal') return 'fauna';
    if (cat === 'color') return 'nature';
    if (cat === 'building') return 'civilization';
    if (cat === 'directions') return 'abstract';

    // Food
    if (cat === 'food') {
        if (['酉', '飠', '饣'].includes(char)) return 'civilization';
        return 'fauna';
    }

    // Object
    if (cat === 'object') {
        if (['竹', '⺮'].includes(char)) return 'nature';
        return 'civilization';
    }

    // Abstract
    if (cat === 'abstract') return 'abstract';

    // For 'other' category — use meaning heuristics
    const natureKws = ['gas', 'air', 'wind', 'cloud', 'water', 'river', 'rock', 'stone', 'root', 'dawn', 'ice', 'snow', 'rain', 'thunder'];
    const bodyKws = ['hand', 'foot', 'tooth', 'tongue', 'hair', 'fur', 'skin', 'blood', 'bone', 'meat', 'flesh', 'walk', 'step', 'finger'];
    const faunaKws = ['dog', 'ox', 'cow', 'pig', 'boar', 'cattle', 'deer', 'dragon', 'bird', 'fish', 'feather', 'shell', 'creature', 'insect', 'silkworm', 'grain', 'cereal', 'rice', 'bean', 'sweet', 'fruit', 'food', 'eat', 'drink', 'hemp'];
    const civKws = ['knife', 'axe', 'arrow', 'spear', 'dagger', 'weapon', 'bow', 'net', 'trap', 'container', 'vessel', 'dish', 'towel', 'cloth', 'silk', 'thread', 'clothes', 'garment', 'roof', 'house', 'door', 'gate', 'cave', 'shelter', 'cliff', 'wall', 'city', 'road', 'table', 'cart', 'vehicle', 'boat', 'ship', 'tool', 'utensil', 'work', 'labor', 'jade', 'metal', 'gold', 'money', 'coin', 'seal', 'pen', 'brush', 'book', 'music', 'drum', 'bell'];
    const absKws = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'thousand', 'number', 'count', 'measure', 'unit', 'inch', 'direction', 'north', 'south', 'east', 'west', 'center', 'middle', 'big', 'small', 'many', 'few', 'new', 'old', 'self', 'common', 'together', 'same', 'different', 'opposite', 'contrary', 'bad', 'evil', 'good', 'true', 'ghost', 'spirit', 'death', 'life'];

    if (natureKws.some(k => meaning.includes(k))) return 'nature';
    if (bodyKws.some(k => meaning.includes(k))) return 'body';
    if (faunaKws.some(k => meaning.includes(k))) return 'fauna';
    if (civKws.some(k => meaning.includes(k))) return 'civilization';
    if (absKws.some(k => meaning.includes(k))) return 'abstract';

    return 'other';
}

// Build results
const results = [];
const seenSimp = new Set();
const removedTrad = [];

for (const rad of radicals) {
    const char = rad.char;
    const source = rad.source || 'decomposition';
    const category = rad.category || '';
    const meaning = rad.meaning || '';
    const freq = rad.frequency || 0;
    const reacts = rad.reactions || 0;
    const unlockLevel = rad.unlock_level;

    // Check if traditional variant
    const isTrad = char in TRAD_TO_SIMP;
    const simpForm = TRAD_TO_SIMP[char] || null;

    // Get frequency data
    const mov = movieFreq[char] || {};
    const bok = bookFreq[char] || {};
    const movRank = mov.rank ? parseInt(mov.rank) : null;
    const movCount = mov.count ? parseInt(mov.count) : 0;
    const bokRank = bok.rank ? parseInt(bok.rank) : null;
    const bokCount = bok.count ? parseInt(bok.count) : 0;

    // Combined rank sum (lower = more frequent, 9999 = not found)
    const rankSum = (movRank || 9999) + (bokRank || 9999);

    // Obscure
    const obscure = OBSCURE.has(char);

    // Doodle God category
    const doodleCat = assignDoodleCat(rad);

    results.push({
        char, source, category, meaning: meaning.slice(0, 80),
        doodleCat, unlockLevel, frequency: freq, reactions: reacts,
        movRank, movCount, bokRank, bokCount, rankSum,
        isTrad, simpForm, obscure, pinyin: rad.pinyin || ''
    });
}

// Deduplicate: for trad/simp pairs, keep the one with better frequency
const groups = {};
for (const r of results) {
    const key = TRAD_TO_SIMP[r.char] || r.char;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
}

const deduped = [];
for (const [key, entries] of Object.entries(groups)) {
    if (entries.length === 1) {
        deduped.push(entries[0]);
    } else {
        entries.sort((a, b) => (a.isTrad ? 1 : 0) - (b.isTrad ? 1 : 0) || a.rankSum - b.rankSum);
        deduped.push(entries[0]);
        for (let i = 1; i < entries.length; i++) removedTrad.push(entries[i]);
    }
}

const leveling = deduped.filter(r => r.source === 'leveling').sort((a, b) => a.rankSum - b.rankSum);
const decomp = deduped.filter(r => r.source === 'decomposition').sort((a, b) => a.rankSum - b.rankSum);

// Output
console.log(`\n${'='.repeat(80)}`);
console.log(`DEDUPLICATION: Removed ${removedTrad.length} traditional variants`);
console.log(`Unique radicals: ${deduped.length} (${leveling.length} leveling + ${decomp.length} decomposition)`);
console.log(`${'='.repeat(80)}`);

// Doodle God category counts
const dcCounts = {};
for (const r of deduped) {
    const d = r.doodleCat;
    dcCounts[d] = (dcCounts[d] || 0) + 1;
}
console.log(`\nDoodle God Category Distribution:`);
for (const [dc, cnt] of Object.entries(dcCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${dc}: ${cnt}`);
}

// Flag traditional variants removed
if (removedTrad.length) {
    console.log(`\nRemoved traditional variants:`);
    for (const r of removedTrad) console.log(`  ${r.char} → kept ${r.simpForm}`);
}

// Flag obscure
const obscureRads = deduped.filter(r => r.obscure);
if (obscureRads.length) {
    console.log(`\n⚠️ Obscure (consider removal):`);
    for (const r of obscureRads) console.log(`  ${r.char} (${r.doodleCat}) - ${r.meaning.slice(0, 50)}`);
}

// Leveling table
console.log(`\n${'='.repeat(80)}`);
console.log(`LEVELING RADICALS (${leveling.length}) — Sorted by frequency`);
console.log(`${'='.repeat(80)}`);
console.log(`Lv  | Char | CurrCat         | Doodle          | MovRnk | BkRnk | React | Meaning`);
console.log('-'.repeat(80));
for (let i = 0; i < leveling.length; i++) {
    const r = leveling[i];
    console.log(`${String(i + 1).padStart(3)} | ${r.char.padEnd(4)} | ${r.category.padEnd(15)} | ${r.doodleCat.padEnd(15)} | ${String(r.movRank || '—').padStart(6)} | ${String(r.bokRank || '—').padStart(5)} | ${String(r.reactions).padStart(5)} | ${r.meaning.slice(0, 35)}`);
}

// Starting set
console.log(`\n${'='.repeat(80)}`);
console.log(`TOP 10 — Recommended Starting Set (Levels 1-10):`);
console.log(`${'='.repeat(80)}`);
const top10 = leveling.slice(0, 10);
for (let i = 0; i < top10.length; i++) {
    const r = top10[i];
    console.log(`  Lv ${i + 1}: ${r.char} (${r.doodleCat}) - ${r.meaning.slice(0, 50)}`);
}

// Category-balanced starting set
console.log(`\nCategory-balanced Top 10 (ensure variety):`);
const balanced = [];
const catsInBal = new Set();
for (const r of leveling) {
    if (balanced.length >= 10) break;
    if (!catsInBal.has(r.doodleCat) || balanced.length < 10) {
        balanced.push(r);
        catsInBal.add(r.doodleCat);
    }
}
for (let i = 0; i < balanced.length; i++) {
    const r = balanced[i];
    console.log(`  Lv ${i + 1}: ${r.char} (${r.doodleCat}) - ${r.meaning.slice(0, 50)}`);
}

// Full JSON output for plan document
console.log(`\n${'='.repeat(80)}`);
console.log(`JSON — Leveling radicals with new categories:`);
console.log(`${'='.repeat(80)}`);
const output = leveling.map((r, i) => ({
    char: r.char,
    pinyin: r.pinyin,
    meaning: r.meaning.slice(0, 60),
    doodle_category: r.doodleCat,
    new_level: i + 1,
    movie_rank: r.movRank,
    book_rank: r.bokRank,
    reactions: r.reactions,
}));
console.log(JSON.stringify(output, null, 2));
