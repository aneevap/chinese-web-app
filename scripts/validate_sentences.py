#!/usr/bin/env python3
"""
Comprehensive validation of ALL Chinese example sentences across HSK course files.
Checks every zh + sent_en pair for contextual correctness and flags issues.
"""

import json
import glob
import sys
import re

# ──────────────────────────────────────────────
#  LOAD REFERENCE DATA
# ──────────────────────────────────────────────

# Load curated sentences to distinguish curated vs template-generated
CUSTOM = {}
try:
    with open('scripts/custom_sentences.json', 'r', encoding='utf-8') as f:
        CUSTOM = json.load(f)
    print(f"Loaded {len(CUSTOM)} curated sentences from custom_sentences.json\n")
except FileNotFoundError:
    print("Warning: custom_sentences.json not found")

# Templates from generate_sentences.py for type reference
VERB_TEMPLATES = [
    "我喜欢{w}。", "我在{w}。", "他正在{w}。", "我们{w}吧。",
    "我想{w}这个。", "我们一起{w}。", "他会{w}。",
]
NOUN_TEMPLATES = [
    "这个{w}很好。", "我喜欢这个{w}。", "我有一个{w}。", "这个{w}很漂亮。",
    "他买了一个{w}。", "我们需要一个{w}。", "这个{w}在哪里？", "大家都在用这个{w}。",
]
ADJ_TEMPLATES = [
    "这个很{w}。", "他觉得很{w}。", "今天很{w}。", "她看起来很{w}。",
    "这个{w}吗？", "天气很{w}。", "这里很{w}。", "你觉得{w}吗？",
]
PLACE_TEMPLATES = [
    "我在{w}。", "我们去{w}吧。", "他在{w}工作。", "从{w}到学校。", "他住在{w}。",
]
ADV_TEMPLATES = [
    "他{w}来了。", "请{w}做。", "他{w}说。", "他走得{w}。", "事情{w}发展。",
]
FUNCTION_WORD_TEMPLATES = [
    "{w}他来了。", "{w}我不去。", "{w}大家都同意。", "他{w}没来。", "{w}这样是对的。",
]
OTHER_TEMPLATES = [
    "这个{w}很好。", "我喜欢{w}。", "这个{w}是什么？", "看看这个{w}。", "他提到了{w}。",
]

ALL_TEMPLATES = {
    'verb': VERB_TEMPLATES,
    'noun': NOUN_TEMPLATES,
    'adj': ADJ_TEMPLATES,
    'place': PLACE_TEMPLATES,
    'adv': ADV_TEMPLATES,
    'function_word': FUNCTION_WORD_TEMPLATES,
    'other': OTHER_TEMPLATES,
}

# ──────────────────────────────────────────────
#  DETECTION LOGIC (mirrors generate_sentences.py)
# ──────────────────────────────────────────────

def detect_word_type(ch, en, en_full):
    """Mirror the detection from generate_sentences.py."""
    en_lower = en.lower() if en else ''
    en_full_lower = en_full.lower() if en_full else en_lower

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

    adv_indicators = ['ly', 'adverb']
    for indicator in adv_indicators:
        if en.endswith(indicator):
            return 'adv'
    adverb_words = ['always', 'often', 'usually', 'sometimes', 'seldom',
                    'never', 'already', 'just', 'recently', 'immediately',
                    'gradually', 'suddenly', 'quickly', 'slowly',
                    'together', 'separately', 'especially', 'particularly',
                    'approximately', 'about', 'around', 'quite']
    for word in adverb_words:
        if en_lower.startswith(word):
            return 'adv'

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

    if en_full and 'CL:' in en_full_lower:
        return 'noun'

    noun_suffixes = ['ion', 'tion', 'sion', 'ment', 'ness', 'ity',
                     'ence', 'ance', 'ism', 'ist', 'er', 'or', 'ing', 'tion']
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

    if en_lower.startswith('to '):
        return 'verb'

    if len(ch) >= 3:
        return 'noun'

    return 'other'


# ──────────────────────────────────────────────
#  VALIDATION CHECKS
# ──────────────────────────────────────────────

def check_zh_contains_char(ch, zh):
    """Check the Chinese sentence contains the target character."""
    if not zh:
        return False, "zh field is empty"
    if ch not in zh:
        return False, f"Character '{ch}' not found in zh: '{zh}'"
    return True, None


def check_template_artifact(zh, sent_en):
    """Check for {w} remaining in output (template wasn't filled)."""
    if '{w}' in zh:
        return False, f"Template artifact '{{w}}' in zh: '{zh}'"
    if '{w}' in sent_en:
        return False, f"Template artifact '{{w}}' in en: '{sent_en}'"
    return True, None


def check_to_bug(sent_en):
    """Check for the 'to ' bug in English sentences."""
    # Check for " to " followed by a non-verb (the old bug)
    # e.g., "I to like this" - this shouldn't happen after the fix
    patterns = [
        (r'\bI to \w+', "I to {verb} pattern"),
        (r'\bHe to \w+', "He to {verb} pattern"),
        (r'\bShe to \w+', "She to {verb} pattern"),
        (r'\bWe to \w+', "We to {verb} pattern"),
        (r'\bThey to \w+', "They to {verb} pattern"),
        (r'\bYou to \w+', "You to {verb} pattern"),
        (r'\bIt to \w+', "It to {verb} pattern"),
    ]
    for pat, desc in patterns:
        if re.search(pat, sent_en):
            return False, f"'to ' bug detected: '{desc}' in '{sent_en}'"
    return True, None


def check_conjugation(sent_en):
    """Check for bad verb conjugations like 'studys', 'fixs', 'watchs'."""
    # Match words ending in 'ys', 'ss', 'shs', 'chs' (bad third-person singular)
    bad_verb = re.findall(r'\b\w+[^aeiou]ys\b', sent_en, re.IGNORECASE)
    # Filter out common valid words
    valid = {'always', 'says', 'pays', 'lays', 'plays', 'stays', 'prays',
             'prays', 'delays', 'displays'}
    for bv in bad_verb:
        if bv.lower() not in valid:
            return False, f"Bad conjugation: '{bv}' in '{sent_en}'"
    
    # Check for 's at end like "fixs", "watchs" (should be "fixes", "watches")
    bad_s = re.findall(r'\b\w+[csgk]s\b', sent_en, re.IGNORECASE)
    for bs in bad_s:
        if bs.lower() not in valid and not bs.lower().endswith('ss'):
            return False, f"Bad conjugation: '{bs}' in '{sent_en}'"
    
    return True, None


def check_en_has_word_context(en_word, sent_en):
    """Check the English sentence has some relation to the English definition."""
    if not en_word or not sent_en:
        return None, None  # Skip - no data to compare
    
    # Take the primary meaning (before first comma)
    primary = en_word.split(',')[0].strip().lower()
    # Remove "to " prefix
    if primary.startswith('to '):
        primary = primary[3:]
    
    # Check if the primary meaning word appears in sent_en
    # Also check for synonyms or related words
    sent_lower = sent_en.lower()
    
    # For short primary words (1-3 chars), only check exact match
    if len(primary) <= 3:
        words_in_sent = sent_lower.split()
        if primary not in words_in_sent:
            # May be a function word or abstract - hard to verify
            return None, None
        return True, None
    
    # For longer words, check if the primary meaning is contained (word boundary)
    if re.search(r'\b' + re.escape(primary) + r'\b', sent_lower):
        return True, None
    
    # Special case: the word might be a particle/conjunction that wouldn't appear directly
    # e.g., "虽然" → "although" → sentence "Although it rained, he went out."
    # The word "although" appears in the sentence
    # But for very common words, the word itself might not appear
    # e.g., "to be" → the primary is "be" which is very common
    
    # If the primary is a very short common word, relax the check
    very_common = {'be', 'do', 'go', 'come', 'see', 'get', 'make', 'take',
                   'have', 'say', 'know', 'think', 'want', 'put', 'set',
                   'a', 'an', 'the', 'is', 'are', 'was', 'were', 'been',
                   'can', 'may', 'must', 'will', 'shall', 'could', 'would'}
    if primary in very_common:
        return None, None  # Skip - too hard to verify
    
    return False, f"Primary meaning '{primary}' not found in sent_en: '{sent_en}'"


def check_zh_grammar(ch, zh, detected_type):
    """Basic Chinese grammar check - does the sentence structure match the word type."""
    # Skip curated sentences - they're known to be correct
    if ch in CUSTOM:
        return None, None
    
    # Check zh has proper Chinese punctuation
    if zh and zh[-1] not in '。？！，；：、！？。，':
        return False, f"Chinese sentence missing proper punctuation: '{zh}'"
    
    return True, None


def classify_template(zh, ch):
    """Try to classify which template a zh sentence came from based on pattern.
    Returns a list of all matching types (a template may belong to multiple types)."""
    if not zh:
        return []
    matching = []
    for type_name, templates in ALL_TEMPLATES.items():
        for t in templates:
            pattern = t.replace('{w}', ch)
            if zh == pattern:
                matching.append(type_name)
    return matching


def check_template_type_match(detected_type, zh, ch):
    """Check if the implied template type matches the detected word type."""
    if ch in CUSTOM:
        return None, None  # Skip curated - known correct
    
    if not zh:
        return None, None
    
    inferred_types = classify_template(zh, ch)
    if not inferred_types:
        return None, None  # Can't classify - might be curated or different format
    
    if detected_type not in inferred_types:
        return False, f"Template type(s) {inferred_types} used but word classified as '{detected_type}'"
    
    return True, None


# ──────────────────────────────────────────────
#  MAIN VALIDATOR
# ──────────────────────────────────────────────

def validate_all():
    """Validate ALL sentences across all HSK files."""
    files = glob.glob('characters_hsk*.json') + glob.glob('characters_hsk20_*.json')
    files.sort()
    
    results = {
        'total_words': 0,
        'has_zh_en': 0,
        'curated': 0,
        'template_generated': 0,
        'missing_zh_or_en': 0,
        'issues': [],
        'by_course': {},
        'by_type': {},
        'by_severity': {'critical': [], 'major': [], 'minor': [], 'info': []},
    }
    
    for fname in files:
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        course = data['course']
        course_data = {
            'total': len(data['words']),
            'has_zh_en': 0,
            'missing': 0,
            'curated': 0,
            'templated': 0,
            'issues': 0,
        }
        
        for w in data['words']:
            ch = w['ch']
            results['total_words'] += 1
            
            zh = w.get('zh', '')
            sent_en = w.get('sent_en', '')
            en = w.get('en', '')
            en_full = w.get('en_full', en)
            
            if not zh or not sent_en:
                course_data['missing'] += 1
                results['missing_zh_or_en'] += 1
                continue
            
            course_data['has_zh_en'] += 1
            results['has_zh_en'] += 1
            
            is_curated = ch in CUSTOM
            if is_curated:
                course_data['curated'] += 1
                results['curated'] += 1
            else:
                course_data['templated'] += 1
                results['template_generated'] += 1
            
            detected_type = detect_word_type(ch, en, en_full)
            results['by_type'][detected_type] = results['by_type'].get(detected_type, 0) + 1
            
            word_issues = []
            
            # ── Check 1: Chinese sentence contains the character ──
            ok, msg = check_zh_contains_char(ch, zh)
            if not ok:
                word_issues.append(('critical', f"CHAR NOT IN ZH: {msg}"))
            
            # ── Check 2: Template artifacts ──
            ok, msg = check_template_artifact(zh, sent_en)
            if not ok:
                word_issues.append(('critical', msg))
            
            # ── Check 3: 'to ' bug ──
            ok, msg = check_to_bug(sent_en)
            if not ok:
                word_issues.append(('critical', msg))
            
            # ── Check 4: Bad verb conjugation ──
            ok, msg = check_conjugation(sent_en)
            if not ok:
                word_issues.append(('major', msg))
            
            # ── Check 5: English context match ──
            ok, msg = check_en_has_word_context(en, sent_en)
            if ok is False:  # Only flag explicit failures
                word_issues.append(('major', msg))
            
            # ── Check 6: Template type match ──
            ok, msg = check_template_type_match(detected_type, zh, ch)
            if ok is False:
                word_issues.append(('major', 
                    f"TYPE MISMATCH for '{ch}': detected as '{detected_type}' but zh matches different template type. {msg}"))
            
            # ── Check 7: Chinese grammar (template-generated only) ──
            ok, msg = check_zh_grammar(ch, zh, detected_type)
            if ok is False:
                word_issues.append(('minor', msg))
            
            # ── Log issues ──
            for severity, msg in word_issues:
                issue = {
                    'course': course,
                    'ch': ch,
                    'en': en[:60],
                    'zh': zh,
                    'sent_en': sent_en[:80],
                    'detected_type': detected_type,
                    'is_curated': is_curated,
                    'severity': severity,
                    'message': msg,
                }
                results['issues'].append(issue)
                results['by_severity'][severity].append(issue)
                course_data['issues'] += 1
        
        results['by_course'][course] = course_data
    
    return results


def print_report(results):
    """Print a formatted report of the validation results."""
    
    print(f"{'='*70}")
    print(f"VALIDATION REPORT")
    print(f"{'='*70}")
    print(f"\nOverall stats:")
    print(f"  Total words checked:  {results['total_words']}")
    print(f"  Have zh + sent_en:    {results['has_zh_en']}")
    print(f"  Missing zh or sent_en: {results['missing_zh_or_en']}")
    print(f"  Curated sentences:    {results['curated']}")
    print(f"  Template-generated:   {results['template_generated']}")
    
    print(f"\n  Total issues found:   {len(results['issues'])}")
    print(f"    Critical: {len(results['by_severity']['critical'])}")
    print(f"    Major:    {len(results['by_severity']['major'])}")
    print(f"    Minor:    {len(results['by_severity']['minor'])}")
    print(f"    Info:     {len(results['by_severity']['info'])}")
    
    # Per-type breakdown
    print(f"\n{'─'*70}")
    print(f"By detected type:")
    for type_name, count in sorted(results['by_type'].items(), key=lambda x: -x[1]):
        print(f"  {type_name:16s}: {count}")
    
    # Per-course breakdown
    print(f"\n{'─'*70}")
    print(f"By course:")
    print(f"  {'Course':12s} {'Total':>6s} {'Have':>6s} {'Miss':>6s} {'Curated':>8s} {'Tmpl':>6s} {'Issues':>7s}")
    print(f"  {'─'*12} {'─'*6} {'─'*6} {'─'*6} {'─'*8} {'─'*6} {'─'*7}")
    for course, cd in sorted(results['by_course'].items()):
        print(f"  {course:12s} {cd['total']:6d} {cd['has_zh_en']:6d} {cd['missing']:6d} "
              f"{cd['curated']:8d} {cd['templated']:6d} {cd['issues']:7d}")
    
    # ── Critical Issues ──
    if results['by_severity']['critical']:
        print(f"\n{'!'*70}")
        print(f"CRITICAL ISSUES ({len(results['by_severity']['critical'])})")
        print(f"{'!'*70}")
        for iss in results['by_severity']['critical'][:20]:
            print(f"\n  [{iss['course']}] {iss['ch']} ({iss['en'][:40]})")
            print(f"    zh: {iss['zh'][:60]}")
            print(f"    en: {iss['sent_en'][:60]}")
            print(f"    → {iss['message']}")
        if len(results['by_severity']['critical']) > 20:
            print(f"\n  ... and {len(results['by_severity']['critical']) - 20} more critical issues")
    
    # ── Major Issues ──
    if results['by_severity']['major']:
        print(f"\n{'─'*70}")
        print(f"MAJOR ISSUES ({len(results['by_severity']['major'])})")
        print(f"{'─'*70}")
        for iss in results['by_severity']['major'][:30]:
            print(f"\n  [{iss['course']}] {iss['ch']} ({iss['en'][:40]})")
            print(f"    zh: {iss['zh'][:60]}")
            print(f"    en: {iss['sent_en'][:60]}")
            print(f"    → {iss['message']}")
        if len(results['by_severity']['major']) > 30:
            print(f"\n  ... and {len(results['by_severity']['major']) - 30} more major issues")
    
    # ── Minor Issues ──
    if results['by_severity']['minor']:
        print(f"\n{'─'*70}")
        print(f"MINOR ISSUES ({len(results['by_severity']['minor'])})")
        print(f"{'─'*70}")
        for iss in results['by_severity']['minor'][:20]:
            print(f"\n  [{iss['course']}] {iss['ch']}")
            print(f"    → {iss['message']}")
        if len(results['by_severity']['minor']) > 20:
            print(f"\n  ... and {len(results['by_severity']['minor']) - 20} more minor issues")
    
    # ── Summary ──
    print(f"\n{'='*70}")
    print(f"SUMMARY")
    print(f"{'='*70}")
    if results['by_severity']['critical'] == 0 and results['by_severity']['major'] == 0:
        print(f"  ✅ All checks passed! No critical or major issues found.")
    elif results['by_severity']['critical'] == 0:
        print(f"  ⚠️  No critical issues, but {len(results['by_severity']['major'])} major issues found.")
    else:
        print(f"  ❌ {len(results['by_severity']['critical'])} critical and {len(results['by_severity']['major'])} major issues found.")
    
    return results


if __name__ == '__main__':
    results = validate_all()
    print_report(results)
    
    # Save detailed results to JSON for analysis
    with open('scripts/validation_results.json', 'w', encoding='utf-8') as f:
        # Keep only the issue list for the JSON (compact format)
        json.dump({
            'summary': {
                'total_words': results['total_words'],
                'has_zh_en': results['has_zh_en'],
                'missing': results['missing_zh_or_en'],
                'curated': results['curated'],
                'templated': results['template_generated'],
                'critical': len(results['by_severity']['critical']),
                'major': len(results['by_severity']['major']),
                'minor': len(results['by_severity']['minor']),
                'info': len(results['by_severity']['info']),
                'total_issues': len(results['issues']),
            },
            'issues': results['issues'],
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\nDetailed results saved to scripts/validation_results.json")
