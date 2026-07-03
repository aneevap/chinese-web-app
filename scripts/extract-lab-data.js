#!/usr/bin/env node
/**
 * extract-lab-data.js
 *
 * Extracts radical and reaction data from the chinese-lexicon repository
 * for use in the Laboratory minigame.
 *
 * Output: radicals.json, reactions.json
 *   radicals.json includes unlock_level for each radical (1-50 for leveled radicals, null for decomposition-only)
 *   reactions.json includes 2-radical reactions, chain reactions, and multi-radical reactions
 */

const fs = require('fs');
const path = require('path');

const LEXICON_PATH = '/Users/gu2026/Downloads/chinese-lexicon-master';

// ── Load data ──────────────────────────────────────────────────────────────

console.log('Loading chinese-lexicon data...');

const ety = require(path.join(LEXICON_PATH, 'etymology/index.js'));
const dictData = require(path.join(LEXICON_PATH, 'dictionary/index.js'));

const etymologies = ety.etymologies;
const dictionaryEntries = dictData.default || [];

// Build fast character lookup: simp -> entry
const dictLookup = {};
for (const entry of dictionaryEntries) {
  if (entry.simp && !dictLookup[entry.simp]) {
    dictLookup[entry.simp] = entry;
  }
}

// ── Category definitions ───────────────────────────────────────────────────

const CATEGORIES = {
  nature: new Set([
    '日', '月', '山', '水', '火', '土', '石', '木', '金',
    '雨', '云', '气', '风', '光', '星', '天', '地',
    '田', '川', '谷', '海', '河', '江', '湖', '泉',
    '春', '夏', '秋', '冬', '夕', '旦', '旱', '申',
  ]),
  body: new Set([
    '口', '目', '耳', '鼻', '舌', '手', '足', '心',
    '身', '面', '首', '页', '而', '牙', '血', '骨', '皮', '毛', '肉',
    '自',
  ]),
  person: new Set([
    '人', '女', '子', '父', '母', '儿', '男', '老', '幼',
    '士', '夫', '民', '臣', '王', '君', '后',
  ]),
  action: new Set([
    '言', '辶', '辵', '彳', '走', '止',
    '立', '行', '来', '去', '出', '入', '进', '退',
  ]),
  animal: new Set([
    '虫', '鱼', '鸟', '马', '牛', '羊', '犬', '豕',
    '鹿', '龙', '虎', '兔', '蛇', '鼠', '猴', '鸡',
    '象', '龟', '贝', '羽', '隹', '毛',
  ]),
  object: new Set([
    '刀', '弓', '戈', '斤', '斗', '车', '门', '户',
    '巾', '革', '韦', '竹', '米', '食', '酉', '辛', '辰',
    '衣', '网', '几', '匕', '勺', '皿', '缶', '瓦', '鼎',
    '糸', '釒',
  ]),
  building: new Set([
    '宀', '穴', '厂', '广', '阜', '卩', '门',
  ]),
  color: new Set([
    '白', '黑', '青', '赤', '黄', '玄', '丹', '朱',
  ]),
  abstract: new Set([
    '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '百', '千', '万', '寸', '尺', '丈', '分', '半',
    '小', '大', '多', '少', '长', '方', '正', '反',
    '上', '下', '左', '右', '中', '内', '外', '前', '后',
    '力', '又',
  ]),
  food: new Set([
    '米', '食', '酉', '甘', '香', '果', '茶', '酒',
    '豆', '麦', '谷', '韭', '禾',
  ]),
};

// Variant form → category mapping
const DIRECT_VARIANT_CATEGORIES = {
  '氵': 'nature', '氺': 'nature',
  '灬': 'nature',
  '扌': 'body',
  '艹': 'nature',
  '忄': 'body', '⺗': 'body',
  '⺼': 'body',
  '亻': 'person', '𠆢': 'person',
  '辶': 'action', '⻌': 'action',
  '彳': 'action',
  '讠': 'action', '訁': 'action',
  '饣': 'food', '飠': 'food',
  '⺮': 'object',
  '纟': 'object', '糹': 'object',
  '刂': 'object',
  '钅': 'object', '釒': 'object',
  '阝': 'building',
  '冫': 'nature',
  '又': 'abstract',
  '卩': 'building',
  '冖': 'building',
  '冂': 'building',
  '爫': 'body',
  '王': 'object',
  '⻊': 'body',
};

// ── Level thresholds ──────────────────────────────────────────────────────

function generateLevelThresholds(maxLevel) {
  // Generate base thresholds using the original cost curve
  const raw = [];
  for (let level = 1; level <= maxLevel; level++) {
    if (level === 1) {
      raw.push(0);
    } else {
      let increment = 40 + (level * 6);
      if (level > 10) increment += 20;
      if (level > 20) increment += 40;
      if (level > 30) increment += 60;
      if (level > 40) increment += 100;
      raw.push(raw[raw.length - 1] + increment);
    }
  }

  // Scale to target ~150 hours total playtime for 30 min/day (49 stars/day)
  // Research benchmarks: 150 hours ≈ full playthrough of a substantive learning app
  // 150 hours × 2 sessions/hour × 49 stars/session = 14,700 stars
  const TARGET_MAX = 14700;
  const currentMax = raw[raw.length - 1]; // 33,394 with original formula
  const scaleFactor = TARGET_MAX / currentMax;

  return raw.map(stars => Math.round(stars * scaleFactor));
}

const MAX_LEVEL = 80;
const LEVEL_THRESHOLDS = generateLevelThresholds(MAX_LEVEL);

// ── Helpers ────────────────────────────────────────────────────────────────

function extractComponentChars(data) {
  if (!data || !data.components) return [];
  return data.components
    .map(c => {
      if (typeof c === 'string') return c;
      if (c && typeof c.char === 'string') return c.char;
      return null;
    })
    .filter(c => c && c.length >= 1 && c !== '◎');
}

function isChineseChar(c) {
  const code = c.charCodeAt(0);
  return (code >= 0x4E00 && code <= 0x9FFF) ||
         (code >= 0x3400 && code <= 0x4DBF) ||
         (code >= 0x2E80 && code <= 0x2EFF) ||
         (code >= 0x2F00 && code <= 0x2FDF);
}

const singleStrokes = new Set(['丨', '丶', '丿', '乙', '乚', '亅']);

// Build category lookup
const CHAR_TO_CATEGORY = {};
for (const [cat, chars] of Object.entries(CATEGORIES)) {
  for (const c of chars) {
    CHAR_TO_CATEGORY[c] = cat;
  }
}
for (const [variant, cat] of Object.entries(DIRECT_VARIANT_CATEGORIES)) {
  CHAR_TO_CATEGORY[variant] = cat;
}

function categorizeRadical(c) {
  return CHAR_TO_CATEGORY[c] || 'other';
}

function getReactionType(data) {
  if (!data || !data.components) return 'compound';
  const types = data.components.map(c => c.type || 'unknown');
  if (types.includes('meaning') && types.includes('sound')) return 'phono-semantic';
  if (types.every(t => t === 'meaning')) return 'semantic';
  if (types.every(t => t === 'iconic')) return 'pictographic';
  if (types.includes('meaning')) return 'semantic-compound';
  return 'compound';
}

// ── Collect components and their frequencies ───────────────────────────────

console.log('Scanning etymology data for components...');
let charsWithComponents = 0;
const componentFreq = {};

for (const [char, data] of Object.entries(etymologies)) {
  const comps = extractComponentChars(data);
  if (comps.length === 0) continue;
  charsWithComponents++;
  for (const comp of comps) {
    componentFreq[comp] = (componentFreq[comp] || 0) + 1;
  }
}

console.log(`Characters with component data: ${charsWithComponents}`);
console.log(`Unique components found: ${Object.keys(componentFreq).length}`);

// ── Select radicals ────────────────────────────────────────────────────────

console.log('\nSelecting radicals...');

const ESSENTIAL_RADICALS = [
  '口', '日', '月', '木', '水', '火', '土', '山', '石', '田', '雨', '风',
  '目', '耳', '手', '足', '心', '肉', '血', '骨',
  '人', '女', '子', '父', '母',
  '言', '辶', '彳', '止', '立',
  '虫', '鱼', '鸟', '马', '牛', '羊', '犬', '隹', '羽', '贝',
  '刀', '弓', '戈', '斤', '车', '门', '巾', '竹', '米', '食', '酉', '衣', '皿',
  '宀', '穴', '厂', '广',
  '白', '黑', '青', '赤', '黄',
  '一', '二', '三', '十', '大', '小', '中', '上', '下', '力', '又', '寸', '八',
  '甘', '豆',
  '氵', '扌', '忄', '灬', '饣', '钅', '纟', '讠', '刂', '阝', '亻', '艹', '冫',
];

const selectedChars = new Set();

for (const c of ESSENTIAL_RADICALS) {
  if (componentFreq[c] && componentFreq[c] >= 1 && isChineseChar(c) && !singleStrokes.has(c)) {
    selectedChars.add(c);
  }
}

for (const [char, freq] of Object.entries(componentFreq)) {
  if (selectedChars.has(char)) continue;
  if (!isChineseChar(char)) continue;
  if (singleStrokes.has(char)) continue;
  if (freq >= 10) {
    selectedChars.add(char);
  }
}

// ── Curated level progression (educational order, hybrid approach) ─────────
// Tier 1 (Lv 1-5): Auto-award. Most essential building blocks.
// Tier 2 (Lv 6-10): Core semantic radicals that appear everywhere.
// Tier 3 (Lv 11-15): Common radicals for character composition.
// Tier 4 (Lv 16-20): Everyday thematic radicals.
// Tier 5 (Lv 21-25): Advanced mixing unlocks here.
// Levels 26-50: Data-driven from frequency + reaction score.

console.log('Building level assignments (curated + data-driven)...');

// Curated first 25 levels
const CURATED_LEVELS = [
  // Tier 1: Foundation (Levels 1-5) — Lab unlocks at 5
  '口', // Lv 1 — mouth. In hundreds of characters.
  '日', // Lv 2 — sun/day. 明, 時, 是, 春.
  '月', // Lv 3 — moon/month. 明, 期, 有, 朋.
  '木', // Lv 4 — tree/wood. 林, 休, 果, 相.
  '氵', // Lv 5 — water. 海, 河, 洗, 酒. 🔬 Lab unlocks.

  // Tier 2: Core semantic (Levels 6-10)
  '火', // Lv 6 — fire. 烧, 灯, 热, 烟.
  '人', // Lv 7 — person. 从, 众, 今.
  '亻', // Lv 8 — person variant. 你, 他, 们, 体.
  '土', // Lv 9 — earth. 地, 城, 场, 坏.
  '心', // Lv 10 — heart. 想, 思, 意. 🌿 Branching begins.

  // Tier 3: Common composable (Levels 11-15)
  '女', // Lv 11 — woman. 好, 她, 姓, 妈.
  '扌', // Lv 12 — hand. 打, 拿, 把, 找.
  '言', // Lv 13 — speech. 说, 话, 语, 信.
  '山', // Lv 14 — mountain. 峰, 岩, 岛, 岸.
  '目', // Lv 15 — eye. 看, 眼, 睛, 睡.

  // Tier 4: Everyday thematic (Levels 16-20)
  '金', // Lv 16 — gold/metal. 钱, 银, 铁.
  '足', // Lv 17 — foot. 路, 踢, 跳, 跑.
  '石', // Lv 18 — stone. 码, 矿, 硬.
  '刀', // Lv 19 — knife. 切, 分, 刻, 到.
  '田', // Lv 20 — field. 男, 画, 界, 电.

  // Tier 5: Thematic expansion (Levels 21-25)
  '虫', // Lv 21 — insect. 虽, 虾, 蛋, 独.
  '力', // Lv 22 — power. 加, 助, 动, 办.
  '马', // Lv 23 — horse. 骑, 驾, 骄, 验.
  '车', // Lv 24 — vehicle. 辆, 轻, 军, 库.
  '鸟', // Lv 25 — bird. 鸡, 鸭, 鹅, 鸣. ⚗️ Advanced mixing.
];

// Get reaction counts for data-driven scoring of remaining slots
const reactionCount = {};
for (const [char, data] of Object.entries(etymologies)) {
  const comps = extractComponentChars(data);
  if (comps.length !== 2) continue;
  for (const comp of comps) {
    if (selectedChars.has(comp)) {
      reactionCount[comp] = (reactionCount[comp] || 0) + 1;
    }
  }
}

// Score remaining (non-curated) radicals by usefulness
const remainingForLevels = [...selectedChars]
  .filter(char => !CURATED_LEVELS.includes(char))
  .map(char => ({
    char,
    frequency: componentFreq[char],
    reactions: reactionCount[char] || 0,
    score: (componentFreq[char] * 0.3) + ((reactionCount[char] || 0) * 0.7)
  }))
  .sort((a, b) => b.score - a.score);

// Assign levels: curated 25 + data-driven 25 = 50 total
const levelAssignment = {};
CURATED_LEVELS.forEach((char, i) => { levelAssignment[char] = i + 1; });
remainingForLevels.slice(0, MAX_LEVEL - CURATED_LEVELS.length).forEach((r, i) => {
  levelAssignment[r.char] = CURATED_LEVELS.length + i + 1;
});
// Remaining get null (decomposition-only)
for (const char of selectedChars) {
  if (levelAssignment[char] === undefined) levelAssignment[char] = null;
}

// Build the radicals array (sorted by unlock_level, nulls last)
const radicals = [...selectedChars]
  .sort((a, b) => {
    const la = levelAssignment[a] ?? 999;
    const lb = levelAssignment[b] ?? 999;
    return la - lb;
  })
  .map(char => {
    const entry = dictLookup[char];
    const pinyin = entry ? (entry.pinyin || entry.searchablePinyin || '') : '';
    const meaning = entry ? (entry.definitions || []).slice(0, 3).join('; ') : '';

    return {
      char,
      pinyin,
      meaning,
      frequency: componentFreq[char],
      reactions: reactionCount[char] || 0,
      category: categorizeRadical(char),
      unlock_level: levelAssignment[char],
      source: levelAssignment[char] !== null ? 'leveling' : 'decomposition',
    };
  });

// Stats
const leveled = radicals.filter(r => r.unlock_level !== null);
const decomposable = radicals.filter(r => r.unlock_level === null);
console.log(`Leveled radicals (1-${MAX_LEVEL}): ${leveled.length}`);
console.log(`Decomposition-only radicals: ${decomposable.length}`);

// Category distribution
const byCat = {};
for (const r of radicals) {
  byCat[r.category] = (byCat[r.category] || 0) + 1;
}
console.log('\nRadicals by category:');
for (const [cat, count] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count}`);
}

// ── Build 2-component reactions ────────────────────────────────────────────

console.log('\nBuilding 2-component reactions...');

const radicalCharSet = new Set(radicals.map(r => r.char));
const decompOnlySet = new Set(decomposable.map(r => r.char));
const reactions = [];
const seenReactions = new Set();

for (const [char, data] of Object.entries(etymologies)) {
  const comps = extractComponentChars(data);
  if (comps.length !== 2) continue;
  if (!radicalCharSet.has(comps[0]) || !radicalCharSet.has(comps[1])) continue;

  const sorted = [...comps].sort();
  const key = sorted.join('+');
  if (seenReactions.has(key)) continue;
  seenReactions.add(key);

  const entry = dictLookup[char];
  // Classify the decomposition category
  const comp0Leveled = !decompOnlySet.has(comps[0]);
  const comp1Leveled = !decompOnlySet.has(comps[1]);
  let decompCategory;
  if (!comp0Leveled && !comp1Leveled) decompCategory = 'both_decomp';
  else if (comp0Leveled && comp1Leveled) decompCategory = 'both_leveled';
  else decompCategory = 'mixed';

  reactions.push({
    radicals: comps,
    result: char,
    pinyin: entry ? entry.pinyin || '' : '',
    meaning: entry ? (entry.definitions || []).slice(0, 2).join('; ') : '',
    type: getReactionType(data),
    decomp_category: decompCategory,
  });
}

console.log(`Reactions generated: ${reactions.length}`);

// ── Build chain reactions (3+ components) ──────────────────────────────────

console.log('\nBuilding chain reactions...');

const multiCompChars = [];
for (const [char, data] of Object.entries(etymologies)) {
  const comps = extractComponentChars(data);
  if (comps.length >= 3 && dictLookup[char]) {
    multiCompChars.push({ char, comps, data });
  }
}

const reactionByPair = {};
for (const r of reactions) {
  const sorted = [...r.radicals].sort().join('+');
  reactionByPair[sorted] = r;
}

const chainReactions = [];
const seenChainKeys = new Set();

for (const { char, comps, data } of multiCompChars) {
  const entry = dictLookup[char];

  for (let i = 0; i < comps.length; i++) {
    for (let j = i + 1; j < comps.length; j++) {
      const pair = [comps[i], comps[j]].sort();
      const pairKey = pair.join('+');
      const knownReaction = reactionByPair[pairKey];
      if (!knownReaction) continue;

      const remaining = comps.filter((_, idx) => idx !== i && idx !== j);
      if (remaining.length === 0) continue;

      for (const rem of remaining) {
        const chainKey = `${knownReaction.result}+${rem}`;
        if (seenChainKeys.has(chainKey)) continue;
        seenChainKeys.add(chainKey);

        chainReactions.push({
          intermediate: knownReaction.result,
          intermediate_recipe: [comps[i], comps[j]],
          added_radical: rem,
          result: char,
          pinyin: entry ? entry.pinyin || '' : '',
          meaning: entry ? (entry.definitions || []).slice(0, 2).join('; ') : '',
          remaining_components: remaining.length > 1 ? remaining : undefined,
        });
        break;
      }
      break;
    }
    break;
  }
}

console.log(`Chain reactions found: ${chainReactions.length}`);

// Direct multi-radical reactions
const multiRadicalReactions = [];
for (const { char, comps, data } of multiCompChars) {
  if (!dictLookup[char]) continue;
  if (!comps.every(c => radicalCharSet.has(c))) continue;
  const entry = dictLookup[char];
  multiRadicalReactions.push({
    radicals: comps,
    result: char,
    pinyin: entry ? entry.pinyin || '' : '',
    meaning: entry ? (entry.definitions || []).slice(0, 2).join('; ') : '',
  });
}

console.log(`Direct multi-radical reactions: ${multiRadicalReactions.length}`);

// ── Build affinity hints ───────────────────────────────────────────────────

console.log('\nBuilding affinity hints...');

const affinities = {};
for (const rxn of reactions) {
  const [r1, r2] = rxn.radicals;
  if (!affinities[r1]) affinities[r1] = [];
  affinities[r1].push({ partner: r2, result: rxn.result, meaning: rxn.meaning });
  if (!affinities[r2]) affinities[r2] = [];
  affinities[r2].push({ partner: r1, result: rxn.result, meaning: rxn.meaning });
}

console.log(`Radicals with affinity data: ${Object.keys(affinities).length}`);

// ── Stats: radicals with no reactions ──────────────────────────────────────

const radicalsWithReactions = new Set();
for (const r of reactions) {
  for (const rad of r.radicals) radicalsWithReactions.add(rad);
}
const noReactionRadicals = radicals.filter(r => !radicalsWithReactions.has(r.char));
console.log(`\nRadicals with no reactions: ${noReactionRadicals.length}`);
if (noReactionRadicals.length > 0) {
  console.log('  ' + noReactionRadicals.map(r => r.char + '(' + r.pinyin + ')').join(', '));
}

// ── Write output files ─────────────────────────────────────────────────────

console.log('\nWriting output files...');

const outputDir = path.join(__dirname, '..');
const radicalsPath = path.join(outputDir, 'radicals.json');
const reactionsPath = path.join(outputDir, 'reactions.json');

fs.writeFileSync(radicalsPath, JSON.stringify({
  radicals,
  total: radicals.length,
  level_thresholds: LEVEL_THRESHOLDS.map((stars, i) => ({
    level: i + 1,
    stars_required: stars,
  })),
  generated_at: new Date().toISOString(),
  source: 'chinese-lexicon etymology data'
}, null, 2));

fs.writeFileSync(reactionsPath, JSON.stringify({
  reactions,
  chain_reactions: chainReactions,
  multi_radical_reactions: multiRadicalReactions,
  stats: {
    total_reactions: reactions.length,
    total_chain_reactions: chainReactions.length,
    total_multi_radical_reactions: multiRadicalReactions.length,
    total_radicals: radicals.length,
  },
  generated_at: new Date().toISOString(),
  source: 'chinese-lexicon etymology data'
}, null, 2));

console.log(`\n✅ Done!`);
console.log(`  radicals.json → ${radicals.length} radicals (${leveled.length} leveled, ${decomposable.length} decomposition-only)`);
console.log(`  reactions.json → ${reactions.length} reactions, ${chainReactions.length} chains, ${multiRadicalReactions.length} multi-radical`);

// ── Summary ────────────────────────────────────────────────────────────────

console.log('\n── Level Progressions ──');
for (let i = 0; i < MAX_LEVEL; i++) {
  const r = radicals.find(r => r.unlock_level === i + 1);
  if (r) {
    const threshold = LEVEL_THRESHOLDS[i];
    let note = '';
    if (i === 0) note = '⭐ Start';
    else if (i === 4) note = '🔬 Lab unlocks';
    else if (i === 9) note = '🌿 Branching begins';
    else if (i === 14) note = '📂 Categories';
    else if (i === 24) note = '⚗️ Advanced mixing';
    console.log(`  Lv${String(i+1).padStart(2)} | ${String(threshold).padStart(5)} ★ | ${r.char} (${r.pinyin}) | ${r.category} ${note}`);
  }
}
