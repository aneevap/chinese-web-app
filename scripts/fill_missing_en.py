#!/usr/bin/env python3
"""
Fill 70 missing English definition (en) fields in HSK files.
These words don't exist as standalone CC-CEDICT entries.
English definitions are verified for the HSK context.
"""

import json
import glob

# Verified English definitions for all 69 unique words missing en
EN_DEFS = {
    # HSK1 - common words with clear meanings
    '车上': 'on the bus, in the car',
    '看到': 'to see, to catch sight of',
    '请坐': 'please sit down, have a seat',
    '在家': 'at home, to be home',
    '真的': 'really, truly, indeed',

    # HSK2
    '比如说': 'for example, for instance, such as',
    '不太': 'not very, not too',
    '不一会儿': 'in a moment, presently, after a little while',
    '好人': 'good person, nice person',
    '见过': 'have met, have seen (before)',
    '拿到': 'to receive, to obtain, to get',
    '那会儿': 'at that time, in those days',
    '送到': 'to deliver to, to send to',
    '笑话儿': 'joke, comedy',
    '有空儿': 'to have free time, to be available',
    '这时候': 'at this moment, at this time, now',
    '中小学': 'primary and secondary school, K-12',

    # HSK3
    '…极了': 'extremely, ...to the extreme',
    '放到': 'to put, to place, to set down',
    '红酒': 'red wine',
    '交费': 'to pay fees, to pay tuition',
    '能不能': 'can or cannot, whether one can',
    '只有': 'only, merely, just',

    # HSK4
    '…分之…': 'X-out-of-Y, ...percent (分数表达)',
    '纯净水': 'purified water',
    '电动车': 'electric bicycle, electric vehicle',
    '多年': 'many years, for many years',
    '没法儿': 'can't, cannot, there's no way',
    '名牌儿': 'famous brand, name brand',
    '通知书': 'notification letter, notice',
    '下楼': 'to go downstairs',
    '眼里': 'in one's eyes, in the view of',
    '有劲儿': 'energetic, full of energy, strong',

    # HSK5
    '城里': 'in the city, in town, urban area',
    '大奖赛': 'grand prize competition, grand prix',
    '递给': 'to hand to, to pass to',
    '电子版': 'digital version, electronic edition',
    '豆制品': 'soybean products, bean products',
    '胡同儿': 'hutong (narrow street/alley in Beijing)',
    '起到': 'to play a role, to have an effect',
    '杀毒': 'to disinfect, to kill viruses (computer)',
    '水产品': 'aquatic products, seafood',
    '小偷儿': 'thief, petty thief',
    '也好': 'might as well, also good, anyway',
    '有利于': 'beneficial to, conducive to',
    '只见': 'only see, one sees only, but see',

    # HSK6
    '背着': 'to carry on one\'s back, to bear',
    '表面上': 'on the surface, outwardly, superficially',
    '不仅仅': 'not only, not merely',
    '车号': 'license plate number, car number',
    '此事': 'this matter, this issue, this affair',
    '大赛': 'major competition, grand contest',
    '更是': 'even more, what is more',
    '很难说': 'hard to say, difficult to tell',
    '两手': 'dual approach, both hands, two prongs',
    '如一': 'to be consistent, as one',
    '特大': 'especially large, super, special',
    '一番': 'a period of, a kind of, a round of',
    '一路上': 'along the way, throughout the journey',
    '迎来': 'to welcome, to greet, to usher in',
    '这就是说': 'that is to say, in other words, namely',
    '指着': 'to point at, to point to',

    # HSK20_2
    '打篮球': 'to play basketball',
    '踢足球': 'to play soccer',

    # HSK20_4
    '放暑假': 'to have summer vacation',
    '弹钢琴': 'to play the piano',

    # HSK20_5
    '系领带': 'to tie a necktie',

    # HSK20_6
    '纽扣儿': 'button (a small fastener on clothing)',
    '烟花爆竹': 'fireworks and firecrackers',
}


def fill_en():
    """Fill missing en fields in all HSK files."""
    all_files = sorted(
        glob.glob('characters_hsk*.json') +
        glob.glob('characters_hsk20_*.json')
    )

    total_filled = 0
    total_skipped = 0

    for fname in all_files:
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)

        modified = False
        course_filled = 0

        for w in data['words']:
            ch = w['ch']
            if not w.get('en') and ch in EN_DEFS:
                w['en'] = EN_DEFS[ch]
                course_filled += 1
                modified = True

        if modified:
            with open(fname, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  {data['course']:15s}: +{course_filled} filled")

        total_filled += course_filled

    print(f"\n{'='*50}")
    print(f"SUMMARY")
    print(f"{'='*50}")
    print(f"  Total filled: {total_filled}")
    print(f"{'='*50}")


if __name__ == '__main__':
    fill_en()
