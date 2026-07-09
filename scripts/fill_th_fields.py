#!/usr/bin/env python3
"""
Fill missing 'th' (Thai word translation) fields in HSK course files.
Uses a curated English→Thai dictionary built from existing school course data,
plus pattern-based rules for remaining characters.
"""

import json
import glob
import re

# ──────────────────────────────────────────────
#  LOAD SOURCES
# ──────────────────────────────────────────────

# English→Thai lookup dictionary
EN_TO_TH = {}
try:
    with open('scripts/en_to_th_dict.json', 'r', encoding='utf-8') as f:
        EN_TO_TH = json.load(f)
    print(f"Loaded {len(EN_TO_TH)} English→Thai mappings")
except FileNotFoundError:
    print("Warning: en_to_th_dict.json not found")

# Chinese→Thai word dictionary (from all courses)
CH_TO_TH = {}
try:
    with open('scripts/thai_word_dict.json', 'r', encoding='utf-8') as f:
        CH_TO_TH = json.load(f)
    print(f"Loaded {len(CH_TO_TH)} Chinese→Thai mappings")
except FileNotFoundError:
    print("Warning: thai_word_dict.json not found")

# ──────────────────────────────────────────────
#  PATTERN-BASED THAI GENERATION
#  For common English definition patterns
# ──────────────────────────────────────────────

# Common verb translations
COMMON_VERBS = {
    'love': 'รัก', 'like': 'ชอบ', 'hate': 'เกลียด', 'want': 'ต้องการ',
    'need': 'ต้องการ', 'have': 'มี', 'be': 'เป็น', 'do': 'ทำ',
    'make': 'ทำ', 'get': 'ได้รับ', 'take': 'เอา', 'give': 'ให้',
    'go': 'ไป', 'come': 'มา', 'see': 'เห็น', 'look': 'ดู',
    'hear': 'ได้ยิน', 'listen': 'ฟัง', 'say': 'พูด', 'tell': 'บอก',
    'talk': 'พูดคุย', 'speak': 'พูด', 'read': 'อ่าน', 'write': 'เขียน',
    'learn': 'เรียนรู้', 'study': 'เรียน', 'teach': 'สอน',
    'know': 'รู้', 'think': 'คิด', 'understand': 'เข้าใจ',
    'remember': 'จำ', 'forget': 'ลืม', 'find': 'หา',
    'buy': 'ซื้อ', 'sell': 'ขาย', 'eat': 'กิน', 'drink': 'ดื่ม',
    'cook': 'ทำอาหาร', 'sleep': 'นอน', 'wake': 'ตื่น',
    'work': 'ทำงาน', 'play': 'เล่น', 'run': 'วิ่ง', 'walk': 'เดิน',
    'swim': 'ว่ายน้ำ', 'fly': 'บิน', 'drive': 'ขับรถ',
    'help': 'ช่วย', 'thank': 'ขอบคุณ', 'welcome': 'ต้อนรับ',
    'open': 'เปิด', 'close': 'ปิด', 'start': 'เริ่ม', 'stop': 'หยุด',
    'wait': 'รอ', 'call': 'โทร', 'ask': 'ถาม', 'answer': 'ตอบ',
    'use': 'ใช้', 'put': 'วาง', 'try': 'ลอง', 'show': 'แสดง',
    'change': 'เปลี่ยน', 'stay': 'อยู่', 'live': 'อาศัย',
    'meet': 'พบ', 'visit': 'เยี่ยม', 'travel': 'เดินทาง',
    'bring': 'นำ', 'send': 'ส่ง', 'receive': 'ได้รับ',
    'believe': 'เชื่อ', 'hope': 'หวัง', 'wish': 'ปรารถนา',
    'feel': 'รู้สึก', 'seem': 'ดูเหมือน', 'become': 'กลายเป็น',
    'keep': 'เก็บ', 'let': 'ให้', 'allow': 'อนุญาต',
    'begin': 'เริ่มต้น', 'finish': 'เสร็จ', 'continue': 'ดำเนินต่อ',
    'follow': 'ตาม', 'lead': 'นำ', 'move': 'เคลื่อนที่',
    'stand': 'ยืน', 'sit': 'นั่ง', 'lie': 'นอน',
    'carry': 'ถือ', 'hold': 'ถือ', 'catch': 'จับ',
    'cut': 'ตัด', 'break': 'ทำลาย', 'fix': 'ซ่อม',
    'build': 'สร้าง', 'grow': 'เติบโต', 'plant': 'ปลูก',
    'wash': 'ล้าง', 'clean': 'ทำความสะอาด', 'dry': 'ทำให้แห้ง',
    'draw': 'วาด', 'paint': 'ระบายสี', 'sing': 'ร้องเพลง',
    'dance': 'เต้นรำ', 'climb': 'ปีน', 'fall': 'ตก',
    'cover': 'ปก', 'fill': 'เติม', 'check': 'ตรวจสอบ',
    'choose': 'เลือก', 'decide': 'ตัดสินใจ', 'agree': 'เห็นด้วย',
    'allow': 'อนุญาต', 'appear': 'ปรากฏ', 'arrive': 'มาถึง',
    'belong': 'เป็นของ', 'care': 'ดูแล', 'consider': 'พิจารณา',
    'consist': 'ประกอบด้วย', 'contain': 'บรรจุ', 'continue': 'ดำเนินต่อ',
    'control': 'ควบคุม', 'cook': 'ทำอาหาร', 'correct': 'แก้ไข',
    'cost': 'ราคา', 'count': 'นับ', 'cover': 'คลุม',
    'cross': 'ข้าม', 'cry': 'ร้องไห้', 'deal': 'จัดการ',
    'deliver': 'ส่ง', 'depend': 'ขึ้นอยู่กับ', 'describe': 'บรรยาย',
    'design': 'ออกแบบ', 'develop': 'พัฒนา', 'die': 'ตาย',
    'discuss': 'อภิปราย', 'divide': 'แบ่ง', 'doubt': 'สงสัย',
    'dream': 'ฝัน', 'drop': 'ตก', 'enjoy': 'สนุก',
    'enter': 'เข้า', 'escape': 'หนี', 'exist': 'มีอยู่',
    'expect': 'คาดหวัง', 'experience': 'ประสบการณ์', 'explain': 'อธิบาย',
    'express': 'แสดงออก', 'fail': 'ล้มเหลว', 'fight': 'ต่อสู้',
    'fit': 'พอดี', 'flow': 'ไหล', 'focus': 'โฟกัส',
    'force': 'บังคับ', 'form': 'รูปแบบ', 'free': 'ปลดปล่อย',
    'freeze': 'แช่แข็ง', 'frighten': 'ทำให้กลัว', 'gather': 'รวบรวม',
    'grab': 'คว้า', 'guard': 'ป้องกัน', 'guess': 'เดา',
    'guide': 'แนะนำ', 'handle': 'จัดการ', 'hang': 'แขวน',
    'happen': 'เกิดขึ้น', 'hide': 'ซ่อน', 'hit': 'ตี',
    'identify': 'ระบุ', 'ignore': 'ละเว้น', 'imagine': 'จินตนาการ',
    'improve': 'ปรับปรุง', 'include': 'รวม', 'increase': 'เพิ่ม',
    'indicate': 'บ่งชี้', 'inform': 'แจ้ง', 'insist': 'ยืนยัน',
    'intend': 'ตั้งใจ', 'introduce': 'แนะนำ', 'invent': 'ประดิษฐ์',
    'invite': 'เชิญ', 'join': 'เข้าร่วม', 'jump': 'กระโดด',
    'kick': 'เตะ', 'kill': 'ฆ่า', 'knock': 'เคาะ',
    'laugh': 'หัวเราะ', 'lay': 'วาง', 'lift': 'ยก',
    'limit': 'จำกัด', 'link': 'เชื่อมโยง', 'load': 'โหลด',
    'lock': 'ล็อก', 'lose': 'เสีย', 'lower': 'ลด',
    'manage': 'จัดการ', 'mark': 'ทำเครื่องหมาย', 'match': 'จับคู่',
    'measure': 'วัด', 'mention': 'กล่าวถึง', 'miss': 'คิดถึง',
    'mix': 'ผสม', 'notice': 'สังเกต', 'observe': 'สังเกต',
    'offer': 'เสนอ', 'order': 'สั่ง', 'organize': 'จัดระเบียบ',
    'owe': 'เป็นหนี้', 'own': 'เป็นเจ้าของ', 'pass': 'ผ่าน',
    'pay': 'จ่าย', 'perform': 'แสดง', 'pick': 'เลือก',
    'place': 'วาง', 'plan': 'วางแผน', 'point': 'ชี้',
    'polish': 'ขัด', 'possess': 'ครอบครอง', 'pour': 'เท',
    'practice': 'ฝึกฝน', 'praise': 'ชมเชย', 'pray': 'สวดมนต์',
    'prefer': 'ชอบมากกว่า', 'prepare': 'เตรียม', 'present': 'นำเสนอ',
    'press': 'กด', 'prevent': 'ป้องกัน', 'produce': 'ผลิต',
    'promise': 'สัญญา', 'protect': 'ปกป้อง', 'prove': 'พิสูจน์',
    'provide': 'จัดหา', 'pull': 'ดึง', 'push': 'ผลัก',
    'raise': 'ยก', 'reach': 'ถึง', 'realize': 'ตระหนัก',
    'rebuild': 'สร้างใหม่', 'record': 'บันทึก', 'recover': 'ฟื้นตัว',
    'reduce': 'ลด', 'reflect': 'สะท้อน', 'refuse': 'ปฏิเสธ',
    'regret': 'เสียใจ', 'reject': 'ปฏิเสธ', 'relate': 'เกี่ยวข้อง',
    'release': 'ปล่อย', 'rely': 'พึ่งพา', 'remain': 'คงอยู่',
    'remove': 'ลบ', 'repeat': 'ทำซ้ำ', 'replace': 'แทนที่',
    'reply': 'ตอบ', 'report': 'รายงาน', 'represent': 'เป็นตัวแทน',
    'request': 'ขอร้อง', 'require': 'ต้องการ', 'respect': 'เคารพ',
    'respond': 'ตอบสนอง', 'rest': 'พักผ่อน', 'result': 'ส่งผล',
    'return': 'กลับ', 'reveal': 'เปิดเผย', 'rise': 'เพิ่มขึ้น',
    'roll': 'กลิ้ง', 'rub': 'ถู', 'rule': 'ปกครอง',
    'rush': 'รีบ', 'save': 'บันทึก', 'search': 'ค้นหา',
    'separate': 'แยก', 'serve': 'บริการ', 'set': 'ตั้งค่า',
    'settle': 'จัดการ', 'shake': 'เขย่า', 'share': 'แบ่งปัน',
    'shine': 'ส่องแสง', 'shoot': 'ยิง', 'shout': 'ตะโกน',
    'shut': 'ปิด', 'sign': 'เซ็น', 'sink': 'จม',
    'slide': 'เลื่อน', 'smell': 'ได้กลิ่น', 'smile': 'ยิ้ม',
    'solve': 'แก้ไข', 'sort': 'จัดเรียง', 'sound': 'เสียง',
    'spend': 'ใช้จ่าย', 'split': 'แบ่ง', 'spread': 'กระจาย',
    'squeeze': 'บีบ', 'stare': 'จ้อง', 'steal': 'ขโมย',
    'stick': 'ติด', 'stir': 'คน', 'stretch': 'ยืด',
    'strike': 'ตี', 'struggle': 'ต่อสู้', 'succeed': 'ประสบความสำเร็จ',
    'suffer': 'ทนทุกข์', 'suggest': 'แนะนำ', 'supply': 'จัดหา',
    'support': 'สนับสนุน', 'suppose': 'สมมติ', 'surprise': 'แปลกใจ',
    'surround': 'ล้อมรอบ', 'survive': 'อยู่รอด', 'suspect': 'สงสัย',
    'swallow': 'กลืน', 'swear': 'สาบาน', 'sweep': 'กวาด',
    'swing': 'แกว่ง', 'taste': 'ชิม', 'tear': 'ฉีก',
    'tend': 'มีแนวโน้ม', 'test': 'ทดสอบ', 'threaten': 'ขู่',
    'throw': 'โยน', 'tie': 'ผูก', 'touch': 'สัมผัส',
    'train': 'ฝึก', 'treat': 'ปฏิบัติ', 'tremble': 'สั่น',
    'trust': 'เชื่อใจ', 'turn': 'หมุน', 'twist': 'บิด',
    'type': 'พิมพ์', 'unite': 'รวมกัน', 'upset': 'ทำให้เสียใจ',
    'urge': 'กระตุ้น', 'value': 'ให้คุณค่า', 'vary': 'เปลี่ยนแปลง',
    'view': 'ดู', 'vote': 'โหวต', 'wait': 'รอ',
    'wake': 'ตื่นนอน', 'wander': 'เดินเตร่', 'warn': 'เตือน',
    'wash': 'ซัก', 'waste': 'เสีย', 'watch': 'ดู',
    'wave': 'โบก', 'wear': 'สวมใส่', 'weigh': 'ชั่งน้ำหนัก',
    'win': 'ชนะ', 'wonder': 'สงสัย', 'worry': 'กังวล',
    'wrap': 'ห่อ', 'write': 'เขียน', 'yield': 'ให้ผลผลิต',
}

# Common noun translations
COMMON_NOUNS = {
    'person': 'บุคคล', 'people': 'คน', 'man': 'ผู้ชาย', 'woman': 'ผู้หญิง',
    'child': 'เด็ก', 'baby': 'ทารก', 'friend': 'เพื่อน', 'family': 'ครอบครัว',
    'father': 'พ่อ', 'mother': 'แม่', 'brother': 'พี่ชาย', 'sister': 'พี่สาว',
    'husband': 'สามี', 'wife': 'ภรรยา', 'son': 'ลูกชาย', 'daughter': 'ลูกสาว',
    'teacher': 'ครู', 'student': 'นักเรียน', 'doctor': 'หมอ', 'nurse': 'พยาบาล',
    'worker': 'คนงาน', 'farmer': 'ชาวนา', 'driver': 'คนขับ', 'cook': 'พ่อครัว',
    'singer': 'นักร้อง', 'dancer': 'นักเต้น', 'writer': 'นักเขียน',
    'artist': 'ศิลปิน', 'actor': 'นักแสดง', 'player': 'ผู้เล่น',
    'leader': 'ผู้นำ', 'member': 'สมาชิก', 'owner': 'เจ้าของ',
    'guest': 'แขก', 'host': 'เจ้าภาพ', 'customer': 'ลูกค้า',
    'patient': 'คนไข้', 'boss': 'เจ้านาย', 'manager': 'ผู้จัดการ',
    'king': 'กษัตริย์', 'queen': 'ราชินี', 'prince': 'เจ้าชาย', 'princess': 'เจ้าหญิง',
    'god': 'พระเจ้า', 'angel': 'เทวดา', 'hero': 'ฮีโร่', 'enemy': 'ศัตรู',
    'name': 'ชื่อ', 'word': 'คำ', 'language': 'ภาษา',
    'book': 'หนังสือ', 'letter': 'จดหมาย', 'paper': 'กระดาษ',
    'pen': 'ปากกา', 'pencil': 'ดินสอ', 'bag': 'กระเป๋า',
    'table': 'โต๊ะ', 'chair': 'เก้าอี้', 'door': 'ประตู', 'window': 'หน้าต่าง',
    'room': 'ห้อง', 'house': 'บ้าน', 'school': 'โรงเรียน',
    'hospital': 'โรงพยาบาล', 'bank': 'ธนาคาร', 'shop': 'ร้านค้า',
    'market': 'ตลาด', 'store': 'ร้าน', 'park': 'สวนสาธารณะ',
    'city': 'เมือง', 'country': 'ประเทศ', 'world': 'โลก',
    'water': 'น้ำ', 'fire': 'ไฟ', 'air': 'อากาศ', 'earth': 'ดิน',
    'sun': 'ดวงอาทิตย์', 'moon': 'ดวงจันทร์', 'star': 'ดาว',
    'sky': 'ท้องฟ้า', 'cloud': 'เมฆ', 'rain': 'ฝน', 'snow': 'หิมะ',
    'wind': 'ลม', 'mountain': 'ภูเขา', 'river': 'แม่น้ำ', 'sea': 'ทะเล',
    'tree': 'ต้นไม้', 'flower': 'ดอกไม้', 'grass': 'หญ้า',
    'animal': 'สัตว์', 'dog': 'สุนัข', 'cat': 'แมว', 'bird': 'นก',
    'fish': 'ปลา', 'horse': 'ม้า', 'cow': 'วัว', 'pig': 'หมู',
    'chicken': 'ไก่', 'duck': 'เป็ด', 'elephant': 'ช้าง', 'tiger': 'เสือ',
    'lion': 'สิงโต', 'bear': 'หมี', 'monkey': 'ลิง', 'snake': 'งู',
    'food': 'อาหาร', 'rice': 'ข้าว', 'bread': 'ขนมปัง', 'meat': 'เนื้อ',
    'fruit': 'ผลไม้', 'vegetable': 'ผัก', 'milk': 'นม', 'egg': 'ไข่',
    'sugar': 'น้ำตาล', 'salt': 'เกลือ', 'oil': 'น้ำมัน',
    'tea': 'ชา', 'coffee': 'กาแฟ', 'juice': 'น้ำผลไม้',
    'color': 'สี', 'red': 'สีแดง', 'blue': 'สีน้ำเงิน', 'green': 'สีเขียว',
    'yellow': 'สีเหลือง', 'white': 'สีขาว', 'black': 'สีดำ',
    'number': 'ตัวเลข', 'time': 'เวลา', 'year': 'ปี', 'month': 'เดือน',
    'week': 'สัปดาห์', 'day': 'วัน', 'hour': 'ชั่วโมง', 'minute': 'นาที',
    'second': 'วินาที', 'morning': 'ตอนเช้า', 'afternoon': 'ตอนบ่าย',
    'evening': 'ตอนเย็น', 'night': 'กลางคืน',
    'spring': 'ฤดูใบไม้ผลิ', 'summer': 'ฤดูร้อน', 'autumn': 'ฤดูใบไม้ร่วง',
    'winter': 'ฤดูหนาว',
    'weather': 'สภาพอากาศ', 'temperature': 'อุณหภูมิ',
    'head': 'หัว', 'face': 'หน้า', 'eye': 'ตา', 'ear': 'หู',
    'nose': 'จมูก', 'mouth': 'ปาก', 'hand': 'มือ', 'foot': 'เท้า',
    'arm': 'แขน', 'leg': 'ขา', 'hair': 'ผม', 'skin': 'ผิวหนัง',
    'heart': 'หัวใจ', 'body': 'ร่างกาย', 'health': 'สุขภาพ',
    'life': 'ชีวิต', 'death': 'ความตาย', 'love': 'ความรัก',
    'happiness': 'ความสุข', 'sadness': 'ความเศร้า', 'anger': 'ความโกรธ',
    'fear': 'ความกลัว', 'hope': 'ความหวัง', 'dream': 'ความฝัน',
    'idea': 'ความคิด', 'plan': 'แผน', 'way': 'วิธี', 'reason': 'เหตุผล',
    'problem': 'ปัญหา', 'question': 'คำถาม', 'answer': 'คำตอบ',
    'fact': 'ข้อเท็จจริง', 'truth': 'ความจริง', 'story': 'เรื่องราว',
    'history': 'ประวัติศาสตร์', 'news': 'ข่าว', 'information': 'ข้อมูล',
    'work': 'งาน', 'job': 'งาน', 'business': 'ธุรกิจ', 'company': 'บริษัท',
    'money': 'เงิน', 'price': 'ราคา', 'cost': 'ค่าใช้จ่าย',
    'gift': 'ของขวัญ', 'toy': 'ของเล่น', 'game': 'เกม',
    'music': 'ดนตรี', 'song': 'เพลง', 'picture': 'รูปภาพ',
    'movie': 'ภาพยนตร์', 'film': 'ฟิล์ม', 'TV': 'โทรทัศน์',
    'computer': 'คอมพิวเตอร์', 'phone': 'โทรศัพท์',
    'car': 'รถยนต์', 'bus': 'รถบัส', 'train': 'รถไฟ', 'plane': 'เครื่องบิน',
    'bike': 'จักรยาน', 'boat': 'เรือ', 'ship': 'เรือ',
    'road': 'ถนน', 'street': 'ถนน', 'bridge': 'สะพาน',
    'place': 'สถานที่', 'position': 'ตำแหน่ง', 'part': 'ส่วน',
    'kind': 'ชนิด', 'type': 'ประเภท', 'sort': 'ประเภท',
    'thing': 'สิ่งของ', 'something': 'บางสิ่ง', 'everything': 'ทุกสิ่ง',
    'nothing': 'ไม่มีอะไร', 'same': 'เหมือนกัน', 'different': 'แตกต่าง',
    'other': 'อื่น', 'another': 'อีก', 'many': 'มากมาย',
    'much': 'มาก', 'little': 'เล็กน้อย', 'few': 'น้อย',
    'some': 'บาง', 'any': 'ใดๆ', 'all': 'ทั้งหมด', 'both': 'ทั้งสอง',
    'each': 'แต่ละ', 'every': 'ทุก', 'whole': 'ทั้งหมด',
    'half': 'ครึ่ง', 'part': 'ส่วน', 'piece': 'ชิ้น',
    'pair': 'คู่', 'group': 'กลุ่ม', 'line': 'เส้น',
    'circle': 'วงกลม', 'square': 'สี่เหลี่ยม', 'middle': 'กลาง',
    'top': 'บน', 'bottom': 'ล่าง', 'side': 'ด้าน', 'front': 'หน้า',
    'back': 'หลัง', 'inside': 'ข้างใน', 'outside': 'ข้างนอก',
    'left': 'ซ้าย', 'right': 'ขวา', 'up': 'ขึ้น', 'down': 'ลง',
    'beginning': 'จุดเริ่มต้น', 'end': 'จุดจบ', 'middle': 'กลาง',
    'age': 'อายุ', 'size': 'ขนาด', 'length': 'ความยาว',
    'weight': 'น้ำหนัก', 'height': 'ความสูง', 'depth': 'ความลึก',
    'distance': 'ระยะทาง', 'direction': 'ทิศทาง',
}


def get_thai_from_en(en, en_full):
    """Get Thai translation from English definition using lookup tables."""
    if not en:
        return None
    
    # Extract primary meaning (before first comma)
    primary = en.split(',')[0].strip()
    
    # Remove "to " prefix for verbs
    is_verb = primary.lower().startswith('to ')
    clean_primary = primary[3:].strip() if is_verb else primary
    
    # Normalize
    clean_lower = clean_primary.lower()
    
    # 1. Check English→Thai dictionary
    if clean_lower in EN_TO_TH:
        return EN_TO_TH[clean_lower]
    
    # 2. Check verb dictionary
    if is_verb and clean_lower in COMMON_VERBS:
        return COMMON_VERBS[clean_lower]
    
    # 3. Check noun dictionary
    if clean_lower in COMMON_NOUNS:
        return COMMON_NOUNS[clean_lower]
    
    # 4. Check for CL: pattern (classifier) - extract the noun before CL:
    if en_full and 'CL:' in en_full:
        parts = en_full.split(',')
        for p in parts:
            p = p.strip().lower()
            if p in EN_TO_TH:
                return EN_TO_TH[p]
            if p in COMMON_NOUNS:
                return COMMON_NOUNS[p]
    
    # 5. Try individual words from the primary definition
    words = clean_lower.split()
    for w in words:
        if w in EN_TO_TH:
            return EN_TO_TH[w]
        if is_verb and w in COMMON_VERBS:
            return COMMON_VERBS[w]
        if w in COMMON_NOUNS:
            return COMMON_NOUNS[w]
    
    return None


def fill_missing_th():
    """Fill missing 'th' fields in all HSK course files."""
    files = sorted(glob.glob('characters_hsk*.json') + glob.glob('characters_hsk20_*.json'))
    
    total_filled = 0
    total_skipped = 0
    total_already = 0
    
    for fname in files:
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        course = data['course']
        course_filled = 0
        course_skipped = 0
        
        for w in data['words']:
            ch = w['ch']
            
            # Skip if already has th
            if w.get('th'):
                total_already += 1
                continue
            
            en = w.get('en', '')
            en_full = w.get('en_full', en)
            
            # Try Chinese→Thai dictionary first
            if ch in CH_TO_TH:
                w['th'] = CH_TO_TH[ch]
                course_filled += 1
                total_filled += 1
                continue
            
            # Try English→Thai lookup
            thai = get_thai_from_en(en, en_full)
            if thai:
                w['th'] = thai
                course_filled += 1
                total_filled += 1
                continue
            
            course_skipped += 1
            total_skipped += 1
        
        # Save if any changes
        if course_filled > 0:
            with open(fname, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"  {course}: +{course_filled} th filled, {course_skipped} skipped")
    
    print(f"\n{'='*50}")
    print(f"SUMMARY")
    print(f"{'='*50}")
    print(f"  Already had th: {total_already}")
    print(f"  Filled: {total_filled}")
    print(f"  Skipped (no match): {total_skipped}")
    print(f"{'='*50}")


if __name__ == '__main__':
    fill_missing_th()
