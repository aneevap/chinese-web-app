# Active Context

## Current Session — Customer area extension & character SVG images

### Spawn timer: text → juice-bar progress bar
- **Replaced** "Next customer in {spawnTick}s" text with a green gradient progress bar
- Added `spawnMaxRef` to track the current spawn interval for accurate percentage
- Bar drains smoothly from 100% → ~16% over each interval, with 0.9s linear transition and shiny highlight streak
- CSS: `.spawn-tip` flex row (label + pill bar), `.spawn-tip-fill` with green gradient + `::after` highlight

### Customer area extended downward to meet conveyor belt
- **Restructured DOM:** `.drop-zone` moved from sibling between `customer-area` and `belt` to child inside `customer-area`
- `.customer-area` padding-bottom: 8px → 320px (shop background extends down, belt untouched)
- `.drop-zone` now `position: absolute; bottom: 10px` inside the padded area
- `.belt` fully restored to original CSS (no modifications)
- `.customer-row` uses `position: relative; top: 220px` to shift seats down visually without expanding layout height (unlike margin-top which would also push the absolute drop zone)

### Emoji avatars replaced with SVG character images
- **New folder:** `images/characters/` with 5 SVG placeholder faces — cat, bear, ninja, panda, fox
- Each SVG: 100×100 viewBox, colored circular background, expressive face features, ~30 lines
- Customer avatars now render as `<img>` tags instead of emoji text
- `.avatar` CSS: `font-size` → `width/height: clamp(42px, 7vw, 54px)` with `object-fit: contain`
- Added `pointer-events: none; user-select: none; -webkit-user-drag: none` to prevent drag interference

### Avatar positioned to sit on stool
- `.avatar` added `margin-top: auto` in the flex column — pushes avatar to bottom of slot, sitting right on the stool
- `.avatar` `margin-bottom: 2px` → `0` so there's no gap between avatar and stool

### ✅ Working Correctly
- **Design system migration:** All 8 pages use design system CSS variables
- **paper-grain.png:** Exists at `assets/textures/paper-grain.png` (788 bytes)
- **signup.html:** Deleted
- **Hall of Fame:** Auto-saves scores, leaderboard in result screens, live refresh on dojo.html, **global shared leaderboard via Supabase**
- **Global Rankings tab:** Shows all players' scores, current user highlighted, loading spinner, auto-refreshes after game finish
- **Duplicate profiles:** Name-only check, auto-merge on `getAllProfiles()`
- **Auth flow:** Upgrade, sign-in, password reset, set-new-password, recovery detection
- **Font weights:** All pages identical (Bai 400-800, Nunito 400-800, Mali 400-700)
- **Sushi mode:** Walking entrance/exit animations, slot-based positioning, column layout (text top, emoji bottom), white glow on text, juice-bar spawn timer, SVG character avatars
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
- **Green juice-bar spawn timer:** Smooth drain animation, shiny highlight streak
- **Customer area extends to belt:** 320px bottom padding, seats at bottom via relative top:220px
- **SVG character avatars:** 5 cute faces replace emoji, sit on stools via margin-top:auto

### Known Issues
- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- User could close recovery modal without setting password (leaves recovery-limited session)
- `window.__SUPABASE_SYNC.pushAll()` called in auth-modal.js on sign-in success but method doesn't exist in silent no-op

### Pending: 12 Custom Character SVGs
- **User will prepare 12 SVG character images** (face/body only, no chairs) and place them in `images/characters/`
- **After placing them:** Update `SushiMode.tsx` line ~956 — replace the current 5-element array with all 12 filenames, change `index % 5` to `index % 12`
- SVG spec: 100×100 viewBox, just the character (stool is CSS-generated at 22px total), keep within ~50-60px center area
- Avatar CSS already handles `object-fit: contain` at 42-54px clamp

### Other Next Steps
- Verify matching game touch interaction on iPhone (tap-to-match needs pointer events)
- Fix `pushAll()` missing method or replace with proper sync trigger after sign-in
