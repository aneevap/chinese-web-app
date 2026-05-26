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

### Cache buster tracking

Every time the bundle is rebuilt, the `?v=` parameter in `dojo.html` must be incremented. Current version tracking:
- Session 39: `v=35`
- Session 40 (initial fixes): `v=36`
- Session 40 (iPhone image paths + fonts): `v=37`
- Session 40 (iPhone centering + z-index): `v=38`
- Session 41 (grid stages): `v=39`
- Session 42: `v=39` (no bundle changes)

## ✅ Working Correctly

- **Design system migration:** All 8 pages use design system CSS variables
- **Hall of Fame:** Auto-saves scores, leaderboard in result screens, global shared leaderboard via Supabase
- **Auth flow:** Upgrade, sign-in, password reset, set-new-password, recovery detection
- **Sushi mode:** Walking animations, slot positioning, column layout, white glow, juice-bar spawn timer, SVG character avatars, drag-and-drop, tap-to-select
- **Drop zone:** Fully invisible — no background, border, shadow, or fixed dimensions
- **Flash Match:** Sushi-style HUD, green/red gradient cards, custom background, dynamic grids (3×3→3×4→3×4→4×4→4×5), combo/stage time bonuses + wrong penalty, time popup animations
- **Error Boundary:** Catches render errors gracefully
- **Dojo page:** Neo-brutalism design, centered games grid, global HOF
- **Body scroll locked during gameplay**, iOS viewport 100dvh
- **pandarocket.png** mascot on start screen, **panda_flash.png** on victory screen
- **pushAll()** sync now enqueues when not ready (no silent drops)

## Known Issues

- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- User could close recovery modal without setting password (leaves recovery-limited session)
- Stage 1 grid (3×3) has 1 empty cell — 9 cells with only 8 tiles (4 pairs)
- Stage 2 and 3 have the same 3×4 grid config — consider differentiating stage 3 for progressive difficulty
- Flash Match touch interaction on iPhone not yet fully verified

## Next Steps

- Consider making stages 3+ more challenging (different configs for stages 3-5)
- Verify Flash Match touch interaction on iPhone
- Test pandarocket.png and panda_flash.png rendering on live site

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

---

## ✅ Working Correctly

- **Design system migration:** All 8 pages use design system CSS variables
- **Hall of Fame:** Auto-saves scores, leaderboard in result screens, global shared leaderboard via Supabase
- **Auth flow:** Upgrade, sign-in, password reset, set-new-password, recovery detection
- **Sushi mode:** Walking animations, slot positioning, column layout, white glow, juice-bar spawn timer, SVG character avatars, drag-and-drop, tap-to-select
- **Drop zone:** Fully invisible — no background, border, shadow, or fixed dimensions
- **Flash Match:** Sushi-style HUD, green/red gradient cards, custom background, dynamic grids (3×3→3×4→3×4→4×4→4×5), combo/stage time bonuses + wrong penalty, time popup animations
- **Error Boundary:** Catches render errors gracefully
- **Dojo page:** Neo-brutalism design, centered games grid, global HOF
- **Body scroll locked during gameplay**, iOS viewport 100dvh
- **pandarocket.png** mascot on start screen, **panda_flash.png** on victory screen
- **pushAll()** sync now enqueues when not ready (no silent drops)

## Known Issues

- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- User could close recovery modal without setting password (leaves recovery-limited session)
- Stage 1 grid (3×3) has 1 empty cell — 9 cells with only 8 tiles (4 pairs). The last cell is unfilled.
- Stage 2 and 3 have the same grid config (3×4) — no difficulty increase between them.

## Next Steps

- Consider making stages 3+ more challenging (different configs for stages 3-5)
- Verify Flash Match touch interaction on iPhone
- Test pandarocket.png and panda_flash.png rendering on live site
