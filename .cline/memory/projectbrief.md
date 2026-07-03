# Project Brief

## 🏮 学汉字 (Study Hanzi)

**Goal:** A gamified, offline-first web app for children (ages 5–12) to learn Chinese characters through flashcards, writing practice (HanziWriter.js), games, and progress tracking.

**Tech Stack:**
- Vanilla HTML/CSS/JS (core pages: index, study, write, dojo, progress, print, new-learner)
- React + TypeScript + Vite (game sub-app in `games/` — matching + sushi modes)
- HanziWriter.js v3 (stroke animation & quiz in write.html)
- Supabase (cloud sync — anonymous auth with email/password upgrade)
- localStorage (primary data store via `XHZ` namespace in profiles.js)

**Design:** "Botes paper palette" — warm cream/tan paper textures (`paper-grain.png`), soft brown shadows, custom font stack (Bai Jamjuree, ZCOOL KuaiLe, Nunito, Mali). CSS custom properties defined in `shared/design-system.css`.

**Data:** `courses.json` (course structure), `characters_*.json` (vocabulary), `rewards.json` (badges & items), `radicals.json` (222 radicals for lab game), `reactions.json` (1,443 2-radical reactions). All data read from local JSON files with offline caching.

**XP/Level System:** XP = total stars earned (no separate tracking). 80 levels, each unlocking a Chinese radical. Labs (mixing + decomposition) unlocked at Level 5. Paced for ~150 hours to reach Lv 80. Implemented in `shared/lab-engine.js`.

**Persistence:** Local-first with optional Supabase sync. All writes go to localStorage via `profiles.js` and are synced to Supabase asynchronously via `shared/supabase-sync.js`.

**Auth:** Inline auth modal (`shared/auth-modal.js`) with upgrade (anon→email/password), sign-in, password reset, and set-new-password flows. No longer uses a separate `signup.html` page (now deleted).

**Repository:** https://github.com/aneevap/chinese-web-app.git
