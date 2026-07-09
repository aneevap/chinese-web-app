#!/usr/bin/env python3
"""
Fix remaining pinyin issues from CC-CEDICT char lookup:
1. Lowercase all pinyin (CC-CEDICT uses title case: Bái → bái)
2. Fix erhua: 'rén' suffix → 'r' for words ending in 儿
3. Fix 女: 'nǔ:' → 'nǚ' (wrong CC-CEDICT entry)
"""

import json
import glob

all_files = sorted(
    glob.glob('characters_hsk*.json') +
    glob.glob('characters_hsk20_*.json') +
    glob.glob('characters_[0-9]*.json')
)

total_lowered = 0
total_erhua = 0
total_nu = 0

for fname in all_files:
    with open(fname, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    course_fixed = 0
    
    for w in data['words']:
        ch = w['ch']
        old_py = w.get('py', '')
        if not old_py:
            continue
        
        new_py = old_py
        
        # Fix 1: Lowercase
        lowered = new_py.lower()
        if lowered != new_py:
            new_py = lowered
        
        # Fix 2: Fix nǔ: → nǚ (wrong CC-CEDICT encoding for 女)
        new_py = new_py.replace('nǔ:', 'nǚ').replace('nu:', 'nǚ')
        
        # Fix 3: Fix erhua - 儿 should be 'r' not 'rén' in pinyin
        if ch.endswith('儿'):
            parts = new_py.split()
            if parts and parts[-1] == 'rén':
                parts[-1] = 'r'
                new_py = ' '.join(parts)
            # Also fix standalone word 儿
            if ch == '儿' and new_py == 'rén':
                new_py = 'ér'  # standalone 儿 is 'ér' not 'r'
        
        if new_py != old_py:
            w['py'] = new_py
            course_fixed += 1
            modified = True
            
            # Count by type
            if any(c.isupper() for c in old_py):
                total_lowered += 1
            if 'nǔ:' in old_py or 'nu:' in old_py:
                total_nu += 1
            if ch.endswith('儿') and 'rén' in old_py:
                total_erhua += 1
    
    if modified:
        with open(fname, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  {data['course']:15s}: +{course_fixed} fixed")

print(f"\n{'='*50}")
print(f"SUMMARY")
print(f"{'='*50}")
print(f"  Lowercased: {total_lowered}")
print(f"  Erhua fixed: {total_erhua}")
print(f"  女(nǔ:) fixed: {total_nu}")
print(f"{'='*50}")
