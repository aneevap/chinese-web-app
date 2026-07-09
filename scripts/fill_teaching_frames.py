#!/usr/bin/env python3
"""
Replace all 37 teaching-frame 'คำว่า ...' placeholders with proper Thai content.

Each entry gets:
- en: English definition
- th: Thai definition  
- zh: Chinese example sentence
- sent_en: English translation of example
- sent_th: Proper Thai translation (replaces คำว่า ... placeholder)
"""

import json

# ── Pinyin fixes for entries with corrupted tone/reading errors ──
PINYIN_FIXES = {
    '放暑假': 'fàng shǔ jià',      # was fàng shǔ gēi
    '一番': 'yī fān',               # was yī pān
    '这就是说': 'zhè jiù shì shuō',   # was zhè jiù shì shuì
    '表面上': 'biǎo miàn shàng',     # was biǎo miàn shǎng (wrong tone)
    '一路上': 'yī lù shàng',         # was yī lù shǎng (wrong tone)
}

# ── Teaching frame data: en, th, zh, sent_en, sent_th ──
ENTRIES = {
    '比如说': {
        'en': 'for example, for instance, such as',
        'th': 'ยกตัวอย่างเช่น, เช่น',
        'zh': '我喜欢吃水果，比如说苹果和香蕉。',
        'sent_en': 'I like eating fruit, for example, apples and bananas.',
        'sent_th': 'ฉันชอบกินผลไม้ ยกตัวอย่างเช่น แอปเปิ้ลและกล้วย',
    },
    '不一会儿': {
        'en': 'after a while, in a moment, presently',
        'th': 'แป๊บเดียว, ไม่ช้า',
        'zh': '不一会儿，他就回来了。',
        'sent_en': 'After a while, he came back.',
        'sent_th': 'แป๊บเดียว เขาก็กลับมาแล้ว',
    },
    '那会儿': {
        'en': 'at that time, in those days',
        'th': 'ตอนนั้น, สมัยนั้น',
        'zh': '那会儿我还小，不懂事。',
        'sent_en': 'At that time, I was still young and didn\'t understand things.',
        'sent_th': 'ตอนนั้นฉันยังเด็ก ไม่รู้เรื่อง',
    },
    '笑话儿': {
        'en': 'joke, funny story',
        'th': 'มุกตลก, เรื่องตลก',
        'zh': '他讲了一个笑话儿，大家都笑了。',
        'sent_en': 'He told a joke and everyone laughed.',
        'sent_th': 'เขาเล่ามุกตลกมา ทุกคนหัวเราะกันใหญ่',
    },
    '有空儿': {
        'en': 'to have free time, to be available',
        'th': 'ว่าง, มีเวลา',
        'zh': '你有空儿的时候，我们一起去玩吧。',
        'sent_en': 'When you have free time, let\'s go play together.',
        'sent_th': 'ตอนคุณว่าง เราไปเที่ยวด้วยกันนะ',
    },
    '中小学': {
        'en': 'primary and secondary school, K-12',
        'th': 'โรงเรียนประถมและมัธยม',
        'zh': '他是一名中小学教师。',
        'sent_en': 'He is a primary and secondary school teacher.',
        'sent_th': 'เขาเป็นครูสอนระดับประถมและมัธยม',
    },
    '交费': {
        'en': 'to pay fees, to pay tuition',
        'th': 'จ่ายค่าธรรมเนียม, จ่ายค่าเล่าเรียน',
        'zh': '每学期开学前都要去交费。',
        'sent_en': 'We have to pay the fees before each semester starts.',
        'sent_th': 'ต้องไปจ่ายค่าธรรมเนียมก่อนเปิดเทอมทุกครั้ง',
    },
    '纯净水': {
        'en': 'purified water',
        'th': 'น้ำดื่มบริสุทธิ์',
        'zh': '请给我一瓶纯净水。',
        'sent_en': 'Please give me a bottle of purified water.',
        'sent_th': 'ขอน้ำดื่มบริสุทธิ์หนึ่งขวดครับ',
    },
    '电动车': {
        'en': 'electric bicycle, electric vehicle',
        'th': 'รถไฟฟ้า, จักรยานไฟฟ้า',
        'zh': '他每天骑电动车上班。',
        'sent_en': 'He rides an electric bike to work every day.',
        'sent_th': 'เขาขี่รถไฟฟ้าไปทำงานทุกวัน',
    },
    '没法儿': {
        'en': 'can\'t, cannot, there\'s no way',
        'th': 'ทำไม่ได้, ไม่มีทาง',
        'zh': '这事儿太难了，我没法儿一个人做完。',
        'sent_en': 'This is too difficult, there\'s no way I can finish it alone.',
        'sent_th': 'เรื่องนี้ยากเกินไป ฉันทำคนเดียวไม่ได้',
    },
    '名牌儿': {
        'en': 'famous brand, name brand',
        'th': 'แบรนด์เนม, สินค้าแบรนด์ดัง',
        'zh': '她喜欢买名牌儿包。',
        'sent_en': 'She likes to buy name brand bags.',
        'sent_th': 'เธอชอบซื้อกระเป๋าแบรนด์เนม',
    },
    '通知书': {
        'en': 'notification letter, notice',
        'th': 'หนังสือแจ้ง, หนังสือแจ้งเตือน',
        'zh': '我收到了学校的录取通知书。',
        'sent_en': 'I received the admission notice from the school.',
        'sent_th': 'ฉันได้รับหนังสือแจ้งผลการสอบจากโรงเรียน',
    },
    '下楼': {
        'en': 'to go downstairs',
        'th': 'ลงไปข้างล่าง, ลงบันได',
        'zh': '妈妈叫我下楼吃饭。',
        'sent_en': 'Mom called me to go downstairs to eat.',
        'sent_th': 'แม่เรียกฉันลงไปข้างล่างกินข้าว',
    },
    '有劲儿': {
        'en': 'energetic, full of energy, strong',
        'th': 'มีแรง, มีพลัง',
        'zh': '他年轻有劲儿，干活特别快。',
        'sent_en': 'He is young and energetic, working very fast.',
        'sent_th': 'เขายังหนุ่มมีแรง ทำงานได้เร็วมาก',
    },
    '大奖赛': {
        'en': 'grand prize competition, grand prix',
        'th': 'การแข่งขันชิงรางวัลใหญ่',
        'zh': '他参加了钢琴大奖赛。',
        'sent_en': 'He participated in the grand piano competition.',
        'sent_th': 'เขาเข้าร่วมการแข่งขันเปียโนชิงรางวัลใหญ่',
    },
    '电子版': {
        'en': 'digital version, electronic edition',
        'th': 'ไฟล์ดิจิทัล, ฉบับอิเล็กทรอนิกส์',
        'zh': '这本书有电子版吗？',
        'sent_en': 'Does this book have a digital version?',
        'sent_th': 'หนังสือเล่มนี้มีไฟล์ดิจิทัลไหม',
    },
    '豆制品': {
        'en': 'soybean products, bean products',
        'th': 'ผลิตภัณฑ์จากถั่วเหลือง',
        'zh': '豆制品对身体健康很有好处。',
        'sent_en': 'Soybean products are very good for your health.',
        'sent_th': 'ผลิตภัณฑ์จากถั่วเหลืองดีต่อสุขภาพมาก',
    },
    '胡同儿': {
        'en': 'hutong (narrow street/alley in Beijing)',
        'th': 'ตรอก, ตรอกเล็กในกรุงปักกิ่ง',
        'zh': '北京的胡同儿很有名。',
        'sent_en': 'Beijing\'s hutongs are very famous.',
        'sent_th': 'ตรอกในกรุงปักกิ่งมีชื่อเสียงมาก',
    },
    '杀毒': {
        'en': 'to disinfect, to kill viruses (computer)',
        'th': 'ฆ่าเชื้อ, กำจัดไวรัส',
        'zh': '电脑需要杀毒了。',
        'sent_en': 'The computer needs to be disinfected (virus removal).',
        'sent_th': 'คอมพิวเตอร์ต้องกำจัดไวรัสแล้ว',
    },
    '水产品': {
        'en': 'aquatic products, seafood',
        'th': 'อาหารทะเล, สินค้าประมง',
        'zh': '这个市场卖的水产品很新鲜。',
        'sent_en': 'The seafood sold at this market is very fresh.',
        'sent_th': 'อาหารทะเลที่ตลาดนี้สดมาก',
    },
    '小偷儿': {
        'en': 'thief, petty thief',
        'th': 'ขโมย, โจร',
        'zh': '小心小偷儿！',
        'sent_en': 'Watch out for thieves!',
        'sent_th': 'ระวังขโมยนะ',
    },
    '只见': {
        'en': 'only see, one sees only, but see',
        'th': 'เห็นเพียงแค่, ได้แต่เห็น',
        'zh': '我抬头一看，只见一只小鸟在树上。',
        'sent_en': 'I looked up and only saw a little bird on the tree.',
        'sent_th': 'ฉันเงยหน้าขึ้นไป เห็นเพียงแค่นกน้อยตัวหนึ่งบนต้นไม้',
    },
    '背着': {
        'en': 'to carry on one\'s back, to bear',
        'th': 'สะพายหลัง, แบกไว้บนหลัง',
        'zh': '他背着书包去上学。',
        'sent_en': 'He carries his backpack to school.',
        'sent_th': 'เขาสะพายกระเป๋านักเรียนไปโรงเรียน',
    },
    '表面上': {
        'en': 'on the surface, outwardly, superficially',
        'th': 'ภายนอก, ผิวเผิน',
        'zh': '他表面上看起来很开心，其实心里很难过。',
        'sent_en': 'He looked happy on the surface, but actually he was very sad inside.',
        'sent_th': 'ภายนอกเขาดูมีความสุข แต่จริงๆแล้วข้างในเสียใจมาก',
    },
    '不仅仅': {
        'en': 'not only, not merely',
        'th': 'ไม่เพียงแค่, ไม่ใช่แค่',
        'zh': '他不仅仅是个好学生，还是个好朋友。',
        'sent_en': 'He is not only a good student, but also a good friend.',
        'sent_th': 'เขาไม่เพียงแค่เป็นนักเรียนที่ดี แต่ยังเป็นเพื่อนที่ดีด้วย',
    },
    '车号': {
        'en': 'license plate number, car number',
        'th': 'ป้ายทะเบียนรถ, เลขทะเบียนรถ',
        'zh': '你能记住他的车号吗？',
        'sent_en': 'Can you remember his license plate number?',
        'sent_th': 'คุณจำป้ายทะเบียนรถเขาได้ไหม',
    },
    '大赛': {
        'en': 'major competition, grand contest',
        'th': 'การแข่งขันใหญ่',
        'zh': '他们正在准备大赛。',
        'sent_en': 'They are preparing for the major competition.',
        'sent_th': 'พวกเขากำลังเตรียมตัวสำหรับการแข่งขันใหญ่',
    },
    '两手': {
        'en': 'dual approach, both hands, two prongs',
        'th': 'สองมือ, สองแนวทาง',
        'zh': '我们要两手准备，以防万一。',
        'sent_en': 'We need to prepare both approaches, just in case.',
        'sent_th': 'เราต้องเตรียมสองแนวทางไว้ เผื่อไว้',
    },
    '特大': {
        'en': 'especially large, super, special',
        'th': 'ใหญ่พิเศษ, ขนาดใหญ่เป็นพิเศษ',
        'zh': '今天买了一个特大西瓜。',
        'sent_en': 'Today I bought an especially large watermelon.',
        'sent_th': 'วันนี้ซื้อแตงโมลูกใหญ่พิเศษมา',
    },
    '一番': {
        'en': 'a period of, a kind of, a round of',
        'th': 'สักพัก, หนึ่งรอบ, อย่างหนึ่ง',
        'zh': '他努力了一番，终于成功了。',
        'sent_en': 'He put in a round of effort and finally succeeded.',
        'sent_th': 'เขาพยายามสักพักใหญ่ ในที่สุดก็สำเร็จ',
    },
    '一路上': {
        'en': 'along the way, throughout the journey',
        'th': 'ระหว่างทาง, ตลอดทาง',
        'zh': '一路上风景很美。',
        'sent_en': 'The scenery along the way was beautiful.',
        'sent_th': 'ระหว่างทางวิวสวยมาก',
    },
    '这就是说': {
        'en': 'that is to say, in other words, namely',
        'th': 'นั่นก็คือ, หมายความว่า',
        'zh': '他是我哥哥，这就是说，他是我爸爸的儿子。',
        'sent_en': 'He is my older brother, that is to say, he is my father\'s son.',
        'sent_th': 'เขาเป็นพี่ชายของฉัน นั่นก็คือ เขาเป็นลูกของพ่อฉัน',
    },
    '放暑假': {
        'en': 'to have summer vacation, summer holiday',
        'th': 'ปิดเทอมฤดูร้อน, หยุดภาคฤดูร้อน',
        'zh': '七月放暑假，我们一起去海边玩。',
        'sent_en': 'Summer vacation starts in July, let\'s go to the beach together.',
        'sent_th': 'เดือนกรกฎาปิดเทอมฤดูร้อน เราไปเที่ยวทะเลด้วยกันนะ',
    },
    '纽扣儿': {
        'en': 'button (on clothing)',
        'th': 'กระดุม',
        'zh': '我的衬衫掉了一颗纽扣儿。',
        'sent_en': 'My shirt lost a button.',
        'sent_th': 'เสื้อของฉันกระดุมหลุดไปเม็ดหนึ่ง',
    },
    '烟花爆竹': {
        'en': 'fireworks',
        'th': 'ดอกไม้ไฟ, ประทัด',
        'zh': '过年的时候会放烟花爆竹。',
        'sent_en': 'During Chinese New Year, people set off fireworks.',
        'sent_th': 'ช่วงปีใหม่จีนจะมีการจุดดอกไม้ไฟ',
    },
    '…极了': {
        'en': 'extremely, very much, to the extreme',
        'th': 'อย่างยิ่ง, มากที่สุด, สุดๆ',
        'zh': '今天热极了！',
        'sent_en': 'Today is extremely hot!',
        'sent_th': 'วันนี้ร้อนสุดๆ เลย',
    },
    '…分之…': {
        'en': 'X-out-of-Y, fraction, ...percent',
        'th': 'ใน..., ...ส่วน...',
        'zh': '四分之三的学生都通过了考试。',
        'sent_en': 'Three-fourths of the students passed the exam.',
        'sent_th': 'สามในสี่ของนักเรียนสอบผ่าน',
    },
}

# ── Process each file ──
import glob

all_files = sorted(glob.glob('characters_hsk*.json') + glob.glob('characters_hsk20_*.json'))

fixed_sent_th = 0
fixed_pinyin = 0
fixed_en = 0
fixed_th = 0
fixed_zh = 0
fixed_sent_en = 0

for fname in all_files:
    with open(fname) as f:
        data = json.load(f)
    
    modified = False
    
    for w in data['words']:
        ch = w['ch']
        
        # Fix pinyin
        if ch in PINYIN_FIXES and w.get('py') != PINYIN_FIXES[ch]:
            old_py = w.get('py', '')
            w['py'] = PINYIN_FIXES[ch]
            print(f"  PINYIN: [{data['course']}] {ch}: '{old_py}' -> '{PINYIN_FIXES[ch]}'")
            fixed_pinyin += 1
            modified = True
        
        # Fix teaching frame data
        if ch in ENTRIES:
            entry = ENTRIES[ch]
            
            if not w.get('en'):
                w['en'] = entry['en']
                fixed_en += 1
                modified = True
            
            if not w.get('th'):
                w['th'] = entry['th']
                fixed_th += 1
                modified = True
            
            if not w.get('zh'):
                w['zh'] = entry['zh']
                fixed_zh += 1
                modified = True
            
            if not w.get('sent_en'):
                w['sent_en'] = entry['sent_en']
                fixed_sent_en += 1
                modified = True
            
            # Replace sent_th placeholder
            old_st = w.get('sent_th', '')
            if old_st.startswith('คำว่า'):
                w['sent_th'] = entry['sent_th']
                fixed_sent_th += 1
                modified = True
    
    if modified:
        with open(fname, 'w') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  -> Saved {fname.split('/')[-1]}")

print(f"\n{'='*50}")
print(f"  Summary:")
print(f"  sent_th fixed: {fixed_sent_th}")
print(f"  en filled:     {fixed_en}")
print(f"  th filled:     {fixed_th}")
print(f"  zh filled:     {fixed_zh}")
print(f"  sent_en filled: {fixed_sent_en}")
print(f"  pinyin fixed:  {fixed_pinyin}")
print(f"{'='*50}")
