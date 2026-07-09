#!/usr/bin/env python3
"""
Fix all 54 critical data issues found by the validator.
For each entry where the target character is missing from its own zh sentence,
regenerate zh + sent_en using the template engine from generate_sentences.py.
"""

import json
import glob
import sys
import os

# Import the generation logic
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate_sentences import CUSTOM_SENTENCES, generate_sentence, detect_word_type

# ──────────────────────────────────────────────
#  Load the critical issues
# ──────────────────────────────────────────────

with open('scripts/validation_results.json', 'r', encoding='utf-8') as f:
    val_data = json.load(f)

critical = [i for i in val_data['issues'] if i['severity'] == 'critical']
print(f"Loaded {len(critical)} critical issues to fix")

# ──────────────────────────────────────────────
#  Load all course files
# ──────────────────────────────────────────────

courses = {}
for fname in glob.glob('characters_*.json') + glob.glob('characters_hsk20_*.json'):
    with open(fname, 'r', encoding='utf-8') as f:
        cd = json.load(f)
    courses[cd['course']] = (fname, cd)

# ──────────────────────────────────────────────
#  Fix each issue
# ──────────────────────────────────────────────

fixed_count = 0
error_count = 0
type_counter = {}

for iss in critical:
    course = iss['course']
    ch = iss['ch']
    
    if course not in courses:
        print(f"  SKIP: {course}/{ch} - course not found")
        continue
    
    fname, data = courses[course]
    
    # Find the word entry
    word = None
    for w in data['words']:
        if w['ch'] == ch:
            word = w
            break
    
    if not word:
        print(f"  SKIP: {course}/{ch} - word not found in file")
        continue
    
    # Check if the issue is real (char not in zh)
    zh = word.get('zh', '')
    sent_en = word.get('sent_en', '')
    
    # Detect the issue type
    needs_fix = False
    reason = ""
    
    if ch not in zh:
        needs_fix = True
        reason = f"char '{ch}' not in zh"
    
    if not zh or not sent_en:
        needs_fix = True
        reason = "empty zh or sent_en"
    
    # Check for Thai/garbage in zh
    if zh and any(ord(c) > 0x0E00 and ord(c) < 0x0E7F for c in zh):  # Thai Unicode range
        needs_fix = True
        reason = "Thai text in zh"
    
    if zh and zh.strip() in [', etc.)', ', etc.', 'etc.)']:
        needs_fix = True
        reason = "garbage data in zh"
    
    if not needs_fix:
        print(f"  SKIP: {course}/{ch} - no issue detected (might be a false positive)")
        continue
    
    # Generate a new sentence
    en = word.get('en', '')
    en_full = word.get('en_full', en)
    
    if not en:
        print(f"  SKIP: {course}/{ch} - no en field available")
        error_count += 1
        continue
    
    detected_type = detect_word_type(ch, en, en_full)
    type_counter[detected_type] = type_counter.get(detected_type, 0) + 1
    template_idx = type_counter[detected_type] - 1
    
    try:
        # Remove broken curated entry so template generation is used
        if ch in CUSTOM_SENTENCES:
            del CUSTOM_SENTENCES[ch]
        new_zh, new_sent_en = generate_sentence(ch, en, en_full, detected_type, template_idx)
    except Exception as e:
        print(f"  ERROR: {course}/{ch} - generate_sentence failed: {e}")
        error_count += 1
        continue
    
    # Save the old values for logging
    old_zh = word.get('zh', '')
    old_en = word.get('sent_en', '')
    
    # Update the word
    word['zh'] = new_zh
    word['sent_en'] = new_sent_en
    
    # Also fix sent_th if it was corrupted
    if 'sent_th' in word and (not word['sent_th'] or any(ord(c) > 0x0E00 and ord(c) < 0x0E7F for c in word.get('sent_th', ''))):
        word['sent_th'] = ''
    
    print(f"  FIXED: {course}/{ch} ({detected_type})")
    print(f"    Old zh: {old_zh[:60]}")
    print(f"    New zh: {new_zh[:60]}")
    print(f"    Old en: {old_en[:60]}")
    print(f"    New en: {new_sent_en[:60]}")
    print(f"    Reason: {reason}")
    
    fixed_count += 1

# ──────────────────────────────────────────────
#  Save all modified files
# ──────────────────────────────────────────────

# Track which files were modified
modified_files = set()
for iss in critical:
    course = iss['course']
    if course in courses:
        fname, data = courses[course]
        modified_files.add(fname)

for fname in sorted(modified_files):
    # Find the course data
    for course_name, (cfname, cdata) in courses.items():
        if cfname == fname:
            with open(fname, 'w', encoding='utf-8') as f:
                json.dump(cdata, f, ensure_ascii=False, indent=2)
            print(f"\n  Saved: {fname} ({course_name})")
            break

print(f"\n{'='*50}")
print(f"FIX SUMMARY")
print(f"{'='*50}")
print(f"  Fixed: {fixed_count}")
print(f"  Errors: {error_count}")
print(f"  Courses modified: {len(modified_files)}")
print(f"{'='*50}")
