# Active Context

## Current Session — Sushi plate refinements & custom image directory setup

### Sushi plate layout refactor (Sessions in conversation)
- **Round plates restored:** Changed `min-height` to fixed `height: 106px` guaranteeing perfect circle with `border-radius: 50%`
- **Text at top, emoji at bottom:** `flex-direction: column; justify-content: space-between` layout — hanzi/pinyin at upper border, sushi emoji at lower border (stacked look)
- **White glow for text:** Replaced `-webkit-text-stroke` (which ate into character strokes) with 4-layer `text-shadow` — tight bright core (2px 100% opacity) + 3 outer glow layers, making characters visibly float as an upper layer over the emoji
- **Character/emoji swapping:** Swapped DOM order so `.plate-flag` is first (top) and `.plate-emoji` is last (bottom) — consistent across belt plates, selected plate, and drag ghost
- **Emoji size:** Reduced from 48px → 42px to fit edge-to-edge in the column layout

### HUD simplification
- **Before:** 5 red card-style items (stars, score, combo, stage, timer) with neo-brutalist backgrounds
- **After:** 2 clean indicators — star counter (left) + timer (right), big chunky 36px Bangers font, 4-layer glowing text-shadow, no card backgrounds

### Custom sushi image directory
- **Directory created:** `games/public/images/sushi/`
- **README conventions documented:** 128×128px PNG, 8 naming conventions matching current sushi types, lowercase filenames, migration guide for switching from emojis to `<img>` tags

### ✅ Working Correctly
- **Design system migration:** All 8 pages use design system CSS variables
- **paper-grain.png:** Exists at `assets/textures/paper-grain.png` (788 bytes)
- **signup.html:** Deleted
- **Hall of Fame:** Auto-saves scores, leaderboard in result screens, live refresh on dojo.html, **global shared leaderboard via Supabase**
- **Global Rankings tab:** Shows all players' scores, current user highlighted, loading spinner, auto-refreshes after game finish
- **Duplicate profiles:** Name-only check, auto-merge on `getAllProfiles()`
- **Auth flow:** Upgrade, sign-in, password reset, set-new-password, recovery detection
- **Font weights:** All pages identical (Bai 400-800, Nunito 400-800, Mali 400-700)
- **Sushi mode:** Walking entrance/exit animations, slot-based positioning, column layout (text top, emoji bottom), white glow on text
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
- **Custom image directory:** `games/public/images/sushi/` ready for PNG assets

### Known Issues
- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- User could close recovery modal without setting password (leaves recovery-limited session)
- `window.__SUPABASE_SYNC.pushAll()` called in auth-modal.js on sign-in success but method doesn't exist in silent no-op

### Next Steps
- User plans to prepare custom sushi PNG images for `games/public/images/sushi/`
- Migrate `getSushiEmoji()` to load `<img>` tags from `/images/sushi/` when images are ready
- Verify matching game touch interaction on iPhone (tap-to-match needs pointer events)
- Fix `pushAll()` missing method or replace with proper sync trigger after sign-in
