#!/usr/bin/env python3
"""
Generate natural Chinese example sentences (zh + sent_en) for HSK words that are missing them.
Uses a large curated sentence database extracted from existing course files,
plus a template engine with smart word-type detection for remaining words.
"""

import json
import glob
import random
import re

random.seed(42)

# ──────────────────────────────────────────────
#  LOAD CURATED SENTENCES FROM EXISTING COURSES
# ──────────────────────────────────────────────

CUSTOM_SENTENCES = {}
try:
    with open('scripts/custom_sentences.json', 'r', encoding='utf-8') as f:
        CUSTOM_SENTENCES = json.load(f)
    print(f"Loaded {len(CUSTOM_SENTENCES)} curated sentences from custom_sentences.json")
except FileNotFoundError:
    print("Warning: custom_sentences.json not found. Running with empty custom dictionary.")

# ──────────────────────────────────────────────
#  TEMPLATE LIBRARY
#  Natural sentence patterns organized by word type.
#  {w} is replaced with the target word.
#  Templates are in (Chinese, English) pairs.
# ──────────────────────────────────────────────

VERB_TEMPLATES = [
    ("我喜欢{w}。", "I like to {w}."),
    ("我在{w}。", "I am {w}ing."),
    ("他正在{w}。", "He is {w}ing right now."),
    ("我们{w}吧。", "Let's {w}."),
    ("我想{w}这个。", "I want to {w} this."),
    
    ("我们一起{w}。", "We {w} together."),
    ("他会{w}。", "He can {w}."),
]

NOUN_TEMPLATES = [
    ("这个{w}很好。", "This {w} is very good."),
    ("我喜欢这个{w}。", "I like this {w}."),
    ("我有一个{w}。", "I have a {w}."),
    ("这个{w}很漂亮。", "This {w} is very beautiful."),
    ("他买了一个{w}。", "He bought a {w}."),
    ("我们需要一个{w}。", "We need a {w}."),
    ("这个{w}在哪里？", "Where is this {w}?"),
    ("大家都在用这个{w}。", "Everyone is using this {w}."),
]

ADJ_TEMPLATES = [
    ("这个很{w}。", "This is very {w}."),
    ("他觉得很{w}。", "He feels very {w}."),
    ("今天很{w}。", "Today is very {w}."),
    ("她看起来很{w}。", "She looks very {w}."),
    ("这个{w}吗？", "Is this {w}?"),
    ("天气很{w}。", "The weather is very {w}."),
    ("这里很{w}。", "It's very {w} here."),
    ("你觉得{w}吗？", "Do you think it's {w}?"),
]

PLACE_TEMPLATES = [
    ("我在{w}。", "I am at {w}."),
    ("我们去{w}吧。", "Let's go to {w}."),
    ("他在{w}工作。", "He works at {w}."),
    ("从{w}到学校。", "From {w} to school."),
    ("他住在{w}。", "He lives in {w}."),
]

ADV_TEMPLATES = [
    ("他{w}来了。", "He came {w}."),
    ("请{w}做。", "Please do it {w}."),
    ("他{w}说。", "He said {w}."),
    ("他走得{w}。", "He walks {w}."),
    ("事情{w}发展。", "Things develop {w}."),
]

FUNCTION_WORD_TEMPLATES = [
    ("{w}他来了。", "{w} he came."),
    ("{w}我不去。", "{w} I won't go."),
    ("{w}大家都同意。", "{w} everyone agrees."),
    ("他{w}没来。", "He didn't come {w}."),
    ("{w}这样是对的。", "{w} this is right."),
]

OTHER_TEMPLATES = [
    ("这个{w}很好。", "This {w} is very good."),
    ("我喜欢{w}。", "I like {w}."),
    ("这个{w}是什么？", "What is this {w}?"),
    ("看看这个{w}。", "Look at this {w}."),
    ("他提到了{w}。", "He mentioned {w}."),
]


def get_templates_for_type(word_type):
    """Return the appropriate template list based on word type."""
    if word_type == 'verb':
        return VERB_TEMPLATES
    elif word_type == 'noun':
        return NOUN_TEMPLATES
    elif word_type == 'adj':
        return ADJ_TEMPLATES
    elif word_type == 'place':
        return PLACE_TEMPLATES
    elif word_type == 'adv':
        return ADV_TEMPLATES
    elif word_type == 'function_word':
        return FUNCTION_WORD_TEMPLATES
    else:  # 'other'
        return OTHER_TEMPLATES


def detect_word_type(ch, en, en_full):
    """Detect the word type from English definition."""
    en_lower = en.lower()
    en_full_lower = en_full.lower() if en_full else en_lower

    # 1. Function words (conjunctions, prepositions, particles)
    func_indicators = ['not only', 'although', 'because', 'if', 'unless',
                       'since', 'while', 'however', 'therefore', 'thus',
                       'moreover', 'furthermore', 'meanwhile', 'nevertheless',
                       'otherwise', 'consequently', 'furthermore',
                       'each and every', 'as for', 'as to', 'in order to',
                       'in addition', 'in terms of', 'no matter',
                       'not until', 'rather than', 'whether', 'even if',
                       'even though', 'on the contrary',
                       'no sooner', 'hardly', 'scarcely',
                       'so that', 'such as', 'as long as', 'as soon as',
                       'in case', 'for example', 'for instance',
                       'in other words', 'in general', 'generally',
                       'what is more', 'what is worse']
    for indicator in func_indicators:
        if indicator in en_lower:
            return 'function_word'

    # 2. Adverbs
    adv_indicators = ['ly', 'adverb']
    for indicator in adv_indicators:
        if en.endswith(indicator):
            return 'adv'
    # Common adverb patterns
    adverb_words = ['always', 'often', 'usually', 'sometimes', 'seldom',
                    'never', 'already', 'just', 'recently', 'immediately',
                    'gradually', 'suddenly', 'quickly', 'slowly',
                    'together', 'separately', 'especially', 'particularly',
                    'approximately', 'about', 'around', 'quite']
    for word in adverb_words:
        if en_lower.startswith(word):
            return 'adv'

    # 3. Check for place names / locations
    place_indicators = ['place', 'location', 'area', 'region', 'city',
                        'town', 'village', 'country', 'capital',
                        'street', 'road', 'station', 'stop', 'airport',
                        'hospital', 'school', 'market', 'shop', 'store',
                        'restaurant', 'hotel', 'bank', 'park', 'garden',
                        'museum', 'library', 'factory', 'farm',
                        'island', 'mountain', 'river', 'lake', 'sea',
                        'office', 'building', 'center', 'square',
                        'province', 'state', 'district',
                        'bedroom', 'kitchen', 'bathroom', 'classroom',
                        'the south', 'the north', 'the east', 'the west',
                        'southern', 'northern', 'eastern', 'western',
                        'southwest', 'southeast', 'northwest', 'northeast',
                        'south', 'north', 'east', 'west',
                        'downtown', 'neighborhood']
    for indicator in place_indicators:
        if indicator in en_lower or en_lower.startswith(indicator):
            return 'place'

    # 4. Nouns (check en_full for classifier patterns first)
    if en_full and 'CL:' in en_full_lower:
        return 'noun'

    noun_suffixes = ['ion', 'tion', 'sion', 'ment', 'ness', 'ity',
                     'ence', 'ance', 'ism', 'ist', 'er', 'or', 'ing',
                     'tion']
    for suffix in noun_suffixes:
        if en_lower.endswith(suffix) and len(en) > 4:
            return 'noun'

    noun_indicators = ['a kind of', 'a type of', 'a sort of',
                       'cl:', 'classifier',
                       'thing', 'person', 'people', 'animal', 'plant',
                       'food', 'drink', 'book', 'word', 'language',
                       'color', 'number', 'money', 'time', 'day',
                       'month', 'year', 'hour', 'minute', 'second',
                       'part', 'piece', 'kind', 'type', 'sort',
                       'way', 'method', 'means', 'tool', 'machine',
                       'material', 'product', 'goods', 'item',
                       'member', 'friend', 'family', 'parent',
                       'child', 'baby', 'student', 'teacher', 'doctor',
                       'worker', 'farmer', 'soldier', 'officer',
                       'manager', 'leader', 'boss',
                       'law', 'rule', 'principle', 'theory',
                       'system', 'structure', 'organization',
                       'result', 'effect', 'influence',
                       'problem', 'question', 'answer',
                       'reason', 'cause', 'purpose',
                       'power', 'force', 'energy',
                       'feeling', 'emotion', 'mood',
                       'habit', 'custom', 'tradition']
    for indicator in noun_indicators:
        if indicator in en_lower:
            return 'noun'

    # 5. Adjectives
    adj_indicators = ['very', 'extremely', 'quite', 'rather',
                      'pretty ', '(adj)', 'adjective']
    for indicator in adj_indicators:
        if indicator in en_lower:
            return 'adj'

    adj_endings = ['able', 'ible', 'ful', 'less', 'ous', 'ious',
                   'al', 'ive', 'ic', 'ical', 'ed', 'ing',
                   'y', 'ly', 'ish', 'some', 'like',
                   'ant', 'ent', 'ar', 'ary', 'ory',
                   'ulent', 'ulent']
    for ending in adj_endings:
        if en_lower.endswith(ending) and len(en) > 3:
            return 'adj'

    # 6. Verbs (start with "to ")
    if en_lower.startswith('to '):
        return 'verb'

    # 7. Multi-character words (likely nouns or compounds)
    if len(ch) >= 3:
        return 'noun'

    return 'other'



def generate_sentence(ch, en, en_full, word_type, template_idx):
    """Generate a natural sentence using the target word.

    Returns (zh_sentence, en_sentence).
    """
    # 1. Check curated dictionary first
    if ch in CUSTOM_SENTENCES:
        return CUSTOM_SENTENCES[ch]

    # 2. Extract and clean the English word BEFORE substitution
    raw_word = en.split(',')[0].strip() if en else ''
    if not raw_word:
        return (ch + '。', ch + '.')

    # Clean "to " prefix for verb templates
    clean_word = raw_word[3:] if raw_word.startswith('to ') else raw_word

    # 3. Select template
    templates = get_templates_for_type(word_type)
    template_idx = template_idx % len(templates)
    zh_tmpl, en_tmpl = templates[template_idx]

    # 4. Fill in the word
    zh = zh_tmpl.replace('{w}', ch)
    en_sentence = en_tmpl.replace('{w}', clean_word)

    return (zh, en_sentence)


def process_all_files():
    """Process all HSK JSON files and fill missing zh + sent_en."""
    files = glob.glob('characters_hsk*.json') + glob.glob('characters_hsk20_*.json')
    files.sort()

    total_filled = 0
    total_skipped = 0
    type_counter = {}

    for fname in files:
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)

        course = data['course']
        course_filled = 0
        course_skipped = 0

        for w in data['words']:
            # Skip if it already has both zh and sent_en
            if w.get('zh') and w.get('sent_en'):
                continue

            ch = w['ch']
            en = w.get('en', '')
            en_full = w.get('en_full', en)

            # Skip if no English definition available
            if not en:
                course_skipped += 1
                total_skipped += 1
                continue

            # Detect word type
            word_type = detect_word_type(ch, en, en_full)

            # Track template cycle for variety
            type_counter[word_type] = type_counter.get(word_type, 0)
            template_idx = type_counter[word_type]
            type_counter[word_type] += 1

            # Generate sentence
            zh, sent_en = generate_sentence(ch, en, en_full, word_type, template_idx)

            w['zh'] = zh
            w['sent_en'] = sent_en
            course_filled += 1
            total_filled += 1

        # Write updated file
        with open(fname, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"  {course}: +{course_filled} filled, {course_skipped} skipped (no en)")

    print(f"\n{'='*40}")
    print(f"Total filled: {total_filled}")
    print(f"Total skipped (no en field): {total_skipped}")
    print(f"{'='*40}")


if __name__ == '__main__':
    process_all_files()
