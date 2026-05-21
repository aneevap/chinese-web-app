# Active Context

## Current Session (Session 25) — Notebook source for Print + EN/TH i18n + TH meaning enrichment

### Print page: Notebook source
- **Source selector** added to print page — users can choose between 📚 Course and 📓 My Notebook
- Notebook characters appear as selectable tiles (sorted by most recently added)
- "Select All" disabled for notebook (manual selection only)
- Course + theme sections hidden when notebook source active
- Renumbered steps: ① Source, ② Course, ③ Theme, ④ Characters, ⑤ Options

### Print page: Bug fixes
- **Missing `charsPerPage()`** function was lost during refactor, breaking both preview and print. Added back: 8 chars per first page, 10 for subsequent.
- **Notebook char enrichment:** `findWordInCourseData()` helper looks up `zh`, `sent_en`, `sent_th`, and `th` from loaded course data so notebook chars show example sentences and Thai meanings when available
- **Notebook char toggle fix:** closure now correctly uses `this` (DOM element) for classList + captured word for data

### Progress page: EN/TH toggle
- **All dynamic content** now uses `t()` (stats, journey, badges, calendar, mastery, items, notebook)
- **onLangChange** callback registered once in `window.onload` (fixed exponential callback bug)
- **MONTH_NAMES** replaced with dynamic `getMonthNames()` function for live lang updates
- **Remaining hardcoded strings translated:** legend (unseen/seen/practiced/mastered), tooltip status labels, month names, calendar alert labels, streak day/days, notebook TH meaning

### Notebook TH meaning across pages
- **Write/Study:** `memoCurrentWord()` now passes `meaning: wd.en, meaning_th: wd.th` instead of single lang-dependent field
- **Profiles.js:** `addNotebookEntry()` stores and updates `meaning_th` field alongside `meaning`
- **Progress page:** `findInCourseData()` helper provides TH fallback for old entries without `meaning_th`
- **Print page:** same course data fallback for TH meanings in notebook chars

## ✅ Working Correctly
- **Design system migration:** All 8 pages use design system CSS variables
- **paper-grain.png:** Exists at `assets/textures/paper-grain.png` (788 bytes)
- **signup.html:** Deleted
- **Hall of Fame:** Auto-saves scores, leaderboard in result screens, live refresh on dojo.html
- **Duplicate profiles:** Name-only check, auto-merge on `getAllProfiles()`
- **Auth flow:** Upgrade, sign-in, password reset, set-new-password, recovery detection
- **Font weights:** All pages identical (Bai 400-800, Nunito 400-800, Mali 400-700)
- **Sushi mode:** Walking entrance/exit animations, slot-based positioning, bigger hanzi
- **Grid Buster:** 4×4 matching game, multi-round, neo-brutalism board-game aesthetic
- **Sushi mode:** Neo-brutalism redesign matching the board-game aesthetic
- **Error Boundary:** Catches render errors gracefully with fallback UI
- **Dojo page:** Neo-brutalism redesign with centered games grid, accent stripes, achievement card HOF
- **Print page:** Dual source (Course/Notebook), missing charsPerPage restored, notebook char enrichment
- **Progress page:** Full EN/TH i18n support for all dynamic content
- **Notebook entries:** meaning_th stored alongside meaning, course data fallback for old entries
- **Supabase sync:** Notebook data sync support added

## Known Issues
- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- User could close recovery modal without setting password (leaves recovery-limited session)

## Next Steps
- Enhance progress tracking with detailed analytics
- Apply neo-brutalism to remaining core pages (study, write, progress)
