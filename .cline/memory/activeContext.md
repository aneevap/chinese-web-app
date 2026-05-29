# Active Context

## Session 40 — Flash Match UI fixes, pushAll sync, mascot swap, iPhone fixes

- **Start screen:** Removed 🔤 emoji and description paragraph. Made "Back to Dojo" button borderless.
- **Mascot:** Swapped from `panda_flash.png` to `pandarocket.png` on the bottom-left. `panda_flash.png` now appears on the victory screen with pop-in animation.
- **Font sizes:** Increased Chinese tile font sizes for both desktop and mobile.
- **pushAll() sync fix:** `pushAll` now enqueues when Supabase isn't ready (instead of silently dropping the call), following the same pattern as `pushHallOfFameEntry`.
- **Dead CSS cleanup:** Removed orphaned `.start-sushi-icon` and `sushiSpin` animation CSS.
- **Cache buster:** `v=35` → `v=36`

### iPhone Fixes (Commit e611601)

- **Image path fix:** `../assets/mascot/` → `assets/mascot/` — paths resolve from `dojo.html` at root, not component file depth.
- **Mobile grid centering:** Changed `width: 100%` → `width: min(94vw, 520px)` so `margin: auto` can center it.
- **Mobile font sizes bumped:** Characters `clamp(1.35→1.7rem)`, meanings `clamp(0.85→1.05rem)`.
- **Cache buster:** `v=36` → `v=37`

### iPhone Fixes (Commit 59b0ba1)

- **Parent-level centering:** Added `align-items: center` to `.matching-mode` (more reliable than `align-self` on child for iOS Safari). Added `align-self: stretch` to HUD and header.
- **Mascot z-index fix:** `z-index: 50` → `z-index: 0` (grid has `z-index: 1`, mascot was overlapping cards).
- **Cache buster:** `v=37` → `v=38`

## Session 41 — Stage grid layout change

- **Stage 1:** `2×4` → `3×3` (9 cells, 4 pairs + 1 empty)
- **Stage 2:** `2×5` → `3×4` (12 cells, 6 pairs)
- `Math.floor(totalCells / 2)` handles odd counts naturally.
- **Cache buster:** `v=38` → `v=39`

## Session 43 — Documentation update

- Updated all `.cline/memory` files and `README.md` with complete fix history and troubleshooting guide.

## Session 44 — Score Calibration & Game Star Removal

### Score calibration (Flash Match ÷ 3)
- Added `gameId` param to `applyCorrect()` with `SCORE_MULTIPLIERS`: `{ sushi: 1.0, matching: 0.33 }`
- `gameState.tsx` passes `gameId` through `CORRECT` action
- MatchingMode dispatches `gameId: 'matching'`, SushiMode dispatches `gameId: 'sushi'`

### Phase 1: Remove addStudyStars()
- Removed from `profileBridge.ts`, `SushiMode.tsx`, `MatchingMode.tsx`

### Remove stars field entirely
- Removed `stars` from `ScoreState`, game HUD, result screens, `HallOfFameEntry`, `hallOfFame.ts` sort
- Removed `bestStars` from `dojo.html` (5 references) + `.score-stars` CSS
- **Cache buster:** `v=39` → `v=40`

### HOF migration for old scores
- **localStorage:** `migrateOldMatchingScores()` — divides old Flash Match scores by 3
- **Supabase:** `migrateSupabaseMatchingScores()` — same for global leaderboard
- Both run once on page load with eager flag to prevent re-division

### Added npm run watch
- `"watch": "vite build --watch"` to `games/package.json` — auto-rebuilds on save

### Key lesson: dojo.html has own HOF renderer
The Hall of Fame in `dojo.html` is **plain JavaScript**, not React/TypeScript. Changes to game code do NOT affect it.

**Cache buster tracking update:**
- Session 44: `v=39` → `v=40` (score multiplier + stars removal + HOF migration)

---

## ⚠️ CRITICAL LESSONS: Changes not appearing

### Production bundle must be rebuilt

This project has a **dual delivery setup**:
- **Source files** (`games/src/`) — edited directly but only served by Vite dev server
- **Production bundle** (`games/dist/assets/game.js`) — pre-built snapshot loaded by `dojo.html`

**Any change to `games/src/` requires:**
1. `cd games && npm run build` — rebuilds `dist/assets/game.js`
2. Bump the `?v=` cache-buster in `dojo.html`'s script tag (e.g., `?v=38`)
3. Hard refresh the browser (Ctrl+Shift+R / Cmd+Shift+R)

Editing source files alone will NOT update the live game visible through `dojo.html`.

### Image paths resolve from dojo.html, not component file

React components in `games/src/modes/matching/MatchingMode.tsx` reference images like `src="assets/mascot/pandarocket.png"`. Despite the component file being nested 5 directories deep, the path is relative to `dojo.html` at the project root. Using `../assets/mascot/` goes one level above the repo root → image not found.

**Fix:** Always use `assets/mascot/...` (without `../`) for images in matching/sushi mode components.

### Git push silently fails ~50% of the time

`git push` from the assistant (basher agent) outputs "Everything up-to-date" even with unpushed commits. **Fix:** Always run `git push origin main` explicitly and verify by comparing `git rev-parse HEAD` vs `git rev-parse origin/main`.

### iOS Safari grid centering

`align-self: center` on a flex child works in most browsers but can fail on iOS Safari, especially when the child is `display: grid`. **Fix:** Use `align-items: center` on the parent flex container, then undo with `align-self: stretch` on children that need full width.

- Session 44: `v=39` → `v=40` (score multiplier + stars removal + HOF migration)

## Session 46 — Phase 3: Shop Toggle (Hide items behind Enter Shop button)

### Problem
Shop items were all visible at once on progress.html, making the page look messy.

### Solution
Used the same `.section-hidden` pattern from write.html — shop items hidden behind a gold-toned "🛍️ Enter Shop ▾" button.

### Changes (`progress.html`)
- Added `.shop-hidden .shop-content { display: none !important }` CSS class
- Added `shop-enter-btn` with icon, label, and arrow (seb-icon / seb-label / seb-arrow spans — no `data-i18n` attribute to avoid `refreshStrings()` override)
- Added `_shopOpen` state variable and `toggleShop()` function
- `renderShop()` starts with `shop-hidden` class added, arrow reset to ▾
- DOMContentLoaded safety init adds `shop-hidden` as fallback

### String updates (`strings.js`)
- Added `shop_enter` and `shop_close` in both EN and TH

**Cache buster:** No game code changes — no cache buster bump needed.

---

## Session 45 — Phase 2: Coin Economy Implementation

### Coin data model (`profiles.js`)
- Added `coins`, `coins_earned_total`, `coins_sources` to `createProfile()`
- Added `addCoins(profileId, amount, source)` with daily cap (once per source per day)
- Added `spendCoins(profileId, amount)` — balance check + deduction
- Added `getCoins()`, `getCoinSources()`, `getCoinsEarnedTotal()` — getters
- Added `awardGameCoin(gameId)` — 1 coin per game session, daily-capped
- Added `migrateCoinsForExistingItems()` — 5 coins per previously earned item
- Added `_ensureCoinFields()` — backward compat for old profiles
- Modified `addScore()` — awards 1 coin for newly reached badge tier (fixed: not all tiers)
- Removed `getUnlockedItemsByStars()` — dead code referencing removed `min_stars`

### Game integration (`profileBridge.ts`, MatchingMode, SushiMode)
- Added `awardGameCoin(gameId)` bridge function
- Added coin method types to `window.XHZ`
- MatchingMode calls `awardGameCoin('matching')` on victory + time-up
- SushiMode calls `awardGameCoin('sushi')` on game end

### Item economy (`rewards.json`)
- Expanded from 14 → 22 items with `coin_cost` (range: 6–100)
- 8 new items: lollipop, ice cream, sparkle aura, scroll, jade ring, festival lantern, silk scarf, moon cake, golden crown
- Removed all `min_stars` references

### String updates (`strings.js`)
- Updated `items_empty` to reference coins instead of stars (EN + TH)

### Bug fixes
- Fixed badge coin awarding: was looping all 4 BADGE_TIERS on any badge change → now awards 1 coin for the specific newly unlocked badge only

**Cache buster tracking:**
- Phase 2 does not add a cache buster change (no game code changes since Session 44)

---

## Session 47 — Arena Page Visual Redesign

### Layout restructure
- **Top row:** Changed from stacked column to horizontal flex row with panda image on far left, header "Arena" + description centered in remaining space
- **Below:** Game cards (Sushi Conveyor, Flash Match, panda_arena.png) + Hall of Fame unchanged below the top row

### Visual changes
- **"Arena" header:** Font-size doubled (1.5rem → 3rem desktop, 2.2rem at 640px, 1.8rem at 480px)
- **Panda avatar circle:** Added `::before` pseudo-element — off-white `#F5F0EB` round circle behind the panda (profile picture style, no border)
- **Third game card:** Replaced "Coming Soon" lock button with full-bleed `panda_arena.png` image
- **Cleanup:** Removed duplicate `updateAuraLayer()` dead code

### Files changed
- `arena.html` — HTML restructure, CSS changes (+27 lines), game card update

---

## Session 48 — Console Error Sweep (All 8 Pages)

### Fix 1: Aura PNG 404 (`arena.html`, `panda-display-preview.html`)
- Stripped `_aura` suffix from item.id when constructing PNG path
- E.g., `sparkle_aura` → `aura_sparkle.png` (was trying broken `aura_sparkle_aura.png`)

### Fix 2: Supabase notebook 404 (`shared/supabase-sync.js`)
- Silently returned on 'notebook table not found' errors
- Later restored `console.warn` after notebook SQL was prepared for dashboard deployment

### Fix 3: Auto-merge crash (`profiles.js`)
- Added `if (!p || !p.nickname) return;` guard before `p.nickname.toLowerCase()`
- Prevents TypeError crash in `findDuplicateGroups()` on profiles with missing nickname

### Fix 4: Missing `setEffortItems` (`profiles.js`)
- Added `_effortItems: null`, `setEffortItems(items)`, `getEffortItems()` to XHZ object
- Fixes "XHZ.setEffortItems is not a function" error on write.html and study.html

### Verification
- All 8 pages (`index.html`, `progress.html`, `arena.html`, `study.html`, `write.html`, `new-learner.html`, `recovery.html`, `print.html`) verified in browser — **zero console errors**
- Only Chrome network-level 404 for `rest/v1/notebook` remains (requires Supabase table creation via dashboard)

### Files changed
- `arena.html`, `panda-display-preview.html`, `shared/supabase-sync.js`, `profiles.js`

---

## Session 49 — Notebook SQL for Supabase

- Notebook table definition (`public.notebook`) already present in `supabase-schema.sql` with RLS policy and index
- User provided step-by-step Supabase dashboard instructions to run the SQL
- `CREATE TABLE IF NOT EXISTS` is safe to run multiple times
- Once applied, eliminates the remaining network-level 404 for `rest/v1/notebook`

---

### Overall Phase Status

| Phase | Status | Notes |
|---|---|---|
| Phase 1: Strip game stars | ✅ Complete | Session 44 |
| Phase 2: Coin economy | ✅ Complete | Session 45 |
| Phase 3: Shop UI | ✅ Complete | Session 46 — shop toggle + full purchase flow on progress.html |
| Phase 4: Score calibration | ✅ Complete | Session 44 (alongside Phase 1) |
| Phase 5: Panda display | ✅ Complete | Session 50 |
| Phase 6: Polish & tuning | ✅ Complete | Session 50b — Panda bug fixes (PNG paths, accessory items) |

## Session 50b — Panda Display Bug Fix: Real PNGs & Accessory Support

### Problem
Two critical bugs made the progress page panda display show emojis instead of real PNGs, and completely ignore accessory items:

1. **Aura PNG paths wrong**: Items like `sparkle_aura` generated path `aura_sparkle_aura.png` but the actual file is `aura_sparkle.png` — double `_aura` suffix.
2. **Accessory items never rendered**: Items with `category: "accessory"` (like `dragon_cape`, `straw_hat`, `cool_glasses`, `magic_fan`, `jade_ring`, `hair_bow`, `silk_scarf`, `golden_crown`) were stored in `equipped.accessory` but the render loop only checked `PANDA_CATEGORIES = ['aura', 'clothing', 'head', 'tool', 'food']` — ALL accessories were silently ignored.

### Fixes (progress.html)

1. **Aura PNG path**: `updatePandaLayerWithPNG` now strips `_aura` suffix from aura item IDs before building the path. `sparkle_aura` → `aura_sparkle.png` ✓

2. **displayMap pattern**: Both `getPandaVariant()` and `renderPandaDisplay()` now build a `displayMap` from all equipped items by resolving each item's `panda_layer || category`. This means:
   - `dragon_cape` (accessory, panda_layer: clothing) → `displayMap.clothing = "dragon_cape"` → renders on clothing layer ✓
   - `magic_fan` (accessory, panda_layer: tool) → `displayMap.tool = true` → detected as tool for variant ✓
   - `straw_hat` (accessory, panda_layer: head) → `displayMap.head = true` → renders on head layer ✓
   - Status chips use `displayMap[cat]` instead of `equipped[cat]` to show correct active state

### Verified
- No console errors
- Panda display section renders correctly on progress.html
- All 8 avatar PNGs now load correctly (aura, clothing, head, tool, food categories)

## Session 52 — Cleaned up unused pages

- Deleted `dojo.html` (replaced by arena.html, no references left)
- Deleted `panda-display-preview.html` (preview/test page, zero references)
- Updated README.md: removed dojo.html from file tree, changed "Dojo" → "Arena" in references

---

## ✅ Working Correctly

- **Panda mascot display:** Real PNG overlays load correctly, accessory items render on proper layers, variant detection works for accessories
- **Design system migration:** All 8 pages use design system CSS variables
- **Hall of Fame:** Auto-saves scores, leaderboard in result screens, global shared leaderboard via Supabase
- **Auth flow:** Upgrade, sign-in, password reset, set-new-password, recovery detection
- **Sushi mode:** Walking animations, slot positioning, column layout, white glow, juice-bar spawn timer, SVG character avatars, drag-and-drop, tap-to-select
- **Drop zone:** Fully invisible — no background, border, shadow, or fixed dimensions
- **Flash Match:** Sushi-style HUD, green/red gradient cards, custom background, dynamic grids (3×3→3×4→3×4→4×4→4×5), combo/stage time bonuses + wrong penalty, time popup animations
- **Score calibration:** Flash Match scores ~1/3 of original, fair leaderboard with sushi
- **Error Boundary:** Catches render errors gracefully
- **Arena page:** Horizontal flex layout with panda avatar circle, 3 game cards, global HOF
- **Console errors:** All 8 pages verified — zero console errors
- **Panda mascot display:** Interactive avatar on progress page with 4 variant states, 6 visual layers, aura glow effects
- **Body scroll locked during gameplay**, iOS viewport 100dvh
- **pandarocket.png** mascot on start screen, **panda_flash.png** on victory screen
- **pushAll()** sync now enqueues when not ready (no silent drops)

## Known Issues

- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- User could close recovery modal without setting password (leaves recovery-limited session)
- Stage 1 grid (3×3) has 1 empty cell — 9 cells with only 8 tiles (4 pairs). The last cell is unfilled.
- Stage 2 and 3 have the same grid config (3×4) — no difficulty increase between them.
- Notebook table still needs to be applied to Supabase (SQL ready in supabase-schema.sql) to eliminate `rest/v1/notebook` network 404

## Session 51 — Arena Page: Badge Display, Daily Badge Emoji Integration & Polish

### Problem: Badge shelf not visible on arena page

The standalone badge shelf section was hidden (CSS/layer issue). Replaced it with inline badge emojis inside the player name pill, alongside the daily mission indicator.

### Changes

1. **Badge shelf removed** — Deleted the `.arena-badges` section (HTML + CSS + `renderArenaBadges()` function). Badges are now shown directly in the name pill via `setPlayerName()`.

2. **Daily badge emoji in name pill** — `setPlayerName()` now reads today's `badge` and `study_badge` from the day record, resolves them to emoji via `__arenaBadges`, and appends them to the `daily-badge` span in the player name pill.
   - Both games done today → shows `🎯` + badge emoji(s) with `.complete` class (full opacity)
   - One game done → shows badge emoji(s) or `○` (dimmed)
   - None done → shows badge emoji(s) or empty

3. **Null-safety fix** — Changed `XHZ.getActiveProfile().id` → `profile.id` (uses already-fetched variable). Added `profile` guard to badge block (`if (badgeEl && profile)`). Prevents crash when no active profile.

4. **Emoji white border** — Added 8-direction white `text-shadow` stroke to `.daily-badge` so emoji pop against the gold-to-coral gradient badge background.

### Files changed
- `arena.html` — CSS (+8 lines), JS refactored, badge section removed

---

## Session 53 — Arena: Dynamic Mission Text (Coin-Based)

### Problem
Mission speech bubble always showed both Sushi Shop & Flash Match, even after the player earned coins for one or both games.

### Solution
Added `updateMissionText()` function that dynamically adjusts the speech bubble based on which daily game coins have been earned:
- **Both coins earned** → "Hey Mia! 🐼 You have worked hard today! 💪"
- **Only Sushi earned** → mission mentions only Flash Match
- **Only Flash Match earned** → mission mentions only Sushi Shop
- **Neither earned** → full mission with both games (unchanged)

### Changes (`arena.html`)
- Added `updateMissionText()` — reads `coins_sources` + `game_scores` from profile to determine earned coins, builds appropriate HTML
- Called from `renderPandaAvatar()` after `setPlayerName()`
- Uses `escapeHtml()` for player name to prevent XSS
- Static HTML fallback preserved for initial page load

---

## Session 55 — Shrink arena profile avatar on iPhone (30% smaller)

- **Correct avatar this time:** Reduced `.arena-panda-panel` width from 150px → 105px at 480px (the paper doll profile avatar, not the speech bubble panda)
- **Adjusted overlap:** `.avatar-name` margin-top from -28px → -20px to keep name badge proportional to the smaller panel
- **Previous session (54):** Had mistakenly shrunk the mission speech bubble panda (`.mission-panda-img`: 80px → 56px) — kept that change as it's also reasonable

## Session 56 — iPhone layout: header above avatar, avatar 20% smaller

- **Stacked layout on iPhone:** Changed `.arena-top-row` to `flex-direction: column` at 480px with `order: -1` on `.arena-top-text` so the "Arena" header appears above the profile avatar
- **Avatar 20% smaller:** Reduced `.arena-panda-panel` width from 105px → 84px at 480px
- **Proportional name badge:** `.avatar-name` margin-top from -20px → -16px

## Session 57 — Daily Login Coin

- **Added `awardDailyLoginCoin()` to `profiles.js`** — 1 coin per day with source `'daily_login'`, daily-capped via existing `addCoins()` mechanism
- **Triggered from arena.html** — called right after `XHZ.requireActive()` in `DOMContentLoaded`, so every visit to the arena hub awards the login coin silently
- No game bundle changes needed (no cache buster bump)

---

## Next Steps

- Apply notebook SQL to Supabase dashboard to eliminate remaining 404
