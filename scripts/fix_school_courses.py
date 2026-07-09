#!/usr/bin/env python3
"""
Fix all 'char not in zh' issues in school course files (characters_1A through 6B).
For each entry where the target character is missing from its own zh sentence,
regenerate zh + sent_en using the template engine.
"""

import json
import glob
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_sentences import CUSTOM_SENTENCES, generate_sentence, detect_word_type

# ──────────────────────────────────────────────
#  Find all school course files
# ──────────────────────────────────────────────

files = sorted(glob.glob('characters_[0-9]*.json'))
print(f"Found {len(files)} school course files to process\n")

# ──────────────────────────────────────────────
#  Process each file
# ──────────────────────────────────────────────

total_fixed = 0
total_skipped_no_en = 0
total_already_good = 0
type_counter = {}
modified_files = set()

for fname in files:
    with open(fname, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    course = data['course']
    words = data['words']
    
    course_fixed = 0
    course_skipped = 0
    course_good = 0
    
    for w in words:
        ch = w['ch']
        zh = w.get('zh', '')
        sent_en = w.get('sent_en', '')
        en = w.get('en', '')
        en_full = w.get('en_full', en)
        
        # Determine if this entry has the bug: zh exists but char not in it
        needs_fix = False
        reason = ""
        
        if not zh and not sent_en:
            # Both empty - needs generation
            if en:
                needs_fix = True
                reason = "empty zh and sent_en"
            else:
                course_skipped += 1
                total_skipped_no_en += 1
                continue
        elif zh and ch in zh and sent_en:
            # Already good
            course_good += 1
            total_already_good += 1
            continue
        elif zh and ch not in zh:
            # zh exists but char not in it - synonym bug
            needs_fix = True
            reason = f"synonym bug: zh='{zh[:50]}' doesn't contain '{ch}'"
        elif zh and ch in zh and not sent_en:
            # zh has the char but sent_en is missing
            needs_fix = True
            reason = "missing sent_en"
        elif not zh and sent_en:
            # zh missing but sent_en exists
            needs_fix = True
            reason = "missing zh"
        
        # Also check for Thai/garbage in zh
        if zh and any(ord(c) > 0x0E00 and ord(c) < 0x0E7F for c in zh):
            needs_fix = True
            reason = "Thai text in zh"
        
        if not needs_fix:
            continue
        
        if not en:
            course_skipped += 1
            total_skipped_no_en += 1
            continue
        
        # Remove broken curated entry if it exists
        if ch in CUSTOM_SENTENCES:
            del CUSTOM_SENTENCES[ch]
        
        # Detect word type and generate
        detected_type = detect_word_type(ch, en, en_full)
        type_counter[detected_type] = type_counter.get(detected_type, 0) + 1
        template_idx = type_counter[detected_type] - 1
        
        try:
            new_zh, new_sent_en = generate_sentence(ch, en, en_full, detected_type, template_idx)
        except Exception as e:
            print(f"  ERROR: {course}/{ch} - {e}")
            course_skipped += 1
            continue
        
        old_zh = w.get('zh', '')
        old_en = w.get('sent_en', '')
        
        w['zh'] = new_zh
        w['sent_en'] = new_sent_en
        
        if course_fixed < 3:
            print(f"  [{course}] {ch} ({detected_type})")
            print(f"    Old: zh='{old_zh[:50]}' en='{old_en[:50]}'")
            print(f"    New: zh='{new_zh[:50]}' en='{new_sent_en[:50]}'")
            print(f"    Reason: {reason}")
        
        course_fixed += 1
        total_fixed += 1
        modified_files.add(fname)
    
    # Save immediately after processing this file
    with open(fname, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"{course}: {course_fixed} fixed, {course_skipped} skipped, {course_good} already good (out of {len(words)} total)")

# ──────────────────────────────────────────────
#  Update custom_sentences.json with fixed entries
# ──────────────────────────────────────────────

# Save the updated curated dictionary (broken entries removed)
with open('scripts/custom_sentences.json', 'w', encoding='utf-8') as f:
    json.dump(CUSTOM_SENTENCES, f, ensure_ascii=False, indent=2)

print(f"\n{'='*50}")
print(f"SUMMARY")
print(f"{'='*50}")
print(f"  Fixed: {total_fixed}")
print(f"  Skipped (no en field): {total_skipped_no_en}")
print(f"  Already correct: {total_already_good}")
print(f"{'='*50}")
