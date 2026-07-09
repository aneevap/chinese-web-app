import json

# 1. Fix HSK3 …极了 — teaching frame, needs py, en, th
with open('characters_hsk3.json') as f:
    hsk3 = json.load(f)

for w in hsk3['words']:
    if w['ch'] == '…极了':
        w['py'] = 'jí le'
        w['en'] = 'extremely, very much, to the extreme'
        w['th'] = 'อย่างยิ่ง, มากที่สุด'
        print(f"Fixed HSK3 …极了: py='{w['py']}', en='{w['en']}', th='{w['th']}'")

with open('characters_hsk3.json', 'w') as f:
    json.dump(hsk3, f, ensure_ascii=False, indent=2)
print("-> Saved characters_hsk3.json")

# 2. Fix HSK4 …分之… — teaching frame, needs py, en, th
with open('characters_hsk4.json') as f:
    hsk4 = json.load(f)

for w in hsk4['words']:
    if w['ch'] == '…分之…':
        w['py'] = 'fēn zhī'
        w['en'] = 'X-out-of-Y, fraction, ...percent'
        w['th'] = 'ใน..., ...ส่วน...'
        print(f"Fixed HSK4 …分之…: py='{w['py']}', en='{w['en']}', th='{w['th']}'")

with open('characters_hsk4.json', 'w') as f:
    json.dump(hsk4, f, ensure_ascii=False, indent=2)
print("-> Saved characters_hsk4.json")

# 3. Fix 5A 畔 — corrupted en, th, zh, sent_en; needs sent_th
with open('characters_5A.json') as f:
    course5a = json.load(f)

for w in course5a['words']:
    if w['ch'] == '畔':
        w['py'] = 'pàn'
        w['en'] = 'side, bank (of a river), lakeshore'
        w['th'] = 'ฝั่ง, ริมน้ำ'
        w['zh'] = '我们在湖畔散步。'
        w['sent_en'] = 'We are taking a walk by the lake.'
        w['sent_th'] = 'เราเดินเล่นริมทะเลสาบ'
        print(f"Fixed 5A 畔: en='{w['en']}', th='{w['th']}', zh='{w['zh']}'")
        print(f"  sent_en='{w['sent_en']}', sent_th='{w['sent_th']}'")

with open('characters_5A.json', 'w') as f:
    json.dump(course5a, f, ensure_ascii=False, indent=2)
print("-> Saved characters_5A.json")

print("\nAll 3 gaps fixed.")
