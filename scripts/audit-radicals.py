#!/usr/bin/env python3
"""
Cross-reference radicals.json with chinese-lexicon frequency data.
Deduplicate variants, assign Doodle God categories, sort by frequency.
"""

import json
import re
import sys

# ── 1. Load radicals.json ──────────────────────────────────────────────────
with open('/Users/gu2026/Desktop/chinese-web-app/radicals.json') as f:
    raw = json.load(f)
radicals = raw['radicals'] if isinstance(raw, dict) and 'radicals' in raw else raw
print(f"Loaded {len(radicals)} radicals from radicals.json")

# ── 2. Load chinese-lexicon frequency data ─────────────────────────────────
def parse_freq_tsv(filepath, has_contexts=False):
    """Parse tab-separated frequency files from chinese-lexicon."""
    freq = {}
    with open(filepath) as f:
        content = f.read()
        # Skip the comment header line
        lines = [l.strip() for l in content.split('\n') if l.strip() and not l.strip().startswith('//')]
        for line in lines:
            parts = line.split('\t')
            if len(parts) >= 2:
                char = parts[0]
                count = int(parts[1])
                rank = None  # We'll compute rank later
                if has_contexts and len(parts) >= 3:
                    contexts = int(parts[2])
                else:
                    contexts = None
                freq[char] = {'count': count, 'contexts': contexts}
    return freq

# Movie char frequency (has contexts column)
movie_path = '/Users/gu2026/Downloads/chinese-lexicon-master/statistics/movieCharFrequency.js'
movie_freq = parse_freq_tsv(movie_path, has_contexts=True)
print(f"Loaded {len(movie_freq)} movie char frequencies")

# Book char frequency (just count)
book_path = '/Users/gu2026/Downloads/chinese-lexicon-master/statistics/bookCharFrequency.js'
book_freq = parse_freq_tsv(book_path, has_contexts=False)
print(f"Loaded {len(book_freq)} book char frequencies")

# Compute ranks for both
def compute_ranks(freq_map):
    sorted_chars = sorted(freq_map.items(), key=lambda x: -x[1]['count'])
    for rank, (char, data) in enumerate(sorted_chars, 1):
        freq_map[char]['rank'] = rank
compute_ranks(movie_freq)
compute_ranks(book_freq)

# ── 3. Define variant mappings (traditional → simplified) ──────────────────
TRAD_TO_SIMP = {
    '馬': '马', '鳥': '鸟', '魚': '鱼', '龍': '龙', '見': '见',
    '門': '门', '車': '车', '貝': '贝', '頁': '页', '釒': '钅',
    '絲': '丝', '糹': '纟', '飠': '饣', '麥': '麦', '齒': '齿',
    '龜': '龟', '塵': '尘', '關': '关', '萬': '万', '開': '开',
    '學': '学', '覺': '觉', '審': '审', '對': '对', '爾': '尔',
    '話': '话', '說': '说', '書': '书', '長': '长', '風': '风',
}

# ── 4. Obscure radicals to flag ────────────────────────────────────────────
# These are real decomposition artifacts but have very low gameplay value
OBSCURE = {
    '䜌', '雚', '尞', '堇', '曷', '昜', '僉', '佥', '監', '夂',
    '巠', '廾', '甬', '彡', '聿', '亥', '佥', '䜌',
}

# ── 5. Doodle God category assignment based on current category + meaning ──
def assign_category(rad):
    """Assign Doodle God category based on existing category and meaning."""
    cat = rad.get('category', '')
    char = rad['char']
    meaning = rad.get('meaning', '').lower()
    
    # Override for specific characters that are miscategorized
    # Discovery Compounds — multi-radical compounds that should be discoverable through mixing
    discovery_compounds = {'林', '从', '北', '比', '囚', '相', '旦', '古', '分', '合', '同', '占'}
    if char in discovery_compounds:
        return 'discovery'
    
    # Body
    if cat == 'body':
        return 'body'
    # Person/Family
    if cat == 'person':
        return 'body'
    # Nature
    if cat == 'nature':
        return 'nature'
    # Animal
    if cat == 'animal':
        return 'fauna'
    # Food → usually Flora (plants/crops) or Civilization (processed food like 酉)
    if cat == 'food':
        # 酉 is wine/alcohol → civilization
        if char in ('酉', '飠', '饣'):
            return 'civilization'
        return 'fauna'  # 禾, 米, 豆, 甘 → plants/crops
    # Building → civilization
    if cat == 'building':
        return 'civilization'
    # Object → civilization
    if cat == 'object':
        # Some objects are nature-related
        nature_objects = {'竹', '⺮'}
        if char in nature_objects:
            return 'nature'
        return 'civilization'
    # Action → body (actions are done by people)
    if cat == 'action':
        return 'body'
    # Abstract → abstract
    if cat == 'abstract':
        return 'abstract'
    # Color → nature or abstract
    if cat == 'color':
        return 'nature'  # Colors are natural phenomena
    # Directions
    if cat == 'directions':
        return 'abstract'
    
    # For 'other' category, use character and meaning heuristics
    # Nature-related
    nature_keywords = ['gas', 'air', 'wind', 'cloud', 'water', 'river', 'rock', 'stone', 'root', 'dawn', 'ice', 'snow']
    if any(kw in meaning for kw in nature_keywords):
        return 'nature'
    
    # Body-related
    body_keywords = ['hand', 'foot', 'tooth', 'tongue', 'hair', 'fur', 'skin', 'blood', 'bone', 'meat', 'flesh', 'walk', 'step']
    if any(kw in meaning for kw in body_keywords):
        return 'body'
    
    # Animal-related
    animal_keywords = ['dog', 'ox', 'cow', 'pig', 'boar', 'cattle', 'deer', 'dragon', 'bird', 'fish', 'feather', 'shell', 'creature', 'insect', 'silkworm']
    if any(kw in meaning for kw in animal_keywords):
        return 'fauna'
    
    # Plant/food-related
    plant_keywords = ['grain', 'cereal', 'rice', 'bean', 'sweet', 'bamboo', 'hemp', 'fruit', 'food', 'eat', 'drink']
    if any(kw in meaning for kw in plant_keywords):
        return 'fauna'
    
    # Civilization/tool-related
    civ_keywords = ['knife', 'axe', 'arrow', 'spear', 'dagger', 'weapon', 'bow', 'net', 'trap', 'container', 'vessel', 
                    'dish', 'towel', 'cloth', 'silk', 'thread', 'clothes', 'clothing', 'garment', 'building', 'roof', 
                    'house', 'door', 'gate', 'cave', 'shelter', 'cliff', 'wall', 'city', 'road', 'table', 'cart',
                    'vehicle', 'boat', 'ship', 'tool', 'utensil', 'implement', 'work', 'labor', 'jade', 'metal',
                    'gold', 'money', 'coin', 'seal', 'pen', 'brush', 'book', 'music', 'drum', 'bell']
    if any(kw in meaning for kw in civ_keywords):
        return 'civilization'
    
    # Abstract
    abstract_keywords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred',
                         'thousand', 'number', 'count', 'measure', 'unit', 'inch', 'direction', 'north', 'south',
                         'east', 'west', 'center', 'middle', 'big', 'small', 'many', 'few', 'new', 'old',
                         'self', 'public', 'common', 'together', 'same', 'different', 'opposite', 'contrary',
                         'bad', 'evil', 'wicked', 'good', 'true', 'ghost', 'spirit', 'death', 'life']
    if any(kw in meaning for kw in abstract_keywords):
        return 'abstract'
    
    # Default: other → civilization (broadest category)
    return 'civilization'


# ── 6. Build the analysis ──────────────────────────────────────────────────
# Track simplified-only set to deduplicate
seen_simp = set()

results = []
for rad in radicals:
    char = rad['char']
    source = rad.get('source', 'decomposition')
    unlock_level = rad.get('unlock_level')
    category = rad.get('category', '')
    meaning = rad.get('meaning', '')
    frequency = rad.get('frequency', 0)
    reactions = rad.get('reactions', 0)
    
    # Check if this is a traditional variant
    is_trad = False
    simp_form = None
    if char in TRAD_TO_SIMP:
        is_trad = True
        simp_form = TRAD_TO_SIMP[char]
    
    # Get frequency data
    mov = movie_freq.get(char, {})
    bok = book_freq.get(char, {})
    mov_count = mov.get('count', 0)
    mov_rank = mov.get('rank')
    bok_count = bok.get('count', 0)
    bok_rank = bok.get('rank')
    
    # Combined frequency score (lower is better, sum of ranks, missing = 9999)
    rank_sum = (mov_rank or 9999) + (bok_rank or 9999)
    
    # Determine if this is obscure
    obscure = char in OBSCURE
    
    # Doodle God category
    doodle_cat = assign_category(rad)
    
    # Skip traditional variants — we'll keep the simplified version
    # But keep traditional-only radicals (ones without a simplified counterpart)
    if is_trad and simp_form:
        # Check if the simplified form is in radicals
        # We'll handle deduplication at the output stage
        pass
    
    results.append({
        'char': char,
        'pinyin': rad.get('pinyin', ''),
        'meaning': meaning[:80],
        'category': category,
        'doodle_cat': doodle_cat,
        'source': source,
        'unlock_level': unlock_level,
        'frequency': frequency,
        'reactions': reactions,
        'mov_count': mov_count,
        'mov_rank': mov_rank,
        'bok_count': bok_count,
        'bok_rank': bok_rank,
        'rank_sum': rank_sum,
        'is_trad': is_trad,
        'simp_form': simp_form,
        'obscure': obscure,
    })

# ── 7. Deduplicate and sort ────────────────────────────────────────────────
# Strategy: Keep the simplified version of each radical pair.
# For trad/simp pairs, keep the one with the better frequency data.
# For the freq-based sort, only use leveling radicals + best decomposition ones.

# First pass: flag duplicates to remove
# Build groups: char → group key
def simplify_char(char):
    """Get the simplified form of a character."""
    return TRAD_TO_SIMP.get(char, char)

groups = {}
for r in results:
    key = simplify_char(r['char'])
    if key not in groups:
        groups[key] = []
    groups[key].append(r)

# For each group, pick the best entry
deduped = []
removed_trad = []
for key, entries in groups.items():
    if len(entries) == 1:
        deduped.append(entries[0])
    else:
        # Keep the one with better rank_sum (lower = better frequency)
        # Or prefer simplified form
        best = min(entries, key=lambda e: (e['is_trad'], e['rank_sum']))
        deduped.append(best)
        for e in entries:
            if e != best:
                removed_trad.append(e)

# Separate into leveling and decomposition
leveling = [r for r in deduped if r['source'] == 'leveling']
decomp = [r for r in deduped if r['source'] == 'decomposition']

# Sort leveling by rank_sum (best frequency first)
leveling.sort(key=lambda r: r['rank_sum'])

# Sort decomposition by rank_sum too
decomp.sort(key=lambda r: r['rank_sum'])

# ── 8. Print results ───────────────────────────────────────────────────────
print(f"\n{'='*80}")
print(f"DEDUPLICATION: Removed {len(removed_trad)} traditional variants")
print(f"Unique radicals after dedup: {len(deduped)} ({len(leveling)} leveling + {len(decomp)} decomposition)")
print(f"{'='*80}")

# Doodle God category counts
doodle_cats = {}
for r in deduped:
    dc = r['doodle_cat']
    doodle_cats[dc] = doodle_cats.get(dc, 0) + 1
print(f"\nDoodle God Category Distribution:")
for dc, cnt in sorted(doodle_cats.items(), key=lambda x: -x[1]):
    print(f"  {dc}: {cnt}")

# Traditional variants removed
print(f"\nRemoved traditional variants:")
for r in removed_trad:
    print(f"  {r['char']} → kept {r['simp_form']}")

# Obscure radicals flagged
obscure_rads = [r for r in deduped if r['obscure']]
if obscure_rads:
    print(f"\n⚠️ Flagged as obscure (low gameplay value):")
    for r in obscure_rads:
        print(f"  {r['char']} ({r['doodle_cat']}) - {r['meaning'][:60]}")
    print(f"\n  Consider removing: {', '.join(r['char'] for r in obscure_rads)}")

# ── 9. Print the ranked table ──────────────────────────────────────────────
print(f"\n{'='*80}")
print("LEVELING RADICALS (80) — Sorted by frequency (most frequent = Level 1)")
print(f"{'='*80}")
print(f"{'Lv':>4} | {'Char':>4} | {'Cat':>14} | {'Doodle Cat':>14} | {'MovRank':>7} | {'BkRank':>7} | {'Reacts':>7} | {'Freq':>6} | Meaning")
print("-"*80)
for rank, r in enumerate(leveling, 1):
    doodle = r['doodle_cat']
    mov_r = r['mov_rank'] or '—'
    bok_r = r['bok_rank'] or '—'
    print(f"{rank:>4} | {r['char']:>4} | {r['category']:>14} | {doodle:>14} | {str(mov_r):>7} | {str(bok_r):>7} | {r['reactions']:>7} | {r['frequency']:>6} | {r['meaning'][:40]}")

print(f"\n{'='*80}")
print("DECOMPOSITION RADICALS (150 → deduped ~90) — Sorted by frequency")
print(f"{'='*80}")
print(f"{'Rank':>4} | {'Char':>4} | {'Cat':>14} | {'Doodle Cat':>14} | {'MovRank':>7} | {'BkRank':>7} | {'Source'} | Meaning")
print("-"*80)
for rank, r in enumerate(decomp, 1):
    doodle = r['doodle_cat']
    mov_r = r['mov_rank'] or '—'
    bok_r = r['bok_rank'] or '—'
    print(f"{rank:>4} | {r['char']:>4} | {r['category']:>14} | {doodle:>14} | {str(mov_r):>7} | {str(bok_r):>7} | {'decomp':>6} | {r['meaning'][:40]}")

# ── 10. Doodle God category breakdown ──────────────────────────────────────
print(f"\n{'='*80}")
print("DOODLE GOD CATEGORY BREAKDOWN (by frequency)")
print(f"{'='*80}")
for dc in ['nature', 'body', 'fauna', 'civilization', 'abstract', 'discovery']:
    cat_rads = [r for r in deduped if r['doodle_cat'] == dc]
    cat_rads.sort(key=lambda r: r['rank_sum'])
    if cat_rads:
        print(f"\n--- {dc} ({len(cat_rads)} radicals) ---")
        for r in cat_rads[:5]:
            mov_r = r['mov_rank'] or '—'
            bok_r = r['bok_rank'] or '—'
            print(f"  {r['char']} (movRank={mov_r}, bkRank={bok_r}) - {r['meaning'][:50]}")
        if len(cat_rads) > 5:
            print(f"  ... and {len(cat_rads)-5} more")

# ── 11. Level 1-10 starting set (best engagement) ─────────────────────────
print(f"\n{'='*80}")
print("SUGGESTED STARTING SET (Levels 1-10)")
print("Most frequent radicals, balanced across categories")
print(f"{'='*80}")

# Pick top 10 leveling radicals, try to balance categories
top10 = []
cats_seen = set()
for r in leveling:
    if len(top10) >= 10:
        break
    # Ensure at least 3 different categories in first 10
    top10.append(r)
    cats_seen.add(r['doodle_cat'])

for rank, r in enumerate(top10, 1):
    print(f"  Lv {rank}: {r['char']:>4} ({r['doodle_cat']:>14}) - {r['meaning'][:50]}")

# ── 12. Print JSON for the plan document ──────────────────────────────────
print(f"\n{'='*80}")
print("JSON SUMMARY: Leveling radicals with new categories")
print(f"{'='*80}")
leveling_json = []
for rank, r in enumerate(leveling, 1):
    leveling_json.append({
        'char': r['char'],
        'pinyin': r['pinyin'],
        'meaning': r['meaning'][:60],
        'doodle_category': r['doodle_cat'],
        'new_level': rank,
        'movie_rank': r['mov_rank'],
        'book_rank': r['bok_rank'],
        'reactions': r['reactions'],
    })
print(json.dumps(leveling_json, ensure_ascii=False, indent=2))
