# Chinese Lexicon Reference

**Location:** `/Users/gu2026/Downloads/chinese-lexicon-master/`
**npm package:** `chinese-lexicon` (ESM + CJS dual build)
**Source:** Based on CC-CEDICT, SUBTLEX-CH film subtitles (Cai & Brysbaert 2010), Jun Da book corpus

## Directory Structure

```
├── statistics/       ← Frequency data (ES modules, default exports)
│   ├── movieCharFrequency.js    (4.5K entries) char → {count, contexts, rank}
│   ├── bookCharFrequency.js     (7.9K entries) char → {count, rank}
│   ├── movieWordFrequency.js    Word-level movie freq
│   ├── bookWordFrequency.js     Word-level book freq
│   ├── hsk.js                   HSK level lookup
│   ├── pinyinFrequency.js       Pinyin frequency
│   └── index.js                 Aggregates everything, adds topWords
├── dictionary/
│   ├── cedict.js                ← CC-CEDICT dictionary (8.9MB)
│   ├── formatPinyin.js
│   └── index.js
├── dist/                        Bundled builds (esm + cjs)
│   ├── index.esm.js
│   └── index.cjs.js
├── etymology/
│   ├── index.js                 Etymology data for ~1000 common chars
│   ├── etymologyImages.js       SVG image data for etymology
│   └── etymologyCommands.js
└── package.json                 npm package config
```

## Access Patterns

### 1. Frequency data (most useful)

**Files are ES modules** — imported normally via Node.js:
```javascript
const moviePath = '/Users/gu2026/Downloads/chinese-lexicon-master/statistics/movieCharFrequency.js';
const url = new URL('file://' + moviePath);
const mod = await import(url);
const movieFreq = mod.default;
// Returns: { '我': { count: '2058980', contexts: '6242', rank: 1 }, ... }
```

### 2. Character frequency entry format

**Movie:** `char → { count: string, contexts: string, rank: number }`  
**Book:** `char → { count: string, rank: number }` (no contexts)

- Movie corpus: 46,841,097 chars, 6,243 contexts (subtitles)
- Book corpus: 193,504,018 chars (Jun Da corpus)
- Ranks are computed from the raw TSV data inside each JS file
- Rank 1 = most frequent. Missing chars = not in top N
- Variant radical forms (氵, 亻, 扌, 艹) are NOT in frequency lists — use `radicals.json`'s own `frequency` field as fallback

### 3. The TSV data lives inside JS template literals

Each frequency file has this structure:
```javascript
// comment header
let data = `我\t2058980\t6242
的\t1762079\t6243
...`;

let movieCharFrequencies = {};
let lines = data.split('\n');
for (let ln of lines) {
    let [char, count, contexts] = ln.split('\t');
    // builds object with rank
}
export default movieCharFrequencies;
```

**Do NOT parse with Python** — just `import` via Node.js dynamic import.

### 4. To get stats for a specific character via the npm API

```javascript
import { getEntries } from 'chinese-lexicon';
const entries = getEntries('口');
// entries[0].statistics = { movieCharRank, bookCharRank, pinyinFrequency, ... }
```

## Key Data Points

| File | Lines | Coverage |
|------|-------|----------|
| movieCharFrequency.js | 3,374 | ~4,500 most common chars |
| bookCharFrequency.js | 9,947 | ~7,900 most common chars |
| dictionary/cedict.js | ~890K | Full CC-CEDICT |
| etymology/index.js | 12K lines | ~1,000 chars with etymology |

## Common Pitfalls

- **Variant forms not in freq data**: 氵, 亻, 扌, 辶, 艹, 灬, 刂, etc. don't appear in frequency lists. Use `reactions` count from `radicals.json` as a proxy for importance.
- **Traditional/simplified duplicates**: The extraction kept both (馬/马, 龍/龙, etc.). Deduplicate by keeping simplified.
- **Some entries are full characters**: 我, 同, 真, 它, 鬼 appear as radicals in the game but are actually full characters extracted from decompositions.
- **Movie rank is more conversational**, book rank is more literary. Use combined score.
