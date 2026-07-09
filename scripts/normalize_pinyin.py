#!/usr/bin/env python3
"""
Normalize all pinyin in course files to a single format:
- Tone marks (bù) instead of tone numbers (bu4)
- Regular spaces between syllables (yī xià) instead of zero-width spaces (yī​xià)
- 'ü' instead of 'v' (nǚ instead of nv3)
- Neutral erhua: 'r' suffix (no tone number)

Also normalizes school course files for consistency.
"""

import json
import glob
import re

ZWSP = '\u200b'

# ── Tone mark mapping ──
# Index 0=neutral, 1=first, 2=second, 3=third, 4=fourth
TONE_MAP = {
    'a': ['a', 'ā', 'á', 'ǎ', 'à'],
    'e': ['e', 'ē', 'é', 'ě', 'è'],
    'i': ['i', 'ī', 'í', 'ǐ', 'ì'],
    'o': ['o', 'ō', 'ó', 'ǒ', 'ò'],
    'u': ['u', 'ū', 'ú', 'ǔ', 'ù'],
    'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
}


def tone_num_to_mark(syllable):
    """Convert a single pinyin syllable from tone-number to tone-mark format.
    E.g., 'bu4' → 'bù', 'nv3' → 'nǚ', 'r5' → 'r', 'r' → 'r'
    """
    if not syllable:
        return syllable
    
    # Handle erhua suffix 'r5' or 'r'
    if syllable.lower() == 'r' or syllable.lower() == 'r5':
        return 'r'
    
    # Extract tone number from end
    tone = 0
    if syllable[-1].isdigit():
        tone = int(syllable[-1])
        base = syllable[:-1]
    else:
        base = syllable
    
    # Handle 'v' as 'ü'
    base = base.replace('v', 'ü').replace('V', 'ü')
    if 'ü' not in base.lower():
        base_check = base.lower()
    else:
        base_check = base.lower()
    
    if tone == 0 or tone >= 5:
        return base  # neutral tone, no mark
    
    # Find which vowel gets the tone mark
    # Rule: a/e first, then ou (mark on o), then second vowel
    lower = base.lower()
    
    # Find position of a/e (priority 1)
    for vowel in ['a', 'e']:
        if vowel in lower:
            idx = lower.index(vowel)
            vowel_char = base[idx]
            lower_char = vowel
            # Map to the correct letter (a→ā/á/ǎ/à, e→ē/é/ě/è)
            for v_map, marks in TONE_MAP.items():
                if v_map == lower_char:
                    return base[:idx] + marks[tone] + base[idx+1:]
            return base
    
    # Find 'ou' - mark on 'o'
    if 'ou' in lower:
        idx = lower.index('o')
        return base[:idx] + TONE_MAP['o'][tone] + base[idx+1:]
    
    # Otherwise, mark on the last vowel
    vowels = 'aeioüu'
    vowel_positions = [(i, c) for i, c in enumerate(lower) if c in vowels]
    if vowel_positions:
        # Mark on the second vowel if there are multiple
        if len(vowel_positions) >= 2:
            idx, vowel_char = vowel_positions[1]
        else:
            idx, vowel_char = vowel_positions[0]
        
        # Map the vowel character
        for v_map, marks in TONE_MAP.items():
            if v_map == vowel_char or (v_map == 'u' and vowel_char == 'u') or (v_map == 'ü' and vowel_char == 'ü'):
                return base[:idx] + marks[tone] + base[idx+1:]
    
    # Fallback: mark on last letter
    return base + str(tone)


def normalize_py(py):
    """Normalize a pinyin string to tone-mark format.
    Handles: tone numbers, zero-width spaces, v→ü, multiple syllables.
    """
    if not py:
        return py
    
    # Remove zero-width spaces and other invisible chars
    py = py.replace(ZWSP, '').replace('\u200c', '').replace('\u200d', '').replace('\ufeff', '')
    
    # Remove any apostrophes used as syllable separators
    py = py.replace("'", '').replace('’', '').replace('`', '')
    
    # Split into syllables (by spaces, or by detecting the pattern)
    # Handle both space-separated and run-together formats
    if ' ' in py.strip():
        syllables = py.strip().split()
    else:
        # Run-together format: split by detecting vowel→consonant boundaries
        # This is complex - for now, assume space-separated
        # If no spaces and no tone marks, try to parse as tone-number format
        syllables = [py.strip()]
    
    # Convert each syllable
    result = []
    for syl in syllables:
        syl = syl.strip()
        if not syl:
            continue
        result.append(tone_num_to_mark(syl))
    
    return ' '.join(result)


def process_file(fname):
    """Process a single course file, normalizing all pinyin."""
    with open(fname, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    fixed_py = 0
    
    for w in data['words']:
        old_py = w.get('py', '')
        if not old_py:
            continue
        
        new_py = normalize_py(old_py)
        if new_py != old_py:
            w['py'] = new_py
            fixed_py += 1
            modified = True
    
    if modified:
        with open(fname, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    return fixed_py


def main():
    # Process all course files
    all_files = sorted(
        glob.glob('characters_hsk*.json') +
        glob.glob('characters_hsk20_*.json') +
        glob.glob('characters_[0-9]*.json')
    )
    
    total_fixed = 0
    total_entries = 0
    
    for fname in all_files:
        with open(fname) as f:
            data = json.load(f)
        course = data['course']
        entry_count = len(data['words'])
        total_entries += entry_count
        
        fixed = process_file(fname)
        if fixed > 0:
            print(f"  {course:15s}: {fixed:4d}/{entry_count} entries fixed")
        
        total_fixed += fixed
    
    print(f"\n{'='*50}")
    print(f"SUMMARY")
    print(f"{'='*50}")
    print(f"  Files processed: {len(all_files)}")
    print(f"  Total entries:   {total_entries}")
    print(f"  Entries fixed:   {total_fixed}")
    print(f"{'='*50}")
    
    # Show sample conversions
    print("\nSAMPLE CONVERSIONS:")
    test_cases = [
        ('bu4 yi1 hui4 r5', 'bù yī huì r'),
        ('ni3 hao3', 'nǐ hǎo'),
        ('nv3 er2', 'nǚ ér'),
        ('yī\u200bxià', 'yī xià'),
        ('zhōng xué', 'zhōng xué'),
        ('kan1 dao4', 'kàn dào'),
    ]
    for inp, expected in test_cases:
        result = normalize_py(inp)
        status = '✓' if result == expected else '✗'
        print(f"  {status} '{inp}' → '{result}' (expected: '{expected}')")


if __name__ == '__main__':
    main()
