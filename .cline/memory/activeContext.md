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
- **Production bundle** (`games/dist/assets/game.js`) — pre-built snapshot loaded by `arena.html`

**Any change to `games/src/` requires:**
1. `cd games && npm run build` — rebuilds `dist/assets/game.js`
2. Bump the `?v=` cache-buster in `arena.html`'s script tag (e.g., `?v=43`)
3. Hard refresh the browser (Ctrl+Shift+R / Cmd+Shift+R)

Editing source files alone will NOT update the live game visible through `arena.html`.

### Image paths resolve from arena.html, not component file

React components in `games/src/modes/matching/MatchingMode.tsx` reference images like `src="assets/mascot/pandarocket.png"`. Despite the component file being nested 5 directories deep, the path is relative to `arena.html` at the project root. Using `../assets/mascot/` goes one level above the repo root → image not found.

**Fix:** Always use `assets/mascot/...` (without `../`) for images in matching/sushi mode components.

### Git push silently fails ~50% of the time

`git push` from the assistant (basher agent) outputs "Everything up-to-date" even with unpushed commits. **Fix:** Always run `git push origin main` explicitly and verify by comparing `git rev-parse HEAD` vs `git rev-parse origin/main`.

### iOS Safari grid centering

`align-self: center` on a flex child works in most browsers but can fail on iOS Safari, especially when the child is `display: grid`. **Fix:** Use `align-items: center` on the parent flex container, then undo with `align-self: stretch` on children that need full width.

- Session 44: `v=39` → `v=40`

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
- No game code changes since Session 44

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

- **Journey card redesign:** Stage images with celebration overlay and confetti, background placeholder system
- **Write auto-scroll:** Advances after 2 perfect 3-star writes (not just "mastered")
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

- Arena cards background still lighter than page (user preference: match paper-warm with grain)
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

## Session 57 — Daily Login Coin (Arena only)

- **Added `awardDailyLoginCoin()` to `profiles.js`** — 1 coin per day with source `'daily_login'`, daily-capped via existing `addCoins()` mechanism
- **Triggered from arena.html** — called right after `XHZ.requireActive()` in `DOMContentLoaded`, so every visit to the arena hub awards the login coin silently
- No game bundle changes needed (no cache buster bump)

## Session 58 — Daily Login Coin Extended to Study & Writing

- Users visiting study.html or write.html first (without going to arena) were missing their daily login coin
- **study.html**: Added `XHZ.awardDailyLoginCoin()` after `XHZ.requireActive()` in DOMContentLoaded
- **write.html**: Added `XHZ.awardDailyLoginCoin()` after `XHZ.requireActive()` in window.onload
- Now all three main pages (arena, study, write) award the daily login coin on first visit each day

## Session 59 — Toast Notification for Daily Login Coin

- Added visual toast notification when the daily login coin is actually awarded (first visit of the day)
- **Toast message**: `🪙 +1 Daily login coin!` — slides in from top-right, auto-dismisses after 2.5s
- Only shows when coins are earned (return > 0) — subsequent same-day visits are silent
- **arena.html**: Added `#toast-container` div + `showToast()` function + return value check
- **study.html**: Already had toast infrastructure — wrapped existing call in `if (> 0)` check
- **write.html**: Added `#toast-container` div + `showToast()` function + return value check
- Uses `toastOut` CSS animation from shared design system

## Session 60 — Panda Sizing Fixes (iPhone ≤480px)

### Round 1 (Session 60)
- **Mission panda** (speech bubble `.mission-panda-img`): 56px → **84px** (50% larger)
- **Profile panda** (paper doll `.arena-panda-panel`): 84px → **67px** (20% smaller)
- User noted this made mission panda bigger than profile panda — felt backwards

### Round 2 (Session 60b)
- User clarification: the profile panda frame (round circle) controls visible size, not just the image
- **Profile panda** (`.arena-panda-panel`): 67px → **200px** — clearly the main panda
- **Mission panda** (`.mission-panda-img`): 84px → **85px** — visibly smaller, secondary
- **Name badge overlap**: `.avatar-name` margin-top from -16px → **-34px** (proportional to 200px panel)
- User confirmed these sizes look correct

---

## Session 61 — Per-Pose Clothing PNG Overlays

### Problem
Clothing items (dragon_cape, silk_scarf) used a single overlay PNG that didn't match the panda's current pose. When the base pose switched to `foody`, `warrior`, or `foody_warrior`, the clothing overlay stayed in the stand-still position — misaligned and unnatural.

### Solution
Added per-pose clothing PNG fallback system. Clothing items now try a pose-specific PNG first, then fall back to the generic PNG:

- **progress.html** (`updatePandaLayerWithPNG()`): If `slotId === 'clothing'`, builds `clothing_{id}_{pose}.png` path using `_currentVariantId`. Falls back to `clothing_{id}.png` if pose-specific PNG doesn't exist.
- **arena.html** (`updateLayerWithPNG()`): Same logic mirrored.
- `_currentVariantId` is maintained by `updatePandaBaseLayer()` / `updateBaseLayer()` — no additional tracking needed.

### Fallback chain
1. Try `clothing_dragon_cape_foody.png` ✗ → 2. Try `clothing_dragon_cape.png` ✗ → 3. Show emoji placeholder

### Naming convention (documented in rewardPlan.md §11.3)

| Item | Stand-still | Foody | Warrior | Foody Warrior |
|---|---|---|---|---|
| `dragon_cape` | `clothing_dragon_cape_stand.png` | `clothing_dragon_cape_foody.png` | `clothing_dragon_cape_warrior.png` | `clothing_dragon_cape_foody_warrior.png` |
| `silk_scarf` | `clothing_silk_scarf_stand.png` | `clothing_silk_scarf_foody.png` | `clothing_silk_scarf_warrior.png` | `clothing_silk_scarf_foody_warrior.png` |

### Files changed
- `progress.html` — per-pose clothing fallback in `updatePandaLayerWithPNG()`
- `arena.html` — per-pose clothing fallback in `updateLayerWithPNG()`
- `rewardPlan.md` — added Per-Pose Clothing PNGs table in §11.3

---

## Zombie Spell Defense — Enhanced Playground (v2)

### File
- **`zombie-game-playground.html`** — standalone playground (like `avatar-playground.html`)
- **Status:** ✅ Enhanced with animations, combo system, zombie variety, countdown, screen shake

### New features (v2)
- **Combo/Streak system:** Consecutive correct strokes build a combo meter (displayed top-left of battle field). Every 5-streak triggers a **CRITICAL HIT** (2 damage, gold burst FX, triple points, screen shake!)
- **Player aura glow:** Wizard's aura intensifies with streak (level 1 at 2 streak, level 2 at 4, level 3 at 8 — gold glow)
- **3 Zombie types:** Grunt 🧟 (standard), Brute 🧟‍♂️ (more HP), Reaper 💀 (more HP + slower advance)
- **Round countdown:** 3 → 2 → 1 → ⚔️ animation before each round
- **Zombie spawn animation:** Rises from ground with particle burst
- **Floating damage numbers:** +1 / CRIT! 2 float up from zombie
- **Screen shake:** On mistakes and critical hits
- **Glassmorphism UI:** Frosted glass cards, glowing borders, atmospheric fog background
- **Ground decorations:** Grass, stones, plants in the battle field
- **Victory dance:** Player dances after defeating a zombie
- **Hint toggle:** Magical conic-gradient spinning glow ring around writing box in Easy mode

### Game mechanics (as implemented)
1. Zombie appears on the right, advances in 5 stages
2. Player draws character on HanziWriter.js canvas
3. **Correct stroke** → combo up! Every 5th = critical hit (2 dmg, 3× points)
4. **Wrong stroke** → combo resets, zombie advances after N mistakes, screen shake
5. Word completed → bonus points (streak preserved!)
6. Zombie HP=0 → explosion particle burst, round bonus (+streak bonus), victory overlay
7. Zombie reaches DEADLY stage → game over

### Two difficulty levels
| Feature | Easy | Normal |
|---|---|---|
| Stroke guide | ✅ Outline + faded reference | ❌ No guide |
| Leniency | 1.5 | 1.0 |
| Zombie speed | 4→2 mistakes (round scaling) | 3→1 mistakes (faster scaling) |
| Points per stroke | 10 (30 on crit) | 15 (45 on crit) |

### Visual effects
- Dark atmospheric theme with animated fog, glassmorphism UI
- Zombie: lurch idle → hurt shake → stun flash → death explosion (12 particles)
- Player: floating idle → cast spell → critical cast → victory dance
- Spell hit: ✨ flies from wizard to zombie (correct direction now!)
- Critical: 💥⚡ double FX burst + screen shake
- Writing area: green flash on hit, red flash on mistake
- HP bar: green gradient → gold → red pulsing
- Round countdown: pop-in animation each number
- 5 particles per correct stroke (stars, sparkles, magic)
- Damage numbers: positioned over zombie (right side)

### Bugs fixed v2 (code review)
1. 🐛 **Countdown animation re-trigger** — Now clears class to `''` before reflow so each number replays its pop-in animation.
2. 🐛 **Damage numbers positioned wrong** — Changed from `left: 150px` (near player) to `right: 40px` (over zombie).
3. 🐛 **Spell FX flew wrong direction** — `--fx-x` changed from `-80px` (left, away from zombie) to `+80px` (right, toward zombie).

## Zombie Spell Defense — Gameplay Enhancements (v3)

### File
- **`zombie-game-playground.html`** — standalone playground (like `avatar-playground.html`)
- **Status:** ✅ Enhanced with clickable slots, slot defeat animation, distance bars, difficulty tuning, bug fixes, enlarged battlefield

### New Features (v3)

**1. Clickable Character Slots**
- Each filled slot is now clickable — click any active zombie's slot to switch the writing canvas to that character instantly
- Active slot gets a gold border + golden glow + colored character text (`.z-slot-active` CSS class)
- Auto-selects first alive zombie on spawn if nothing is being written
- Edge cases handled: clicking empty slot = no-op, clicking already-active slot = no-op, defeating active zombie shifts highlight to next alive

**2. Slot Defeat Animation**
- When a zombie is defeated, its slot plays a 0.7s animation sequence:
  - 0–25%: Pulse shrink (scale 0.92) with strong gold glow
  - 25–50%: Pulse expand (scale 1.05), glow transitions to red damage
  - 50–70%: Scale down, red glow fading out
  - 70–100%: Shrink to 0.3 scale, full transparency
- Inner content (character + emoji) fades out simultaneously
- `pointer-events: none` during animation prevents accidental clicks
- After animation completes, the slot is removed and remaining slots shift left

**3. Distance/HP Bar Under Each Zombie**
- Small progress bar (`zombie-hp-wrap`) below each zombie showing remaining distance to castle
- Full bar at spawn (green, `zbf-safe` with green glow) → shrinks as zombie walks closer
- Color transitions: green (>50% distance) → yellow (25–50%, `zbf-warn`) → red (<25%, `zbf-danger` with damage glow)
- Width updates every frame with `transition: width 0.15s linear` for smooth shrinkage
- Fades out during death animation via `opacity: 0` with 0.1s delay
- Responsive sizing: 36×4px desktop → 30×3px at 520px → 26×3px at 360px

**4. Easy Mode Slowdown**
- Easy mode `baseSpeed` reduced from 0.3 → **0.2** (60% slower than Normal's 0.5)
- Wave scaling still applies (+0.06 per wave, capped at 1.5), so late-game easy zombies still speed up
- Start screen footer updated: "Easy: slow zombies, stroke guide & hints · Normal: fast zombies, no guide"

### Bug Fixes

**Bug 1: Writing area stuck on zombie that reached castle**
- When a zombie hits the castle and is removed from the array, `ZG.currentChar` still pointed at that zombie's character
- Fixed: After the `toRemove` cleanup loop in `updateGame()`, a new check verifies if `ZG.currentChar.ch` still exists among alive (non-defeated) zombies
- If not found (zombie was removed), `loadNextAvailableCharacter()` switches to the next living zombie or clears the writing area
- Guarded by `!ZG.gameOver` to prevent action after game ends

**Bug 2: Normal mode writing board unresponsive**
- `showOutline: false` in Normal mode prevented HanziWriter from building internal stroke target zones needed for `quiz()` stroke detection
- Fix: `showOutline: true` in **both** modes (always provides stroke target data to the quiz engine)
- Normal mode uses very dim `outlineColor: '#1E1030'` — nearly invisible against `#0A0612` canvas background
- Easy mode still uses visible `'#3D2D55'` outline color
- `showCharacter: true` in both modes; `charColor` dimmer in Normal (`'#555577'` vs `'#8888AA'`)
- Normal mode challenge now comes from: no visible outline guide + stricter 1.0 leniency + faster zombies

**Bug 3: Start screen also uses Normal mode setting**
- When returning to start screen, `isEasy` would be `false`, causing a `toUpperCase()` call on undefined
- Not a gameplay issue, just a minor console noise on the start screen

### Enlarged Battlefield
- Changed `.z-battle-field` from fixed `height: 300px; flex-shrink: 0` to `flex: 1; min-height: 220px`
- Battlefield now fills available vertical space — zombies have more room to traverse
- Responsive: `min-height: 180px` at 520px, `min-height: 150px` at 360px (can still grow larger)
- Spawn margin changed from hardcoded 10px to `Math.min(fw, fh) * 0.08` (proportional to field size)
- Zombies no longer spawn right at the edge of smaller fields

### Current Difficulty Matrix
| Feature | Easy | Normal |
|---|---|---|
| Stroke outline guide | ✅ Visible (`#3D2D55`) | ✅ Dim (`#1E1030`, nearly invisible) |
| Character reference | ✅ Visible (`#8888AA`) | ✅ Dim (`#555577`) |
| Stroke animation speed | 0.5 (slow show) | 1.0 (normal) |
| Quiz leniency | 1.5 (forgiving) | 1.0 (strict) |
| Base zombie speed | 0.2 | 0.5 |
| Wave speed scaling | +0.06/wave (cap 1.5) | +0.06/wave (cap 1.5) |
| Points per stroke | 10 (30 on crit) | 15 (45 on crit) |

## Mastery Requirement Fix — Both Study & Writing Required for "Mastered"

### Problem
Users could reach "mastered" status purely through writing. In `_updateWordMastery()`, when `write_cleared_count >= 2`, it auto-set `quiz_cleared = true` — meaning 2 perfect writing scores were sufficient without ever studying.

### Fix (`profiles.js`)
- Removed the auto-setting of `quiz_cleared` when `write_cleared_count >= 2`
- `quiz_cleared` can now only be set by `markQuizCleared()`, which is exclusively called from study.html's `handleQuizAnswer()`
- `write_cleared` is only incremented by `markWriteCleared()` in write.html (perfect 3-star scores)
- The mastered condition (`perfectCount >= 2 && entry.quiz_cleared`) remains unchanged — users now genuinely need both activities

### Migration function preserved
- `migrateOldMasteryData()` still sets both flags together as before — appropriate for old data that already met the previous requirements

### Files changed
- `profiles.js` — removed 4 lines in `_updateWordMastery()`

## Session 64 — Journey Card Redesign & Write Auto-Scroll Fix

### Journey Card Redesign (`progress.html`)

**Stage images replace progress bar:** Each mastery stage now shows a large panda PNG instead of a progress bar. 6 village stage images (0%→100%) with full-screen celebration overlay on stage-up.

**Changes:**
- Added `getJourneyStageImagePath(info)` — maps mastery stage to `journey_village_{egg,hatch,cub,lantern,guardian,champion}.png`
- Added `getJourneyStageBgPath(info)` — maps year group to `journey_{village,temple,palace}_bg.png` placeholder (at 25% opacity)
- Added `.journey-stage-wrapper`, `.journey-stage-img`, `.journey-bg-img`, `.journey-pct-row`, `.journey-pct`, `.journey-title-name` CSS
- Added `.journey-celebration` overlay with confetti particles (40 pieces, random colors)
- Added `checkAndTriggerCelebration()`, `showJourneyCelebration()`, `closeJourneyCelebration()`, `generateConfetti()`
- Added `getCelebratedStages()` / `markStageCelebrated()` — localStorage tracking, fires once per stage
- Scenic backgrounds per year: `.scene-village` (green), `.scene-temple` (purple), `.scene-palace` (gold)
- Emoji fallback if image doesn't exist

### Write Auto-Scroll Fix (`write.html`)

**Problem:** Auto-scroll only checked `ma.status === 'mastered'`, but "mastered" now requires both study quiz AND 2 perfect writes. Users who completed writing felt the auto-mode was broken.

**Fix:** Auto-scroll now checks `write_cleared_count >= 2` (2 perfect 3-star writes) OR `status === 'mastered'`. This matches the user's expectation: "after 2 perfect writing scores, move to the next word."

**Files changed:** `progress.html`, `write.html`

### Cache buster update
- `?v=40` → `?v=43` on arena.html's game.js script tag (cumulative across Sessions 52-64)

---

## Journey Background Images — Creation Guide

Place **square PNGs** (400×400 px recommended, transparent background preferred) in:

**`assets/mascot/`**

### Stage images (already in place ✓)
| # | Filename | Stage |
|---|----------|-------|
| 1 | `journey_village_egg.png` | Panda Hatchling (0%) |
| 2 | `journey_village_hatch.png` | Bamboo Cub (20%) |
| 3 | `journey_village_cub.png` | Village Wanderer (40%) |
| 4 | `journey_village_lantern.png` | Lantern Carrier (60%) |
| 5 | `journey_village_guardian.png` | Bamboo Guardian (80%) |
| 6 | `journey_village_champion.png` | Village Champion (100%) |

### Background images (create these) — sits behind the stage image at 25% opacity
| # | Group | Filename | Suggested Scene |
|---|-------|----------|-----------------|
| 1 | Year 1 — The Village | `journey_village_bg.png` | Bamboo forest, moon, village rooftops, lantern glow |
| 2 | Year 2 — The Temple | `journey_temple_bg.png` | Mountain shrine, cherry blossoms, prayer flags |
| 3 | Year 3 — The Palace | `journey_palace_bg.png` | Imperial courtyard, golden roofs, red pillars |

### How it works (`progress.html` → `getJourneyStageBgPath()`)
- The background image auto-selects based on the user's current year group (from `rewards.json` mastery titles)
- Stays the same for all 6 stages within a year — only the panda stage image changes
- If the PNG doesn't exist yet, the image hides itself gracefully (no broken icon shown)
- Opacity is 25% so it acts as a subtle backdrop behind the panda

## Session 65 — Dashboard Bento Redesign (Action Launch Rows + Pastel Toy Aesthetic)

### Overview
Overhauled the dashboard (`dashboard.html`) bento card layout to fix the "Box-ception" problem and improve affordance for young learners. Transformed passive nested frames into vibrant action launch rows with 3D pastel buttons.

### Changes (in order)

**1. Avatar greeting → speech bubble**
- White bubble with `border: 2px solid var(--text-dark)`, `border-radius: 14px`, `::after` triangle tail pointing up toward the panda
- Mali hand-written font for greeting text
- `box-shadow: 3px 3px 0 var(--text-dark)` matching new palette
- Responsive: shrinks to `max-width: 200px` at 420px

**2. Journey stage images in trophy case**
- Trophy case now shows stage-specific PNGs (`journey_village_{egg,hatch,cub,lantern,guardian,champion}.png`) instead of just emoji
- `getStageImageSrc(minPct)` maps mastery % → filename
- Enlarged from 60×60px → 80×80px
- Fallback edge case: if image source is empty (unknown stage), properly hides `<img>` and shows `🏆` fallback span

**3. Mastery % discrepancy fix**
- **Bug:** Dashboard counted mastered words across ALL courses (mixing year groups). Progress page only counts within the current year group.
- **Fix:** Added `DASH_COURSES` global from `courses.json`. `getMasteryTitle()` now finds the active year group → filters words to that year → calculates % within that group only.
- Title lookup uses `mastery_titles.find()` by `year_group` instead of hardcoded `[0]`.

**4. CTA button relocated & recolored**
- Moved from avatar stage to stamp card (below quest rows)
- Color: yellow gradient → `#ffa17a` → `#326c9e` (users' sequential requests)
- `margin-top: auto` pushes to bottom of card on wider screens
- Hover: `translateY(-3px)`, `filter: brightness(1.15)`

**5. Quest rows → Action launch rows**
- Removed nested white sticker frames (`sc-quest` → `action-launch-row`)
- Dashed dividers between rows instead of box backgrounds
- 3D buttons per path: green (study), orange (write), purple (arena)
  - `border: 3px solid #111827`, `5px` offset shadow, `:active` squish (translateY+shadow flatten)
- Initially too bulky; slimmed down per user feedback (smaller padding/font/shadow)

**6. Pastel toy aesthetic (Nintendo Switch-style)**
Applied comprehensive visual redesign based on user-provided CSS spec:

| Token | Before | After |
|-------|--------|-------|
| `--text-dark` | `--ink-dark` (#170E07) | `#2C1A0B` (deep coffee brown) |
| Card background | `var(--paper-warm)` + paper-grain texture | `#FFFFFF` (pure white) |
| Card border | None (just `filter: drop-shadow`) | `3px solid var(--text-dark)` |
| Card radius | 20px | 24px |
| Card shadow | `var(--shadow-card)` (soft brown) | `6px 6px 0px 0px var(--text-dark)` (solid) |
| Card padding | 18px 20px | 28px |
| Button colors | Bright #2ECC71 / #E67E22 / #6C5CE7 | Pastel `#A3E4D7` / `#FAD7A0` / `#A3E4D7` |
| Button text | White | `var(--text-dark)` |
| Button radius | 10px | 20px (pill) |
| Button shadow | Colored per-theme | `0 5px 0 var(--text-dark)` (unified) |
| Button active | translateY(2px) | translateY(4px), shadow → 1px |
| Stamp dots | 28px, dashed border, #FFDE6A active | 16px, solid border, `var(--pastel-yellow)` active |
| Ink splash | rgba(255,200,50,...) | rgba(249,231,159,...) |
| CTA button | Blue (#326c9e), white text | Pastel yellow, dark brown text, 3D pill |
| `.bento-card` | `overflow: hidden` (clipped aura glow) | Removed |
| `.bento-card` | `filter: drop-shadow` | Removed (replaced by solid shadow) |

**Arena button** reuses `pastel-green` for color harmony (instead of a 3rd competing color).

**Files changed:** `dashboard.html` only

### Remaining polish
The user noted the pastel redesign "doesn't look right yet" and wants to revisit tomorrow.

---

## Session 66 — Dashboard Polish: Panda Variant Fix, Text Fixes, Quest Board Prep for 9-Slice Border

### Overview
Multiple polish passes on `dashboard.html` fixing panda avatar overlap, text overflow, quest board frame design, and preparing for future 9-slice SVG border images.

### Changes (in order)

**1. Panda variant system ported from progress page**
- **Bug:** Main panda always showed `panda_stand.png` with equipped items (e.g. foodie) overlaid on top — "two layers of pandas"
- **Fix:** Ported `VARIANT_PNG_MAP`, `getPandaVariant()`, `updatePandaBaseLayer()` from progress.html
- Now swaps base image to `panda_foody.png`, `panda_warrior.png`, or `panda_foody_warrior.png` based on equipped food/tool items
- `_currentVariantId` caching prevents redundant src swaps
- Called before other layers in `renderPandaAvatar()`

**2. Text display fixes**
- **Journey header**: Removed `t('dash_journey_header')` JS override that was returning the i18n key itself (missing from strings.js). Static `MY JOURNEY` from HTML now displays correctly.
- **CTA button**: Removed `data-i18n="dash_start_mission"` so "🚀 START TODAY'S MISSION" renders instead of the i18n key.
- **Button overflow**: `white-space: nowrap` → `normal`, reduced padding/font-size, added `word-break: keep-all` + `overflow-wrap: break-word` + `box-sizing: border-box`.

**3. Quest board 3-layer frame → simplified placeholder**
- Initially built a carved wooden toy frame (8px brown stroke, 16px gold gradient band, cream panel, gold cap bars, shading overlay)
- User didn't like the result, decided to use 9-slice border-image method with SVGs
- **Reverted**: Removed `.quest-board-frame`, `.qbf-cap`, `::before` overlay, and gold ribbon pseudo-element tails
- Simplified to clean `.quest-board` and `.quest-ribbon` containers with placeholder gold borders, marked with `/* ══ PLACEHOLDER ══ */` comments

**4. 9-slice SVG setup documented** (`onboarding-audit.md` §8)
- Added file structure: `assets/frames/quest-board.svg`, `assets/frames/quest-ribbon.svg`
- SVG slice guide: 80×80 px grid with 20 px slices
- CSS `border-image` recipes for both elements
- Step-by-step activation instructions

### Files changed
- `dashboard.html` — Panda variant system, text fixes, quest board simplified
- `onboarding-audit.md` — New §8: 9-Slice Border Setup

---

## Session 67 — Dashboard: Responsive Overhaul, Mastery Fix, Quest Reward, Cleanup

### Overview
Major polish pass on `dashboard.html` — responsive layout restructured for iPhone, mastery percentage fixed to match progress page, daily quest reward system, and extensive dead code cleanup.

### Changes

**1. Responsive layout overhaul (iPhone ≤640px)**
- **Top bar restructured:** Horizontal row with avatar+streak on left, coins on right (was 3 stacked rows)
- **Ribbon restructured:** Moved from `.dash-top-bar` (tb-center) to `.dash-main` as a sibling of `.panda-col` and `.quest-board`. On desktop: absolutely positioned at `top: -60px; right: 0` to appear in the top bar area (known fragile magic number). On mobile (≤640px): `position: relative`, flows naturally between panda and quest board, right-aligned.
- **Bottom row layout:** My Journey on top (full width), Daily Bonus (70%) + Parent Settings (30%) below on mobile
- **Journey card width fix:** Added `width: 100%; min-width: 0` at ≤900px to override flex-era `width: 0; min-width: 280px`
- **Compact spacing:** Top bar gap 12→6px, ribbon padding tightened, speech bubble smaller, panda viewport 220→100px at ≤400px, main area gaps reduced
- **Ribbon border removed** on mobile for cleaner look
- **Coins font size** reduced to 0.75rem on mobile

**2. Mastery percentage fix**
- **Bug:** Dashboard loaded ALL courses' data into `COURSE_DATA` but progress page only loaded attempted ones. Dashboard included unattempted courses in the year group word count, lowering the percentage.
- **Fix:** Added `attemptedCourseIds` detection (same pattern as progress page's `getAttemptedCourseIds()`), filtered `yearWords` to only include attempted courses
- **Files:** `dashboard.html` — `getMasteryTitle()` function

**3. Daily quest reward**
- Awards 1 bonus coin via `XHZ.addCoins(id, 1, 'daily_quest_complete')` when all 3 quests complete (daily-capped by addCoins)
- Reward panel shows 👍 + "You completed today's quest! Good job! +1 🪙" on first completion
- Removed XP display entirely (no XP system exists)
- Removed dead `.rp-pill` CSS and JS references
- Removed dead `.reward-panel.claimed` CSS rules

**4. Removed elements**
- Removed broken `rewards.html` link from treasure chest icon (changed `<a>` to `<div>`)
- Removed gift box icon (🎁) from top-right nav bar (HTML + CSS)
- Removed "Clear Local Data" button from parent settings dropdown

**5. Encouraging ribbon text**
- Changed from streak-based messages ("Keep it up! Day 1!") to 10 random encouraging phrases (no day numbers)
- Random phrase picks on each page load for variety

**6. Dead CSS cleanup**
- Removed `.tb-center` base CSS (flex: 1, display: flex, justify-content: center, min-width: 200px) — ribbon moved out
- Removed `.rp-pill` CSS block — element hidden with visibility:hidden
- Removed `.reward-panel.claimed` CSS rules — function now overwrites styles inline
- Removed `overflow: visible` from `.dash-top-bar` at ≤640px — ribbon moved out

### Files changed
- `dashboard.html` — all changes above

---

## Sessions 70-74 — Arena Layout, Zombie Game HOF, Stats Sync, Memory Update

### Session 70 — Arena: Mobile layout restructured
- **Header moved to top** of `arena-upper`, outside 2-column layout
- **Mobile CSS Grid (≤720px):** Uses `display: contents` to flatten DOM, then CSS Grid with explicit placements — avatar at (1,1), name at (1,2), mission at (2,1/3), games-grid at (1/-1, 3) for full-width below
- **Desktop preserved:** games-grid stays in `arena-right`, original 2-column grid untouched
- **Fixed absolute positioning conflict:** `.profile-card .arena-panda-panel { position: absolute }` had higher specificity than mobile rule — added `position: static !important` with `top/left/transform` resets
- **Bg scoping preserved:** `bg_mountains` on `arena-upper`, `bg_bamboos` on `arena-lower`

### Session 71 — Zombie game unlock + name change
- **Name:** "Zombie Chase" → **"Zombie Strike"** in GAMES array
- **Unlock logic verified** via browser automation: locked when Course 1A not fully mastered, unlocks after injecting full 1A mastery
- **Locked cards visible on mobile:** Removed `.game-card.disabled { display: none }` from 480px media query

### Session 72 — Zombie HOF + testplayer deletion
- **Zombie in HOF:** Added third section to both Local and Global rankings (after sushi & matching) with 🧟 icon labels
- **Test Player deleted:** Found and removed "Test Player" (score 1000) from Supabase `hall_of_fame` table — verified deletion

### Session 73 — Zombie game iPhone layout fix
- **Battlefield min-height reduced:** 180→140px (≤520px), 150→110px (≤360px)
- **Writing box smaller:** 130→110px (≤520px), 90px (≤360px)
- **Slots compacted:** 44→40px (≤520px), 38→34px (≤360px), gaps reduced
- **Added `overflow-y: auto`** to `.z-arena` — content scrolls if still too tall
- **Added `min-height: 0`** to `.z-page` — allows proper flex shrink

### Session 74 — Profile stats sync fix
- **Bug:** Stars showed today's score via `getTodayScore()` instead of lifetime total
- **Fix:** Created `syncProfileStats()` helper using `XHZ.getTotalStars(p.id)` (all-time total)
- **Deduplicated:** Replaced 4 copies of identical sync code with single helper
- **Added to focus handler:** Stats now sync when returning to the page

### Pushed to GitHub
- Commit `addd9a7` — all above changes pushed

## Radical Replan — Doodle God Style Discovery (Current Session)

### Final Decisions Made

**Data audit:** radicals.json has 230 entries → 218 unique after removing 12 trad variants (馬→马, etc.)

**70 leveling radicals** sorted by frequency (movie + book rank). Variant forms (氵, 扌, 艹, 亻) sorted by reactions count since they lack standalone frequency.

**Variant + full-character pairs (7 pairs):**
- 5 merged (both were leveling): 人+亻, 心+忄, 言+讠, 金+钅, 刀+刂 → freed 5 slots
- 9 bonus (variant leveled, full was decomp): 氵+水, 扌+手, 辶+走, ⺼+肉, 纟+糸, 饣+食, 犭+犬, 衤+衣, ⺮+竹
- 1 reverse bonus: 火+灬 (fire + fire dots)

**5 promoted from decomposition:** 一, 小, 母, 风, 龙 (low reactions = hard to mix = good to level)

**6 Doodle God categories:** nature(14), body(17), civilization(17), fauna(9), abstract(5), other(8)

**Chainable discovery system:** 12 leveling radicals can also be discovered through mixing. If that happens, a spare replacement is awarded at level-up instead:
- 大→公, 日→合, 目→彳, 木→冫, 土→生, 金→青, 王→弓, 贝→羽, 石→气, 穴→戈, 疒→包, 各→令

**Lab data:** 2,502 reactions. 54 produce chainable results (result IS a radical). 574 reactions use only leveling radicals (day-one available).

### Plan document
`radical-categories-plan.md` — completely updated with all decisions, full 70-level table, variant pairs, spare list, discovery tree design.

### Reference doc
`.cline/references/chinese-lexicon-reference.md` — quick-access guide for the chinese-lexicon-master repo.

## Aesthetic Audit — Laboratory UI vs Dashboard Direction

### Current Lab Page Aesthetic
- Uses original "Botes Paper Palette" (warm creams, soft browns, paper textures)
- All cards have thin 1px borders with soft drop shadows
- Flask SVG centerpiece with glassmorphism effects
- Elemental orb filters for radical category filtering
- Parchment-style radical cards with category color accent strips
- Overall: **functional lab notebook** — clean, organized, but not game-y

### Dashboard Aesthetic (latest design direction from Sessions 65-67)
- **Neo-brutalist pastel toy aesthetic** with thick 3px borders
- **Solid offset shadows** (6px 9px 0 0) instead of soft drop shadows
- Pure white cards with bold outlines, no paper-grain on cards
- **3D buttons** with squish feedback on `:active`
- Clip-path ribbon shapes, stamp circles, playful emoji integration
- **Panda mascot** integrated throughout (speech bubble, avatar, clickable)
- Rich `--db-*` palette vs original Botes palette

### Design Gap Analysis

| Aspect | Lab (Current) | Dashboard (Target) | Gap |
|--------|:------------:|:------------------:|:---:|
| Card borders | 1px solid `--paper-deep` | 3px solid `--db-border` | Lab feels flat |
| Card shadows | `0 2px 4px rgba(0,0,0,0.06)` | `6px 9px 0 0 #e8dcc6` | Lab has no tactile depth |
| Card backgrounds | `--paper-warm` (#FAEFD3) | `#FFFFFF` with bold borders | Lab looks like aged notebook |
| Buttons | Pills with `shadow-card` | 3D offset shadow, squish :active | Lab buttons don't pop |
| Top bar | Glassmorphism with background chips | Clean frameless flex layout | Lab top bar is heavier |
| Mascot | None | Panda avatar + speech bubble | Lab lacks character |
| Colors | Botes palette (sage, mustard, etc.) | `--db-*` palette (richer, more vibrant) | Lab palette is muted |
| Empty states | Text-heavy with muted emoji | N/A | Could be more playful |

### Proposed Improvements — Prioritized

**HIGH PRIORITY (visual cohesion):**
1. **Unified card system** — All card types (book-left, book-right, picker, collection, decomp detail) adopt neo-brutalist style: thick borders, solid offset shadows, white/cream backgrounds
2. **Button redesign** — Lab buttons (`lb-primary`, `lb-secondary`, `lb-gold`, `lb-chain`) get 3D offset shadows and squish feedback matching dashboard
3. **Panda mascot integration** — Add panda as lab assistant (top bar or speech bubble with lab-themed messages)
4. **Top bar simplification** — Streamline to match dashboard's clean horizontal layout (avatar | streak | level | coins)

**MEDIUM PRIORITY (visual polish):**
5. **Flask overlay polish** — Better success particle effects, liquid animation on mix
6. **Empty state redesign** — More encouraging, game-like empty states with mascot
7. **Tab redesign** — More playful tabs with active indicator matching dashboard aesthetic
8. **Cohesive palette pass** — Unify all `--botes-*` color references; introduce `--lab-*` tokens that bridge to dashboard palette

**LOW PRIORITY (nice-to-have):**
9. **Background decoration** — Faint alchemy line art behind the mix area (beakers, scrolls, herbs)
10. **Discovery reveal animation** — Sparkle/bubble animation when new radical is earned or character discovered
11. **Stats panel visual pass** — Stat cards are plain text — add charts or visual indicators

## Post-Radical-Replan Fixes & Data Improvements

### Session: Flashcard Meaning Truncation Fix
- **Problem:** `.quiz-option .opt-meaning-main` had `-webkit-line-clamp: 2` which truncated long meanings (e.g., "to like, to take pleasure in, keen on, fond of, interest...") to 2 lines with ellipsis in the study quiz
- **Fix:** Removed `display: -webkit-box`, `-webkit-line-clamp: 2`, `line-clamp: 2`, `-webkit-box-orient: vertical` from `shared/design-system.css`. Changed `overflow: hidden` → `visible`, tightened `font-size` slightly and `line-height` from 1.3 → 1.25. All meaning text now wraps naturally within the button.

### Session: Theme "Done" Badge Fix
- **Problem:** After studying 4 words (one batch), `finishBatch()` called `saveStageResult()` which set `S.stageData[key] = {best_score, completed_date}`. Then `renderJourneyPath()` used `getStageInfo()` to determine if a theme was "Done" — so any theme that had at least one batch completed showed "Done" even if it had 20+ words remaining.
- **Fix:** Changed from `info` (stage data exists) to `allSeen` (seen >= themeWords.length) for the "✓ Done" badge and `completed` CSS class. Date display also gated on `allSeen` with null-safety.

### Session: en_short → en_full Data Migration
- **Problem:** Many HSK words have long `en` fields packed with all dictionary info — multiple synonyms, classifiers (CL:), etc. This makes displayed meanings unnecessarily long in quiz options, flashcard backs, and writing info strips.
- **Solution:** Created `scripts/generate_en_short.py` which processes all 12 `characters_hsk*.json` files:
  1. Saves the full original `en` → `en_full` (preserved as reference)
  2. Generates a concise version via `shorten_en()` → sets as new `en`
  - Shortening rules: strip everything after `, CL:`, keep at most 4 comma-separated items, strip very long parentheticals (30+ chars)
- **Result:** 10,354 words updated across all HSK levels. Display fields like `爱` now show "to love, to be fond of, to like, affection" instead of the full dictionary entry. No code changes needed on display pages since `en` field name is unchanged.

## Session: Data Integrity Pass — Pinyin Normalization, Validation, Teaching Frames

### Pinyin Normalization Pipeline
| Script | Purpose | Result |
|--------|---------|--------|
| `scripts/normalize_pinyin.py` | Tone numbers→marks, ZWSP removal | 8,587 entries fixed |
| `scripts/fix_pinyin_spacing.py` | Re-insert spaces via CC-CEDICT lookup | Fixed ZWSP→spacing bug |
| `scripts/fix_pinyin_remaining.py` | Lowercase, erhua fix, 女 fix | 0 remaining format issues |
| `scripts/fix_multi_reading_pinyin.py` | 72 multi-reading fixes (还, 着, 乐, etc.) | 104/104 verified correct |

### Data Quality Fixes
- **4 sent_th fixes**: 巾→clean Thai, 畔→cleared, …极了/…分之…→ZWSP removed
- **70 missing en fields filled**: All teaching-frame words with verified English definitions
- **3 remaining gaps**: Filled 2 missing py (…极了, …分之…), 1 missing sent_th (畔)
- **37 teaching-frame placeholders replaced**: `คำว่า '…'` → proper Thai translations with zh/sent_en
- **5 pinyin corruption fixes**: 放暑假 (gēi→jià), 一番 (pān→fān), 这就是说 (shuì→shuō), 表面上/一路上 (shǎng→shàng)

### Validation
`scripts/validate_integrity.py` — comprehensive checks across 30 files, 12,916 entries:
- ✅ File integrity (30/30 valid)
- ✅ Structural integrity (all required fields present)
- ✅ Pinyin format (0 tone numbers, 0 ZWSP, 0 uppercase, 0 run-together)
- ✅ sent_th quality (0 mixed-language issues — teaching-frame warning eliminated)
- ✅ Multi-reading accuracy (0 errors)
- ✅ School course format (0 issues)
- ⚠️ 33 missing en, 3604 missing th (pre-existing HSK translation gaps)

## Next Steps

### Next Stage: Phase 3.5 — Visual Cohesion Overhaul

**Objective:** Bridge the aesthetic gap between the lab page and the dashboard's neo-brutalist pastel toy direction. Make the lab feel like a cohesive, playful Alchemist's Toolkit rather than a functional spreadsheet with beakers.

**Priority order:**
1. **Adopt dashboard-style card system** — Thick borders, solid shadows, white/cream cards
2. **3D button redesign** — Matching dashboard's `:active` squish behavior
3. **Streamline top bar** — Match dashboard's avatar/streak/level/coins layout
4. **Panda mascot** — Add tiny panda lab assistant with speech bubble
5. **Tab & filter polish** — Match dashboard pill/swatch aesthetic
6. **Empty state & toast brush-up** — More game-like prompts
7. **Background decor** — Faint SVG line art

### Other Active Items
- Create 9-slice SVG frames for quest board and ribbon (`assets/frames/`)
- Apply notebook SQL to Supabase dashboard
- Create journey background PNGs (`journey_village_bg.png`, etc.)
- Fill remaining 3,604 HSK words missing Thai translations and example sentences