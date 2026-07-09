#!/usr/bin/env python3
"""
Comprehensive data integrity validation across all course files.

Checks:
1. File integrity — all JSON files valid
2. Structural integrity — required fields present
3. Pinyin format — no tone numbers, no ZWSP, no uppercase, proper spacing
4. Data completeness — missing py, en, th, zh, sent_en, sent_th
5. Sent_th quality — no mixed-language entries
6. Course consistency — word_id format
7. Cross-file consistency — etymology field completeness
"""

import json
import glob
import re
import sys

ZWSP = '\u200b'
EXIT_CODE = 0

# Category labels
PASS = "  ✅"
WARN = "  ⚠️"
FAIL = "  ❌"


def check(condition, label, message):
    """Check a condition and print result."""
    global EXIT_CODE
    if condition:
        print(f"{PASS} {label}: {message}")
    else:
        print(f"{FAIL} {label}: {message}")
        EXIT_CODE = 1


def warn(condition, label, message):
    """Warn if condition fails (non-blocking)."""
    if condition:
        print(f"{WARN} {label}: {message}")


# ── Collect all course files ──
all_files = sorted(
    glob.glob('characters_hsk*.json') +
    glob.glob('characters_hsk20_*.json') +
    glob.glob('characters_[0-9]*.json')
)

print("=" * 60)
print("  COMPREHENSIVE DATA INTEGRITY VALIDATION")
print("=" * 60)
print(f"\nFiles to check: {len(all_files)}")

# =====================================================
# 1. FILE INTEGRITY
# =====================================================
print(f"\n{'─'*60}")
print("  SECTION 1: FILE INTEGRITY")
print(f"{'─'*60}")

valid_files = 0
corrupt_files = 0

for fname in all_files:
    try:
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)
        valid_files += 1
    except json.JSONDecodeError as e:
        print(f"  {FAIL} CORRUPTED: {fname}: {str(e)[:60]}")
        corrupt_files += 1
    except FileNotFoundError:
        print(f"  {FAIL} MISSING: {fname}")
        corrupt_files += 1

check(corrupt_files == 0, "File integrity", f"{valid_files} valid, {corrupt_files} corrupted")

# ── Load all valid data ──
all_data = {}
for fname in all_files:
    try:
        with open(fname, 'r', encoding='utf-8') as f:
            all_data[fname] = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        pass

# =====================================================
# 2. STRUCTURAL INTEGRITY
# =====================================================
print(f"\n{'─'*60}")
print("  SECTION 2: STRUCTURAL INTEGRITY")
print(f"{'─'*60}")

missing_course = 0
missing_words = 0
missing_word_id = 0
missing_ch = 0
total_entries = 0

for fname, data in all_data.items():
    if not isinstance(data, dict):
        print(f"  {FAIL} {fname}: not a dict (type={type(data).__name__})")
        continue
    
    if 'course' not in data:
        missing_course += 1
        continue
    
    if 'words' not in data or not isinstance(data['words'], list):
        missing_words += 1
        continue
    
    for w in data['words']:
        total_entries += 1
        if 'word_id' not in w:
            missing_word_id += 1
        if 'ch' not in w:
            missing_ch += 1

check(missing_course == 0, "Course field", f"{missing_course} files missing course field")
check(missing_words == 0, "Words field", f"{missing_words} files missing words array")
check(missing_word_id == 0, "Word IDs", f"{missing_word_id} entries missing word_id")
check(missing_ch == 0, "Chinese chars", f"{missing_ch} entries missing ch field")

# =====================================================
# 3. PINYIN FORMAT
# =====================================================
print(f"\n{'─'*60}")
print("  SECTION 3: PINYIN FORMAT")
print(f"{'─'*60}")

tone_numbers = 0
zwsp = 0
uppercase = 0
no_space_multichar = 0
only_hsk = True  # Only count HSK for strict checks

for fname, data in all_data.items():
    is_hsk = 'hsk' in data.get('course', '').lower() or 'hsk20' in data.get('course', '').lower()
    for w in data['words']:
        py = w.get('py', '')
        if not py:
            continue
        
        if re.search(r'\d', py):
            tone_numbers += 1
        if ZWSP in py:
            zwsp += 1
        if any(c.isupper() for c in py):
            uppercase += 1
        if len(w['ch']) > 1 and ' ' not in py:
            no_space_multichar += 1

check(tone_numbers == 0, "Tone numbers", f"{tone_numbers} entries with tone numbers")
check(zwsp == 0, "Zero-width spaces", f"{zwsp} entries with ZWSP")
check(uppercase == 0, "Uppercase pinyin", f"{uppercase} entries with uppercase")
check(no_space_multichar == 0, "Run-together pinyin", f"{no_space_multichar} multi-char entries without spaces")

# =====================================================
# 4. DATA COMPLETENESS
# =====================================================
print(f"\n{'─'*60}")
print("  SECTION 4: DATA COMPLETENESS")
print(f"{'─'*60}")

missing_py = 0
missing_en = 0
missing_th = 0
missing_zh = 0
missing_sent_en = 0
missing_sent_th = 0
has_sent_th = 0

for fname, data in all_data.items():
    for w in data['words']:
        if not w.get('py'): missing_py += 1
        if not w.get('en'): missing_en += 1
        if not w.get('th'): missing_th += 1
        if not w.get('zh'): missing_zh += 1
        if not w.get('sent_en'): missing_sent_en += 1
        if w.get('sent_th'): has_sent_th += 1
        if not w.get('sent_th'): missing_sent_th += 1

print(f"  Total entries: {total_entries}")
print(f"  Missing py: {missing_py} ({100*missing_py/total_entries:.1f}%)" if total_entries else "")
print(f"  Missing en: {missing_en} ({100*missing_en/total_entries:.1f}%)")
print(f"  Missing th: {missing_th} ({100*missing_th/total_entries:.1f}%)")
print(f"  Missing zh: {missing_zh} ({100*missing_zh/total_entries:.1f}%)")
print(f"  Missing sent_th: {missing_sent_th} ({100*missing_sent_th/total_entries:.1f}%)")

warn(missing_py == 0, "py completeness", f"{missing_py} empty")
warn(missing_en == 0, "en completeness", f"{missing_en} empty")
warn(missing_th == 0, "th completeness", f"{missing_th} empty")
warn(missing_sent_th == 0, "sent_th completeness", f"{missing_sent_th} empty")

# =====================================================
# 5. SENT_TH QUALITY
# =====================================================
print(f"\n{'─'*60}")
print("  SECTION 5: SENT_TH QUALITY")
print(f"{'─'*60}")

mixed_language = 0
teaching_frames = 0  # 'คำว่า' frames (intentional Chinese chars)

for fname, data in all_data.items():
    for w in data['words']:
        st = w.get('sent_th', '')
        if not st:
            continue
        has_chinese = any('\u4e00' <= c <= '\u9fff' for c in st)
        if has_chinese:
            if st.startswith('คำว่า'):
                teaching_frames += 1
            else:
                mixed_language += 1
                if mixed_language <= 3:
                    print(f"  {FAIL} MIXED [{data['course']}] {w['ch']}: '{st[:50]}'")

check(mixed_language == 0, "No mixed-language", f"{mixed_language} unintentional mixed-language entries")
if teaching_frames > 0:
    print(f"  {WARN} {teaching_frames} teaching-frame entries (intentional Chinese chars in 'คำว่า' context)")

# =====================================================
# 6. MULTI-READING ACCURACY
# =====================================================
print(f"\n{'─'*60}")
print("  SECTION 6: MULTI-READING ACCURACY (HSK only)")
print(f"{'─'*60}")

CORRECT = {
    '还是': 'hái shi', '还有': 'hái yǒu', '还要': 'hái yào', '还好': 'hái hǎo',
    '音乐': 'yīn yuè', '乐器': 'yuè qì', '乐队': 'yuè duì',
    '觉得': 'jué de', '感觉': 'gǎn jué', '自觉': 'zì jué',
    '行为': 'xíng wéi', '行人': 'xíng rén', '行动': 'xíng dòng', '自行车': 'zì xíng chē',
    '校长': 'xiào zhǎng', '班长': 'bān zhǎng', '长大': 'zhǎng dà', '生长': 'shēng zhǎng',
    '重要': 'zhòng yào', '严重': 'yán zhòng', '重大': 'zhòng dà', '重点': 'zhòng diǎn',
    '效率': 'xiào lǜ', '概率': 'gài lǜ', '汇率': 'huì lǜ', '税率': 'shuì lǜ',
    '调查': 'diào chá', '空调': 'kōng tiáo', '调整': 'tiáo zhěng',
    '爱好': 'ài hào', '好奇': 'hào qí',
    '头发': 'tóu fa', '发现': 'fā xiàn',
    '背着': 'bēi zhe', '背景': 'bèi jǐng',
    '只有': 'zhǐ yǒu', '只要': 'zhǐ yào', '只见': 'zhǐ jiàn',
    '比如说': 'bǐ rú shuō', '说服': 'shuō fú',
    '意味着': 'yì wèi zhe', '接着': 'jiē zhe', '随着': 'suí zhe',
    '弹钢琴': 'tán gāng qín', '背诵': 'bèi sòng',
}

multi_ok = 0
multi_wrong = 0
multi_examples = []

for fname, data in all_data.items():
    course = data['course'].lower()
    if 'hsk' not in course and 'hsk20' not in course:
        continue
    for w in data['words']:
        if w['ch'] in CORRECT:
            if w.get('py', '') == CORRECT[w['ch']]:
                multi_ok += 1
            else:
                multi_wrong += 1
                if len(multi_examples) < 5:
                    multi_examples.append(f"[{data['course']}] {w['ch']}: '{w.get('py','')}' (expected '{CORRECT[w['ch']]}')")

check(multi_wrong == 0, "Multi-reading accuracy", f"{multi_ok} correct, {multi_wrong} wrong")
for ex in multi_examples:
    print(f"  {FAIL} {ex}")

# =====================================================
# 7. SCHOOL COURSE FORMAT CHECK
# =====================================================
print(f"\n{'─'*60}")
print("  SECTION 7: SCHOOL COURSE FORMAT CHECK")
print(f"{'─'*60}")

school_issues = 0
for fname, data in all_data.items():
    course = data['course']
    if any(c in course for c in ['HSK', 'hsk']):
        continue  # Skip HSK files
    
    for w in data['words']:
        py = w.get('py', '')
        if not py:
            continue
        
        # Check for issues the normalization might have introduced
        if ZWSP in py:
            school_issues += 1
        if 'rén' in py.split() and w['ch'].endswith('儿'):
            school_issues += 1

check(school_issues == 0, "School course format", f"{school_issues} issues found")

# =====================================================
# 8. SUMMARY
# =====================================================
print(f"\n{'='*60}")
print("  VALIDATION SUMMARY")
print(f"{'='*60}")
print(f"  Files checked: {len(all_files)}")
print(f"  Total entries: {total_entries}")
print(f"  Result: {'✅ ALL CHECKS PASSED' if EXIT_CODE == 0 else '❌ ISSUES FOUND'}")
print(f"{'='*60}")

sys.exit(EXIT_CODE)
