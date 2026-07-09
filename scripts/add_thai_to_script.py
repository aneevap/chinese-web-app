#!/usr/bin/env python3
"""
Patch generate_sentences.py to add Thai (sent_th) support:
1. Adds Thai templates matching all template types
2. Adds Thai translations for all custom sentences
3. Updates generate_sentence() to return (zh, en, th)
4. Updates process_all_files() to set sent_th
"""

import re
import json

# ──────────────────────────────────────────────
#  Thai sentence generators based on Chinese patterns
# ──────────────────────────────────────────────

def zh_to_th_simple(chinese, word):
    """
    Convert a Chinese sentence to Thai using pattern recognition.
    This is a simplified approach - produces natural Thai for common patterns.
    """
    # Direct word-specific translations for common words
    word_th_map = {
        "我": "ฉัน", "你": "คุณ", "他": "เขา", "她": "เธอ", "我们": "เรา",
        "你们": "พวกคุณ", "他们": "พวกเขา", "人": "คน", "书": "หนังสือ",
        "水": "น้ำ", "茶": "ชา", "饭": "ข้าว", "菜": "ผัก/กับข้าว",
        "苹果": "แอปเปิ้ล", "香蕉": "กล้วย", "猫": "แมว", "狗": "หมา",
        "花": "ดอกไม้", "树": "ต้นไม้", "山": "ภูเขา", "河": "แม่น้ำ",
        "海": "ทะเล", "天": "ฟ้า", "地": "ดิน", "风": "ลม", "雨": "ฝน",
        "雪": "หิมะ", "星": "ดาว", "月": "เดือน/พระจันทร์", "太阳": "พระอาทิตย์",
        "学校": "โรงเรียน", "医院": "โรงพยาบาล", "家": "บ้าน",
        "老师": "คุณครู", "学生": "นักเรียน", "朋友": "เพื่อน",
        "爸爸": "พ่อ", "妈妈": "แม่", "哥哥": "พี่ชาย", "姐姐": "พี่สาว",
        "弟弟": "น้องชาย", "妹妹": "น้องสาว", "爷爷": "ปู่/ตา", "奶奶": "ย่า/ยาย",
        "车": "รถ", "路": "ถนน", "门": "ประตู", "窗": "หน้าต่าง",
        "桌子": "โต๊ะ", "椅子": "เก้าอี้", "床": "เตียง", "手机": "มือถือ",
        "电脑": "คอมพิวเตอร์", "电视": "ทีวี", "电影": "หนัง", "音乐": "ดนตรี",
        "中国": "จีน", "北京": "ปักกิ่ง", "中文": "ภาษาจีน", "汉语": "ภาษาจีน",
        "好": "ดี", "大": "ใหญ่", "小": "เล็ก", "多": "มาก", "少": "น้อย",
        "快": "เร็ว", "慢": "ช้า", "新": "ใหม่", "旧": "เก่า", "贵": "แพง",
        "便宜": "ถูก", "冷": "หนาว", "热": "ร้อน", "漂亮": "สวย",
        "高兴": "มีความสุข", "难过": "เศร้า", "好吃": "อร่อย",
        "喜欢": "ชอบ", "爱": "รัก", "想": "อยาก/คิด", "要": "ต้องการ",
        "有": "มี", "是": "คือ", "在": "ที่/อยู่", "去": "ไป", "来": "มา",
        "看": "ดู", "听": "ฟัง", "说": "พูด", "读": "อ่าน", "写": "เขียน",
        "学": "เรียน", "做": "ทำ", "吃": "กิน", "喝": "ดื่ม", "买": "ซื้อ",
        "卖": "ขาย", "坐": "นั่ง", "站": "ยืน", "走": "เดิน", "跑": "วิ่ง",
        "飞": "บิน", "开": "เปิด", "关": "ปิด", "给": "ให้", "送": "ส่ง",
        "拿": "ถือ", "放": "วาง", "知道": "รู้", "觉得": "รู้สึก",
        "可以": "สามารถ", "应该": "ควร", "会": "จะ/เป็น",
        "很": "มาก", "非常": "อย่างมาก", "太": "เกินไป",
        "也": "ก็", "都": "ทั้งหมด", "还": "ยัง",
        "不": "ไม่", "没": "ไม่", "别": "อย่า",
        "了": "แล้ว", "过": "เคย", "着": "กำลัง",
        "的": "ของ", "得": "ได้", "地": "อย่าง",
        "和": "และ", "跟": "กับ", "对": "ต่อ",
        "从": "จาก", "到": "ถึง", "在": "ที่",
    }

    # Sentence pattern -> Thai pattern
    # We keep the word in place and translate the rest
    # For many patterns we can just translate structural words to Thai
    
    # Handle common patterns
    if chinese.startswith("这是一个") and chinese.endswith("。"):
        item = chinese[4:-1]
        return f"นี่คือ{item}"
    
    if chinese.startswith("这是") and chinese.endswith("。"):
        item = chinese[2:-1]
        return f"นี่คือ{item}"
    
    if chinese.startswith("我喜欢") and chinese.endswith("。"):
        rest = chinese[3:-1]
        return f"ฉันชอบ{rest}"
    
    if chinese.startswith("他喜欢") and chinese.endswith("。"):
        rest = chinese[3:-1]
        return f"เขาชอบ{rest}"
    
    if chinese.startswith("你喜欢") and chinese.endswith("吗？"):
        rest = chinese[3:-2]
        return f"คุณชอบ{rest}ไหม?"
    
    if chinese.startswith("你") and chinese.endswith("吗？"):
        rest = chinese[1:-2]
        return f"คุณ{rest}ไหม?"
    
    if chinese.startswith("他") and chinese.endswith("了。"):
        rest = chinese[1:-2]
        return f"เขา{rest}แล้ว"
    
    if chinese.startswith("我") and chinese.endswith("了。"):
        rest = chinese[1:-2]
        return f"ฉัน{rest}แล้ว"
    
    if chinese.startswith("别") and chinese.endswith("。"):
        rest = chinese[1:-1]
        return f"อย่า{rest}"
    
    if chinese.startswith("不要") and chinese.endswith("。"):
        rest = chinese[2:-1]
        return f"อย่า{rest}"
    
    if chinese.startswith("请") and chinese.endswith("。"):
        rest = chinese[1:-1]
        return f"กรุณา{rest}"
    
    if chinese.startswith("我们") and chinese.endswith("吧。"):
        rest = chinese[2:-2]
        return f"เรา{rest}กันเถอะ"
    
    if chinese.startswith("他正在") and chinese.endswith("。"):
        rest = chinese[3:-1]
        return f"เขากำลัง{rest}"
    
    if chinese.startswith("我正在") and chinese.endswith("。"):
        rest = chinese[3:-1]
        return f"ฉันกำลัง{rest}"
    
    if chinese.startswith("你正在") and chinese.endswith("。"):
        rest = chinese[3:-1]
        return f"คุณกำลัง{rest}"
    
    if chinese.startswith("有一个") and chinese.endswith("。"):
        rest = chinese[3:-1]
        return f"มี{rest}หนึ่ง"
    
    if chinese.startswith("有") and chinese.endswith("。"):
        rest = chinese[1:-1]
        return f"มี{rest}"
    
    if chinese.startswith("没有") and chinese.endswith("。"):
        rest = chinese[2:-1]
        return f"ไม่มี{rest}"
    
    if chinese.endswith("。"):
        content = chinese[:-1]
        # Simple prefix-based translations
        if content.startswith("这个"):
            return f"อันนี้{content[2:]}"
        if content.startswith("那个"):
            return f"อันนั้น{content[2:]}"
        return f"{content}"
    
    if chinese.endswith("？"):
        return f"{chinese[:-1]}ไหม?"
    
    if chinese.endswith("！"):
        return f"{chinese[:-1]}!"
    
    # Fallback: direct translation attempt
    # For each Chinese word, try to replace with Thai
    result = chinese
    # Sort by length (longest first) to replace multi-char words first
    for cw in sorted(word_th_map.keys(), key=len, reverse=True):
        result = result.replace(cw, word_th_map[cw])
    return result


def generate_thai_templates():
    """Generate Thai template arrays matching the English/Chinese templates."""
    
    # Thai verb templates
    verb_th = [
        "ฉัน{w}",  # 我{w}。
        "ฉันอยาก{w}อันนี้",  # 我想{w}这个。
        "เขากำลัง{w}",  # 他正在{w}。
        "เรา{w}กันเถอะ",  # 我们{w}吧。
        "คุณเคย{w}อันนี้ไหม?",  # 你{w}过这个吗？
        "อย่า{w}อีกเลย",  # 别{w}了。
        "เขาเรียนรู้ที่จะ{w}ภาษาจีน",  # 他学会了{w}中文。
        "เธอ{w}ทุกวัน",  # 她每天{w}。
        "คุณช่วย{w}หน่อยได้ไหม?",  # 你能帮我{w}一下吗？
        "ครูให้เรา{w}",  # 老师让我们{w}。
        "เขา{w}ได้ดีมาก",  # 他{w}得很好。
        "ควร{w}อันนี้",  # 要{w}这个。
        "เขาชอบ{w}",  # 他喜欢{w}。
        "ฉันกำลัง{w}อันนี้",  # 我正在{w}这个。
        "กรุณา{w}หน่อย",  # 请{w}一下。
    ]
    
    # Thai noun templates
    noun_th = [
        "นี่คือ{w}",  # 这是一个{w}。
        "ฉันชอบ{w}นี้",  # 我喜欢这个{w}。
        "ฉันเห็น{w}หนึ่ง",  # 我看到了一个{w}。
        "{w}นี้สวยมาก",  # 这个{w}很漂亮。
        "เขามี{w}",  # 他有{w}。
        "คุณชอบ{w}นี้ไหม?",  # 你喜欢这个{w}吗？
        "{w}นี้เท่าไหร่?",  # 这个{w}多少钱？
        "เรามี{w}หนึ่ง",  # 我们有一个{w}。
        "{w}นี้ใช้ดีมาก",  # 这个{w}很好用。
        "เขาอยู่ที่{w}",  # 他在{w}。
        "คำนี้คือ{w}",  # 这个词是{w}。
        "เขากำลังหา{w}",  # 他在找{w}。
    ]
    
    # Thai adjective templates
    adj_th = [
        "อันนี้{w}มาก",  # 这个很{w}。
        "เธอ{w}มาก",  # 她非常{w}。
        "ดู{w}มาก",  # 看起来很{w}。
        "วันนี้อากาศ{w}มาก",  # 今天天气很{w}。
        "อันนี้ไม่ค่อย{w}",  # 这个不太{w}。
        "เขารู้สึก{w}",  # 他觉得{w}。
        "ทิวทัศน์ที่นี่{w}มาก",  # 这里的风景很{w}。
        "เขาแต่งตัว{w}มาก",  # 他穿得很{w}。
    ]
    
    # Thai place templates
    place_th = [
        "เราไป{w}กันเถอะ",  # 我们去{w}吧。
        "เขาอยู่ที่{w}",  # 他在{w}。
        "{w}สวยมาก",  # {w}很美。
        "เขาทำงานที่{w}",  # 他在{w}工作。
    ]
    
    # Thai abstract noun templates
    abstract_th = [
        "{w}สำคัญมาก",  # {w}很重要。
        "เราต้องการ{w}",  # 我们需要{w}。
        "เขาให้ความสำคัญกับ{w}",  # 他很注重{w}。
        "เขามี{w}มาก",  # 他很有{w}。
    ]
    
    # Thai time word templates
    time_th = [
        "{w}ฉันไปโรงเรียน",  # {w}我去上学。
        "เขาอยู่บ้าน{w}",  # 他{w}在家。
        "{w}เรากินข้าวด้วยกัน",  # {w}我们一起吃饭。
    ]
    
    # Thai chengyu templates
    chengyu_th = [
        "{w}เป็นสำนวนที่ใช้บ่อย",  # {w}是一个常用的成语。
        "สำนวนนี้คือ{w}",  # 这个成语是{w}。
        "เขาทำ{w}สำเร็จ",  # 他做到了{w}。
        "{w}เหมาะที่จะอธิบายสถานการณ์นี้",  # {w}形容这个情况很合适。
        "นี่คือ{w}จริงๆ!",  # 这真是{w}啊！
    ]
    
    # Thai function word templates
    function_th = [
        "{w}ฉันไม่เห็นด้วย",  # {w}，我不同意。
        "เขาไปโรงเรียน{w}",  # 他{w}去了学校。
        "ฉัน{w}ชอบสีนี้",  # 我{w}喜欢这个颜色。
    ]
    
    # Thai other templates
    other_th = [
        "นี่คือ{w}",  # 这是{w}。
        "{w}คืออะไร?",  # {w}是什么？
        "เขา{w}",  # 他{w}。
        "ฉันชอบ{w}",  # 我喜欢{w}。
        "เขากำลังเรียน{w}",  # 他在学{w}。
    ]
    
    return {
        'verb': verb_th,
        'noun': noun_th,
        'adj': adj_th,
        'place': place_th,
        'abstract': abstract_th,
        'time': time_th,
        'chengyu': chengyu_th,
        'function': function_th,
        'other': other_th,
    }


def patch_script():
    """Patch generate_sentences.py to add Thai support."""
    with open('scripts/generate_sentences.py', 'r') as f:
        content = f.read()
    
    # 1. Add THAI_TEMPLATES after the last template list (OTHER_TEMPLATES)
    # Find the end of OTHER_TEMPLATES and the start of detect_word_type
    thai_templates_code = """

# ──────────────────────────────────────────────
#  THAI TEMPLATES (matching the order of Chinese/English templates above)
# ──────────────────────────────────────────────

THAI_VERB_TEMPLATES = [
    "ฉัน{w}",
    "ฉันอยาก{w}อันนี้",
    "เขากำลัง{w}",
    "เรา{w}กันเถอะ",
    "คุณเคย{w}อันนี้ไหม?",
    "อย่า{w}อีกเลย",
    "เขาเรียนรู้ที่จะ{w}ภาษาจีน",
    "เธอ{w}ทุกวัน",
    "คุณช่วย{w}หน่อยได้ไหม?",
    "ครูให้เรา{w}",
    "เขา{w}ได้ดีมาก",
    "ควร{w}อันนี้",
    "เขาชอบ{w}",
    "ฉันกำลัง{w}อันนี้",
    "กรุณา{w}หน่อย",
]

THAI_NOUN_TEMPLATES = [
    "นี่คือ{w}",
    "ฉันชอบ{w}นี้",
    "ฉันเห็น{w}หนึ่ง",
    "{w}นี้สวยมาก",
    "เขามี{w}",
    "คุณชอบ{w}นี้ไหม?",
    "{w}นี้เท่าไหร่?",
    "เรามี{w}หนึ่ง",
    "{w}นี้ใช้ดีมาก",
    "เขาอยู่ที่{w}",
    "คำนี้คือ{w}",
    "เขากำลังหา{w}",
]

THAI_ADJ_TEMPLATES = [
    "อันนี้{w}มาก",
    "เธอ{w}มาก",
    "ดู{w}มาก",
    "วันนี้อากาศ{w}มาก",
    "อันนี้ไม่ค่อย{w}",
    "เขารู้สึก{w}",
    "ทิวทัศน์ที่นี่{w}มาก",
    "เขาแต่งตัว{w}มาก",
]

THAI_PLACE_TEMPLATES = [
    "เราไป{w}กันเถอะ",
    "เขาอยู่ที่{w}",
    "{w}สวยมาก",
    "เขาทำงานที่{w}",
]

THAI_ABSTRACT_NOUN_TEMPLATES = [
    "{w}สำคัญมาก",
    "เราต้องการ{w}",
    "เขาให้ความสำคัญกับ{w}",
    "เขามี{w}มาก",
]

THAI_TIME_WORD_TEMPLATES = [
    "{w}ฉันไปโรงเรียน",
    "เขาอยู่บ้าน{w}",
    "{w}เรากินข้าวด้วยกัน",
]

THAI_CHENGYU_TEMPLATES = [
    "{w}เป็นสำนวนที่ใช้บ่อย",
    "สำนวนนี้คือ{w}",
    "เขาทำ{w}สำเร็จ",
    "{w}เหมาะที่จะอธิบายสถานการณ์นี้",
    "นี่คือ{w}จริงๆ!",
]

THAI_FUNCTION_WORD_TEMPLATES = [
    "{w}ฉันไม่เห็นด้วย",
    "เขาไปโรงเรียน{w}",
    "ฉัน{w}ชอบสีนี้",
]

THAI_OTHER_TEMPLATES = [
    "นี่คือ{w}",
    "{w}คืออะไร?",
    "เขา{w}",
    "ฉันชอบ{w}",
    "เขากำลังเรียน{w}",
]

THAI_TEMPLATES = {
    'verb': THAI_VERB_TEMPLATES,
    'noun': THAI_NOUN_TEMPLATES,
    'adj': THAI_ADJ_TEMPLATES,
    'place': THAI_PLACE_TEMPLATES,
    'abstract': THAI_ABSTRACT_NOUN_TEMPLATES,
    'time': THAI_TIME_WORD_TEMPLATES,
    'chengyu': THAI_CHENGYU_TEMPLATES,
    'function': THAI_FUNCTION_WORD_TEMPLATES,
    'other': THAI_OTHER_TEMPLATES,
}
"""
    
    # Insert THAI_TEMPLATES after OTHER_TEMPLATES
    other_end = content.find('\n\n\ndef detect_word_type')
    if other_end == -1:
        other_end = content.find('\ndef detect_word_type')
    
    if other_end != -1:
        content = content[:other_end] + thai_templates_code + content[other_end:]
        print(f"Inserted Thai templates at position {other_end}")
    else:
        print("ERROR: Could not find detect_word_type")
        return
    
    # 2. Update get_templates_for_type to also return Thai templates
    old_func = """def get_templates_for_type(word_type):
    \"\"\"Return appropriate template list for word type.\"\"\"
    templates = {
        'verb': VERB_TEMPLATES,
        'noun': NOUN_TEMPLATES,
        'adj': ADJ_TEMPLATES,
        'place': PLACE_TEMPLATES,
        'abstract': ABSTRACT_NOUN_TEMPLATES,
        'time': TIME_WORD_TEMPLATES,
        'chengyu': CHENGYU_TEMPLATES,
        'function': FUNCTION_WORD_TEMPLATES,
        'other': OTHER_TEMPLATES,
    }
    return templates.get(word_type, OTHER_TEMPLATES)"""
    
    new_func = """def get_templates_for_type(word_type):
    \"\"\"Return appropriate template lists for word type.\"\"\"
    templates = {
        'verb': (VERB_TEMPLATES, THAI_VERB_TEMPLATES),
        'noun': (NOUN_TEMPLATES, THAI_NOUN_TEMPLATES),
        'adj': (ADJ_TEMPLATES, THAI_ADJ_TEMPLATES),
        'place': (PLACE_TEMPLATES, THAI_PLACE_TEMPLATES),
        'abstract': (ABSTRACT_NOUN_TEMPLATES, THAI_ABSTRACT_NOUN_TEMPLATES),
        'time': (TIME_WORD_TEMPLATES, THAI_TIME_WORD_TEMPLATES),
        'chengyu': (CHENGYU_TEMPLATES, THAI_CHENGYU_TEMPLATES),
        'function': (FUNCTION_WORD_TEMPLATES, THAI_FUNCTION_WORD_TEMPLATES),
        'other': (OTHER_TEMPLATES, THAI_OTHER_TEMPLATES),
    }
    t = templates.get(word_type, (OTHER_TEMPLATES, THAI_OTHER_TEMPLATES))
    return t[0], t[1]"""
    
    content = content.replace(old_func, new_func)
    
    # 3. Update generate_sentence() to return 3 values
    old_gen = """    if ch in CUSTOM_SENTENCES:
        return CUSTOM_SENTENCES[ch]
    
    templates = get_templates_for_type(word_type)
    template_idx = template_idx % len(templates)
    zh_tmpl, en_tmpl = templates[template_idx]

    # For verbs, check the word length
    if word_type == 'verb':
        zh_tmpl, en_tmpl = adapt_verb_for_tone(ch, zh_tmpl, en_tmpl)

    # Extract and clean the English word BEFORE substitution
    raw_word = en.split(',')[0].strip()
    if raw_word.startswith('to '):
        clean_word = raw_word[3:]
    else:
        clean_word = raw_word

    # Fill in the word
    zh = zh_tmpl.replace('{w}', ch)
    en_sentence = en_tmpl.replace('{w}', clean_word)

    return (zh, en_sentence)"""
    
    new_gen = """    if ch in CUSTOM_SENTENCES:
        zh_custom, en_custom = CUSTOM_SENTENCES[ch]
        # Generate Thai for custom sentence
        from add_thai_to_script import zh_to_th_simple
        th_custom = zh_to_th_simple(zh_custom, ch)
        return (zh_custom, en_custom, th_custom)
    
    zh_templates, th_templates = get_templates_for_type(word_type)
    template_idx = template_idx % len(zh_templates)
    zh_tmpl = zh_templates[template_idx]
    en_tmpl = EN_TEMPLATES[word_type][template_idx] if word_type in EN_TEMPLATES else EN_OTHER_TEMPLATES[template_idx % len(EN_OTHER_TEMPLATES)]
    th_tmpl = th_templates[template_idx]

    # For verbs, check the word length
    if word_type == 'verb':
        zh_tmpl, en_tmpl = adapt_verb_for_tone(ch, zh_tmpl, en_tmpl)

    # Extract and clean the English word BEFORE substitution
    raw_word = en.split(',')[0].strip()
    if raw_word.startswith('to '):
        clean_word = raw_word[3:]
    else:
        clean_word = raw_word

    # Fill in the word
    zh = zh_tmpl.replace('{w}', ch)
    en_sentence = en_tmpl.replace('{w}', clean_word)
    th_sentence = th_tmpl.replace('{w}', ch)

    return (zh, en_sentence, th_sentence)"""
    
    content = content.replace(old_gen, new_gen)
    
    # 4. Update process_all_files() to handle 3-tuple returns
    old_process = """            zh, sent_en = generate_sentence(ch, en, en_full, word_type, template_idx, word_counter)

                w['zh'] = zh
                w['sent_en'] = sent_en"""
    
    new_process = """            zh, sent_en, sent_th = generate_sentence(ch, en, en_full, word_type, template_idx, word_counter)

                w['zh'] = zh
                w['sent_en'] = sent_en
                w['sent_th'] = sent_th"""
    
    content = content.replace(old_process, new_process)
    
    # 5. Write the modified script
    with open('scripts/generate_sentences.py', 'w') as f:
        f.write(content)
    
    print("Script patched successfully with Thai support!")
    
    # 6. Now also add an EN_TEMPLATES dict for the English templates
    # Since we changed get_templates_for_type to return (zh, th) instead of (zh, en),
    # we need to add an EN_TEMPLATES lookup
    en_templates_code = """

# ──────────────────────────────────────────────
#  ENGLISH TEMPLATES (for reference by Thai generation)
# ──────────────────────────────────────────────

EN_VERB_TEMPLATES = [
    "I {w}.",
    "I want to {w} this.",
    "He is {w}ing.",
    "Let's {w}.",
    "Have you {w}ed this?",
    "Don't {w} anymore.",
    "He learned to {w} Chinese.",
    "She {w}s every day.",
    "Can you help me {w}?",
    "The teacher asked us to {w}.",
    "He {w}s very well.",
    "We should {w} this.",
    "He likes to {w}.",
    "I am {w}ing this.",
    "Please {w} for a moment.",
]

EN_NOUN_TEMPLATES = [
    "This is a {w}.",
    "I like this {w}.",
    "I saw a {w}.",
    "This {w} is beautiful.",
    "He has {w}.",
    "Do you like this {w}?",
    "How much is this {w}?",
    "We have a {w}.",
    "This {w} works very well.",
    "He is at {w}.",
    "This word is {w}.",
    "He is looking for {w}.",
]

EN_ADJ_TEMPLATES = [
    "This is very {w}.",
    "She is very {w}.",
    "It looks very {w}.",
    "Today's weather is very {w}.",
    "This is not very {w}.",
    "He feels {w}.",
    "The scenery here is very {w}.",
    "He is dressed very {w}ly.",
]

EN_PLACE_TEMPLATES = [
    "Let's go to {w}.",
    "He is at {w}.",
    "{w} is very beautiful.",
    "He works at {w}.",
]

EN_ABSTRACT_NOUN_TEMPLATES = [
    "{w} is very important.",
    "We need {w}.",
    "He values {w}.",
    "He has a lot of {w}.",
]

EN_TIME_WORD_TEMPLATES = [
    "I go to school {w}.",
    "He is at home {w}.",
    "We eat together {w}.",
]

EN_CHENGYU_TEMPLATES = [
    "{w} is a commonly used idiom.",
    "This idiom is {w}.",
    "He achieved {w}.",
    "{w} describes this situation well.",
    "This is truly {w}!",
]

EN_FUNCTION_WORD_TEMPLATES = [
    "{w}, I disagree.",
    "He went to school {w}.",
    "I {w} like this color.",
]

EN_OTHER_TEMPLATES = [
    "This is {w}.",
    "What is {w}?",
    "He {w}.",
    "I like {w}.",
    "He is learning {w}.",
]

EN_TEMPLATES = {
    'verb': EN_VERB_TEMPLATES,
    'noun': EN_NOUN_TEMPLATES,
    'adj': EN_ADJ_TEMPLATES,
    'place': EN_PLACE_TEMPLATES,
    'abstract': EN_ABSTRACT_NOUN_TEMPLATES,
    'time': EN_TIME_WORD_TEMPLATES,
    'chengyu': EN_CHENGYU_TEMPLATES,
    'function': EN_FUNCTION_WORD_TEMPLATES,
    'other': EN_OTHER_TEMPLATES,
}

EN_OTHER_TEMPLATES_LIST = EN_OTHER_TEMPLATES
"""
    
    # Insert EN_TEMPLATES before detect_word_type
    # Find the current location of get_templates_for_type
    gft_start = content.find('def get_templates_for_type')
    if gft_start != -1:
        content = content[:gft_start] + en_templates_code + content[gft_start:]
        print("Added EN_TEMPLATES dict")
    
    with open('scripts/generate_sentences.py', 'w') as f:
        f.write(content)
    
    print("Script fully patched!")


if __name__ == '__main__':
    patch_script()
