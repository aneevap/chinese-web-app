/**
 * extract-three-component-decomps.js
 *
 * Mines the chinese-lexicon etymology data for characters that decompose
 * into exactly 3 components, and filters to only those where ALL 3 components
 * are in our 222-radical list.
 *
 * This gives us "direct 3-radical reactions" — characters formed by
 * combining 3 radicals simultaneously (as opposed to stepwise build-up chains).
 *
 * Examples:
 *   森 = 木 + 木 + 木  (forest)
 *   品 = 口 + 口 + 口  (product)
 *   鑫 = 金 + 金 + 金  (prosperity)
 *
 * Usage: node scripts/extract-three-component-decomps.js
 * Output: three_component_reactions.json (in project root)
 */

const fs = require('fs');
const path = require('path');

const LEXICON_PATH = '/Users/gu2026/Downloads/chinese-lexicon-master';

console.log('=== 3-Component Decomposition Extractor ===\n');

// ── Load data ──────────────────────────────────────────────────────────────

console.log('Loading chinese-lexicon data...');
const ety = require(path.join(LEXICON_PATH, 'etymology/index.js'));
const dictData = require(path.join(LEXICON_PATH, 'dictionary/index.js'));
const etymologies = ety.etymologies;
const dictionaryEntries = dictData.default || [];

console.log('  Etymologies loaded:', Object.keys(etymologies).length);
console.log('  Dictionary entries:', dictionaryEntries.length);

// Build fast dictionary lookup
const dictLookup = {};
for (const entry of dictionaryEntries) {
  if (entry.simp && !dictLookup[entry.simp]) {
    dictLookup[entry.simp] = entry;
  }
}

// ── Load our radicals ──────────────────────────────────────────────────────

console.log('\nLoading radicals.json...');
const radicalsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'radicals.json'), 'utf-8')
);
const radicalSet = {};
radicalsData.radicals.forEach(function (r) {
  radicalSet[r.char] = r;
});
console.log('  Radicals in set:', Object.keys(radicalSet).length);

// ── Extract components from etymology data ────────────────────────────────

function extractComponentChars(data) {
  if (!data || !data.components) return [];
  return data.components
    .map(function (c) {
      if (typeof c === 'string') return c;
      if (c && typeof c.char === 'string') return c.char;
      return null;
    })
    .filter(function (c) {
      return c && c.length >= 1 && c !== '◎';
    });
}

// ── Find 3-component characters, filter by radical set ────────────────────

console.log('\nMining 3-component decompositions...');

const candidates = [];    // All 3-component chars
const filtered = [];      // Only where all 3 components are in radical set
const partiallyMatch = []; // Where 2 of 3 are in radical set
const noMatch = [];        // Where 0-1 of 3 are in radical set

for (const [char, data] of Object.entries(etymologies)) {
  const comps = extractComponentChars(data);
  if (comps.length !== 3) continue;

  candidates.push({ char, comps });

  // Count how many components are in our radical set
  const inSetCount = comps.filter(function (c) { return radicalSet[c]; }).length;

  const entry = dictLookup[char];
  const entryData = {
    char: char,
    radicals: comps,
    pinyin: entry ? (entry.pinyin || '') : '',
    meaning: entry ? (entry.definitions || []).slice(0, 2).join('; ') : '',
    in_radical_set: inSetCount,
  };

  if (inSetCount === 3) {
    filtered.push(entryData);
  } else if (inSetCount === 2) {
    partiallyMatch.push(entryData);
  } else {
    noMatch.push(entryData);
  }
}

console.log('  Total 3-component decompositions:', candidates.length);
console.log('  All 3 in radical set:', filtered.length);
console.log('  2 of 3 in radical set:', partiallyMatch.length);
console.log('  0-1 of 3 in radical set:', noMatch.length);

// ── Show sample output ────────────────────────────────────────────────────

console.log('\n=== SAMPLES FROM FILTERED SET (all 3 radicals) ===');
filtered.slice(0, 30).forEach(function (r) {
  console.log('  ' + r.char + ' → [' + r.radicals.join(', ') + '] ' +
    (r.pinyin ? '(' + r.pinyin + ') ' : '') + r.meaning);
});

// ── Show partially matching for reference ─────────────────────────────────

console.log('\n=== SAMPLES FROM PARTIAL SET (2 of 3 radicals) ===');
partiallyMatch.slice(0, 15).forEach(function (r) {
  const inSet = r.radicals.filter(function (c) { return radicalSet[c]; });
  const missing = r.radicals.filter(function (c) { return !radicalSet[c]; });
  console.log('  ' + r.char + ' → [' + r.radicals.join(', ') + '] ' +
    (r.pinyin ? '(' + r.pinyin + ') ' : '') + r.meaning);
  console.log('    In set: ' + inSet.join(', ') + ' | Missing: ' + missing.join(', '));
});

// ── Category distribution for filtered set ────────────────────────────────

console.log('\n=== CATEGORY DISTRIBUTION ===');
const catCount = {};
filtered.forEach(function (r) {
  r.radicals.forEach(function (c) {
    const rad = radicalSet[c];
    if (rad && rad.category) {
      catCount[rad.category] = (catCount[rad.category] || 0) + 1;
    }
  });
});
Object.keys(catCount).sort(function (a, b) { return catCount[b] - catCount[a]; })
  .forEach(function (cat) {
    console.log('  ' + cat + ': ' + catCount[cat]);
  });

// ── Write output ──────────────────────────────────────────────────────────

console.log('\nWriting output file...');

const output = {
  generated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
  source: 'chinese-lexicon etymology data + radicals.json',
  total_three_component_decomps: candidates.length,
  all_three_in_radical_set: filtered.length,
  two_of_three_in_radical_set: partiallyMatch.length,
  reactions: filtered,
};

const outPath = path.join(__dirname, '..', 'three_component_reactions.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

console.log('  Written to:', outPath);
console.log('  File size:', (fs.statSync(outPath).size / 1024).toFixed(1), 'KB');

console.log('\n✅ Done!');
