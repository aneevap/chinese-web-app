#!/usr/bin/env python3
"""
Fix pinyin spacing: split run-together pinyin (e.g., 'àihào') into 
separate syllables ('ài hào') using CC-CEDICT's syllable dictionary.

The normalization script previously removed zero-width spaces but didn't
add regular spaces, causing multi-character words to have run-together pinyin.
"""

import json
import glob
import re

ZWSP = '\u200b'
CEDICT_PATH = '/Users/gu2026/Downloads/chinese-lexicon-master/dictionary/cedict.js'


def load_pinyin_syllables():
    """Build a comprehensive set of valid pinyin syllables from CC-CEDICT."""
    with open(CEDICT_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract all pinyin from the template literal
    # Pattern: [pinyin]
    pinyins = set(re.findall(r'\[([a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ0-9\s]+)\]', content.lower()))
    
    syllables = set()
    tone_marks = {'ā', 'á', 'ǎ', 'à', 'ē', 'é', 'ě', 'è', 'ī', 'í', 'ǐ', 'ì', 
                  'ō', 'ó', 'ǒ', 'ò', 'ū', 'ú', 'ǔ', 'ù', 'ǖ', 'ǘ', 'ǚ', 'ǜ'}
    
    for p in pinyins:
        # Split multi-syllable pinyin
        parts = p.split()
        for part in parts:
            # Remove tone numbers to get the base syllable
            clean = re.sub(r'[0-9]', '', part)
            if clean:
                syllables.add(clean)
                # Also add uppercase variant
                syllables.add(clean.title())
    
    return syllables


def build_char_to_pinyin():
    """Build a dict mapping each character to its pinyin in tone-mark format."""
    import json as _json
    # Use the existing CC-CEDICT parser logic
    with open(CEDICT_PATH, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    data_lines = lines[1:-1]
    result = {}  # char -> [(pinyin_tone_number, pinyin_tone_mark)]
    
    import re as _re
    pattern = _re.compile(r'^(\S+) (\S+) \[(.+?)\] /(.+)/$')
    
    for line in data_lines:
        line = line.rstrip('\n')
        if not line or line.startswith('#'):
            continue
        
        m = pattern.match(line)
        if m:
            simplified = m.group(2)
            pinyin = m.group(3)
            if len(simplified) == 1 and simplified not in result:
                # Store first occurrence
                result[simplified] = pinyin
    
    return result


def tone_number_to_mark(syllable):
    """Convert a single pinyin syllable from tone-number to tone-mark format."""
    if not syllable:
        return syllable
    
    # Handle erhua suffix
    if syllable.lower() == 'r' or syllable.lower() == 'r5':
        return 'r'
    
    # Extract tone number
    tone = 0
    if syllable[-1].isdigit():
        tone = int(syllable[-1])
        base = syllable[:-1]
    else:
        base = syllable
    
    if tone == 0 or tone >= 5:
        return base
    
    # Handle 'v' as 'ü'
    base = base.replace('v', 'ü').replace('V', 'ü')
    
    # Tone mark vowels
    tone_map = {
        'a': ['a', 'ā', 'á', 'ǎ', 'à'],
        'e': ['e', 'ē', 'é', 'ě', 'è'],
        'i': ['i', 'ī', 'í', 'ǐ', 'ì'],
        'o': ['o', 'ō', 'ó', 'ǒ', 'ò'],
        'u': ['u', 'ū', 'ú', 'ǔ', 'ù'],
        'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
    }
    
    lower = base.lower()
    
    # Rule: a/e gets the mark
    for vowel in ['a', 'e']:
        if vowel in lower:
            idx = lower.index(vowel)
            for v_map, marks in tone_map.items():
                if v_map == vowel:
                    return base[:idx] + marks[tone] + base[idx+1:]
    
    # Rule: 'ou' - mark on 'o'
    if 'ou' in lower:
        idx = lower.index('o')
        return base[:idx] + tone_map['o'][tone] + base[idx+1:]
    
    # Rule: mark on the last vowel (handles 'iu' and 'ui')
    vowels = 'aeioüu'
    vowel_positions = [(i, c) for i, c in enumerate(lower) if c in vowels]
    if vowel_positions:
        # Put mark on the second vowel if there are multiple (for iu, ui)
        if len(vowel_positions) >= 2:
            idx, vowel_char = vowel_positions[1]
        else:
            idx, vowel_char = vowel_positions[0]
        
        for v_map, marks in tone_map.items():
            if v_map == vowel_char:
                return base[:idx] + marks[tone] + base[idx+1:]
    
    return base


def split_pinyin(py, char_count):
    """Try to split run-together pinyin into char_count syllables.
    Uses the known number of characters as a constraint."""
    if not py or char_count <= 1:
        return py
    
    # First check: does py already have spaces?
    if ' ' in py:
        return py
    
    # Remove any remaining invisible characters
    py = py.replace(ZWSP, '').replace('\u200c', '').replace('\u200d', '')
    
    # Try to find valid syllable boundaries
    # Use the CC-CEDICT char lookup: for each character, we know its pinyin
    # But we don't have the character here, only the pinyin string
    # So we need to detect syllable boundaries in the pinyin
    
    # Heuristic: pinyin syllables end in a vowel or 'n', 'g', 'r'
    # and start with a consonant
    # Try to find boundaries by scanning for patterns
    
    # Simple approach: split by detecting transitions
    # Vowels set
    vowels = set('aeioüuāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ')
    consonants = set("bcdfghjklmnpqrstwxyz")
    
    # Try greedy matching against known syllables
    # First, build valid syllable prefix set
    valid_syllables = load_pinyin_syllables()
    
    # For each possible split point, check if both parts are valid syllables
    # This is O(n^2) for n = len(py), but py is short (typically 5-15 chars)
    n = len(py)
    
    # Use dynamic programming to find valid splits
    # dp[i] = list of possible splits for py[:i]
    dp = {0: [[]]}  # position -> list of possible splits
    
    for i in range(1, n + 1):
        dp[i] = []
        for j in range(max(0, i - 6), i):  # max syllable length is ~6
            if j in dp and dp[j]:
                candidate = py[j:i]
                if candidate in valid_syllables or candidate.lower() in valid_syllables:
                    for split in dp[j]:
                        dp[i].append(split + [candidate])
    
    # Find the split that gives exactly char_count syllables
    if n in dp:
        for split in dp[n]:
            if len(split) == char_count:
                return ' '.join(split)
        # If no exact match, prefer the split with the right number of syllables
        # Or fall back to the most common split
        if dp[n]:
            return ' '.join(dp[n][0])
    
    return py


def fix_spacing_with_char_lookup():
    """Fix pinyin spacing using character-by-character pinyin lookup.
    This is more reliable than syllable splitting because we know the character mappings."""
    
    char_py = build_char_to_pinyin()  # char -> pinyin (tone numbers)
    
    all_files = sorted(
        glob.glob('characters_hsk*.json') +
        glob.glob('characters_hsk20_*.json')
    )
    # Don't process school course files - they already have correct format
    
    total_fixed = 0
    total_no_data = 0
    total_skipped = 0
    already_good = 0
    
    for fname in all_files:
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        course = data['course']
        modified = False
        course_fixed = 0
        
        for w in data['words']:
            ch = w['ch']
            py = w.get('py', '')
            
            if not py:
                continue
            
            # Skip single-character words and already-spaced pinyin
            if len(ch) == 1 or ' ' in py:
                already_good += 1
                continue
            
            # Build proper pinyin by looking up each character
            syllables = []
            has_data = True
            for c in ch:
                if c in char_py:
                    syllables.append(char_py[c])
                else:
                    has_data = False
                    break
            
            if not has_data:
                # Fall back to syllable splitting
                result = split_pinyin(py, len(ch))
                if ' ' in result:
                    w['py'] = result
                    course_fixed += 1
                    modified = True
                    total_no_data += 1
                else:
                    total_skipped += 1
                continue
            
            # Convert each syllable from tone numbers to tone marks
            mark_syllables = []
            for syl in syllables:
                mark_syllables.append(tone_number_to_mark(syl))
            new_py = ' '.join(mark_syllables)
            
            if new_py != py:
                w['py'] = new_py
                course_fixed += 1
                modified = True
        
        if modified:
            with open(fname, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  {course:15s}: +{course_fixed} entries fixed")
        
        total_fixed += course_fixed
    
    print(f"\n{'='*50}")
    print(f"SUMMARY")
    print(f"{'='*50}")
    print(f"  Total fixed via char lookup: {total_fixed - total_no_data}")
    print(f"  Total fixed via syllable split: {total_no_data}")
    print(f"  Already correct: {already_good}")
    print(f"  Skipped (could not split): {total_skipped}")
    print(f"  Total fixed: {total_fixed}")
    print(f"{'='*50}")
    
    return total_fixed


if __name__ == '__main__':
    total = fix_spacing_with_char_lookup()
    print(f"\nDone. Fixed {total} entries.")
