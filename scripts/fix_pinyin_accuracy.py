#!/usr/bin/env python3
"""
Fix pinyin inaccuracies from the CC-CEDICT character fallback:
1. Erhua entries: replace 儿 suffix (ren2/er2) with r5
2. Multi-reading characters: 说→shuo1, 着→zhe5 (suffix), 弹→tan2 (instrument)

Correct pinyin for all erhua words and specific multi-reading words
are hardcoded based on verified HSK readings.
"""

import json
import glob

# ── Erhua words verified correct readings ──
ERHUA_FIXES = {
    '不一会儿': 'bu4 yi1 hui4 r5',
    '那会儿': 'na4 hui4 r5',
    '笑话儿': 'xiao4 hua4 r5',
    '有空儿': 'you3 kong1 r5',
    '纽扣儿': 'niu3 kou4 r5',
    '没法儿': 'mei2 fa3 r5',
    '名牌儿': 'ming2 pai2 r5',
    '有劲儿': 'you3 jin4 r5',
    '胡同儿': 'hu2 tong4 r5',
    '小偷儿': 'xiao3 tou1 r5',
}

# ── Multi-reading character fixes ──
# These are words where CC-CEDICT's first-entry char fallback gave wrong reading
MULTI_READING_FIXES = {
    '比如说': 'bi3 ru2 shuo1',      # 说=shuo1 (speak), not shui4 (persuade)
    '背着': 'bei1 zhe5',            # 着=zhe5 (ongoing action suffix), not zhao1 (touch)
    '弹钢琴': 'tan2 gang1 qin2',    # 弹=tan2 (play instrument), not dan4 (bullet)
}


def fix_pinyin():
    """Fix pinyin for erhua and multi-reading entries in HSK files."""
    hsk_files = sorted(glob.glob('characters_hsk*.json') + glob.glob('characters_hsk20_*.json'))

    total_fixed = 0
    erhua_fixed = 0
    multi_fixed = 0

    for fname in hsk_files:
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)

        course = data['course']
        modified = False

        for w in data['words']:
            ch = w['ch']
            old_py = w.get('py', '')

            if not old_py:
                continue

            new_py = None

            # Check erhua fixes
            if ch in ERHUA_FIXES:
                # Only fix if the current py matches the CC-CEDICT fallback pattern (has ren2/er2)
                parts = old_py.split()
                last = parts[-1] if parts else ''
                if last in ('ren2', 'ren5', 'er2', 'er5'):
                    new_py = ERHUA_FIXES[ch]

            # Check multi-reading fixes
            if ch in MULTI_READING_FIXES:
                expected_parts = MULTI_READING_FIXES[ch].split()
                old_parts = old_py.split()
                # Only fix if it's wrong (different last syllable for last character)
                if len(old_parts) >= len(expected_parts):
                    new_py = MULTI_READING_FIXES[ch]

            # Also fix erhua suffix more generally - any word ending in 儿
            # where the last syllable is ren2/er2
            if ch.endswith('儿') and ch not in ERHUA_FIXES:
                parts = old_py.split()
                if len(parts) >= 2 and parts[-1] in ('ren2', 'er2'):
                    # Generic fix: replace last syllable with r5
                    new_py = ' '.join(parts[:-1] + ['r5'])

            if new_py and new_py != old_py:
                w['py'] = new_py
                total_fixed += 1
                if ch in ERHUA_FIXES:
                    erhua_fixed += 1
                else:
                    multi_fixed += 1
                modified = True
                print(f"  [{course}] {ch}: '{old_py}' → '{new_py}'")

        if modified:
            with open(fname, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*50}")
    print(f"SUMMARY")
    print(f"{'='*50}")
    print(f"  Erhua entries fixed: {erhua_fixed}")
    print(f"  Multi-reading fixed: {multi_fixed}")
    print(f"  Total pinyin fixes: {total_fixed}")
    print(f"{'='*50}")


if __name__ == '__main__':
    fix_pinyin()
