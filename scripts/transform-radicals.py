#!/usr/bin/env python3
"""
Phase 1: Transform radicals.json with Doodle God categories, frequency ordering,
variant pairing, and promoted radicals.

Changes:
  - 6 Doodle God categories on every entry
  - 70 leveling radicals sorted by frequency+reactions with new unlock_level values
  - 5 merged pair variants removed from leveling (亻, 忄, 讠, 钅, 刂) → moved to decomp
  - 5 promoted radicals (一, 小, 母, 风, 龙) added to leveling
  - 12 chainable radicals flagged
  - All 12 trad variants removed (keep simplified)
  - Full metadata (variant_pairs, spare_replacements, category colors)
"""

import json
from collections import Counter

RADICALS_PATH = '/Users/gu2026/Desktop/chinese-web-app/radicals.json'

# ── 1. Load data ──────────────────────────────────────────────────────────

with open(RADICALS_PATH) as f:
    data = json.load(f)

old_items = data['radicals']
old_by_char = {x['char']: x for x in old_items}

# ── 2. All decisions as data ─────────────────────────────────────────────

# Traditional → simplified (these get dropped)
TRAD_REMOVE = {'馬', '鳥', '魚', '龍', '見', '門', '車', '貝', '頁', '釒', '糹', '飠'}

# Final 70-level ordering: (char, doodle_category, flags)
# flags: '' | 'chainable'
LEVEL_ORDER = [
    # ── Tier 1: Frequency-ranked (levels 1-51) ──
    ('人', 'body', ''),
    ('大', 'abstract', 'chainable'),
    ('子', 'body', ''),
    ('心', 'body', ''),
    ('力', 'abstract', ''),
    ('者', 'abstract', ''),
    ('工', 'civilization', ''),
    ('女', 'body', ''),
    ('又', 'abstract', ''),
    ('日', 'nature', 'chainable'),
    ('白', 'nature', ''),
    ('门', 'civilization', ''),
    ('非', 'other', ''),
    ('马', 'fauna', ''),
    ('车', 'civilization', ''),
    ('口', 'body', ''),
    ('目', 'body', 'chainable'),
    ('月', 'nature', ''),
    ('金', 'nature', 'chainable'),
    ('火', 'nature', ''),
    ('言', 'body', ''),
    ('各', 'other', 'chainable'),
    ('王', 'civilization', 'chainable'),
    ('山', 'nature', ''),
    ('止', 'body', ''),
    ('米', 'fauna', ''),
    ('足', 'body', ''),
    ('石', 'nature', 'chainable'),
    ('广', 'civilization', ''),
    ('土', 'nature', 'chainable'),
    ('贝', 'fauna', 'chainable'),
    ('鱼', 'fauna', ''),
    ('木', 'nature', 'chainable'),
    ('耳', 'body', ''),
    ('刀', 'civilization', ''),
    ('雨', 'nature', ''),
    ('田', 'nature', ''),
    ('鸟', 'fauna', ''),
    ('虫', 'fauna', ''),
    ('羊', 'fauna', ''),
    ('页', 'body', ''),
    ('欠', 'other', ''),
    ('寸', 'abstract', ''),
    ('巾', 'civilization', ''),
    ('穴', 'civilization', 'chainable'),
    ('禾', 'fauna', ''),
    ('皿', 'civilization', ''),
    ('酉', 'civilization', ''),
    ('金_var', 'civilization', ''),   # will become 钅 at Lv 49
    ('隹', 'fauna', ''),
    ('攵', 'other', ''),
    # ── Tier 2: Reaction-sorted variant forms (levels 52-63) ──
    ('氵', 'nature', ''),
    ('扌', 'body', ''),
    ('艹', 'nature', ''),
    ('人_var', 'body', ''),           # will become 亻 at Lv 54... wait
    # Let me just build the correct list directly.
]

# ── Hmm, the above is getting confusing with merged pair placeholders.
# Let me build the final 70 directly.

# Final 70 levels: char, doodle_category, flags
LEVELS = [
    # Tier 1: Frequency-ranked, no merged variants (51 entries)
    ('人', 'body', ''),        # Lv 1
    ('大', 'abstract', 'chainable'),  # Lv 2
    ('子', 'body', ''),        # Lv 3
    ('心', 'body', ''),        # Lv 4
    ('力', 'abstract', ''),    # Lv 5
    ('者', 'abstract', ''),    # Lv 6
    ('工', 'civilization', ''),  # Lv 7
    ('女', 'body', ''),        # Lv 8
    ('又', 'abstract', ''),    # Lv 9
    ('日', 'nature', 'chainable'),  # Lv 10
    ('白', 'nature', ''),      # Lv 11
    ('门', 'civilization', ''),  # Lv 12
    ('非', 'other', ''),       # Lv 13
    ('马', 'fauna', ''),       # Lv 14
    ('车', 'civilization', ''),  # Lv 15
    ('口', 'body', ''),        # Lv 16
    ('目', 'body', 'chainable'),  # Lv 17
    ('月', 'nature', ''),      # Lv 18
    ('金', 'nature', 'chainable'),  # Lv 19
    ('火', 'nature', ''),      # Lv 20
    ('言', 'body', ''),        # Lv 21
    ('各', 'other', 'chainable'),  # Lv 22
    ('王', 'civilization', 'chainable'),  # Lv 23
    ('山', 'nature', ''),      # Lv 24
    ('止', 'body', ''),        # Lv 25
    ('米', 'fauna', ''),       # Lv 26
    ('足', 'body', ''),        # Lv 27
    ('石', 'nature', 'chainable'),  # Lv 28
    ('广', 'civilization', ''),  # Lv 29
    ('土', 'nature', 'chainable'),  # Lv 30
    ('贝', 'fauna', 'chainable'),  # Lv 31
    ('鱼', 'fauna', ''),       # Lv 32
    ('木', 'nature', 'chainable'),  # Lv 33
    ('耳', 'body', ''),        # Lv 34
    ('刀', 'civilization', ''),  # Lv 35
    ('雨', 'nature', ''),      # Lv 36
    ('田', 'nature', ''),      # Lv 37
    ('鸟', 'fauna', ''),       # Lv 38
    ('虫', 'fauna', ''),       # Lv 39
    ('羊', 'fauna', ''),       # Lv 40
    ('页', 'body', ''),        # Lv 41
    ('欠', 'other', ''),       # Lv 42
    ('寸', 'abstract', ''),    # Lv 43
    ('巾', 'civilization', ''),  # Lv 44
    ('穴', 'civilization', 'chainable'),  # Lv 45
    ('禾', 'fauna', ''),       # Lv 46
    ('皿', 'civilization', ''),  # Lv 47
    ('酉', 'civilization', ''),  # Lv 48
    ('隹', 'fauna', ''),       # Lv 49  ← bumped up since 钅 removed
    ('攵', 'other', ''),       # Lv 50  ← bumped up
    ('氵', 'nature', ''),      # Lv 51  ← bumped up
    
    # Tier 2: Reaction-sorted variant forms (levels 52-60)
    ('扌', 'body', ''),        # Lv 52
    ('艹', 'nature', ''),      # Lv 53
    ('辶', 'body', ''),        # Lv 54
    ('⺼', 'body', ''),        # Lv 55
    ('纟', 'civilization', ''),  # Lv 56
    ('疒', 'other', 'chainable'),  # Lv 57
    ('⺮', 'nature', ''),      # Lv 58
    ('阝', 'civilization', ''),  # Lv 59
    ('犭', 'other', ''),       # Lv 60
    
    # Tier 3: Remaining + promoted (levels 61-70)
    ('宀', 'civilization', ''),  # Lv 61
    ('衤', 'other', ''),       # Lv 62
    ('卩', 'civilization', ''),  # Lv 63
    ('礻', 'other', ''),       # Lv 64
    ('饣', 'civilization', ''),  # Lv 65
    ('一', 'abstract', ''),    # Lv 66 — promoted from decomp
    ('小', 'abstract', ''),    # Lv 67 — promoted from decomp
    ('母', 'body', ''),        # Lv 68 — promoted from decomp
    ('风', 'nature', ''),      # Lv 69 — promoted from decomp
    ('龙', 'fauna', ''),       # Lv 70 — promoted from decomp
]

assert len(LEVELS) == 70, f"Expected 70 levels, got {len(LEVELS)}"

# ── 3. Pair definitions ──────────────────────────────────────────────────

# Merged pair variants — these are REMOVED from leveling (moved to decomp)
# But when the full char is unlocked, the variant is also awarded as a bonus
MERGED_PAIRS = {
    '人': '亻',   # Lv 1 person → also award person radical
    '心': '忄',   # Lv 4 heart → also award heart radical
    '言': '讠',   # Lv 21 speech → also award speech radical
    '金': '钅',   # Lv 19 gold → also award metal radical
    '刀': '刂',   # Lv 35 knife → also award knife radical
}

# Bonus pairs — variant is leveled, full char was decomposition
# The variant entry gets paired_with pointing to the full char
BONUS_PAIRS = {
    '氵': '水', '扌': '手', '辶': '走', '⺼': '肉',
    '纟': '糸', '饣': '食', '犭': '犬', '衤': '衣', '⺮': '竹',
}

# Reverse bonus — full char is leveled, variant was decomposition
REVERSE_PAIRS = {'火': '灬'}

# All paired variants = entries that should NOT exist as separate items
# (They're awarded as a bonus when their counterpart is leveled)
ALL_PAIRED_VARIANTS = set(MERGED_PAIRS.values()) | set(REVERSE_PAIRS.values())

# Full chars that are awarded as bonuses (shouldn't be standalone items)
BONUS_FULL_CHARS = set(BONUS_PAIRS.values())

# Spare replacements for chainable radicals
SPARE_REPLACEMENTS = {
    '大': '公', '日': '合', '目': '彳', '木': '冫', '土': '生',
    '金': '青', '王': '弓', '贝': '羽', '石': '气', '穴': '戈',
    '疒': '包', '各': '令',
}

# Color mapping
DOODLE_COLORS = {
    'nature': '#4CAF50',
    'body': '#FF7043',
    'civilization': '#FFB300',
    'fauna': '#EC407A',
    'abstract': '#5C6BC0',
    'other': '#9E9E9E',
}

# ── 4. Build new radicals list ────────────────────────────────────────────

new_items = []
seen_chars = set()
trad_removed = []
merged_added_to_decomp = []

# 4a. Process 70 leveling radicals
for lv, (char, category, flags) in enumerate(LEVELS, 1):
    old_entry = old_by_char.get(char)
    if not old_entry:
        print(f"WARNING: '{char}' not found in old radicals.json!")
        continue
    
    entry = dict(old_entry)  # shallow copy
    entry['doodle_category'] = category
    entry['unlock_level'] = lv
    entry['source'] = 'leveling'
    entry['chainable'] = (flags == 'chainable')
    
    # Add paired_with for bonus/merged/reverse pairs
    if char in BONUS_PAIRS:
        entry['paired_with'] = BONUS_PAIRS[char]
    elif char in MERGED_PAIRS:
        entry['paired_with'] = MERGED_PAIRS[char]
    elif char in REVERSE_PAIRS:
        entry['paired_with'] = REVERSE_PAIRS[char]
    elif 'paired_with' in entry:
        del entry['paired_with']
    
    new_items.append(entry)
    seen_chars.add(char)
    
    # Remove variant from old_by_char if it's a merged variant
    # (it will be re-added as decomposition below)
    if char in MERGED_PAIRS:
        variant = MERGED_PAIRS[char]
        if variant in old_by_char:
            # We'll pick it up in the decomposition pass
            pass

# 4b. Add merged pair variants to decomposition set
# These are variants that were in the old leveling set but are now
# removed from leveling. They should be discoverable through decomp.
for full_char, variant in MERGED_PAIRS.items():
    if variant in old_by_char and variant not in seen_chars:
        merged_added_to_decomp.append(variant)

# 4c. Process remaining decomposition radicals
for old_item in old_items:
    char = old_item['char']
    
    # Skip if already in leveling
    if char in seen_chars:
        continue
    
    # Skip traditional variants
    if char in TRAD_REMOVE:
        trad_removed.append(char)
        continue
    
    # Skip bonus full chars (awarded as bonus with their variant)
    if char in BONUS_FULL_CHARS:
        continue
    
    # Skip reverse bonus variants (awarded as bonus with their full char)
    if char in REVERSE_PAIRS.values():
        continue
    
    # Create decomposition entry
    entry = dict(old_item)
    entry['unlock_level'] = None
    entry['source'] = 'decomposition'
    entry['chainable'] = False
    
    # Map old category to doodle category
    old_cat = old_item.get('category', '')
    cat_map = {
        'body': 'body', 'person': 'body', 'action': 'body',
        'nature': 'nature', 'color': 'nature',
        'animal': 'fauna', 'food': 'fauna',
        'building': 'civilization', 'object': 'civilization', 'tool': 'civilization',
        'abstract': 'abstract', 'directions': 'abstract', 'number': 'abstract',
    }
    entry['doodle_category'] = cat_map.get(old_cat, 'other')
    if 'paired_with' in entry:
        del entry['paired_with']
    
    new_items.append(entry)
    seen_chars.add(char)

# 4d. Sort: leveling first (by unlock_level), then decomposition
def sort_key(r):
    lv = r.get('unlock_level')
    if lv is not None:
        return (0, lv)
    else:
        return (1, 0)

new_items.sort(key=sort_key)

# ── 5. Update metadata ────────────────────────────────────────────────────

data['radicals'] = new_items
data['total_leveling'] = sum(1 for r in new_items if r['source'] == 'leveling')
data['total_decomposition'] = sum(1 for r in new_items if r['source'] == 'decomposition')
data['total'] = len(new_items)
data['generated_at'] = '2025-06-19 (Doodle God Phase 1)'
data['doodle_categories'] = list(DOODLE_COLORS.keys())
data['doodle_category_colors'] = DOODLE_COLORS
data['variant_pairs'] = {
    **{v: k for k, v in MERGED_PAIRS.items()},  # variant → full
    **BONUS_PAIRS,                               # variant → full
    **REVERSE_PAIRS,                             # full → variant
}
data['spare_replacements'] = SPARE_REPLACEMENTS
data['chainable_radicals'] = [r['char'] for r in new_items if r.get('chainable')]
data['notes'] = 'Doodle God recategorization — 70 leveling, 138 decomposition. See radical-categories-plan.md'

# Remove old fields
for key in ['promoted', 'leveling', 'decomposition']:
    data.pop(key, None)

# ── 6. Summary ────────────────────────────────────────────────────────────

lv_count = data['total_leveling']
dc_count = data['total_decomposition']
total = data['total']

print(f"=== Transformation Summary ===")
print(f"Total radicals: {total}")
print(f"  Leveling: {lv_count}")
print(f"  Decomposition: {dc_count}")
print(f"Traditional variants removed: {len(trad_removed)} ({', '.join(trad_removed)})")
print(f"Merged pairs (variant→decomp): {len(MERGED_PAIRS)} ({', '.join(MERGED_PAIRS.values())})")
print(f"Promoted from decomp→leveling: 5 ({', '.join(c for c,_,_ in LEVELS if c in {'一','小','母','风','龙'})})")
print(f"Bonus pairs (variant→full): {len(BONUS_PAIRS)}")
print(f"Reverse bonus (full→variant): {len(REVERSE_PAIRS)}")

# Category distribution
cats = Counter(r['doodle_category'] for r in new_items if r.get('unlock_level'))
print(f"\nDoodle God category distribution (leveling):")
for c in ['body', 'civilization', 'nature', 'fauna', 'abstract', 'other']:
    chars = [r['char'] for r in new_items if r.get('unlock_level') and r['doodle_category'] == c]
    print(f"  {c}: {len(chars)} — {', '.join(chars)}")

print(f"\nChainable leveling: {[r['char'] for r in new_items if r.get('chainable')]}")
print(f"Spare replacements: {len(SPARE_REPLACEMENTS)}")

# ── 7. Save ────────────────────────────────────────────────────────────────

with open(RADICALS_PATH, 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n✅ radicals.json updated!")
