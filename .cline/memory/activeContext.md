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

## Next Steps

- Apply notebook SQL to Supabase dashboard to eliminate remaining 404
- Create the background PNGs (start with `journey_village_bg.png`)
- Port zombie game into a proper game mode on arena.html
- Add unlock gating (course 1A mastery check) and coin rewards