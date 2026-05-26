# Progress

## Completed

### Session 1 — Bug Fixes
- Fixed image garbage collection and rating formula in `study.html`
- Fixed position persistence on revisit in `write.html`

### Session 2 — Data Consolidation
- Removed duplicate JSON files, updated paths in `vite.config.ts` and `vocab.ts`

### Session 3 & 4 — UI Standardization (Phase 2)
- Migrated `index.html` and `new-learner.html` to `shared/design-system.css`
- Updated `dojo.html` and `progress.html` with design system variables
- Applied paper-grain textures, ink tones, and shadow tokens

### Session 5 — Memory Bank
- Initialized Memory Bank documentation structure

### Session 6 — Supabase Integration
- Created `supabase-schema.sql` — 4 tables (profiles, scores, mastery, items) with RLS policies
- Created `shared/supabase-client.js` — Supabase init via CDN with anonymous auth
- Created `shared/supabase-sync.js` — push/pull/merge sync service with pending write queue
- Modified `profiles.js` — `_triggerSync()` hooks on every write operation
- Added supabase scripts to all 7 pages
- Fixed pending write queue (writes during sync init were silently dropped)

### Session 7 — write.html UI Standardization & Bug Fix
- Migrated `write.html` to design system
- Fixed `currentTheme=0` bug

### Session 8 — Account Upgrade Flow (Anonymous → Email/Password)
- Created `shared/auth-modal.js` — full inline modal UI for upgrade, sign-in, forgot/reset password
- Enhanced `shared/supabase-client.js` with auth APIs
- Added auth i18n strings (EN + TH) to `strings.js`
- Integrated auth modal into 4 pages

### Session 9 — Password Reset Callback Flow & Auth Improvements
- Password reset flow with email magic link
- Auto-detection of `type=recovery` URL hash, set-new-password form
- Duplicate email handling, label updates, UX fixes

### Session 10 — Hall of Fame Auto-Save & Leaderboard
- Removed debug button, added leaderboard to result screen
- Auto-save verified with `xhz:dojo-hof-updated` event

### Session 11 — Phase 3: Game CSS → Design System Migration
- All hardcoded colors → design system CSS variables
- Google Fonts preconnect/stylesheet links added

### Session 12 — Auto-Merge Duplicate Profiles
- Changed `isDuplicate()` from name+avatar check → name-only check
- Added `findDuplicateGroups()`, `_mergeGroups()`, `mergeDuplicates()` methods
- `getAllProfiles()` auto-merges duplicates silently on read

### Session 14 — Hall of Fame Save Flow Fix
- Fixed `getGameHighScore()` to find max score across all entries
- Added game card auto-refresh on `xhz:dojo-hof-updated`
- Fixed race condition in save flow with transition-based observer

### Session 15 — Sushi Mode: Walking Animations & Slot Positioning
- Bigger hanzi, slot-based positioning, walking entrance/exit animations
- CSS cascade fix for combined `walkOut` + `correctFlash`

### Session 16 — Hall of Fame Visual Redesign
- Constrained width, trophy cards, podium styling, game badge pills
- Stagger entrance animation, decorative corner flourishes

### Session 17 — Dojo Cleanup & Grid Buster Game
- Removed Write Practice and Study Cards from Dojo
- 4×4 grid matching game with combo detection, course/theme selection
- Hall of Fame leaderboard in result screen

### Session 18 — Grid Buster: Multi-Round & Neo-Brutalism Redesign
- Multi-round support with word tracking via `usedWordIdsRef`
- Neo-brutalism board-game aesthetic throughout

### Session 19 — Error Boundary & Crash Fixes
- Fixed TDZ crash (`startNewRound` useCallback after the effect referencing it)
- `ErrorBoundary.tsx` with fallback UI, wrapped games in `<ErrorBoundary>`

### Session 20 — Sushi Mode Neo-Brutalism Redesign
- All sushi-specific elements updated to board-game aesthetic
- TSX cleanup, HUD fix

### Session 21 — Dojo Page Neo-Brutalism Redesign
- Games grid centered, full CSS redesign
- Hall of Fame achievement cards with podium/silver/bronze styling

### Session 22 — Auto-Repair Stale Profiles After Supabase Sign-In
- `repairAllProfilesFromSupabase()` sets `is_guest: false` on stale profiles
- `auth-modal.js` bug fix: `profile` variable trapped inside `else` block

### Session 23 — Progress page: Notebook compact card & bottom sheet
- Top 5 entries in compact format, "See all N →" button
- Bottom sheet with inline note editing, remove button, escape-key-to-close

### Session 24 — Print page: Notebook source & bug fixes
- Source selector tabs (Course / My Notebook)
- `renderNotebookCharGrid()` loads notebook entries
- `findWordInCourseData()` helper for word enrichment

### Session 25 — EN/TH i18n fixes + notebook TH meaning enrichment
- All dynamic content uses `t()`, fixed exponential callback growth bug
- Notebook entries store `meaning_th`, course data fallback

### Session 26 — Index page: Sign-in option & Recovery page fix
- Added "Sign In" card to profile picker grid
- Reconstructed truncated recovery.html JavaScript with full recovery flow

### Session 27 — Progress page: Font size audit
- Bumped ~25+ selectors by 0.05–0.1em
- Added `font-size: 112%` to `.page-content`

### Session 28 — Guest dot fix after sign-in
- Called `renderProfiles()` after `repairAllProfilesFromSupabase()` completes

### Session 29 — Sushi game iPhone fixes: tap-to-deliver, hide doors, belt edge-to-edge
- Tap-to-deliver via `onClick` on customer slots
- Doors hidden on mobile, belt edge-to-edge

### Session 30 — Mode tab hiding during gameplay (abandoned)
- All 4 approaches failed on iPhone — root cause was stale cache

### Session 31 — Mode tab hiding + scroll lock: debug checklist applied
- Cache buster bumped `?v=24` → `?v=31` (was never bumped since Session 20)
- Scroll locked with nuclear fix (`position: fixed; inset: 0; z-index: 100`)
- Mobile viewport `100vh` → `100dvh`

### Session 32 — Global Hall of Fame, Safari grid fix, TypeScript build unblocked
- Global HOF tabs, sync methods, loading spinner
- Safari CSS Grid fix: `repeat(3, 1fr)` → `repeat(3, minmax(0, 1fr))`
- Removed dead `personalBest` state blocking `tsc` — GitHub Pages deploy unblocked

### Session 33 — Global HOF race condition fix: push→pull timing
- `pushHallOfFameEntry()` dispatches `xhz:dojo-hof-pushed` event after upsert
- 2-second delayed retry in `xhz:dojo-hof-updated` handler

### Session 35 — Sushi plate layout refinements, HUD simplification, custom image directory
- Round plates with `justify-content: space-between`, text top / emoji bottom
- White glow via layered `text-shadow`, simplified HUD (2 indicators)
- Custom sushi image directory `games/public/images/sushi/`

### Session 36 — Spawn timer progress bar, customer area extension, SVG character avatars
- Green juice-bar spawn timer replacing text countdown
- Customer area extended to belt (320px padding), seats at `top: 220px`
- SVG character images in `images/characters/`

### Session 37 — Drag-and-drop fixes, tap-to-select fix, drop zone redesign, customer scaling
- Removed `setPointerCapture` (was breaking DnD), replaced with `elementFromPoint`
- Fixed double-scoring, tap-to-select ref lifecycle
- Drop zone → translucent square with cancel button
- Customers and stools scaled 50% larger

### Session 38 — Drop zone fully invisible + git push documentation
- Drop zone made fully transparent (no background/border/shadow)
- Git push failures documented in memory files and README

### Session 39 — Flash Match overhaul: HUD, card styles, background, gameplay logic, time popups
- Sushi-style HUD (Score/Stage/Timer), green/red gradient cards
- Custom background (`images/matching-bg.png`), dynamic grids
- Combo time bonus (+3s per 5 correct), stage bonus (+5s), wrong penalty (-1s)
- Time popup animations with green glow float-up

### Session 40 — Flash Match UI fixes, mascot swap, pushAll fix, iPhone fixes
- Removed 🔤 emoji and description from start screen, borderless back button
- Replaced mascot with `pandarocket.png`, added `panda_flash.png` on victory screen
- **Image path fix:** `../assets/mascot/` → `assets/mascot/` (paths resolve from `dojo.html` at root, not component file depth)
- **Fixed pushAll():** enqueues when sync isn't ready (was silently dropping)
- **Mobile grid centering:** `width: 100%` → `width: min(94vw, 520px)` — 100% width made `margin: auto` a no-op
- **Mobile font sizes bumped:** characters 1.35→1.7rem, meanings 0.85→1.05rem
- **Cache buster:** `v=35`→`v=36`→`v=37`
- **Dead CSS cleanup:** removed orphaned `.start-sushi-icon` and `sushiSpin`

### Session 41 — iPhone fixes: parent-level grid centering, mascot z-index
- **Parent-level centering:** Added `align-items: center` to `.matching-mode` (more reliable than `align-self` on child for iOS Safari)
- Added `align-self: stretch` to HUD and header to keep them full-width
- **Mascot z-index:** Changed `z-index: 50` → `z-index: 0` so it renders behind the grid (`z-index: 1`)
- **Cache buster:** `v=37`→`v=38`

### Session 42 — Stage grid layout change
- Stage 1: `2×4` → `3×3` (9 cells, 4 pairs + 1 empty)
- Stage 2: `2×5` → `3×4` (12 cells, 6 pairs)
- `Math.floor(totalCells / 2)` handles odd cell counts naturally

### Session 43 — Documentation update
- Updated all `.cline/memory` files and `README.md` with complete fix history
- Added troubleshooting guide for changes not appearing on live site
- Documented critical lessons: build + cache buster, image path resolution, iOS Safari quirks

## Persistent Issues
- **Git push silently fails ~50% of the time** from the assistant (basher agent). Fix: always run `git push origin main` explicitly.
