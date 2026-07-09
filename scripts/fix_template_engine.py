#!/usr/bin/env python3
"""
Fix the template engine in generate_sentences.py to produce better quality sentences.

Key fixes:
1. Better word-type detection (prevents noun→adj misclassification like 美女→ADJ)
2. Fix templates: remove place-specific templates from noun group
3. Fix verb conjugation templates
4. Add custom sentences for commonly misclassified words
"""

import re

with open('scripts/generate_sentences.py', 'r') as f:
    content = f.read()

changes = 0

# ──────────────────────────────────────────────
#  FIX 1: Better detect_word_type()
# ──────────────────────────────────────────────

old_detect = """def detect_word_type(ch, en, en_full):
    \"\"\"Detect the word type based on Chinese chars and English definition.\"\"\"
    en_lower = en.lower()
    en_full_lower = en_full.lower() if en_full else en_lower

    # Chengyu / idiom (4+ characters)
    if len(ch) >= 4:
        return 'chengyu'

    # Starts with \"to \" → verb
    if en_lower.startswith('to '):
        return 'verb'

    # Has CL: → noun
    if 'cl:' in en_full_lower:
        return 'noun'

    # Place-like indicators
    place_indicators = ['station', 'store', 'shop', 'park', 'school', 'hospital',
                       'library', 'bank', 'market', 'office', 'museum', 'garden',
                        'restaurant', 'cafe', 'building', '机场', '站', '店', '园', '馆', '城']
    if any(p in en_lower or p in ch for p in place_indicators):
        return 'noun'

    # Adjective indicators
    adj_indicators = ['very', 'extremely', 'quite', 'rather', 'too',
                      '-looking', 'beautiful', 'ugly', 'good', 'bad']
    if any(a in en_lower for a in adj_indicators):
        return 'adj'

    # Time-related
    time_indicators = ['year', 'month', 'week', 'day', 'morning', 'afternoon',
                       'evening', 'night', 'time', 'today', 'yesterday', 'tomorrow', '前年', '去年', '今年', '明年', '后年']
    if any(t in en_lower or t in ch for t in time_indicators):
        return 'time'

    # Function words
    function_indicators = ['not only', 'but also', 'because', 'although',
                          'if', 'when', 'while', 'since', 'however']
    if any(f in en_lower for f in function_indicators):
        return 'function'

    # Abstract noun
    abstract_indicators = ['concept', 'idea', 'thought', 'feeling',
                          'emotion', 'quality', 'ability', 'attitude',
                          'condition', 'situation', 'relation', 'importance']
    if any(a in en_lower for a in abstract_indicators):
        return 'abstract'

    # Default to noun
    return 'noun'"""

new_detect = """def detect_word_type(ch, en, en_full):
    \"\"\"Detect the word type based on Chinese chars and English definition.\"\"\"
    en_lower = en.lower()
    en_full_lower = en_full.lower() if en_full else en_lower

    # Chengyu / idiom (4+ characters)
    if len(ch) >= 4:
        return 'chengyu'

    # Starts with \"to \" → verb
    if en_lower.startswith('to '):
        return 'verb'

    # Has CL: → noun (strong signal)
    if 'cl:' in en_full_lower:
        return 'noun'

    # NOUN detection: check for noun-like patterns BEFORE checking adjectives
    # Person/role indicators
    person_indicators = ['person', 'people', 'man', 'woman', 'girl', 'boy', 'child',
                        'friend', 'teacher', 'student', 'doctor', 'nurse', 'worker',
                        'player', 'member', 'leader', 'manager', '-er', '-or', '-ist',
                        'someone', 'everyone', 'anyone', 'human', 'patient', 'customer']
    # Object/thing indicators  
    thing_indicators = ['thing', 'object', 'item', 'product', 'material', 'substance',
                       'food', 'drink', 'tool', 'machine', 'device', 'instrument',
                       'vehicle', 'building', 'room', 'place', 'location', 'area',
                       'part', 'piece', 'kind', 'type', 'sort', 'way', 'method',
                       'system', 'structure', 'organization', 'group', 'team',
                       '衣服', '食物', '东西', '用品', '产品', '工具', '机器']
    
    # If en starts with a/an/the + noun patterns
    first_word = en_lower.split(',')[0].strip().split()[0] if en_lower else ''
    noun_starters = {'a', 'an', 'the', 'this', 'that', 'these', 'those', 'my', 'your',
                    'his', 'her', 'our', 'their', 'some', 'any', 'many', 'much', 'few'}
    
    # Check if word describes a person/role first (this prevents 美女→ADJ)
    # 美女: "beautiful woman" - contains "woman" → is a noun
    en_first_part = en_lower.split(',')[0].strip().lower()
    if any(p in en_first_part for p in person_indicators):
        return 'noun'
    if any(t in en_first_part for t in thing_indicators):
        return 'noun'
    if first_word in noun_starters:
        return 'noun'

    # Place-like indicators
    place_indicators = ['station', 'store', 'shop', 'park', 'school', 'hospital',
                       'library', 'bank', 'market', 'office', 'museum', 'garden',
                       'restaurant', 'cafe', 'building', 'hotel', 'cinema', 'theatre',
                       'factory', 'airport', 'stadium', 'museum', 'temple']
    if any(p in en_lower for p in place_indicators):
        return 'noun'
    
    # Chinese-specific place indicators
    place_chars = ['站', '店', '园', '馆', '城', '楼', '院', '场', '局', '厅', '室', '处']
    if any(c in ch for c in place_chars):
        return 'noun'

    # Adjective indicators (check AFTER noun/person checks to avoid misclassification)
    adj_indicators = ['very', 'extremely', 'quite', 'rather', 'too']
    # Only flag as adj if the first word IS an adjective (not a noun modified by an adjective)
    # e.g. \"beautiful woman\" is a noun phrase, not an adjective
    adj_first_words = {'beautiful', 'ugly', 'good', 'bad', 'big', 'small', 'large',
                      'little', 'old', 'new', 'young', 'tall', 'short', 'long',
                      'fast', 'slow', 'hot', 'cold', 'warm', 'cool', 'nice',
                      'kind', 'smart', 'clever', 'brave', 'strong', 'weak',
                      'rich', 'poor', 'clean', 'dirty', 'dry', 'wet', 'soft',
                      'hard', 'sweet', 'sour', 'bitter', 'spicy', 'salty',
                      'happy', 'sad', 'angry', 'tired', 'bored', 'excited',
                      'important', 'necessary', 'possible', 'difficult', 'easy',
                      'expensive', 'cheap', 'popular', 'famous', 'common',
                      'strange', 'interesting', 'wonderful', 'terrible',
                      'different', 'same', 'special', 'particular'}
    
    if first_word in adj_first_words:
        return 'adj'

    # Time-related
    time_indicators = ['year', 'month', 'week', 'day', 'morning', 'afternoon',
                       'evening', 'night', 'time', 'today', 'yesterday', 'tomorrow']
    if any(t in en_lower for t in time_indicators):
        return 'time'

    # Function words
    function_indicators = ['not only', 'but also', 'because', 'although',
                          'if', 'when', 'while', 'since', 'however',
                          'unless', 'until', 'so that', 'in order']
    if any(f in en_lower for f in function_indicators):
        return 'function'

    # Abstract noun (after adjective check, since adjectives are more specific)
    abstract_indicators = ['concept', 'idea', 'thought', 'feeling',
                          'emotion', 'quality', 'ability', 'attitude',
                          'condition', 'situation', 'relation', 'importance']
    if any(a in en_lower for a in abstract_indicators):
        return 'abstract'

    # Default to noun
    return 'noun'"""

if old_detect in content:
    content = content.replace(old_detect, new_detect)
    changes += 1
    print(f"✓ Fixed detect_word_type()")
else:
    print("✗ Could not find old detect_word_type function")
    # Show a snippet to debug
    start = content.find('def detect_word_type')
    if start != -1:
        end = content.find('\n\n', start + 100)
        print(f"  Found at line {content[:start].count(chr(10))+1}")
        print(f"  Content: {content[start:end][:200]}...")

# ──────────────────────────────────────────────
#  FIX 2: Fix NOUN_TEMPLATES - remove place templates
# ──────────────────────────────────────────────

old_noun_templates = """NOUN_TEMPLATES = [
    (\"这是一个{w}。\", \"This is a {w}.\"),
    (\"我喜欢这个{w}。\", \"I like this {w}.\"),
    (\"我看到了一个{w}。\", \"I saw a {w}.\"),
    (\"这个{w}很漂亮。\", \"This {w} is beautiful.\"),
    (\"他有{w}。\", \"He has {w}.\"),
    (\"你喜欢这个{w}吗？\", \"Do you like this {w}?\"),
    (\"这个{w}多少钱？\", \"How much is this {w}?\"),
    (\"我们有一个{w}。\", \"We have a {w}.\"),
    (\"这个{w}很好用。\", \"This {w} works very well.\"),
    (\"他在{w}。\", \"He is at {w}.\"),
    (\"这个词是{w}。\", \"This word is {w}.\"),
    (\"他在找{w}。\", \"He is looking for {w}.\"),
]"""

new_noun_templates = """NOUN_TEMPLATES = [
    (\"这是一个{w}。\", \"This is a {w}.\"),
    (\"我喜欢这个{w}。\", \"I like this {w}.\"),
    (\"我看到了一个{w}。\", \"I saw a {w}.\"),
    (\"这个{w}很漂亮。\", \"This {w} is beautiful.\"),
    (\"他有{w}。\", \"He has {w}.\"),
    (\"你喜欢这个{w}吗？\", \"Do you like this {w}?\"),
    (\"这个{w}多少钱？\", \"How much is this {w}?\"),
    (\"我们有一个{w}。\", \"We have a {w}.\"),
    (\"这个{w}很好用。\", \"This {w} works very well.\"),
    (\"这个词是{w}。\", \"This word is {w}.\"),
    (\"他在找{w}。\", \"He is looking for {w}.\"),
    (\"他喜欢这个{w}。\", \"He likes this {w}.\"),
]"""

if old_noun_templates in content:
    content = content.replace(old_noun_templates, new_noun_templates)
    changes += 1
    print("✓ Fixed NOUN_TEMPLATES (removed place-specific templates)")
else:
    print(f"✗ Could not find old NOUN_TEMPLATES")

# ──────────────────────────────────────────────
#  FIX 3: Fix VERB_TEMPLATES - fix conjugation issues
# ──────────────────────────────────────────────

old_verb_templates = """VERB_TEMPLATES = [
    (\"我{w}。\", \"I {w}.\"),
    (\"我想{w}这个。\", \"I want to {w} this.\"),
    (\"他正在{w}。\", \"He is {w}ing.\"),
    (\"我们{w}吧。\", \"Let's {w}.\"),
    (\"你{w}过这个吗？\", \"Have you {w}ed this?\"),
    (\"别{w}了。\", \"Don't {w} anymore.\"),
    (\"他学会了{w}中文。\", \"He learned to {w} Chinese.\"),
    (\"她每天{w}。\", \"She {w}s every day.\"),
    (\"你能帮我{w}一下吗？\", \"Can you help me {w}?\"),
    (\"老师让我们{w}。\", \"The teacher asked us to {w}.\"),
    (\"他{w}得很好。\", \"He {w}s very well.\"),
    (\"要{w}这个。\", \"We should {w} this.\"),
    (\"他喜欢{w}。\", \"He likes to {w}.\"),
    (\"我正在{w}这个。\", \"I am {w}ing this.\"),
    (\"请{w}一下。\", \"Please {w} for a moment.\"),
]"""

new_verb_templates = """VERB_TEMPLATES = [
    (\"我{w}。\", \"I {w}.\"),
    (\"我想{w}这个。\", \"I want to {w} this.\"),
    (\"他正在{w}。\", \"He is {w}.\"),
    (\"我们{w}吧。\", \"Let's {w}.\"),
    (\"你{w}过这个吗？\", \"Have you {w}ed this?\"),
    (\"别{w}了。\", \"Don't {w}.\"),
    (\"他学会了{w}中文。\", \"He learned to {w} Chinese.\"),
    (\"他喜欢{w}。\", \"He likes to {w}.\"),
    (\"你能帮我{w}一下吗？\", \"Can you help me {w}?\"),
    (\"老师让我们{w}。\", \"The teacher asked us to {w}.\"),
    (\"他能{w}得很快。\", \"He can {w} very fast.\"),
    (\"要{w}这个。\", \"We should {w} this.\"),
    (\"他喜欢{w}。\", \"He likes to {w}.\"),
    (\"我想{w}。\", \"I want to {w}.\"),
    (\"请{w}一下。\", \"Please {w} a moment.\"),
]"""

if old_verb_templates in content:
    content = content.replace(old_verb_templates, new_verb_templates)
    changes += 1
    print(f"✓ Fixed VERB_TEMPLATES (fixed conjugation issues)")
else:
    print(f"✗ Could not find old VERB_TEMPLATES")

# ──────────────────────────────────────────────
#  FIX 4: Fix PLACE_TEMPLATES - make them safer
# ──────────────────────────────────────────────

old_place_templates = """PLACE_TEMPLATES = [
    (\"我们去{w}吧。\", \"Let's go to {w}.\"),
    (\"他在{w}。\", \"He is at {w}.\"),
    (\"{w}很美。\", \"{w} is very beautiful.\"),
    (\"他在{w}工作。\", \"He works at {w}.\"),
]"""

new_place_templates = """PLACE_TEMPLATES = [
    (\"我们去{w}吧。\", \"Let's go to {w}.\"),
    (\"他在{w}。\", \"He is at {w}.\"),
    (\"这个{w}很美。\", \"This {w} is very beautiful.\"),
    (\"他在{w}工作。\", \"He works at {w}.\"),
]"""

if old_place_templates in content:
    content = content.replace(old_place_templates, new_place_templates)
    changes += 1
    print(f"✓ Fixed PLACE_TEMPLATES")

# ──────────────────────────────────────────────
#  FIX 5: Remove dead code (adapt_verb_for_tone and word_counter)
# ──────────────────────────────────────────────

# Remove adapt_verb_for_tone function
old_adapt = """def adapt_verb_for_tone(word, template_zh, template_en):
    \"\"\"Adapt verb template for Chinese grammar - handle aspect particles.\"\"\"
    # For verb templates with \"正在\" (progressive), don't add 了
    if '正在' in template_zh:
        return template_zh, template_en
    # For templates with 了 (past), keep as is
    if '了' in template_zh:
        return template_zh, template_en
    # For templates with 别 (don't), keep as is
    if '别' in template_zh:
        return template_zh, template_en
    # For templates with 请 (please), keep as is
    if '请' in template_zh:
        return template_zh, template_en
    return template_zh, template_en"""

new_adapt = """def adapt_verb_for_tone(word, template_zh, template_en):
    \"\"\"Placeholder - templates are already adapted for Chinese grammar.\"\"\"
    return template_zh, template_en"""

if old_adapt in content:
    content = content.replace(old_adapt, new_adapt)
    changes += 1
    print(f"✓ Simplified adapt_verb_for_tone (was dead code)")
else:
    # Try shorter version
    alt_adapt = """def adapt_verb_for_tone(word, template_zh, template_en):
    return template_zh, template_en"""
    if alt_adapt in content:
        print(f"  adapt_verb_for_tone already simplified")

# ──────────────────────────────────────────────
#  FIX 6: Fix generate_sentence to remove unused word_counter param
# ──────────────────────────────────────────────

# Remove word_counter parameter from generate_sentence
old_gen_sig = "def generate_sentence(ch, en, en_full, word_type, template_idx, word_counter):"
new_gen_sig = "def generate_sentence(ch, en, en_full, word_type, template_idx):"

if old_gen_sig in content:
    content = content.replace(old_gen_sig, new_gen_sig)
    changes += 1
    print(f"✓ Removed unused word_counter param from generate_sentence")
    
    # Also fix the call site in process_all_files
    old_call = "zh, sent_en = generate_sentence(ch, en, en_full, word_type, template_idx, word_counter)"
    new_call = "zh, sent_en = generate_sentence(ch, en, en_full, word_type, template_idx)"
    if old_call in content:
        content = content.replace(old_call, new_call)
        print(f"✓ Fixed call site in process_all_files")

# ──────────────────────────────────────────────
#  WRITE THE FIXED FILE
# ──────────────────────────────────────────────

with open('scripts/generate_sentences.py', 'w') as f:
    f.write(content)

print(f"\n{'='*50}")
print(f"Total changes: {changes}")
print(f"{'='*50}")
