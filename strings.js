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
    forgot_pin:       "Forgot PIN?",
    forgot_pin_sent_title: "Reset email sent! \uD83D\uDCE7",
    forgot_pin_sent_body:  "Check your email for a password reset link. After resetting, your PIN will be cleared and you can set a new one.",
    pin_was_cleared:  "\uD83D\uDD13 Parent PIN has been cleared. Set a new one in Parent Settings.",
    forgot_pin_not_signed_in: "Please create an account or sign in first to use PIN recovery.",
    day_streak:       "day streak",
    guest:            "Guest",
    are_you_sure:     "Are you sure?",
    delete_warning:   "This will delete all progress for this learner.",
    create_account:   "Create Account",
    sign_out:         "Sign Out",

    // ── Badge popup ─────────────────────────────────────────────
    new_badge:          "New Badge:",
    badge_earned:       "You earned this today. Keep it up! 🐼",
    badge_keep_going:   "Keep going! 🐼",

    // ── Guest banner ────────────────────────────────────────────
    guest_banner:       "Progress is saved on this device only. Sign up to keep it safe!",
    save_my_progress:  "Save My Progress",

    // ── Auth / Account upgrade ────────────────────────────────
    upgrade_title:        "Create Account",
    upgrade_sub:          "Enter your details to keep your progress safe across devices.",
    upgrade_email_label:  "Email",
    upgrade_email_ph:     "e.g. sarah@email.com",
    upgrade_password_label: "Password",
    upgrade_password_ph:  "At least 6 characters",
    upgrade_confirm_label: "Confirm password",
    upgrade_name_label:   "Learner name (optional)",
    upgrade_name_ph:      "e.g. Sarah",
    upgrade_submit:       "Create Account & Save",
    upgrade_submitting:   "Creating account…",
    upgrade_success_title: "Account created! 🎉",
    upgrade_success_body:  "Your progress is now saved. Check your email to confirm your account.",
    upgrade_continue:     "Go to app →",

    signin_title:         "Welcome back!",
    signin_sub:           "Sign in to continue your progress.",
    signin_email_label:   "Email",
    signin_email_ph:      "e.g. sarah@email.com",
    signin_password_label: "Password",
    signin_password_ph:   "Enter your password",
    signin_submit:        "Sign In",
    signin_submitting:    "Signing in…",
    signin_error:         "Invalid email or password.",

    upgrade_banner:       "🔒 Your progress is saved on this device only. Create an account to keep it safe!",
    upgrade_banner_cta:   "Save My Progress",

    // ── Auth switch links ──────────────────────────────────
    switch_to_signin:     "Already have an account? Sign In",
    switch_to_upgrade:    "Don\'t have an account? Sign up to save your progress",

    // ── Duplicate email handling ─────────────────────────────
    auth_email_exists:    "This email is already registered. Sign in instead?",

    // ── Password reset ─────────────────────────────────────────
    forgot_password:          "Forgot password?",
    reset_password_title:     "Reset your password",
    reset_password_sub:       "Enter your email and we'll send you a reset link.",
    reset_password_sent_title: "Check your email \uD83D\uDCE7",
    reset_password_sent_body: "If an account exists with this email, you'll receive a password reset link shortly.",
    reset_password_submit:    "Send Reset Link",
    reset_password_submitting: "Sending…",
    reset_password_back:      "Back to Sign In",

    // ── Set new password (after recovery) ──────────────────────
    set_new_password_title:       "Set a new password",
    set_new_password_sub:         "Enter your new password below.",
    set_new_password_submit:      "Update Password",
    set_new_password_submitting:  "Updating…",
    set_new_password_success_title: "Password updated! \u2705",
    set_new_password_success_body:  "Your password has been changed. You can now sign in with your new password.",
    set_new_password_continue:    "Go to app \u2192",

    // ── Auth validation errors ────────────────────────────────
    auth_error_email:     "Please enter a valid email address.",
    auth_error_password:  "Password must be at least 6 characters.",
    auth_error_confirm:   "Passwords do not match.",
    auth_error_generic:   "Something went wrong. Please try again.",

    // ── Notebook ────────────────────────────────────────────────
    notebook_title:       "📓 Notebook",
    notebook_empty:       "No saved words yet. Tap 📝 in the Write page to save characters!",
    notebook_add_note:    "+ Add note",
    notebook_edit_note:   "Edit note",
    notebook_remove:      "Remove from notebook",
    notebook_remove_confirm: "Remove this word from your notebook?",
    notebook_note_placeholder: "Add a note...",
    notebook_see_all:     "See all {count} →",
    notebook_sheet_title: "📓 Notebook",

    // ── progress.html ──────────────────────────────────────────
    loading_progress:       "Loading progress...",
    stats_total:            "Total ⭐",
    stats_streak:           "Streak",
    stats_best_streak:      "Best Streak",
    stats_best_day:         "Best Day",
    stats_mastered:         "Mastered",
    stats_attempted:        "Attempted",
    journey_next:           "Next: {emoji} {title} at {pct}%",
    journey_max:            "🎉 Maximum title reached!",
    badges_empty:           "No badges yet — keep practising! 🐼",
    mastery_summary:        "{total} words · {mastered} mastered · {practiced} practiced · {seen} seen",
    mastery_empty:          "No words attempted yet. Start practising! 🐼",
    mastery_theme_empty:    "No words in this theme yet.",
    items_empty:            "No items yet — earn coins to buy collectibles! 🎁",
    shop_title:             "🛒 Shop",
    shop_enter:             "Enter Shop",
    shop_close:             "Close Shop",
    shop_empty:             "No items available in the shop.",
    shop_buy:               "Buy",
    shop_owned:             "Owned ✓",
    shop_insufficient:      "Need {cost} 🪙",
    shop_confirm_title:     "Buy this item?",
    shop_confirm_body:      "Spend {cost} 🪙 to buy {name}?",
    shop_confirm_yes:       "Yes, buy!",
    shop_bought:            "You bought {name}! 🎉",
    shop_coin_balance:      "🪙 {coins}",
    shop_coins_today:       "Today's coins",
    shop_source_game:       "Game",
    shop_source_badge:      "Badge",
    shop_source_migration:  "Welcome bonus",
    settings_tap_hint:      "⚙️ Settings",
    cal_su: "Su", cal_mo: "Mo", cal_tu: "Tu", cal_we: "We", cal_th: "Th", cal_fr: "Fr", cal_sa: "Sa",

    // ── Legend ──
    legend_unseen:      "Not seen",
    legend_seen:        "Seen",
    legend_practiced:   "Practiced",
    legend_mastered:    "Mastered",

    // ── Tooltip ──
    tooltip_status_unseen:    "Not seen",
    tooltip_status_seen:      "Seen",
    tooltip_status_practiced: "Practiced",
    tooltip_status_mastered:  "Mastered",
    mastered_on:              "Mastered: {date}",

    // ── Calendar months ──
    cal_jan: "January", cal_feb: "February", cal_mar: "March",
    cal_apr: "April",   cal_may: "May",      cal_jun: "June",
    cal_jul: "July",    cal_aug: "August",    cal_sep: "September",
    cal_oct: "October", cal_nov: "November",  cal_dec: "December",

    // ── Calendar day alert ──
    cal_score: "⭐ Score: {score}",
    cal_write: "✍️  Write: {count}",
    cal_study: "📚 Study: {count}",
    cal_chars: "📝 Chars: {count}",

    // ── Recovery page ─────────────────────────────────────────
    recovery_verifying:     "Verifying recovery link...",
    recovery_no_request:    "No password reset request detected.",
    recovery_invalid_link:  "This link is not a valid password reset request. Please request a new reset email.",
    recovery_verify_failed: "Could not verify this link. Please request a new password reset email.",

    // ── Password strength ────────────────────────────────────────
    password_strength_weak:       "Weak",
    password_strength_fair:       "Fair",
    password_strength_good:       "Good",
    password_strength_strong:     "Strong",
    password_strength_very_strong: "Very Strong",

    // ── Streak ──
    streak_day:  "day",
    streak_days: "days",
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
    pin_wrong:          "รหัสผิด ลองใหม่อีกครั้ง",    pin_saved:        "บันทึกรหัสแล้ว",
    forgot_pin:       "ลืมรหัส PIN?",
    forgot_pin_sent_title: "ส่งอีเมลรีเซ็ตแล้ว! \uD83D\uDCE7",
    forgot_pin_sent_body:  "ตรวจสอบอีเมลของคุณสำหรับลิงก์รีเซ็ตรหัสผ่าน หลังจากรีเซ็ตรหัสผ่านแล้ว รหัส PIN จะถูกล้างและคุณสามารถตั้งค่าใหม่ได้",
    pin_was_cleared:  "\uD83D\uDD13 รหัส PIN ถูกล้างแล้ว ตั้งค่ารหัส PIN ใหม่ได้ในการตั้งค่าผู้ปกครอง",
    forgot_pin_not_signed_in: "กรุณาสร้างบัญชีหรือเข้าสู่ระบบก่อนใช้การกู้คืนรหัส PIN",
    day_streak:       "วันติดต่อกัน",
    guest:              "แขก",
    are_you_sure:       "แน่ใจหรือไม่?",
    delete_warning:     "ข้อมูลการเรียนทั้งหมดจะหายไปตลอดกาล",
    create_account:   "สร้างบัญชี",
    sign_out:         "ออกจากระบบ",

    // ── Badge popup ─────────────────────────────────────────────
    new_badge:          "ได้รับแบดจ์ :",
    badge_earned:       "ว้าว ! วันนี้ได้เลื่อนขั้น มาพยายามกันต่อนะ 🐼",
    badge_keep_going:   "สู้ต่อไป ! 🐼",

    // ── Guest banner ────────────────────────────────────────────
    guest_banner:       "ข้อมูลการเรียนจะถูกบันทึกบนอุปกรณ์นี้เท่านั้น สมัครสมาชิกเพื่อป้องกันข้อมูลสูญหาย",
    save_my_progress: "บันทึกความก้าวหน้า",

    // ── Auth / Account upgrade ────────────────────────────────
    upgrade_title:        "สร้างบัญชี",
    upgrade_sub:          "ป้อนรายละเอียดของคุณเพื่อบันทึกความก้าวหน้าของคุณให้ปลอดภัยในทุกอุปกรณ์",
    upgrade_email_label:  "อีเมล",
    upgrade_email_ph:     "เช่น somsri@email.com",
    upgrade_password_label: "รหัสผ่าน",
    upgrade_password_ph:  "อย่างน้อย 6 ตัวอักษร",
    upgrade_confirm_label: "ยืนยันรหัสผ่าน",
    upgrade_name_label:   "ชื่อผู้เรียน (ไม่จำเป็น)",
    upgrade_name_ph:      "เช่น สมศรี",
    upgrade_submit:       "สร้างบัญชีและบันทึกข้อมูล",
    upgrade_submitting:   "กำลังสร้างบัญชี…",
    upgrade_success_title: "สร้างบัญชีสำเร็จ! 🎉",
    upgrade_success_body:  "ความก้าวหน้าของคุณถูกบันทึกแล้ว กรุณายืนยันอีเมลของคุณ",
    upgrade_continue:     "ไปที่แอป →",

    signin_title:         "ยินดีต้อนรับกลับ!",
    signin_sub:           "ลงชื่อเข้าใช้เพื่อดูความก้าวหน้าของคุณ",
    signin_email_label:   "อีเมล",
    signin_email_ph:      "เช่น somsri@email.com",
    signin_password_label: "รหัสผ่าน",
    signin_password_ph:   "ป้อนรหัสผ่านของคุณ",
    signin_submit:        "ลงชื่อเข้าใช้",
    signin_submitting:    "กำลังลงชื่อเข้าใช้…",
    signin_error:         "อีเมลหรือรหัสผ่านไม่ถูกต้อง",

    upgrade_banner:       "🔒 ข้อมูลการเรียนของคุณถูกบันทึกบนอุปกรณ์นี้เท่านั้น สร้างบัญชีเพื่อปกป้องข้อมูล!",
    upgrade_banner_cta:   "บันทึกข้อมูล",

    // ── Auth switch links ──────────────────────────────────
    switch_to_signin:     "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ",
    switch_to_upgrade:    "ยังไม่มีบัญชี? สมัครเพื่อบันทึกข้อมูล",

    // ── Duplicate email handling ─────────────────────────────
    auth_email_exists:    "อีเมลนี้สมัครใช้งานแล้ว เข้าสู่ระบบแทนไหม?",

    // ── Password reset ─────────────────────────────────────────
    forgot_password:          "ลืมรหัสผ่าน?",
    reset_password_title:     "รีเซ็ตรหัสผ่าน",
    reset_password_sub:       "ป้อนอีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณ",
    reset_password_sent_title: "ตรวจสอบอีเมลของคุณ \uD83D\uDCE7",
    reset_password_sent_body: "หากมีบัญชีที่ใช้อีเมลนี้ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่านเร็ว ๆ นี้",
    reset_password_submit:    "ส่งลิงก์รีเซ็ต",
    reset_password_submitting: "กำลังส่ง…",
    reset_password_back:      "กลับไปที่เข้าสู่ระบบ",

    // ── Set new password (after recovery) ──────────────────────
    set_new_password_title:       "ตั้งรหัสผ่านใหม่",
    set_new_password_sub:         "ป้อนรหัสผ่านใหม่ของคุณด้านล่าง",
    set_new_password_submit:      "อัปเดตรหัสผ่าน",
    set_new_password_submitting:  "กำลังอัปเดต…",
    set_new_password_success_title: "อัปเดตรหัสผ่านสำเร็จ! \u2705",
    set_new_password_success_body:  "รหัสผ่านของคุณถูกเปลี่ยนแล้ว คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้",
    set_new_password_continue:    "ไปที่แอป \u2192",

    // ── Auth validation errors ────────────────────────────────
    auth_error_email:     "กรุณากรอกอีเมลที่ถูกต้อง",
    auth_error_password:  "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    auth_error_confirm:   "รหัสผ่านไม่ตรงกัน",
    auth_error_generic:   "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",

    // ── Notebook ────────────────────────────────────────────────
    notebook_title:       "📓 สมุดบันทึก",
    notebook_empty:       "ยังไม่มีคำที่บันทึก แตะ 📝 ในหน้าเขียนเพื่อบันทึกคำศัพท์!",
    notebook_add_note:    "+ เพิ่มบันทึก",
    notebook_edit_note:   "แก้ไขบันทึก",
    notebook_remove:      "ลบออกจากสมุดบันทึก",
    notebook_remove_confirm: "ลบคำนี้ออกจากสมุดบันทึก?",
    notebook_note_placeholder: "เพิ่มบันทึก...",
    notebook_see_all:     "ดูทั้งหมด {count} →",
    notebook_sheet_title: "📓 สมุดบันทึก",

    // ── progress.html ──────────────────────────────────────────
    loading_progress:       "กำลังโหลด...",
    stats_total:            "รวม ⭐",
    stats_streak:           "ติดต่อกัน",
    stats_best_streak:      "ติดต่อกันสูงสุด",
    stats_best_day:         "วันที่ดีที่สุด",
    stats_mastered:         "เชี่ยวชาญแล้ว",
    stats_attempted:        "ที่ลองแล้ว",
    journey_next:           "ต่อไป: {emoji} {title} ที่ {pct}%",
    journey_max:            "🎉 ถึงตำแหน่งสูงสุดแล้ว!",
    badges_empty:           "ยังไม่มี badges — ฝึกต่อไป! 🐼",
    mastery_summary:        "{total} คำ · เชี่ยวชาญ {mastered} · ฝึก {practiced} · เห็น {seen}",
    mastery_empty:          "ยังไม่มีคำที่ลองเรียน เริ่มฝึกได้เลย! 🐼",
    mastery_theme_empty:    "ยังไม่มีคำในหัวข้อนี้",
    items_empty:            "ยังไม่มีไอเทม — หา 🪙 เพื่อซื้อของสะสม! 🎁",
    shop_title:             "🛒 ร้านค้า",
    shop_enter:             "เข้าร้านค้า",
    shop_close:             "ปิดร้านค้า",
    shop_empty:             "ไม่มีไอเทมในร้านค้า",
    shop_buy:               "ซื้อ",
    shop_owned:             "มีแล้ว ✓",
    shop_insufficient:      "ต้องการ {cost} 🪙",
    shop_confirm_title:     "ซื้อไอเทมนี้?",
    shop_confirm_body:      "ใช้ {cost} 🪙 เพื่อซื้อ {name}?",
    shop_confirm_yes:       "ใช่, ซื้อเลย!",
    shop_bought:            "คุณซื้อ {name}! 🎉",
    shop_coin_balance:      "🪙 {coins}",
    shop_coins_today:       "เหรียญวันนี้",
    shop_source_game:       "เกม",
    shop_source_badge:      "แบดจ์",
    shop_source_migration:  "ของขวัญต้อนรับ",
    settings_tap_hint:      "⚙️ ตั้งค่า",
    cal_su: "อา", cal_mo: "จ", cal_tu: "อ", cal_we: "พ", cal_th: "พฤ", cal_fr: "ศ", cal_sa: "ส",

    // ── Legend ──
    legend_unseen:      "ยังไม่เห็น",
    legend_seen:        "เห็นแล้ว",
    legend_practiced:   "ฝึกแล้ว",
    legend_mastered:    "เชี่ยวชาญแล้ว",

    // ── Tooltip ──
    tooltip_status_unseen:    "ยังไม่เห็น",
    tooltip_status_seen:      "เห็นแล้ว",
    tooltip_status_practiced: "ฝึกแล้ว",
    tooltip_status_mastered:  "เชี่ยวชาญแล้ว",
    mastered_on:              "เชี่ยวชาญเมื่อ: {date}",

    // ── Calendar months ──
    cal_jan: "มกราคม", cal_feb: "กุมภาพันธ์", cal_mar: "มีนาคม",
    cal_apr: "เมษายน",   cal_may: "พฤษภาคม",    cal_jun: "มิถุนายน",
    cal_jul: "กรกฎาคม",    cal_aug: "สิงหาคม",    cal_sep: "กันยายน",
    cal_oct: "ตุลาคม", cal_nov: "พฤศจิกายน",  cal_dec: "ธันวาคม",

    // ── Calendar day alert ──
    cal_score: "⭐ คะแนน: {score}",
    cal_write: "✍️  เขียน: {count}",
    cal_study: "📚 เรียน: {count}",
    cal_chars: "📝 ตัวอักษร: {count}",

    // ── Recovery page ─────────────────────────────────────────
    recovery_verifying:     "กำลังตรวจสอบลิงก์กู้คืน...",
    recovery_no_request:    "ไม่พบคำขอกู้คืนรหัสผ่าน",
    recovery_invalid_link:  "ลิงก์นี้ไม่ใช่คำขอกู้คืนรหัสผ่านที่ถูกต้อง กรุณาขออีเมลรีเซ็ตใหม่",
    recovery_verify_failed: "ไม่สามารถยืนยันลิงก์นี้ได้ กรุณาขออีเมลรีเซ็ตรหัสผ่านใหม่",

    // ── Password strength ────────────────────────────────────────
    password_strength_weak:       "อ่อน",
    password_strength_fair:       "พอใช้",
    password_strength_good:       "ดี",
    password_strength_strong:     "แข็งแรง",
    password_strength_very_strong: "แข็งแรงมาก",

    // ── Streak ──
    streak_day:  "วัน",
    streak_days: "วัน",
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