#!/usr/bin/env python3
"""
Generate concise en field for all words in HSK JSON files.

Logic:
1. Save the current full `en` into a new `en_full` field
2. Generate a concise version and put it into `en`
3. If `en_short` already exists from a previous run, use that as the concise version

Shortening rules:
1. Strip everything from ", CL:" or " ,CL:" onwards (classifier info)
2. Keep at most 4 comma-separated items (3 if any item is very long)
3. Strip very long parentheticals (30+ chars)
4. Clean up trailing punctuation/spaces
"""
import json, glob, re

def shorten_en(en):
    if not en:
        return en
    
    # Step 1: Strip CL: info (case-insensitive)
    en = re.split(r',\s*[Cc][Ll]:', en)[0]
    
    # Step 2: Split by comma, trim each item
    parts = [p.strip() for p in en.split(',')]
    parts = [p for p in parts if p]  # remove empty
    
    # Step 3: Skip classifier leftovers
    cleaned = []
    for p in parts:
        if re.match(r'^[Cc][Ll][\.:]', p):
            continue
        cleaned.append(p)
    parts = cleaned
    
    # Step 4: Keep at most 4 items, or 3 if any item is very long
    max_items = 4
    if any(len(p) > 30 for p in parts[:4]):
        max_items = 3
    parts = parts[:max_items]
    
    # Step 5: Strip very long parentheticals (supplementary noise)
    clean_parts = []
    for p in parts:
        p = re.sub(r'\s*\([^)]{30,}\)', '', p)
        p = p.strip()
        if p:
            clean_parts.append(p)
    parts = clean_parts
    
    # Step 6: Rejoin and clean up
    result = ', '.join(parts)
    result = result.rstrip(', ')
    
    if not result and en:
        result = en[:60].rstrip(', ')
    
    return result


def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    words = data.get('words', [])
    changed = 0
    skipped = 0
    
    for w in words:
        en = w.get('en', '')
        
        # If en_short already exists (from previous run), use it as new en
        if 'en_short' in w:
            # Save full meaning to en_full
            w['en_full'] = en
            # Swap short version into en
            w['en'] = w.pop('en_short')
            changed += 1
        else:
            # First time: generate short version
            short = shorten_en(en)
            if short:
                w['en_full'] = en
                w['en'] = short
                changed += 1
            else:
                skipped += 1
    
    if changed > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    return changed, skipped, len(words)


def main():
    files = glob.glob('characters_hsk*.json')
    files.sort()
    
    total_changed = 0
    total_words = 0
    
    for fname in files:
        changed, skipped, count = process_file(fname)
        total_changed += changed
        total_words += count
        course = fname.replace('.json', '')
        status = '✓' if changed > 0 else '—'
        print(f"  {course:>28} {status}: {changed:>4} updated, {count:>5} total")
    
    print(f"\n{'Total':>28}: {total_changed:>4} updated, {total_words:>5} total")


if __name__ == '__main__':
    main()
