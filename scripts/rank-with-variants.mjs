#!/usr/bin/env node
// Rank leveling radicals with variant forms interleaved by reactions count
// Run: cd chinese-web-app && node scripts/rank-with-variants.mjs

import fs from 'fs';
import path from 'path';

const radPath = path.join(process.cwd(), 'radicals.json');
const raw = JSON.parse(fs.readFileSync(radPath, 'utf-8'));
const radicals = raw.radicals || raw;

async function loadFreq(filepath) {
    const url = new URL('file://' + filepath);
    const mod = await import(url);
    return mod.default;
}
const movieFreq = await loadFreq('/Users/gu2026/Downloads/chinese-lexicon-master/statistics/movieCharFrequency.js');
const bookFreq = await loadFreq('/Users/gu2026/Downloads/chinese-lexicon-master/statistics/bookCharFrequency.js');

const TRAD_TO_SIMP = {
    '馬': '马', '鳥': '鸟', '魚': '鱼', '龍': '龙', '見': '见',
    '門': '门', '車': '车', '貝': '贝', '頁': '页', '釒': '钅',
    '糹': '纟', '飠': '饣', '麥': '麦', '齒': '齿', '龜': '龟',
    '塵': '尘', '關': '关', '萬': '万', '開': '开',
    '爾': '尔', '話': '话', '說': '说', '書': '书', '長': '长', '風': '风',
    '絲': '丝',
};

function assignCat(rad) {
    const cat = rad.category || '';
    const char = rad.char;
    const meaning = (rad.meaning || '').toLowerCase();
    const dc = ['林', '从', '北', '比', '囚', '相', '旦', '古', '分', '合', '同', '占', '包', '加', '召', '周', '告'];
    if (dc.includes(char)) return 'discovery';
    if (cat === 'body' || cat === 'person' || cat === 'action') return 'body';
    if (cat === 'nature' || cat === 'color') return 'nature';
    if (cat === 'animal') return 'fauna';
    if (cat === 'building') return 'civilization';
    if (cat === 'directions' || cat === 'abstract') return 'abstract';
    if (cat === 'food') return ['酉', '飠', '饣'].includes(char) ? 'civilization' : 'fauna';
    if (cat === 'object') return ['竹', '⺮'].includes(char) ? 'nature' : 'civilization';
    const nK = ['gas', 'air', 'wind', 'cloud', 'water', 'river', 'rock', 'stone', 'root', 'dawn', 'ice', 'snow', 'rain'];
    const bK = ['hand', 'foot', 'tooth', 'tongue', 'hair', 'fur', 'skin', 'blood', 'bone', 'meat', 'flesh', 'walk', 'step'];
    const fK = ['dog', 'ox', 'cow', 'pig', 'boar', 'cattle', 'deer', 'dragon', 'bird', 'fish', 'feather', 'shell', 'grain', 'cereal', 'rice', 'bean', 'sweet', 'fruit', 'food', 'eat', 'drink'];
    const cK = ['knife', 'axe', 'arrow', 'spear', 'dagger', 'weapon', 'bow', 'net', 'trap', 'container', 'vessel', 'dish', 'towel', 'cloth', 'silk', 'thread', 'roof', 'house', 'door', 'gate', 'cave', 'shelter', 'cliff', 'wall', 'city', 'road', 'table', 'cart', 'vehicle', 'boat', 'ship', 'tool', 'work', 'labor', 'jade', 'metal', 'gold', 'money', 'coin', 'seal', 'pen', 'brush', 'book', 'music', 'drum', 'bell'];
    const aK = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'thousand', 'number', 'count', 'measure', 'unit', 'inch', 'direction', 'north', 'south', 'east', 'west', 'center', 'middle', 'big', 'small', 'many', 'few', 'new', 'old', 'self', 'common', 'together', 'same', 'different', 'opposite', 'contrary', 'bad', 'evil', 'good', 'true', 'ghost', 'spirit', 'death', 'life'];
    if (nK.some(k => meaning.includes(k))) return 'nature';
    if (bK.some(k => meaning.includes(k))) return 'body';
    if (fK.some(k => meaning.includes(k))) return 'fauna';
    if (cK.some(k => meaning.includes(k))) return 'civilization';
    if (aK.some(k => meaning.includes(k))) return 'abstract';
    return 'other';
}

// Build all radicals
const all = [];
for (const rad of radicals) {
    const char = rad.char;
    const isTrad = char in TRAD_TO_SIMP;
    const key = TRAD_TO_SIMP[char] || char;
    const mov = movieFreq[char] || {};
    const bok = bookFreq[char] || {};
    all.push({
        char, isTrad, key, source: rad.source, category: rad.category,
        doodleCat: assignCat(rad), meaning: rad.meaning || '',
        frequency: rad.frequency || 0, reactions: rad.reactions || 0,
        movRank: mov.rank ? parseInt(mov.rank) : null,
        bokRank: bok.rank ? parseInt(bok.rank) : null,
        pinyin: rad.pinyin || '',
    });
}

// Deduplicate
const groups = {};
for (const r of all) {
    if (!groups[r.key]) groups[r.key] = [];
    groups[r.key].push(r);
}
const deduped = [];
for (const entries of Object.values(groups)) {
    if (entries.length === 1) deduped.push(entries[0]);
    else {
        entries.sort((a, b) => (a.isTrad ? 1 : 0) - (b.isTrad ? 1 : 0));
        deduped.push(entries[0]);
    }
}

const leveling = deduped.filter(r => r.source === 'leveling');

// Separate into "has frequency rank" and "variant forms"
const hasFreq = leveling.filter(r => r.movRank !== null || r.bokRank !== null);
const variants = leveling.filter(r => r.movRank === null && r.bokRank === null);

// Sort frequency-ranked ones by rankSum
hasFreq.sort((a, b) => {
    const aScore = (a.movRank || 9999) + (a.bokRank || 9999);
    const bScore = (b.movRank || 9999) + (b.bokRank || 9999);
    return aScore - bScore;
});

// Sort variants by reactions (descending)
variants.sort((a, b) => b.reactions - a.reactions);

// Now interleave: for each variant, find the best position based on reactions
// We'll insert variants into the frequency list at positions where
// their reactions count would naturally place them

// Strategy: for each variant sorted by reactions (descending),
// insert it after any freq-ranked char with fewer reactions
const result = [...hasFreq];
const inserted = new Set();

for (const v of variants) {
    // Find the best index: insert after the last char that has reactions >= v.reactions
    // But also consider that freq-ranked chars have priority
    let insertIdx = result.length; // default: end
    
    // Find position based on reactions relative to existing chars
    // Look for the right spot: after a char with fewer reactions, before one with more
    for (let i = 0; i < result.length; i++) {
        if (result[i].reactions < v.reactions) {
            insertIdx = i;
            break;
        }
    }
    
    result.splice(insertIdx, 0, v);
    inserted.add(v.char);
}

// Print
console.log('='.repeat(110));
console.log('ADJUSTED LEVELING RADICALS — Variants interleaved by reactions');
console.log('='.repeat(110));
console.log('Lv  | Char | Doodle Cat      | MovRnk | BkRnk | Reactns | Freq  | Meaning');
console.log('-'.repeat(110));
for (let i = 0; i < result.length; i++) {
    const r = result[i];
    const isVar = r.movRank === null && r.bokRank === null;
    const marker = isVar ? ' *' : '  ';
    console.log(
        `${String(i + 1).padStart(3)} | ${r.char.padEnd(4)} | ${r.doodleCat.padEnd(15)} | ` +
        `${String(r.movRank || '—').padStart(6)} | ${String(r.bokRank || '—').padStart(5)} | ` +
        `${String(r.reactions).padStart(7)} | ${String(r.frequency).padStart(5)} | ${r.meaning.slice(0, 30)}${marker}`
    );
}

// Category summary
console.log(`\n${'='.repeat(110)}`);
console.log('CATEGORY DISTRIBUTION');
console.log('-'.repeat(110));
const cats = {};
for (const r of result) {
    cats[r.doodleCat] = (cats[r.doodleCat] || 0) + 1;
}
for (const [c, n] of Object.entries(cats).sort((a, b) => b[1] - a[1])) {
    const chars = result.filter(r => r.doodleCat === c).map(r => r.char).join(' ');
    console.log(`  ${c.padEnd(15)} ${String(n).padStart(2)}: ${chars}`);
}

// Note about markers
console.log(`\n  * = variant form (no standalone freq rank, sorted by reactions count)`);
