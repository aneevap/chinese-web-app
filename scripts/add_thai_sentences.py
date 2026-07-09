#!/usr/bin/env python3
"""
Generate Thai translations (sent_th) for HSK sentences that are missing them.
Uses a large curated Thai sentence database extracted from all courses,
plus Thai templates paralleling the Chinese/English templates.
"""

import json
import glob
import sys
import os

# ──────────────────────────────────────────────
#  LOAD SOURCES
# ──────────────────────────────────────────────

# Load the existing Thai curated dictionary (char → thai sentence)
THAI_CURATED = {}
try:
    with open('scripts/thai_curated.json', 'r', encoding='utf-8') as f:
        THAI_CURATED = json.load(f)
    print(f"Loaded {len(THAI_CURATED)} curated Thai entries")
except FileNotFoundError:
    print("Warning: thai_curated.json not found")

# Build a richer zh→thai mapping from all existing course data
ZH_TO_THAI = {}
for fname in sorted(glob.glob('characters_*.json')):
    with open(fname, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for w in data['words']:
        zh = w.get('zh', '')
        sent_th = w.get('sent_th', '')
        if zh and sent_th and zh not in ZH_TO_THAI:
            ZH_TO_THAI[zh] = sent_th

print(f"Loaded {len(ZH_TO_THAI)} zh→thai sentence mappings from all courses")

# ──────────────────────────────────────────────
#  THAI TEMPLATES (parallel Chinese/English templates)
#  {w} is replaced with the target word in Chinese
#  These match the templates in generate_sentences.py
# ──────────────────────────────────────────────

THAI_TEMPLATES = {
    'verb': [
        "ฉันชอบ{w}",              # 我喜欢{w}
        "ฉันกำลัง{w}",            # 我在{w}
        "เขากำลัง{w}อยู่ตอนนี้",  # 他正在{w}
        "มา{w}กันเถอะ",           # 我们{w}吧
        "ฉันอยาก{w}อันนี้",       # 我想{w}这个
        "เรา{w}ด้วยกัน",          # 我们一起{w}
        "เขาสามารถ{w}ได้",        # 他会{w}
    ],
    'noun': [
        "{w}นี้ดีมาก",              # 这个{w}很好
        "ฉันชอบ{w}นี้",             # 我喜欢这个{w}
        "ฉันมี{w}หนึ่งอัน",        # 我有一个{w}
        "{w}นี้สวยมาก",            # 这个{w}很漂亮
        "เขาซื้อ{w}มา",            # 他买了一个{w}
        "เราต้องการ{w}หนึ่งอัน",  # 我们需要一个{w}
        "{w}นี้อยู่ที่ไหน",        # 这个{w}在哪里
        "ทุกคนกำลังใช้{w}นี้",      # 大家都在用这个{w}
    ],
    'adj': [
        "อันนี้{w}มาก",            # 这个很{w}
        "เขารู้สึก{w}มาก",         # 他觉得很{w}
        "วันนี้{w}มาก",            # 今天很{w}
        "เธอดู{w}มาก",             # 她看起来很{w}
        "อันนี้{w}ไหม",            # 这个{w}吗
        "อากาศ{w}มาก",             # 天气很{w}
        "ที่นี่{w}มาก",            # 这里很{w}
        "คุณคิดว่ามัน{w}ไหม",      # 你觉得{w}吗
    ],
    'place': [
        "ฉันอยู่ที่{w}",           # 我在{w}
        "ไป{w}กันเถอะ",           # 我们去{w}吧
        "เขาทำงานที่{w}",          # 他在{w}工作
        "จาก{w}ไปโรงเรียน",       # 从{w}到学校
        "เขาอยู่ที่{w}",           # 他住在{w}
    ],
    'adv': [
        "เขามา{w}",               # 他{w}来了
        "กรุณาทำ{w}",             # 请{w}做
        "เขาพูด{w}",              # 他{w}说
        "เขาเดิน{w}",             # 他走得{w}
        "สิ่งต่างๆพัฒนา{w}",      # 事情{w}发展
    ],
    'function_word': [
        "{w}เขามา",               # {w}他来了
        "{w}ฉันไม่ไป",            # {w}我不去
        "{w}ทุกคนเห็นด้วย",       # {w}大家都同意
        "เขาไม่มา{w}",            # 他{w}没来
        "{w}แบบนี้ถูกต้อง",        # {w}这样是对的
    ],
    'other': [
        "{w}นี้ดีมาก",            # 这个{w}很好
        "ฉันชอบ{w}",              # 我喜欢{w}
        "{w}นี้คืออะไร",          # 这个{w}是什么
        "ดู{w}นี้สิ",             # 看看这个{w}
        "เขาพูดถึง{w}",           # 他提到了{w}
    ],
}

# ──────────────────────────────────────────────
#  MATCHING FUNCTIONS
# ──────────────────────────────────────────────

def find_matching_template(zh, ch):
    """Find which template pattern a Chinese sentence matches, return the type and index."""
    from generate_sentences import VERB_TEMPLATES, NOUN_TEMPLATES, ADJ_TEMPLATES, \
        PLACE_TEMPLATES, ADV_TEMPLATES, FUNCTION_WORD_TEMPLATES, OTHER_TEMPLATES
    
    all_templates = [
        ('verb', VERB_TEMPLATES),
        ('noun', NOUN_TEMPLATES),
        ('adj', ADJ_TEMPLATES),
        ('place', PLACE_TEMPLATES),
        ('adv', ADV_TEMPLATES),
        ('function_word', FUNCTION_WORD_TEMPLATES),
        ('other', OTHER_TEMPLATES),
    ]
    
    for type_name, templates in all_templates:
        for idx, (zh_tmpl, en_tmpl) in enumerate(templates):
            pattern = zh_tmpl.replace('{w}', ch)
            if zh == pattern:
                return type_name, idx
    
    return None, None


def generate_thai(ch, zh, en, th_word):
    """Generate Thai translation for a Chinese sentence.
    th_word is the Thai word translation (from 'th' field), or the Chinese char as fallback.
    """
    # 1. Check if the exact Chinese sentence has a Thai translation in our database
    if zh in ZH_TO_THAI:
        return ZH_TO_THAI[zh]
    
    # 2. Check if the character has a curated Thai translation
    if ch in THAI_CURATED:
        return THAI_CURATED[ch]
    
    # 3. Try to find which template generated this sentence
    type_name, template_idx = find_matching_template(zh, ch)
    
    if type_name and template_idx is not None:
        thai_templates = THAI_TEMPLATES.get(type_name, [])
        if template_idx < len(thai_templates):
            thai_template = thai_templates[template_idx]
            return thai_template.replace('{w}', th_word)
    
    # 4. Fallback: if we have a real Thai word, use it; otherwise skip
    # (If th_word == ch, no Thai translation exists - skip to avoid mixed language)
    if th_word != ch:
        return f"นี่คือ{th_word}"  # "This is {word}"
    return ''  # Skip - no Thai translation available


# ──────────────────────────────────────────────
#  MAIN PROCESSOR
# ──────────────────────────────────────────────

def process_all():
    """Process all HSK files and add sent_th where missing."""
    files = sorted(glob.glob('characters_hsk*.json') + glob.glob('characters_hsk20_*.json'))
    
    total_filled = 0
    total_curated = 0
    total_templated = 0
    total_fallback = 0
    total_skipped = 0
    
    for fname in files:
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        course = data['course']
        course_filled = 0
        
        for w in data['words']:
            # Skip if already has sent_th
            if w.get('sent_th'):
                continue
            
            ch = w['ch']
            zh = w.get('zh', '')
            sent_en = w.get('sent_en', '')
            en = w.get('en', '')
            
            # Skip if no zh or sent_en to translate from
            if not zh or not sent_en:
                # Minimal fallback: use a teaching frame with the Chinese character
                # This is acceptable because the character is explicitly marked as
                # the word being taught in a language-learning context
                th_word = w.get('th', '')
                if th_word:
                    w['sent_th'] = f"คำว่า {th_word}"  # "The word {th_word}"
                else:
                    w['sent_th'] = f"คำว่า '{ch}'"  # "The word '{ch}'"
                total_fallback += 1
                total_filled += 1
                course_filled += 1
                continue
            
            # Generate Thai
            th_word = w.get('th', ch)  # Thai word if available, else Chinese char
            sent_th = generate_thai(ch, zh, en, th_word)
            
            # Track source
            if zh in ZH_TO_THAI:
                total_curated += 1
            elif ch in THAI_CURATED:
                total_curated += 1
            elif find_matching_template(zh, ch)[0]:
                total_templated += 1
            else:
                total_fallback += 1
            
            w['sent_th'] = sent_th
            course_filled += 1
            total_filled += 1
        
        # Save file if modified
        if course_filled > 0:
            with open(fname, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  {course}: +{course_filled} sent_th added")
    
    print(f"\n{'='*50}")
    print(f"SUMMARY")
    print(f"{'='*50}")
    print(f"  Total sent_th filled: {total_filled}")
    print(f"  From zh→thai mapping: {total_curated}")
    print(f"  From Thai templates:  {total_templated}")
    print(f"  From fallback:        {total_fallback}")
    print(f"  Skipped (no zh/en):   {total_skipped}")
    print(f"{'='*50}")


if __name__ == '__main__':
    process_all()
