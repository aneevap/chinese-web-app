#!/usr/bin/env python3
"""
Fix multi-reading character pinyin that got wrong readings from CC-CEDICT's
first-entry-per-character fallback.

All pinyin values are verified correct for the HSK context.
"""

import json
import glob

# Correct readings for multi-reading characters in HSK context
# Keyed by Chinese word, value = correct pinyin (tone marks, lowercase, spaced)
CORRECT = {
    # 还 (hái=still, huán=return) — most HSK uses hái
    '还是': 'hái shi',
    '还有': 'hái yǒu',
    '还要': 'hái yào',
    '还好': 'hái hǎo',
    '还在': 'hái zài',

    # 着 (zhe=particle, zháo=touch) — particle is most common in HSK
    '忙着': 'máng zhe',
    '跟着': 'gēn zhe',
    '沿着': 'yán zhe',
    '接着': 'jiē zhe',
    '随着': 'suí zhe',
    '朝着': 'cháo zhe',
    '意味着': 'yì wèi zhe',
    '本着': 'běn zhe',
    '背着': 'bēi zhe',
    '朝着': 'cháo zhe',

    # 乐 (lè=happy, yuè=music)
    '快乐': 'kuài lè',
    '欢乐': 'huān lè',
    '音乐': 'yīn yuè',
    '乐器': 'yuè qì',
    '乐队': 'yuè duì',

    # 觉 (jué=feel, jiào=sleep)
    '觉得': 'jué de',
    '感觉': 'gǎn jué',
    '自觉': 'zì jué',

    # 行 (xíng=walk/OK, háng=profession)
    '银行': 'yín háng',
    '行业': 'háng yè',
    '行人': 'xíng rén',
    '行动': 'xíng dòng',
    '行为': 'xíng wéi',
    '自行车': 'zì xíng chē',

    # 长 (cháng=long, zhǎng=grow/leader)
    '长大': 'zhǎng dà',
    '校长': 'xiào zhǎng',
    '班长': 'bān zhǎng',
    '生长': 'shēng zhǎng',
    '长跑': 'cháng pǎo',
    '长': 'cháng',

    # 重 (zhòng=heavy, chóng=repeat)
    '重要': 'zhòng yào',
    '严重': 'yán zhòng',
    '重新': 'chóng xīn',
    '重复': 'chóng fù',
    '重大': 'zhòng dà',
    '重点': 'zhòng diǎn',

    # 率 (lǜ=rate, shuài=lead)
    '效率': 'xiào lǜ',
    '概率': 'gài lǜ',
    '汇率': 'huì lǜ',
    '税率': 'shuì lǜ',

    # 弹 (dàn=bullet, tán=play instrument)
    '弹钢琴': 'tán gāng qín',
    '弹吉他': 'tán jí tā',

    # 背 (bèi=back, bēi=carry on back)
    '背景': 'bèi jǐng',
    '背诵': 'bèi sòng',
    '背心': 'bèi xīn',
    '背后': 'bèi hòu',

    # 调 (diào=tone, tiáo=adjust)
    '调查': 'diào chá',
    '空调': 'kōng tiáo',
    '调整': 'tiáo zhěng',

    # 好 (hǎo=good, hào=like)
    '好奇': 'hào qí',
    '爱好': 'ài hào',

    # 发 (fā=send, fà=hair)
    '发现': 'fā xiàn',
    '头发': 'tóu fa',
    '发展': 'fā zhǎn',
    '发生': 'fā shēng',

    # 只 (zhī=measure, zhǐ=only)
    '只有': 'zhǐ yǒu',
    '只要': 'zhǐ yào',
    '只见': 'zhǐ jiàn',
    '只是': 'zhǐ shì',
    '只能': 'zhǐ néng',
    '只好': 'zhǐ hǎo',

    # 说 (shuō=speak, shuì=persuade)
    '比如说': 'bǐ rú shuō',
    '说服': 'shuō fú',
    '说话': 'shuō huà',
    '说明': 'shuō míng',
}


def fix_multi_reading():
    """Fix multi-reading pinyin in all HSK course files."""
    all_files = sorted(
        glob.glob('characters_hsk*.json') +
        glob.glob('characters_hsk20_*.json') +
        glob.glob('characters_[0-9]*.json')
    )

    total_fixed = 0
    total_checked = 0

    for fname in all_files:
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)

        modified = False
        course_fixed = 0

        for w in data['words']:
            ch = w['ch']
            if ch not in CORRECT:
                continue

            total_checked += 1
            current = w.get('py', '')
            expected = CORRECT[ch]

            if current != expected:
                w['py'] = expected
                course_fixed += 1
                modified = True

        if modified:
            with open(fname, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  {data['course']:15s}: +{course_fixed} fixed")

        total_fixed += course_fixed

    print(f"\n{'='*50}")
    print(f"SUMMARY")
    print(f"{'='*50}")
    print(f"  Words checked: {total_checked}")
    print(f"  Entries fixed: {total_fixed}")
    print(f"{'='*50}")


if __name__ == '__main__':
    fix_multi_reading()
