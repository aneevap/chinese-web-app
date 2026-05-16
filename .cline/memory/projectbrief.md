# Project Brief

## 🏮 学汉字 (Study Hanzi)

**Goal:** A gamified, offline-first web app for children (ages 5–12) to learn Chinese characters through flashcards, writing practice (HanziWriter.js), games, and progress tracking.

**Tech Stack:**
- Vanilla HTML/CSS/JS (core pages)
- React + TypeScript + Vite (game sub-app in `games/`)
- HanziWriter.js v3 (stroke animation & quiz)
- Supabase (cloud sync — anonymous auth, upgradeable)
- localStorage (primary data store via `XHZ` namespace)

**Design:** "Botes paper palette" — warm cream/tan paper textures, soft brown shadows, custom font stack (Bai Jamjuree, ZCOOL KuaiLe, Nunito, Mali).

**Data:** `courses.json` (course structure), `characters_1A.json`/`characters_1B.json` (vocabulary), `rewards.json` (badges & items). All data read from local JSON files with offline caching via `COURSE_DATA`.

**Persistence:** Local-first with optional Supabase sync. All writes go to localStorage via `profiles.js` and are synced to Supabase asynchronously.

**Repository:** https://github.com/aneevap/chinese-web-app.git
