// strings.js — UI translation layer for 学汉字
// Depends on: nav.js (getNavLang, onLangChange)
//
// Usage:
//   t('key')                       → translated string
//   tFormat('key', { name:'Mia' }) → translated string with {name} replaced
//
// EN-only strings (nav labels, panel titles, button labels, mic messages)
// are hardcoded in their respective pages — not in this file.

var STRINGS = {

  en: {

    // ── write.html ──────────────────────────────────────────────
    trace_prompt:       "Trace the character!",
    stroke_good:        "Great stroke ✨",
    stroke_retry:       "Try again 💪",
    score_perfect:      "Perfect! 🎉",
    score_great:        "Well done! 😊",
    score_keep_trying:  "Keep trying! 💪",

    // ── index.html ──────────────────────────────────────────────
    who_learning:       "Who's learning today?",
    add_learner:        "Add learner",
    what_to_do:         "What do you want to do?",
    activity_write:     "✍️ Write Practice",
    activity_study:     "📖 Study",
    activity_print:     "🖨️ Print Worksheet",
    cancel:             "Cancel",

    // ── Settings modal ──────────────────────────────────────────
    parent_settings:  "Parent Settings",
    pin_protect_tip:  "Set a PIN to protect these settings.",
    welcome_tip:      "Welcome! Set a PIN to protect parent settings.",
    parent_access:    "Parent Access",
    enter_pin:        "Enter PIN",
    unlock:           "Unlock",
    settings_title:   "Settings",
    manage_profiles:  "Manage Profiles",
    change_pin:       "Change PIN",
    save:             "Save",
    close:            "Close",
    delete:           "Delete",
    no_learners:      "No learners yet.",
    pin_incomplete:   "Please enter all 4 digits.",
    pin_wrong:        "Incorrect PIN. Try again.",
    pin_saved:        "PIN saved!",
    day_streak:       "day streak",
    guest:            "Guest",
    are_you_sure:     "Are you sure?",
    delete_warning:   "This will delete all progress for this learner.",
    create_account:   "Create Account",

    // ── Badge popup ─────────────────────────────────────────────
    new_badge:          "New Badge:",
    badge_earned:       "You earned this today. Keep it up! 🐼",
    badge_keep_going:   "Keep going! 🐼",

    // ── Guest banner ────────────────────────────────────────────
    guest_banner:       "Progress is saved on this device only. Sign up to keep it safe!",
    sign_up:            "Sign up",
    save_my_progress:  "Save My Progress",

    // ── Sign-up page ─────────────────────────────────────────
    signup_hero_title:    "Every stroke counts.\nEvery day, a little better.",
    signup_hero_sub:      "A Chinese character learning app built around daily practice.",
    signup_feat1_title:   "Stroke-by-stroke Writing",
    signup_feat1_desc:    "Follow guided animations and practise each character with instant feedback.",
    signup_feat2_title:   "Streaks & Progress",
    signup_feat2_desc:    "Daily streaks, badges, and mastery tracking keep learners coming back.",
    signup_feat3_title:   "Flashcards, Quizzes & Minigames",
    signup_feat3_desc:    "More ways to practise — coming soon.",
    signup_coming_soon:   "Coming Soon",
    signup_form_title:    "Get early access",
    signup_form_sub:      "Be the first to know when accounts go live. Your details are stored securely and never shared.",
    signup_name_label:    "Your name",
    signup_name_ph:       "e.g. Sarah",
    signup_email_label:   "Email address",
    signup_email_ph:      "e.g. sarah@email.com",
    signup_submit:        "Join the Waitlist",
    signup_submitting:    "Sending…",
    signup_thanks_title:  "You're on the list! 🐼",
    signup_thanks_body:   "We'll email you as soon as accounts are ready. Meanwhile, try the app — your guest progress can be transferred later.",
    signup_try_guest:     "Try the app as a guest →",
    signup_open_app:      "Open the app →",
    signup_privacy:       "Your details are stored securely and never shared.",
    signup_already:       "Already using the app?",
    signup_go_back:       "← Back to app",
  },

  th: {

    // ── write.html ──────────────────────────────────────────────
    trace_prompt:       "ลากตัวอักษรตามเส้นเลย!",
    stroke_good:        "เขียนสวยมาก ✨",
    stroke_retry:       "เขียนตามแบบเลย ✍️ ",
    score_perfect:      "ไร้ที่ติ! 🎉",
    score_great:        "เก่งมาก! 😊",
    score_keep_trying:  "พยายามเข้านะ! 💪",

    // ── index.html ──────────────────────────────────────────────
    who_learning:       "ก๊อก ๆ ใครเอ่ย?",
    add_learner:        "เพิ่มผู้เรียน",
    what_to_do:         "ทำอะไรก่อนดี?",
    activity_write:     "ฝึกเขียน",
    activity_study:     "เข้าสู่บทเรียน",
    activity_print:     "พิมพ์ใบงาน",
    cancel:             "ยกเลิก",
    parent_settings:    "ตั้งค่าสำหรับผู้ปกครอง",
    pin_protect_tip:    "ตั้งรหัส PIN เพื่อป้องกันข้อมูลผู้เรียนสูญหาย",
    welcome_tip:        "ยินดีต้อนรับสู่ 学汉字! เพิ่มผู้เรียนด้านล่างเพื่อเริ่มต้นได้เลย",

    // ── Settings modal ──────────────────────────────────────────
    parent_access:      "การตั้งค่าของผู้ปกครอง",
    enter_pin:          "ใส่รหัส PIN 4 หลัก",
    unlock:             "ปลดล็อก",
    settings_title:     "ตั้งค่าการดูแลโปรไฟล์",
    manage_profiles:    "จัดการโปรไฟล์ผู้เรียน",
    change_pin:         "เปลี่ยนรหัส PIN",
    save:               "บันทึก",
    close:              "ปิด",
    delete:             "ลบ",
    no_learners:        "ยังไม่มีข้อมูลผู้เรียน",
    pin_incomplete:     "กรุณาใส่ตัวเลข 4 หลัก",
    pin_wrong:          "รหัสผิด ลองใหม่อีกครั้ง",
    pin_saved:          "บันทึกรหัสแล้ว",
    day_streak:         "วันติดต่อกัน",
    guest:              "แขก",
    are_you_sure:       "แน่ใจหรือไม่?",
    delete_warning:     "ข้อมูลการเรียนทั้งหมดจะหายไปตลอดกาล",
    create_account:   "สร้างบัญชี",

    // ── Badge popup ─────────────────────────────────────────────
    new_badge:          "ได้รับแบดจ์ :",
    badge_earned:       "ว้าว ! วันนี้ได้เลื่อนขั้น มาพยายามกันต่อนะ 🐼",
    badge_keep_going:   "สู้ต่อไป ! 🐼",

    // ── Guest banner ────────────────────────────────────────────
    guest_banner:       "ข้อมูลการเรียนจะถูกบันทึกบนอุปกรณ์นี้เท่านั้น สมัครสมาชิกเพื่อป้องกันข้อมูลสูญหาย",
    sign_up:            "สมัครสมาชิก",
    save_my_progress: "บันทึกความก้าวหน้า",

    // ── Sign-up page ─────────────────────────────────────────
    signup_hero_title:    "ทุกเส้นมีความหมาย\nฝึกทุกวัน ก้าวหน้าทุกวัน",
    signup_hero_sub:      "แอปฝึกอักษรจีนที่เน้นการฝึกฝนในชีวิตประจำวัน",
    signup_feat1_title:   "ฝึกเขียนทีละเส้น",
    signup_feat1_desc:    "ตามภาพเคลื่อนไหวและฝึกเขียนแต่ละตัวอักษรพร้อมรับ feedback ทันที",
    signup_feat2_title:   "สถิติและความก้าวหน้า",
    signup_feat2_desc:    "ฝึกต่อเนื่องทุกวัน รับป้าย และติดตามความก้าวหน้าอยู่เสมอ",
    signup_feat3_title:   "แฟลชการ์ด แบบทดสอบ และมินิเกม",
    signup_feat3_desc:    "วิธีฝึกเพิ่มเติม — เร็ว ๆ นี้",
    signup_coming_soon:   "เร็ว ๆ นี้",
    signup_form_title:    "รับสิทธิ์เข้าใช้งานก่อนใคร",
    signup_form_sub:      "รับการแจ้งเตือนเมื่อระบบบัญชีพร้อมใช้งาน ข้อมูลของคุณถูกเก็บอย่างปลอดภัย",
    signup_name_label:    "ชื่อของคุณ",
    signup_name_ph:       "เช่น สมศรี",
    signup_email_label:   "อีเมล",
    signup_email_ph:      "เช่น somsri@email.com",
    signup_submit:        "ลงทะเบียน",
    signup_submitting:    "กำลังส่ง…",
    signup_thanks_title:  "คุณอยู่ในรายชื่อแล้ว! 🐼",
    signup_thanks_body:   "เราจะแจ้งให้ทราบทางอีเมลเมื่อระบบบัญชีพร้อม ระหว่างนี้ลองใช้แอปในโหมดผู้เยี่ยมชมได้เลย",
    signup_try_guest:     "ทดลองใช้แบบผู้เยี่ยมชม →",
    signup_open_app:      "เปิดแอป →",
    signup_privacy:       "ข้อมูลของคุณถูกเก็บอย่างปลอดภัยและไม่ถูกแชร์",
    signup_already:       "ใช้งานแอปอยู่แล้ว?",
    signup_go_back:       "← กลับไปยังแอป",
  }

};

// ── Core lookup ────────────────────────────────────────────────────────────────

function t(key) {
  var lang = (typeof getNavLang === 'function') ? getNavLang() : 'en';
  return (STRINGS[lang]  && STRINGS[lang][key]  !== undefined) ? STRINGS[lang][key]
       : (STRINGS['en']  && STRINGS['en'][key]  !== undefined) ? STRINGS['en'][key]
       : key;
}

function tFormat(key, vars) {
  var str = t(key);
  if (!vars) return str;
  Object.keys(vars).forEach(function(k) {
    str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
  });
  return str;
}

// ── DOM refresh ────────────────────────────────────────────────────────────────

function refreshStrings() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
}

// Wire up to nav.js language toggle automatically
if (typeof onLangChange === 'function') {
  onLangChange(refreshStrings);
}