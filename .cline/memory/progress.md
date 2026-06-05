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

## Persistent Issues
- **Git push silently fails ~50% of the time** from the assistant (basher agent). Fix: always run `git push origin main` explicitly.
- Notebook table still needs to be applied to Supabase dashboard to eliminate remaining 404
