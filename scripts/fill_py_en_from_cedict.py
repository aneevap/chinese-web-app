#!/usr/bin/env python3
"""
Fill missing py (pinyin) and en (English) fields in HSK course files
using the CC-CEDICT dictionary from chinese-lexicon-master.

Strategy:
1. First tries exact word lookup (full multi-character word in CEDICT)
2. Falls back to individual character lookup and combines results
   - pinyin: combine each character's pinyin with spaces
   - en: combine each character's primary definition

CC-CEDICT format: Trad Simplified [py1 py2] /def1/def2/.../
"""

import json
import glob
import re

CEDICT_PATH = '/Users/gu2026/Downloads/chinese-lexicon-master/dictionary/cedict.js'


def load_cedict():
    """Load CC-CEDICT and return (word_dict, char_dict)."""
    with open(CEDICT_PATH, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Skip first line (export default `...) and last line (...`;)
    data_lines = lines[1:-1]

    word_dict = {}  # full word (simplified) → {pinyin, english}
    char_dict = {}   # single char → {pinyin, english}  (first entry only)
    skipped = 0

    # Regex for CC-CEDICT line format
    pattern = re.compile(r'^(\S+) (\S+) \[(.+?)\] /(.+)/$')

    for line in data_lines:
        line = line.rstrip('\n')
        if not line or line.startswith('#'):
            continue

        m = pattern.match(line)
        if m:
            simplified = m.group(2)
            pinyin = m.group(3)
            definitions = m.group(4)
            english = definitions.replace('/', ', ')

            # Store full-word entry (keep first occurrence)
            if simplified not in word_dict:
                word_dict[simplified] = {'pinyin': pinyin, 'english': english}

            # Store single-char entry (pinyin only)
            if len(simplified) == 1 and simplified not in char_dict:
                char_dict[simplified] = pinyin
        else:
            skipped += 1

    print(f"Loaded {len(word_dict)} word entries, {len(char_dict)} single-char entries ({skipped} lines skipped)")
    return word_dict, char_dict


def get_pinyin_from_chars(word, char_dict):
    """Get pinyin for a multi-char word by looking up each character."""
    parts = []
    for ch in word:
        if ch in char_dict:
            parts.append(char_dict[ch])
        else:
            parts.append('?')
    return ' '.join(parts)


def fill_hsk_files(word_dict, char_dict):
    """Fill missing py and en in HSK files."""
    hsk_files = sorted(glob.glob('characters_hsk*.json') + glob.glob('characters_hsk20_*.json'))

    total_filled_py = 0
    total_filled_en = 0
    total_char_fallback_py = 0
    total_char_fallback_en = 0
    still_missing = []

    for fname in hsk_files:
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)

        course_filled_py = 0
        course_filled_en = 0
        course_fallback_py = 0
        course_fallback_en = 0

        for w in data['words']:
            ch = w['ch']

            # ── Fill py if missing ──
            if not w.get('py'):
                if ch in word_dict:
                    w['py'] = word_dict[ch]['pinyin']
                    course_filled_py += 1
                else:
                    # Fallback: look up individual characters
                    py = get_pinyin_from_chars(ch, char_dict)
                    if '?' not in py:
                        w['py'] = py
                        course_filled_py += 1
                        course_fallback_py += 1

            # ── Fill en if missing (only from exact word matches) ──
            if not w.get('en'):
                if ch in word_dict:
                    w['en'] = word_dict[ch]['english']
                    course_filled_en += 1
                # Note: no character fallback for en — individual char definitions
                # don't give the word's meaning. Leave empty rather than misleading.

            # Track still missing
            if not w.get('py') or not w.get('en'):
                still_missing.append((fname.split('/')[-1], ch))

        # Save if modified
        if course_filled_py > 0 or course_filled_en > 0:
            with open(fname, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  {data['course']}: +{course_filled_py} py (+{course_fallback_py} char-fallback), +{course_filled_en} en (+{course_fallback_en} char-fallback)")

        total_filled_py += course_filled_py
        total_filled_en += course_filled_en
        total_char_fallback_py += course_fallback_py
        total_char_fallback_en += course_fallback_en

    print(f"\n{'='*50}")
    print(f"SUMMARY")
    print(f"{'='*50}")
    print(f"  Filled py: {total_filled_py} ({total_char_fallback_py} from char fallback)")
    print(f"  Filled en: {total_filled_en} ({total_char_fallback_en} from char fallback)")
    print(f"  Still missing: {len(still_missing)}")
    if still_missing:
        print(f"\n  Still missing entries:")
        for fname, ch in still_missing:
            print(f"    {fname}: {ch}")
    print(f"{'='*50}")


if __name__ == '__main__':
    word_dict, char_dict = load_cedict()
    fill_hsk_files(word_dict, char_dict)
