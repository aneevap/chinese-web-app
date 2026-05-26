# Active Context

## Current Session — Flash Match overhaul: HUD, card styles, gameplay logic, time popups

### Drag-and-drop fixes
- **`setPointerCapture` removed** from plate's `onPointerDown` — was stealing `pointerup` events from customer slots, breaking drag-and-drop entirely
- **Replaced with `elementFromPoint` hit-test** — game area's `onPointerUp` now uses `document.elementFromPoint()` (after removing ghost) to find the customer slot under the pointer
- **Document-level `pointerup` cleanup** — when drag is released outside the game area, a document event listener cleans up the ghost and clears drag state
- **Tap-to-select fix** — game area's `onPointerUp` was unconditionally setting `dragStateRef.current = null`, wiping the ref before the `click` handler could check `dragStateRef.current?.active`. Now only clears inside the `if (active)` block. For taps, the ref persists through `pointerUp` so the click handler correctly identifies it as a non-drag interaction.
- **Double-scoring fix** — game area's `onPointerUp` was also calling `resolveAttempt` (bubble phase), duplicating the customer slot's handler (target phase). Removed `resolveAttempt` from game area handler — customer slot already covers both drag-drop and tap-to-deliver paths.

### Drop zone made fully transparent
- Removed all graphic styling from `.thought-bubble`: `background`, `box-shadow`, `backdrop-filter`, `border-radius`, fixed width/height — now completely invisible, just a positioned flex container
- Removed `.selected-plate-wrapper` fixed width/height/padding — size is content-determined

### Flash Match game — HUD upgrade
- Replaced old 6-column card-grid HUD with sushi-style simple display: **💰 Score (left)**, **🏁 Stage (center)**, **⏱️ Timer (right)**
- Big 36px Bangers font with gold text-shadow glow, no card backgrounds
- Added `matchStage` state (starts at 1, increments in `startNewRound`)
- Stage saved to Hall of Fame (`bestStage: matchStageRef.current`)

### Flash Match game — Card styling
- **Chinese character tiles:** Green gradient `#107565→#0a2c34`, gold text/border `#e5d18e` with highlight glow
- **Translation tiles:** Red gradient `#a32f2d→#402229`, yellow text/border `#fde87b`
- Removed old `.matching-hud` grid card styles and dead CSS classes

### Flash Match game — Custom background
- Diagonal stripe `::before` pattern replaced with `background-image: url('../../images/matching-bg.png')` (cover/center/no-repeat)
- Image placed at `images/matching-bg.png` (root-level, ~1.6MB)

### Flash Match game — Gameplay logic changes
- **Dynamic grid sizes:** Stage 1 → 3×3 (8 tiles/4 pairs), Stage 2 → 4×4 (16/8), Stage 3+ → 5×5 (24/12)
- **Combo time bonus:** Every 5 corrects in a row → +3 seconds (+5s, +10s, +15s…)
- **Stage time bonus:** Each new stage → +5 seconds
- **Wrong penalty:** Each mistake → −1 second (clamped ≥ 0)
- **ADJUST_TIME action** added to gameState reducer (clamps to min 0)
- Grid columns set via inline `style={{ gridTemplateColumns }}` instead of fixed CSS
- Removed fixed `grid-template-columns` from `.matching-grid` CSS

### Flash Match game — Time popup animations
- `+3s ⏱️` pops up near timer on combo bonus
- `+5s ⏱️` pops up on new stage
- `-1s ⏱️` pops up on wrong match
- Green glow animation with scale-up → float-up → fade over 0.85s
- Cleanup after 900ms via useEffect

### ✅ Working Correctly
- **Design system migration:** All 8 pages use design system CSS variables
- **Hall of Fame:** Auto-saves scores, leaderboard in result screens, global shared leaderboard via Supabase
- **Auth flow:** Upgrade, sign-in, password reset, set-new-password, recovery detection
- **Sushi mode:** Walking animations, slot positioning, column layout (text top, emoji bottom), white glow, juice-bar spawn timer, SVG character avatars, drag-and-drop, tap-to-select
- **Drop zone:** Fully invisible — no background, border, shadow, or fixed dimensions
- **Flash Match:** Sushi-style HUD, green/red gradient cards, custom background, dynamic grids (3×3→4×4→5×5), combo/stage time bonuses + wrong penalty, time popup animations
- **Error Boundary:** Catches render errors gracefully
- **Dojo page:** Neo-brutalism design, centered games grid, global HOF
- **Body scroll locked during gameplay**, iOS viewport 100dvh
- **Custom image directories:** `images/characters/` + `images/matching-bg.png` + `games/public/images/sushi/`

### Known Issues
- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- User could close recovery modal without setting password (leaves recovery-limited session)
- `window.__SUPABASE_SYNC.pushAll()` called in auth-modal.js on sign-in success but method doesn't exist in silent no-op
- **Stage 1 grid (3×3) has odd cell count** — 9 cells can only fit 4 pairs (8 tiles) + 1 empty cell. User expects more cards. Need to decide: change to 4×4 for stage 1, or show 9 cards with 4 pairs + 1 placeholder cell.

### Git Push Failures (Recurring)
`git push` silently fails ~50% of the time from the assistant (basher agent). Exits with "Everything up-to-date" even with unpushed commits. Root cause unclear. **Fix:** Always compare `HEAD` vs `origin/main` after push. If different, re-run `git push origin main` explicitly.

### Next Steps
- Fix stage 1 grid size — 3×3 yields odd cell count, user reports too few cards
- Verify Flash Match touch interaction on iPhone
- Fix `pushAll()` missing method or replace with proper sync trigger after sign-in
