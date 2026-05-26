# Active Context

## Current Session — Drop zone redesign, drag-and-drop fixes, tap-to-select fix

### Drag-and-drop fixes
- **`setPointerCapture` removed** from plate's `onPointerDown` — was stealing `pointerup` events from customer slots, breaking drag-and-drop entirely
- **Replaced with `elementFromPoint` hit-test** — game area's `onPointerUp` now uses `document.elementFromPoint()` (after removing ghost) to find the customer slot under the pointer
- **Document-level `pointerup` cleanup** — when drag is released outside the game area, a document event listener cleans up the ghost and clears drag state
- **Tap-to-select fix** — game area's `onPointerUp` was unconditionally setting `dragStateRef.current = null`, wiping the ref before the `click` handler could check `dragStateRef.current?.active`. Now only clears inside the `if (active)` block. For taps, the ref persists through `pointerUp` so the click handler correctly identifies it as a non-drag interaction.
- **Double-scoring fix** — game area's `onPointerUp` was also calling `resolveAttempt` (bubble phase), duplicating the customer slot's handler (target phase). Removed `resolveAttempt` from game area handler — customer slot already covers both drag-drop and tap-to-deliver paths.

### Drop zone repositioned as plain translucent square
- **Moved from bottom (`position: absolute; bottom: 10px`)** to **top-center of customer area** (`top: 40px; left: 50%; transform: translateX(-50%)`)
- **130×130px square** with 18px rounded corners, translucent background (`rgba(255,248,231,0.75)`), no border, soft `box-shadow`, `backdrop-filter: blur(6px)`
- **No speech balloon tail**, no mini bubbles, no cloud texture
- **Empty state removed** — when no plate is selected, the drop zone is an empty translucent square with no emoji or text
- **Cancel button** overlaid at top-right corner (`top: -6px; right: -6px`), smaller at 24×24px
- **Selected plate** appears centered inside the square with gentle bounce animation
- **Mobile**: scaled to 100×100px square

### Customers and stools scaled 50% larger
- **Customer slot**: min-height 130→195px, width clamp 90-150→135-225px
- **Avatar**: clamp 56-72→84-108px
- **Stool**: width 44→66px, height 8→12px, legs height 14→21px
- **Bubble**: min-height 48→72px, padding 8→12px
- **Empty slot**: min-height 130→195px
- **Mobile**: avatar 44-56→66-84px, bubble min-height 38→54px, slot min-height 120→180px, width 76-110→114-165px

### Customer area height extended
- **`padding-bottom`** increased from 160px → 225px (belt is 130px tall, half ≈ 65px added on top of 160px)

### ✅ Working Correctly
- **Design system migration:** All 8 pages use design system CSS variables
- **paper-grain.png:** Exists at `assets/textures/paper-grain.png` (788 bytes)
- **signup.html:** Deleted
- **Hall of Fame:** Auto-saves scores, leaderboard in result screens, live refresh on dojo.html, **global shared leaderboard via Supabase**
- **Global Rankings tab:** Shows all players' scores, current user highlighted, loading spinner, auto-refreshes after game finish
- **Duplicate profiles:** Name-only check, auto-merge on `getAllProfiles()`
- **Auth flow:** Upgrade, sign-in, password reset, set-new-password, recovery detection
- **Font weights:** All pages identical (Bai 400-800, Nunito 400-800, Mali 400-700)
- **Sushi mode:** Walking entrance/exit animations, slot-based positioning, column layout (text top, emoji bottom), white glow on text, juice-bar spawn timer, SVG character avatars, custom pointer-based drag-and-drop, tap-to-select
- **Drop zone:** Plain translucent square centered above customers, 130×130px, no border/speech balloon, selected plate with cancel button
- **Customers scaled 50% larger:** 84-108px avatars, 66px stools, 195px slots
- **Grid Buster:** 4×4 matching game, multi-round, neo-brutalism board-game aesthetic
- **Error Boundary:** Catches render errors gracefully with fallback UI
- **Dojo page:** Neo-brutalism redesign with centered games grid, accent stripes, achievement card HOF
- **Print page:** Dual source (Course/Notebook), missing charsPerPage restored, notebook char enrichment
- **Progress page:** Full EN/TH i18n support for all dynamic content, improved font sizes
- **Notebook entries:** meaning_th stored alongside meaning, course data fallback for old entries
- **Supabase sync:** Notebook data sync support added
- **Guest dot:** Now hides immediately after sign-in on index page
- **Recovery page:** Fully functional with i18n support
- **Index page:** Sign-in option available alongside Add New Learner
- **Sushi iPhone:** Tap-to-deliver works, coordinate-based plate matching, doors hidden on mobile, belt edge-to-edge, single-row belt
- **Mode tabs conditionally rendered:** Hidden during gameplay via `onGameActiveChange` callback prop
- **Body scroll locked during gameplay:** `.scroll-locked` class toggled on `<html>` + `<body>`, game containers `position: fixed; inset: 0` for iOS bulletproof scroll prevention
- **Mobile Safari viewport:** `100dvh` on game containers for dynamic toolbar
- **Cache buster:** `?v=31` on game.js
- **Game cards on iPhone:** 3-column grid works on all iPhone viewports via `minmax(0, 1fr)` fix
- **Global Hall of Fame:** Shared leaderboards via Supabase with tabbed UI on dojo page
- **GitHub Pages deploy:** Fixed TypeScript build error that was silently blocking deploys for weeks
- **Custom image directories:** `games/public/images/sushi/` + `images/characters/` ready for assets
- **Drag-and-drop:** Custom pointer-based DnD (no HTML5 drag API), `document.elementFromPoint()` hit-testing, document-level pointerup cleanup
- **Double-scoring prevented:** Game area handler only cleans up ghost — customer slot handler does the resolve

### Known Issues
- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- User could close recovery modal without setting password (leaves recovery-limited session)
- `window.__SUPABASE_SYNC.pushAll()` called in auth-modal.js on sign-in success but method doesn't exist in silent no-op

### Pending: 11 Custom Character SVGs
- **User will prepare 11 SVG character images** (face/body only, no chairs) and place them in `images/characters/`
- **After placing them:** Verify the already-populated `CHARACTER_AVATARS` array in `SushiMode.tsx` has all 11 filenames
- SVG spec: 100×100 viewBox, just the character (stool is CSS-generated at 12px height), keep within ~50-60px center area
- Avatar CSS already handles `object-fit: contain` at 84-108px clamp

### Other Next Steps
- Verify matching game touch interaction on iPhone (tap-to-match needs pointer events)
- Fix `pushAll()` missing method or replace with proper sync trigger after sign-in
