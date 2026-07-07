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

### Session 43 — Documentation update (2 rounds)
- Updated all `.cline/memory` files and `README.md` with complete fix history
- Added troubleshooting guide for changes not appearing on live site
- Documented critical lessons: build + cache buster, image path resolution, iOS Safari quirks, git push workaround
- Reorganized `activeContext.md` chronologically by session with cache buster tracking per change
- Restored critical lessons section (was accidentally removed during reorganization)
- Fixed session numbering consistency between `activeContext.md` and `progress.md`

### Session 44 — Score Calibration, Game Star Removal, HOF Migration

**Score calibration (Phase 4):**
- Added `gameId` param to `applyCorrect()` with multiplier lookup (sushi: 1.0, matching: 0.33)
- Passing `gameId` through `CORRECT` dispatch from both games
- Flash Match scores now ~1/3 of original — leaderboard fair across games

**Phase 1 — Strip game stars:**
- Removed `addStudyStars()` from `profileBridge.ts`, `SushiMode.tsx`, `MatchingMode.tsx`
- Games produce only score (leaderboard) + coins (shop) now

**Stars field removal (scope expansion):**
- Removed `stars` from `ScoreState` (scoring.ts, gameState.tsx)
- Removed all `state.stars` references from game HUD, result screens, and deps
- Removed `bestStars` from `HallOfFameEntry` type, `hallOfFame.ts` sort, and `dojo.html` plain JS renderer
- Removed `.score-stars` CSS class

**HOF score migration:**
- Added `migrateOldMatchingScores()` — localStorage: divides old Flash Match scores by 3
- Added `migrateSupabaseMatchingScores()` — Supabase: same migration for global leaderboard
- Both run once on page load

**Dev tooling:**
- Added `npm run watch` script (`vite build --watch`) for auto-rebuild during development
- Documented key lesson: dojo.html has its own HOF renderer, separate from React code

### Session 45 — Phase 2: Coin Economy Implementation

**Coin data model (profiles.js):**
- Added `coins`, `coins_earned_total`, `coins_sources` to profile creation
- Added `addCoins()` with daily cap per source (once per source per day)
- Added `spendCoins()`, `getCoins()`, `getCoinSources()`, `getCoinsEarnedTotal()`
- Added `awardGameCoin(gameId)` for daily-capped game coin awards
- Added `migrateCoinsForExistingItems()` — 5 coins per previously earned item
- Added `_ensureCoinFields()` for backward compatibility
- Modified `addScore()` — awards 1 coin for newly reached badge tier
- Removed `getUnlockedItemsByStars()` (dead code referencing removed `min_stars`)

**Game integration:**
- MatchingMode: calls `awardGameCoin('matching')` on victory + time-up
- SushiMode: calls `awardGameCoin('sushi')` on game end
- profileBridge.ts: added `awardGameCoin()` bridge + coin types on window.XHZ

**Item economy (rewards.json):**
- Expanded from 14 → 22 items with `coin_cost` (6–100)
- 8 new items added: lollipop, ice cream, sparkle aura, scroll, jade ring, festival lantern, silk scarf, moon cake, golden crown
- All `min_stars` references removed

**Bug fixes:**
- Fixed badge coin awarding: was looping all 4 BADGE_TIERS on any badge change → now awards 1 coin for the specific newly unlocked badge only
- Updated `items_empty` string in strings.js (EN + TH) to reference coins instead of stars

### Session 46 — Phase 3: Shop Toggle (Hide items behind Enter Shop button)

**Problem:** All shop items were visible at once, making the page look messy.

**Solution:** `.section-hidden` pattern from write.html — shop items hidden until user clicks "🛍️ Enter Shop ▾".

**Changes (progress.html):**
- Added `.shop-hidden .shop-content { display: none !important }` CSS
- Added `shop-enter-btn` with icon/label/arrow spans (no `data-i18n` attribute to avoid refreshStrings conflict)
- Added `_shopOpen` state and `toggleShop()` function
- `renderShop()` starts with `shop-hidden` class, arrow reset to ▾
- DOMContentLoaded safety init

**Strings (strings.js):**
- Added `shop_enter` / `shop_close` in EN and TH

### Session 47 — Arena Page Visual Redesign

**Layout restructure:**
- Changed from stacked column to horizontal flex top row (panda left, header "Arena" + description centered in remaining space)
- Game cards (Sushi Conveyor, Flash Match, panda_arena.png) + Hall of Fame unchanged beneath the top row

**Visual changes:**
- "Arena" header font-size doubled (1.5rem → 3rem desktop, 2.2rem @640px, 1.8rem @480px)
- Off-white `#F5F0EB` round circle behind the panda (profile picture style, no border, via `::before` pseudo-element)
- Third game card replaced "Coming Soon" lock button with full-bleed `panda_arena.png` image
- Removed duplicate `updateAuraLayer()` dead code

**Files changed:** `arena.html`

### Session 48 — Console Error Sweep (All 8 Pages)

**Fix 1 — Aura PNG 404 (arena.html, panda-display-preview.html):**
- Stripped `_aura` suffix from item.id when building aura PNG path
- E.g., `sparkle_aura` → `aura_sparkle.png` (was attempting `aura_sparkle_aura.png`)

**Fix 2 — Supabase notebook 404 (shared/supabase-sync.js):**
- Silently returned on 'notebook table not found' errors
- Restored `console.warn` after notebook SQL was prepared

**Fix 3 — Auto-merge crash (profiles.js):**
- Added `if (!p || !p.nickname) return;` guard before `p.nickname.toLowerCase()`
- Prevents TypeError in `findDuplicateGroups()`

**Fix 4 — Missing setEffortItems (profiles.js):**
- Added `_effortItems: null`, `setEffortItems(items)`, `getEffortItems()` to XHZ object
- Fixes "XHZ.setEffortItems is not a function" on write.html and study.html

**Verification:** All 8 pages verified — zero console errors. Only `rest/v1/notebook` network 404 remains.

### Session 49 — Notebook SQL for Supabase

- Notebook table definition already in `supabase-schema.sql` (CREATE TABLE IF NOT EXISTS, RLS, index)
- Dashboard instructions provided to user for manual SQL execution

### Session 50 — Phase 5: Panda Mascot Display on Progress Page

**HTML structure (progress.html):**
- Added `.panda-viewport` card between Collection and Shop sections
- 6 visual layers stacked via z-index: aura (10) → base (20) → clothing (30) → head (40) → tool (45) → food (55)
- Status chips below the viewport showing active categories (aura, clothing, head, tool, food)
- `.panda-empty` fallback state when no items are equipped

**CSS:**
- Viewport: 320px max-width, 1:1 aspect-ratio, warm gradient background (#FFF8E7→#FFF0D0), rounded corners
- Aura glow: radial gradients per type (sparkle, flame, rainbow, star) with pulse animation
- Status chips: pill-shaped with `.active` toggle styling

**JavaScript (`renderPandaDisplay()`):**
- `PANDA_CATEGORIES` + `PANDA_SLOT_MAP` mapping categories → layer/placeholder DOM IDs
- `getPandaVariant()`: returns variant name + base emoji based on equipped food/tool combos
  - Stand-still 🐼 (no items)
  - Foody 🍭 (food equipped)
  - Warrior ⚔️ (tool equipped)
  - Foody Warrior ⚔️🍭 (both equipped)
- Renders: toggles card/empty state, sets base emoji, handles aura glow CSS class, updates each layer emoji, toggles chip active states
- Integrated into `renderAll()` and `toggleItem()` so display updates when items are equipped/unequipped
- Empty-state message changed to "Equip items from your Collection to dress up the panda! 🎨"

**Files changed:** `progress.html` (+~150 lines CSS + ~80 lines JS + HTML structure)

### Session 50b — Panda Display Bug Fix: PNG Paths & Accessory Support

**Two critical bugs fixed in progress.html:**

1. **Aura PNG paths**: Items like `sparkle_aura` generated path `aura_sparkle_aura.png` but actual file is `aura_sparkle.png`. Fixed by stripping `_aura` suffix in `updatePandaLayerWithPNG()`.

2. **Accessory items never rendered**: 8 items with `category: "accessory"` (dragon_cape, straw_hat, cool_glasses, magic_fan, jade_ring, hair_bow, silk_scarf, golden_crown) were stored in `equipped.accessory` but the render loop only checked `PANDA_CATEGORIES = ['aura', 'clothing', 'head', 'tool', 'food']` — all accessories were silently ignored.

**Fix**: Both `getPandaVariant()` and `renderPandaDisplay()` now build a `displayMap` that resolves each equipped item's `panda_layer || category`, so accessories render on the correct visual layer and are detected for variant selection.

**Files changed:** `progress.html`, `rewards.json` (already had panda_layer fields)

### Session 52 — Cleaned Up Unused Pages

- **Deleted `dojo.html`**: Completely replaced by `arena.html`. Its content was already a bare redirect page. No nav links or external references point to it. README references updated.
- **Deleted `panda-display-preview.html`**: Preview/test page with zero references anywhere in the project.
- **README cleanup**: Removed dojo.html from file tree; changed "Dojo" → "Arena" in descriptions, testing instructions, and known issues.

### Session 51 — Arena Page: Badge Display, Daily Badge Emoji Integration & Polish

**Problem:** Badge shelf section was hidden/invisible on arena page. Badges were not showing despite correct detection logic.

**Fix:** Removed the standalone badge shelf entirely. Badge emoji are now shown inline inside the player name pill, next to the daily mission indicator.

**Changes (`arena.html`):**
- Removed `.arena-badges` HTML section, CSS, and `renderArenaBadges()` function
- Modified `setPlayerName()` to read today's `badge` and `study_badge` from the day record, resolve to emoji via `__arenaBadges`, and append to the `daily-badge` span
- Both games done → `🎯` + badge emoji(s) with `.complete` class (full opacity)
- One game done → badge emoji(s) or `○` (dimmed)
- None done → badge emoji(s) or empty
- Fixed null-safety: `XHZ.getActiveProfile().id` → `profile.id`, added `profile` guard to badge block
- Added 8-direction white `text-shadow` stroke to `.daily-badge` for emoji contrast against gold-to-coral gradient

**Files changed:** `arena.html`

### Session 53 — Arena: Dynamic Mission Text (Coin-Based)

**Problem:** Mission speech bubble always showed both Sushi Shop & Flash Match, even after coins earned for one or both games.

**Solution:** Added `updateMissionText()` that checks `coins_sources` + `game_scores` and builds appropriate HTML:
- Both coins earned → "You have worked hard today! 💪"
- Only Sushi earned → mission mentions only Flash Match
- Only Flash Match earned → mission mentions only Sushi Shop
- Neither earned → full mission with both games

**Files changed:** `arena.html`

### Session 55 — Shrink Arena Profile Avatar on iPhone

- **Changed the right element this time:** `.arena-panda-panel` width at 480px reduced from 150px → 105px (30% smaller) — this is the paper doll profile avatar the user was actually referring to
- **Proportional overlap:** `.avatar-name` margin-top from -28px → -20px to match the smaller panel radius
- Session 54's change (mission panda 80px → 56px) retained as reasonable improvement

**Files changed:** `arena.html`

### Session 56 — iPhone layout: Header above avatar, avatar 20% smaller

- **Stacked layout:** `.arena-top-row` at 480px changed to `flex-direction: column` with `order: -1` on `.arena-top-text` so Arena header appears above the profile avatar
- **Avatar 20% smaller:** `.arena-panda-panel` width at 480px reduced from 105px → 84px
- **Name badge adjusted:** `.avatar-name` margin-top from -20px → -16px (proportional)

### Session 57 — Daily Login Coin (Arena only)

- **Added `awardDailyLoginCoin()` to `profiles.js`** — awards 1 coin per day with source `daily_login`, daily-capped via existing `addCoins()` mechanism
- **Triggered from arena.html** — called right after `XHZ.requireActive()` in `DOMContentLoaded`, so every visit awards the login coin silently

### Session 58 — Daily Login Coin Extended to Study & Writing

- Users visiting study.html or write.html first (without going to arena) were missing their daily login coin
- **study.html**: Added `XHZ.awardDailyLoginCoin()` after `XHZ.requireActive()` in DOMContentLoaded
- **write.html**: Added `XHZ.awardDailyLoginCoin()` after `XHZ.requireActive()` in window.onload
- Now all three main pages (arena, study, write) award the daily login coin on first visit each day

### Session 59 — Toast Notification for Daily Login Coin

- Added visual toast notification when the daily login coin is actually awarded (first visit of the day)
- **Toast message**: `🪙 +1 Daily login coin!` — slides in from top-right, auto-dismisses after 2.5s
- Only shows when coins are earned (return > 0) — subsequent same-day visits are silent
- **arena.html**: Added `#toast-container` div + `showToast()` function + return value check
- **study.html**: Already had toast infrastructure — wrapped existing call in `if (> 0)` check
- **write.html**: Added `#toast-container` div + `showToast()` function + return value check

### Session 60 — Panda Sizing Fixes (iPhone ≤480px)

**Round 1:**
- **Mission panda** (speech bubble `.mission-panda-img`): 56px → **84px** (50% larger)
- **Profile panda** (paper doll `.arena-panda-panel`): 84px → **67px** (20% smaller)
- User noted this made mission panda bigger than profile panda — felt backwards

**Round 2 (Session 60b):**
- User clarification: the profile panda frame (round circle) controls visible size, not just the image
- **Profile panda** (`.arena-panda-panel`): 67px → **200px** — clearly the main panda
- **Mission panda** (`.mission-panda-img`): 84px → **85px** — visibly smaller, secondary
- **Name badge overlap**: `.avatar-name` margin-top from -16px → **-34px** (proportional to 200px panel)
- User confirmed these sizes look correct

## Zombie Spell Defense — Gameplay Enhancements (v3)

### File
- **`zombie-game-playground.html`** — standalone playground (like `avatar-playground.html`)
- **Status:** ✅ Enhanced with clickable slots, slot defeat animation, distance bars, difficulty tuning, bug fixes, enlarged battlefield

### New Features (v3)

**1. Clickable Character Slots**
- Each filled slot is clickable — click any active zombie's slot to switch writing to that character
- Active slot gets gold border + golden glow + colored character text
- Auto-selects first alive zombie on spawn if nothing is being written
- Edge cases: clicking empty/already-active slot = no-op; defeating active zombie shifts highlight

**2. Slot Defeat Animation**
- 0.7s animation when zombie dies: pulse (scale 0.92→1.05) → gold glow → red flash → shrink + fade out
- Inner content fades out simultaneously; pointer-events disabled during animation
- After animation, slot removed and remaining slots shift left

**3. Distance/HP Bar Under Zombies**
- Progress bar below each zombie showing remaining distance to castle
- Green (>50% distance) → Yellow (25-50%) → Red (<25%) with matching glows
- Width updates each frame with smooth 0.15s transition
- Fades out during death animation; responsive sizes (36×4 → 30×3 → 26×3)

**4. Easy Mode Slowdown**
- baseSpeed 0.3 → 0.2 (60% slower than Normal's 0.5)
- Wave scaling still applies (+0.06/wave, cap 1.5)
- Start screen footer: "Easy: slow zombies, stroke guide & hints"

### Bug Fixes

**Bug: Writing area stuck on zombie that hit castle**
- When zombie reaches castle and is removed, writing area now auto-switches to next living zombie or clears
- Check runs after toRemove cleanup loop in updateGame()

**Bug: Normal mode writing board unresponsive**
- `showOutline: false` prevented HanziWriter from creating stroke target zones for quiz detection
- Fix: `showOutline: true` always; Normal mode uses dim `#1E1030` color (nearly invisible against dark canvas)
- `showCharacter: true` always; charColor dimmer for Normal (`#555577` vs `#8888AA`)
- Normal mode challenge: no visible outline guide + strict 1.0 leniency + faster zombies

### Enlarged Battlefield
- `.z-battle-field`: fixed 300px → `flex: 1; min-height: 220px` (fills available space)
- Responsive min-heights: 180px at 520px, 150px at 360px
- Spawn margin: hardcoded 10px → `Math.min(fw, fh) * 0.08` (proportional)

### Current Difficulty Matrix
| Feature | Easy | Normal |
|---|---|---|
| Stroke outline guide | Visible `#3D2D55` | Dim `#1E1030` (near invisible) |
| Character reference | Visible `#8888AA` | Dim `#555577` |
| Stroke animation speed | 0.5 | 1.0 |
| Quiz leniency | 1.5 | 1.0 |
| Base zombie speed | 0.2 | 0.5 |
| Points per stroke | 10 (30 on crit) | 15 (45 on crit) |

## Mastery Requirement Fix — Both Study & Writing Required for "Mastered"

### Problem
Users could reach "mastered" status purely through writing. In `_updateWordMastery()`, when `write_cleared_count >= 2`, it auto-set `quiz_cleared = true` — meaning 2 perfect writing scores were enough without studying.

### Fix (`profiles.js`)
- **Root cause:** Auto-set of `quiz_cleared = true` when `write_cleared_count >= 2` allowed writing alone to unlock "mastered"
- **Fix:** Removed the auto-set block. `quiz_cleared` now only comes from `markQuizCleared()` in study.html
- **Result:** Users now MUST both study (quiz_cleared) AND write (2 perfect scores) to reach "mastered"
- **Backward compat:** `migrateOldMasteryData()` still sets both flags together — old data already met the previous requirements

## Session 64 — Journey Card Redesign & Write Auto-Scroll Fix

### Journey Card Redesign (`progress.html`)
- Stage images (6 PNGs: egg→hatch→cub→lantern→guardian→champion) replace the old progress bar
- Full-screen celebration overlay with confetti particles on stage-up
- Background image placeholder system behind the stage image at 25% opacity
- Emoji fallback when no image exists; scenic backgrounds per year (village/temple/palace)
- localStorage stage tracking prevents re-triggering celebrations

### Write Auto-Scroll Fix (`write.html`)
- **Problem:** Auto-scroll only checked `ma.status === 'mastered'`, but "mastered" now requires study quiz + writing
- **Fix:** Now checks `write_cleared_count >= 2` (2 perfect 3-star writes) OR `status === 'mastered'`
- Auto-scroll now triggers when writing practice is fully done, regardless of study quiz status

### Cache buster update
- `?v=40` → `?v=43` (cumulative across Sessions 52–64)

### Files changed
- `progress.html` — Journey card redesign + celebration overlay + background placeholder
- `write.html` — Auto-scroll condition fix
- `.cline/memory/activeContext.md` — Added background image creation guide

## Session 65 — Dashboard Bento Redesign (Action Launch Rows + Pastel Toy Aesthetic)

### Overview
Overhauled `dashboard.html` to fix "Box-ception" and improve affordance for young learners. Transformed passive nested frames into vibrant action launch rows with 3D pastel buttons (Nintendo Switch-style).

### Changes

**1. Speech bubble greeting** — White bubble with `::after` triangle tail pointing up toward panda, Mali font, `var(--text-dark)` border+shadow. Responsive: 200px max at 420px.

**2. Journey stage images in trophy case** — Stage-specific PNGs (egg→hatch→cub→lantern→guardian→champion) replace plain emoji. Enlarged 60px → 80px. Fallback edge case: empty src now properly shows 🏆.

**3. Mastery % fix** — Dashboard was counting across ALL courses (mixing year groups). Now matches progress page: determines active year group → filters words to that year → calculates % within that group only. Added `DASH_COURSES` global, `mastery_titles.find()` by `year_group`.

**4. CTA button relocated** — Moved from avatar stage to stamp card. Color changed yellow→salmon→blue through user iterations. `margin-top: auto` for bottom placement. Hover lift + brightness.

**5. Quest rows → Action launch rows** — Stripped nested white sticker frames. Dashed dividers instead of box backgrounds. 3D colored buttons (green/orange/purple) with squish feedback. Initially too bulky; slimmed down per feedback.

**6. Pastel toy aesthetic (Nintendo Switch-style)** — Full CSS redesign per user spec:
- Pure white cards with `3px var(--text-dark)` border, `24px` radius, `6px 6px` solid shadow
- `--text-dark: #2C1A0B` (deep coffee brown), pastel green/orange/yellow
- Pill-shaped buttons (20px radius), dark brown text, unified `5px` text-dark shadow
- `:active` squish: translateY(4px), shadow flattens to 1px
- Stamp dots: 28px dashed → 16px solid, `var(--pastel-yellow)` active
- CTA button: pastel yellow, matches 3D pill style
- Removed `overflow: hidden` and `filter: drop-shadow` from cards

**Files changed:** `dashboard.html` only

**Status:** User noted "doesn't look right yet" — revisit tomorrow.

---

## Session 66 — Dashboard Polish: Panda Variant Fix, Text Fixes, Quest Board Prep

### Overview
Multiple polish passes on `dashboard.html` fixing the panda avatar overlap (variant system ported from progress page), text display/i18n issues, button overflow, and quest board frame design before settling on a 9-slice SVG border placeholder approach.

### Changes

**1. Panda variant system ported** — Fixed "two layers of pandas" overlay by porting `VARIANT_PNG_MAP`, `getPandaVariant()`, `updatePandaBaseLayer()` from progress.html. Base image now swaps to `panda_foody.png`, `panda_warrior.png`, or `panda_foody_warrior.png` based on equipped items instead of always showing `panda_stand.png` with items overlaid.

**2. Text display fixes** — Removed i18n JS overrides (`t('dash_journey_header')` and `data-i18n="dash_start_mission"`) that were displaying i18n keys instead of the intended text. Headers now correctly show "MY JOURNEY" and "🚀 START TODAY'S MISSION".

**3. Button overflow fix** — `white-space: nowrap` → `normal`, reduced padding/font-size, added `word-break: keep-all` + `overflow-wrap: break-word` + `box-sizing: border-box`.

**4. Quest board simplified for 9-slice SVGs** — Built a carved wooden 3-layer frame → user didn't like it → reverted to a clean container with placeholder gold borders. All complex frame CSS (`.quest-board-frame`, `.qbf-cap`, `::before` overlay, ribbon pseudo-element tails) removed. Marked with `/* ══ PLACEHOLDER ══ */` comments for future SVG border-image swap.

**5. 9-slice setup documented** (`onboarding-audit.md` §8) — SVG file paths, 80×80 px slice grid diagram, CSS `border-image` recipes, activation steps.

**Files changed:** `dashboard.html`, `onboarding-audit.md`

---

## Session 67 — Dashboard: Responsive Overhaul, Mastery Fix, Quest Reward, Cleanup

### Overview
Major polish pass on `dashboard.html` — responsive layout restructured for iPhone, mastery percentage fixed to match progress page, daily quest reward system, and extensive dead code cleanup.

### Changes

**1. Responsive layout overhaul (iPhone ≤640px)**
- **Top bar:** Horizontal row with avatar+streak left, coins right (was 3 stacked rows)
- **Ribbon restructured:** Moved from top bar to `.dash-main` as sibling of `.panda-col` and `.quest-board`. Desktop: absolute `top: -60px; right: 0`. Mobile: `position: relative`, flows naturally between panda and quest board, right-aligned.
- **Bottom row:** My Journey full width on top, Daily Bonus (70%) + Parent Settings (30%) below on mobile
- **Journey card width fix:** `width: 100%; min-width: 0` at ≤900px overrides flex-era values
- **Compact spacing:** Top bar gap, ribbon padding, speech bubble, panda viewport (220→100px at ≤400px), main area gaps all reduced
- **Ribbon border removed** on mobile; coins font size reduced to 0.75rem

**2. Mastery percentage fix**
- **Bug:** Dashboard loaded ALL courses but progress page only loaded attempted ones. Dashboard included unattempted courses in year group word count, lowering percentage.
- **Fix:** Added `attemptedCourseIds` detection (same pattern as progress page), filtered `yearWords` to only attempted courses

**3. Daily quest reward**
- Awards 1 bonus coin via `addCoins(id, 1, 'daily_quest_complete')` when all 3 quests complete (daily-capped)
- Shows 👍 + "You completed today's quest! Good job! +1 🪙" on completion
- Removed XP display (no XP system exists)
- Removed dead `.rp-pill` CSS/JS, dead `.reward-panel.claimed` CSS

**4. Removed elements**
- Broken `rewards.html` link (treasure chest `<a>` → `<div>`)
- Gift box icon (🎁) from top-right nav bar
- "Clear Local Data" button from parent settings

**5. Encouraging ribbon text**
- Changed from streak-based to 10 random encouraging phrases (no day numbers)
- Random pick on each page load

**6. Dead CSS cleanup**
- Removed `.tb-center` base CSS, `.rp-pill` block, `.reward-panel.claimed` rules, `overflow: visible` from `.dash-top-bar`

### Files changed
- `dashboard.html`

---

## Sessions 70-74 — Arena Layout, Zombie Game HOF, Stats Sync

### Session 70 — Arena: Mobile layout restructured
- Header moved to top of arena-upper, mobile uses CSS Grid with `display: contents`
- Desktop 2-column grid preserved, games-grid stays in arena-right
- Fixed absolute positioning conflict overriding mobile avatar placement
- bg-mountains on arena-upper, bg-bamboos on arena-lower

### Session 71 — Zombie game unlock + name change
- "Zombie Chase" → "Zombie Strike" in GAMES array
- Unlock logic verified: locks without full Course 1A mastery, unlocks after mastery injection
- Locked cards now visible on mobile (removed `display: none` from 480px media query)

### Session 72 — Zombie HOF + testplayer deletion
- Zombie Strike added to both Local and Global HOF rankings
- "Test Player" (score 1000) deleted from Supabase hall_of_fame table

### Session 73 — Zombie game iPhone layout fix
- Battlefield min-height: 180→140px (≤520px), 150→110px (≤360px)
- Writing box: 130→110px (≤520px), 110→90px (≤360px)
- Slots: 44→40px (≤520px), 38→34px (≤360px), gaps reduced
- Added `overflow-y: auto` to .z-arena, `min-height: 0` to .z-page

### Session 74 — Profile stats sync fix
- Fixed: Stars showed today's score (`getTodayScore()`) instead of lifetime total
- Created `syncProfileStats()` helper using `XHZ.getTotalStars(p.id)`
- Deduplicated 4 copies of sync code, added sync to focus handler

## Session 75+ — Lab/XP System: Design, Data, & Engine

### Design Phase — Laboratory Game & XP/Level System
- Full design plan created in `laboratory-plan.md`
- Chemistry-lab-themed minigame where users collect radicals and mix them to discover characters
- **XP = total stars earned** — no separate tracking needed
- **80 leveled radicals** (levels 1-80) + **142 decomposition-only** discovered through lab
- **3 decomposition categories:** both_decomp (117 chars), mixed (1,010 chars), both_leveled (316 chars — not decomposable)
- **Lab energy system:** 1-2 decompositions per day (resets daily)
- **Zero orphans:** All 142 decomposition-only radicals earnable through course characters

### Phase 1: Data Foundation
- `scripts/extract-lab-data.js` — extracts radicals + reactions from chinese-lexicon
- `radicals.json` — 222 radicals with unlock levels, categories, frequency, source field
- `reactions.json` — 1,443 2-radical reactions with decomp_category field
- All radicals have `source: 'leveling' | 'decomposition'`
- All reactions have `decomp_category: 'both_leveled' | 'both_decomp' | 'mixed'`

### Phase 2: XP/Level Engine
- `shared/lab-engine.js` — extends XHZ with level computation, radical storage, lab energy, mixing helpers
- API: `getLevel()`, `getLevelProgress()`, `getMyLevel()` — level from total stars + thresholds
- Storage: `xhz_lab_{profileId}` in localStorage (earned radicals, discovered chars, decompositions, claimed levels)
- Lab energy: `getLabEnergy()`, `canDecompose()`, `useDecomposition()` — 1-2/day with daily reset
- Level rewards: `getUnclaimedLevelRewards()`, `getLevelRewardOptions()`, `claimLevelReward()`
- Mixing: `checkReaction()`, `getAffinities()`, `loadReactionData()`
- Auto-claim: levels 1-5 auto-awarded, 6+ requires user choice (branching)

### Pacing Decision: 150 hours to Lv 80
- Research: Duolingo 45-300 hrs, Khan Academy 50-100 hrs per subject — 150 hrs is a solid full playthrough
- **TARGET_MAX = 14,700 stars** (was 33,394) — scaled by factor 0.440
- Lv 5 (Lab unlocks): Day 3 at 30 min/day
- Lv 10 (Branching): Day 7
- Lv 25 (Advanced mixing): Day 31 (~1 month)
- Lv 50: Day 125 (~4 months)
- Lv 80: Day 300 (~10 months, 150 hours)
- `scripts/extract-lab-data.js` updated with new TARGET_MAX, `radicals.json` regenerated

### Page-by-Page Audit Complete
- 12 pages analyzed: 3 High priority, 2 Medium, 2 Low, 4 None, 1 Build
- Full integration checklist in `laboratory-plan.md §7`
- Script loading order: profiles.js → lab-engine.js → radicals.json + reactions.json fetch

## Radical Replan — Doodle God Style Discovery

### This session
Decided to replace linear level-based radical unlock with a **tree-based discovery system** inspired by Doodle God. Created `radical-categories-plan.md` with full categorization of 222 radicals into 6 thematic categories, discovery compound logic, progression structure, and implementation plan.

### Six categories
| Category | Emoji | Radicals |
|----------|-------|:--------:|
| 🌿 Nature & Cosmos | ☀️🌊 | ~35 |
| 👤 Humanity & Body | 🖐️❤️ | ~35 |
| 🌸 Flora & Fauna | 🐾🌾 | ~35 |
| 🏛️ Civilization & Tools | 🔧👘 | ~40 |
| ✨ Abstract & Symbols | 🔢🔤 | ~25 |
| 🔬 Discovery Compounds | 🧪⚗️ | ~30 |

### Done: Doodle categories wired into lab UI
- Updated `_categoryEmoji()` in laboratory-playground.html — reduced from 11 old categories to the 6 Doodle God categories: nature (🌿), body (🫀), civilization (🏛️), fauna (🐾), abstract (💭), other (🔮)
- Branching options modal now reads `opt.doodle_category` instead of `opt.category` for both emoji icon and label display
- Old `category` field preserved in data as fallback; UI only shows Doodle God categories

### Next actions
- Add category tabs/filters to lab UI mixing station
- Wire Doodle God discovery chains
- Deploy lab UI to arena.html with level gating (Lv 5 unlock)

## Session 75+ — Lab UI Polish: Game-ification Overhaul (Alchemist's Toolkit)

### Game Design Assessment
Game design feedback identified that the radical inventory felt like a spreadsheet. Key changes:

**1. Parchment Cards (IN PROGRESS)**
- Replacing shelf chips with floating parchment-textured cards with drop shadows
- Category color accent as small badge or left border
- Chips now look like physical items on a shelf, not spreadsheet cells

**2. Elemental Orb Filters (Planned)**
- Replace text shelf headers with glowing category orbs
- Smooth animation transitions for filtering

**3. Wing Work Trays (Done)**
- Wings show distinct content: Partners (left) vs Others (right)
- Headers added for clarity

**4. Background Decor (Planned)**
- Faint alchemy equipment line art behind the UI

**5. Discovery Animation (Planned)**
- New radical arrival animation

### Previous: Wings fix & layout tightening
- Removed empty beaker result box (the "?" space)
- Tightened layout spacing
- Wings now show different content per wing with headers
- Right wing shows "Others" (non-partner earned radicals) instead of duplicating left

## Aesthetic Audit — Lab Page vs Dashboard Direction (Current Session)

### Assessment
Conducted a thorough visual audit of `laboratory-playground.html` against the latest design direction (dashboard's neo-brutalist pastel toy aesthetic from Sessions 65-67).

### Key Findings (7 gaps identified)
1. **Card borders & shadows**: Lab uses 1px thin borders with soft shadows; dashboard uses 3px thick borders with solid offset shadows (6px 9px 0 0). Lab feels flat.
2. **Buttons**: Lab buttons are standard rounded pills; dashboard has 3D buttons with `:active` squish and offset shadows.
3. **Panda mascot**: Lab has no mascot presence — dashboard has avatar, speech bubble, and clickable panda throughout.
4. **Top bar**: Lab uses glassmorphism with background chips; dashboard has clean frameless horizontal layout.
5. **Color palette**: Lab uses original Botes palette (muted); dashboard has richer `--db-*` palette.
6. **Empty states**: Lab uses text-heavy muted emoji states; could be more playful.
7. **No visual cohesion across card types**: Lab has 6+ different card styles (parchment chips, wing chips, collection cards, decomp cards, discovered cards, stat cards) that don't feel part of one system.

### Proposed Next Stage
**Phase 3.5 — Visual Cohesion Overhaul** — Bridge lab with dashboard aesthetic:
1. Unified neo-brutalist card system
2. 3D button redesign
3. Streamlined top bar
4. Panda mascot integration
5. Tab & filter polish
6. Empty state/toast brush-up
7. Background decorative line art

## Session: Flashcard Meaning Truncation Fix

**Problem:** `.quiz-option .opt-meaning-main` had `-webkit-line-clamp: 2` which truncated long English meanings to 2 lines with ellipsis. E.g., "to like, to take pleasure in, keen on, fond of, interest..." was cut off.

**Fix (`shared/design-system.css`):**
- Removed `display: -webkit-box`, `-webkit-line-clamp: 2`, `line-clamp: 2`, `-webkit-box-orient: vertical` — the direct cause of truncation
- Changed `overflow: hidden` → `visible` to ensure all text shows
- Slightly tightened `font-size` from `clamp(1.05rem, 3.5vw, 1.3rem)` → `clamp(1rem, 3.5vw, 1.25rem)` and `line-height` from 1.3 → 1.25 to give more room
- All meaning text now wraps naturally within the quiz option button

**Files changed:** `shared/design-system.css`

---

## Session: Theme "Done" Badge Fix

**Problem:** Theme showed "✓ Done" after studying just 4 words (one batch), because `saveStageResult()` was called on first batch completion, and `renderJourneyPath()` used `info = getStageInfo()` to determine completion status.

**Fix (`study.html`):**
- Changed from `info` (stage data exists, set after first batch) to `allSeen` (seen >= themeWords.length)
- "✓ Done" badge, `completed` CSS class, and completion date now only show when ALL words in a theme have been seen
- Added null-safety to `info.completed_date` access (`allSeen && info ? ... : ''`)

**Files changed:** `study.html`

---

## Session: en_short → en_full Data Migration

**Problem:** HSK word `en` fields contained full dictionary info with classifiers (CL:), excessive synonyms, and long parenthetical notes. Meaning text was unnecessarily long in quiz options, flashcard backs, writing info strips, and print worksheets.

**Solution (`scripts/generate_en_short.py`):**
- New script that processes all 12 `characters_hsk*.json` files
- For each word:
  1. If `en_short` exists from a prior run: saves current `en` → `en_full`, moves `en_short` → `en`, deletes `en_short`
  2. If no `en_short`: generates concise version via `shorten_en()`, saves current `en` → `en_full`, sets new `en` = shortened version
- **Shortening logic (`shorten_en()`):**
  1. Strip everything after `, CL:` (classifier info)
  2. Keep at most 4 comma-separated synonyms (3 if any item exceeds 30 chars)
  3. Strip very long parentheticals (30+ chars)
  4. Clean up trailing punctuation
- **Results:** 10,354 words updated across all 12 HSK files (HSK1–HSK6, HSK20_1–HSK20_6)
- **Zero display code changes needed** — since `en` field name is preserved, all pages (study.html, write.html, print.html) automatically show the short version
- Full reference data preserved in `en_full` field for future use

**Examples:**
| Word | `en` (now concise) | `en_full` (preserved) |
|------|-------------------|----------------------|
| 爱 | `to love, to be fond of, to like, affection` | Full original meaning with CL: info |
| 房子 | `house, building (single- or two-story), apartment` | Full original with CL:棟|栋... |
| 电脑 | `computer` | `computer, CL:臺|台[tái]...` |

**Files changed:** 12 HSK JSON files, `scripts/generate_en_short.py` (new)

---

## Persistent Issues
- **Git push silently fails ~50% of the time** from the assistant (basher agent). Fix: always run `git push origin main` explicitly.
- Notebook table still needs to be applied to Supabase dashboard to eliminate remaining 404
