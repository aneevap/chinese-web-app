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
- Added supabase scripts to all 7 pages (index, new-learner, study, write, dojo, progress, print)
- Fixed pending write queue (writes during sync init were silently dropped)

### Session 7 — write.html UI Standardization & Bug Fix
- Migrated `write.html` to design system (paper-grain bg, design variables, fonts)
- Preserved all HanziWriter functionality
- Fixed `currentTheme=0` bug (initialized to 0, matching first theme index → `selectTheme(0)` exited early skipping `buildWordList()` and `loadChar(0)`)

### Session 8 — Account Upgrade Flow (Anonymous → Email/Password)
- Created `shared/auth-modal.js` — full inline modal UI for upgrade, sign-in, and forgot/reset password
- Enhanced `shared/supabase-client.js` with auth APIs (auth state tracking, upgrade, sign-in, sign-out, onAuth)
- Added auth i18n strings (EN + TH) to `strings.js`
- Integrated auth modal into 4 pages: `index.html`, `progress.html`, `study.html`, `write.html`
- All guest banners now call `showAuthModal('upgrade')` instead of redirecting to `signup.html`
- Added `is_guest` to `profiles.js` `updateProfile()` allowed fields

### Session 9 — Password Reset Callback Flow & Auth Improvements
- **Password reset flow:** "Forgot password?" link → password reset form → "Check your email" view
- **Password reset callback:** Auto-detection of `type=recovery` URL hash, set-new-password form, success view
- **Duplicate email handling:** Inline "Already registered? Sign in instead" link on upgrade form
- **Label updates:** Upgrade modal renamed from "Save your progress" → "Create Account"
- **UX fixes:** "Create Account" button in progress.html hidden when already signed in
- **README:** `signup.html` marked as deprecated
- **Commits:** `8345677` (Session 8), `ec1afbc` (label updates), `988d311` (password reset callback), `0485c2b` (Forgot PIN recovery)

### Session 10 — Hall of Fame Auto-Save & Leaderboard
- **Removed debug button:** "Test Add Score" button and `testHallOfFame()` function removed from `dojo.html`
- **Added leaderboard display:** Sushi game result screen now auto-loads and shows top 5 leaderboard entries
- **Auto-save verified:** `saveSessionResult()` already dispatches `xhz:dojo-hof-updated` event → Hall of Fame auto-refreshes
- **Fixed timestamp race condition:** Captured `Date.now()` once before saving to ensure rank lookup finds the correct entry

### Session 11 — Phase 3: Game CSS → Design System Migration
- `games/index.html` — Added Google Fonts preconnect/stylesheet links
- `games/src/style.css` — All hardcoded colors → design system CSS variables (--paper-*, --ink-*, --botes-*, --highlight-red); all fonts → --font-main, --font-hanzi, --font-pinyin; all shadows → --shadow-soft, --shadow-card, --shadow-lifted
- Build ✓ (Vite build succeeds, 15.6 KB output)
- Fallbacks provided so the game works standalone in dev mode

### Session 12 — Auto-Merge Duplicate Profiles
- Changed `isDuplicate()` from name+avatar check → name-only check in `profiles.js`
- Added `findDuplicateGroups()`, `_mergeGroups()`, `mergeDuplicates()` methods
- `getAllProfiles()` now auto-merges duplicates silently on read (with re-entry guard via `_merging` flag)
- `new-learner.html` — Updated duplicate warning message, disabled submit button on duplicate, defense-in-depth check on create
- Duplicate warning no longer checks avatar — any same-nickname profile triggers it

### Session 14 — Hall of Fame Save Flow Fix
- Fixed `getGameHighScore()` in `dojo.html`: `.find()` → `for` loop finding max `bestScore`
- Added game card auto-refresh on `xhz:dojo-hof-updated` event (calls `renderGameCards()`)
- Fixed Hall of Fame save race condition: transition-based observer detecting secondsLeft 1→0 instead of relying on `ended` state, with backup save effect as safety net

### Session 15 — Sushi Mode: Walking Animations & Slot Positioning
- **Bigger hanzi:** Font 20px→28px, plates 80px→90px
- **Slot-based positioning:** `slotIndex` assigned at spawn, rendering finds by slot (no more shifting)
- **Walking entrance:** Bobbing gait from left entrance door with per-slot CSS custom properties
- **Walking exit:** Served → walk to exit, wrong → sad-slouch exit. `onAnimationEnd` for DOM removal
- **CSS cascade fix:** Combined `walkOut` + `correctFlash` animations so both play simultaneously
- Build ✓ (214 KB, 24 modules)

### Session 16 — Hall of Fame Visual Redesign
- Constrained to 640px centered width
- Trophy cards with white bg, rounded corners, shadow, hover lift
- Podium top 3: gold/silver/bronze with gradient, ribbon accent, medal badges
- Game badge pills with per-game colors
- Stagger entrance animation (fade+slide with 0.06s delay)
- Decorative corner flourishes and gradient header line

### Session 17 — Dojo Cleanup & Grid Buster Game
- **Removed** Write Practice and Study Cards from Dojo
- **Grid Buster game:** 4×4 grid (8 char-meaning pairs), 60s timer, combo detection, course/theme selection, match/wrong animations, score popups, Hall of Fame leaderboard in result screen
- Deleted `MatchingPlaceholder.tsx`
- Fixed grid-building bug: `!gameStarted`→`gameStarted` (tiles never appeared before)
- Build ✓ (228 KB, 24 modules)

### Session 18 — Grid Buster: Multi-Round & Neo-Brutalism Redesign
- **Multi-round:** New sets release when all pairs matched. Words tracked across rounds via `usedWordIdsRef`. "🔄 New Set!" flash animation.
- **Neo-brutalism board-game aesthetic:**
  - Color palette: warm cream `#FAF8F5`, sunny yellow `#FCD34D`, royal blue `#1E40AF`, coral `#F43F5E`
  - Thick 3-4px solid `#111827` borders, hard offset shadows, push-down `:active` interactions
  - Replaced all inline styles with CSS classes (course buttons, theme chips, leaderboard, result screen)
  - Start screen, result card, HUD, tiles all updated with consistent board-game styling
- Build ✓ (227 KB, no errors)

### Session 19 — Error Boundary & Crash Fixes
- **TDZ crash fix:** `startNewRound` useCallback defined after the `useEffect` referencing it → `Cannot access 'Ie' before initialization`. Moved `startNewRound` before the effect, removed unused `speakChinese` import and `resolvedCount` state.
- **ErrorBoundary.tsx:** New React class component with neo-brutalism fallback UI (warning icon, collapsible error details, Try Again + Back to Dojo buttons). Inline styles for resilience.
- **App.tsx:** Wrapped game modes in `<ErrorBoundary>` so render errors are caught gracefully instead of crashing
- **Game-disappearing investigation:** User reported being kicked to Dojo on wrong match. No navigation path found in wrong-match handler. Root cause confirmed as the TDZ crash (app crashed on load, appeared as "disappeared"). No longer reproducible.
- Build ✓ (227 KB, no errors)
- Cache buster: `v=23`

### Session 20 — Sushi Mode Neo-Brutalism Redesign
- **CSS overhaul:** All sushi-specific elements now match the board-game aesthetic:
  - `.sushi-mode` bg `#FAF8F5` with diagonal stripe overlay (replaced sakura)
  - `.hud` → 6 columns, yellow bg, 3px black border, hard shadow, push-down
  - `.customer-slot` → 3px black border, hard shadow, cream bg
  - `.bubble` → 3px black border, 2px hard shadow, bold text
  - `.belt` → yellow bg, 3px black border, hard shadow, blue stripe pattern
  - `.plate` → 3px black border, hard shadow, push-down active state
  - `.start-screen`/`.countdown-screen` → 4px black border, 8px hard shadow
  - `.cancel-selection`/`.door`/`.spawn-tip`/`.noren` → consistent styling
- **TSX cleanup:** Replaced all inline styles with CSS classes (course buttons, theme chips, leaderboard, section labels, hints)
- **HUD fix:** Personal-best always renders (shows `-` when 0) to maintain 6-column grid
- Build ✓ (227 KB, no errors)
- Cache buster: `v=24`

### Session 21 — Dojo Page Neo-Brutalism Redesign
- **Games grid centered** with `justify-content: center` (previously left-aligned)
- **Full CSS redesign** of dojo.html with neo-brutalism board-game aesthetic:
  - 3-4px solid `#111827` borders, hard offset shadows (5px/8px), push-down `:active` states
  - Warm cream `#FAF8F5` backgrounds, sunny yellow `#FCD34D` accents
  - Game cards: 20px rounded corners, 220px fixed width, color accent stripes via `data-game` attribute
  - Sushi accent: orange `#FF6B35`, Matching accent: purple `#7E57C2` (aligned with game definitions)
- **Hall of Fame:** Achievement card layout with podium styling (gold/silver/bronze gradient backgrounds), metallic medal badges with 3px black borders, decorative yellow corner brackets (`.hall::before`/`::after`), staggered `hallEntry` animation, thick left-edge accent stripes for top 3
- **Typography:** `ZCOOL KuaiLe` playful display font applied to `.dojo-header h1` and `.hall-header h2`
- **Responsive:** Mobile breakpoint at 520px with column layout and adjusted sizes
- Cache buster: `v=24`

### Session 22 — Auto-Repair Stale Profiles After Supabase Sign-In
- **Added `repairAllProfilesFromSupabase()` to profiles.js:** Iterates ALL local profiles, sets `is_guest: false` on stale ones, saves only if changes made. Has placeholder comment for future auto-repair fields.
- **Updated progress.html, study.html, write.html** — all guest banner locations now call the comprehensive repair instead of per-profile repair, so sibling profiles also get cleaned up
- **Fixed auth-modal.js bug:** `profile` variable was trapped inside an `else` block (only ran when `repairAllProfilesFromSupabase` didn't exist), causing `window.__SUPABASE_SYNC && profile` to evaluate `undefined` and silently skip the post-sign-in sync trigger. Now declared at function scope.
- **Defensive typeof guards** on auth-modal.js and write.html's `showGuestWarningIfNeeded()` for backward compatibility

### Session 23 — Progress page: Notebook compact card & bottom sheet
- **Notebook now shows top 5 entries** in compact format (char, pinyin, meaning, date on one row)
- **Compact entry layout:** smaller char (1.1em), py+meaning on same row with separator, date right-aligned
- **"See all N →" button** appears when >5 entries, opens a bottom sheet overlay
- **Bottom sheet** has full notebook with inline note editing (click to edit, save), remove button, escape-key-to-close
- **Cleanup:** removed dead functions (old editNotebookNote/saveNotebookNote/removeNotebookEntry)
- **Escape key** fixed: overlay gets focus() on open via tabindex and keydown listener

### Session 24 — Print page: Notebook source & bug fixes
- **Source selector tabs** (Course / My Notebook) added to print page header
- **Course+theme section** wrapped in show/hide div, controlled by selectSource()
- **renderNotebookCharGrid()** loads notebook entries and renders as selectable char tiles
- **Missing charsPerPage()** was lost during refactor — preview and print both broke. Added back: 8 chars first page, 10 for subsequent.
- **findWordInCourseData()** helper searches COURSE_DATA for word enrichment
- **Notebook char enrichment:** word objects now include zh, sent_en, sent_th, and th fallback from course data
- **Notebook char toggle fixed:** closure uses `this` (DOM element) for classList + captured word for data
- **selectAll()** returns early for notebook source; clearAll() uses Object.keys(selected)
- **Course loading functions** added: loadCourses, buildCourseTabs, selectCourse, loadCourseData, buildThemeTabs, selectTheme, buildCharGrid, getThemeWords
- **Supabase sync:** notebook table sync support added (pushNotebook, pullNotebook)

### Session 25 — EN/TH i18n fixes + notebook TH meaning enrichment
- **Progress page:** all dynamic content now uses t() — stats labels, journey, badges, calendar, mastery summary, items, notebook
- **onLangChange** registered once in window.onload (fixed exponential callback growth bug)
- **MONTH_NAMES** replaced with dynamic getMonthNames() for live lang updates
- **Remaining hardcoded strings translated:** legend (unseen/seen/practiced/mastered), tooltip status labels, month names (jan-dec), calendar alert labels, streak day/days
- **Write/Study:** memoCurrentWord() now passes meaning: wd.en, meaning_th: wd.th
- **Profiles.js:** addNotebookEntry stores and updates meaning_th field
- **Progress page notebook:** findInCourseData() provides TH fallback for old entries without meaning_th
- **Print page notebook:** same course data fallback for TH meanings in notebook chars
- **strings.js:** added 40+ new EN/TH string pairs for all new translations

### Session 26 — Index page: Sign-in option & Recovery page fix
- **Added "Sign In" card** to index.html profile picker grid (alongside "Add New Learner")
- **Fixed recovery.html:** JavaScript was truncated at line 221 causing infinite loading spinner. Reconstructed the full script (~150 lines) with complete recovery flow: view toggling, password strength meter, visibility toggles, form validation, PIN-cleared detection, and fallback for invalid links. Fixed background image path.
- **Recovery page i18n:** Added 9 new EN/TH string keys to strings.js. Replaced all hardcoded English text with data-i18n/t() calls. Fixed refreshStrings() overwriting dynamic text on no-recovery-msg.

### Session 27 — Progress page: Font size audit
- First pass: Bumped ~25+ selectors by 0.05–0.1em (stats labels, badges, calendar, mastery grid, items, notebook compact entries)
- Second pass: Added `font-size: 112%` to `.page-content` for a proportional 12% base boost; increased mastery word button sizes with overflow hidden

### Session 28 — Guest dot fix after sign-in
- **Bug:** After signing in on index.html, renderProfiles() was never called again so guest dots persisted in the DOM
- **Fix:** In auth-modal.js, captured the repairAllProfilesFromSupabase() promise and chained .then() to call renderProfiles() on completion

### Session 29 — Sushi game iPhone fixes: tap-to-deliver, hide doors, belt edge-to-edge
- **Tap-to-deliver:** Added onClick to occupied customer slots calling resolveAttempt() when a word is selected — fixes drag & drop not working on iPhone touch devices
- **Doors hidden on mobile:** Added display:none to .door-row at max-width:400px breakpoint
- **Belt edge-to-edge:** Negative margins (-6px) counteract container padding, side borders removed, edge fades hidden, track padding/gaps reduced — ~6 plates visible instead of ~5

### Session 30 — Mode tab hiding during gameplay (abandoned — all approaches failed on iPhone)
- **Attempt 1:** Custom events (`xhz:game-playing`/`xhz:game-idle`) dispatched from game modes, App.tsx listens → `display: none` — failed
- **Attempt 2:** CSS class toggle on `<body>` (`body.classList.toggle('game-active', ...)`) + CSS `body.game-active .mode-tabs { display: none !important; }` — failed
- **Attempt 3:** Direct DOM manipulation: `document.querySelector('.mode-tabs').style.display = 'none'` called synchronously inside countdown callback — failed
- **Attempt 4:** Pure React callback prop: `onGameActiveChange={setGameActive}` passed to game modes, `.mode-tabs` conditionally rendered `{!gameActive && (...)}` — failed (user reports "there is no change at all")
- **Suspected causes (not confirmed):** Browser caching, deploy workflow not picking up latest commits, iOS Safari quirk preventing React state propagation
- **Outcome:** Abandoned. Mode tabs remain visible during gameplay on iPhone.

### Session 31 — Mode tab hiding + scroll lock: debug checklist applied
- **Root cause identified:** Cache buster `?v=24` hadn't been bumped since Session 20 — iPhone was loading cached JS predating all 4 approaches
- **Cache buster bumped:** `?v=24` → `?v=31` in `dojo.html`
- **Scroll locked during gameplay:** `.scroll-locked` class toggled on `<html>` + `<body>` when game is active (#2 from checklist)
- **Nuclear fix:** Game containers become `position: fixed; inset: 0; z-index: 100` when `.scroll-locked` is active, preventing iOS rubber-banding (#3/#19 from checklist)
- **Mobile viewport fix:** `min-height: 100vh` → `100dvh` on both game modes for Safari dynamic toolbar (#11 from checklist)
- **Effect combined:** `onGameActiveChange` callback + scroll locking merged into one useEffect in both SushiMode and MatchingMode
- **Commit:** `48e5110`
- **Status:** Needs iPhone testing with hard refresh to confirm fix

### Session 32 — Global Hall of Fame, Safari grid fix, TypeScript build unblocked
- **Global Hall of Fame:** Added `hall_of_fame` table to Supabase schema, sync methods (`pushHallOfFameEntry`, `pullHallOfFameEntries`, `pushAllHallOfFame`), wired `hallOfFame.ts` to push after local save, dojo page with "Your Rankings" / "Global Rankings" tabs, loading spinner, current user highlight, race condition guard
- **Safari CSS Grid fix:** Changed `grid-template-columns: repeat(3, 1fr)` → `repeat(3, minmax(0, 1fr))` to fix iOS Safari's implicit `minmax(auto, 1fr)` that prevented 3-card grid from working on iPhone
- **TypeScript build fix:** Removed dead `personalBest` state (unused variable) in `SushiMode.tsx` that was blocking `tsc` — causing GitHub Pages deploy to silently fail for weeks
- **GitHub Pages unblocked:** After build fix, all accumulated changes (Dojo redesign, Global HOF, Safari grid) deployed to live site
- **Commit:** `d974d0a` (Global HOF), `b8d2aa9` (Safari grid fix), `99c465a` (TypeScript build fix)

### Session 33 — Global HOF race condition fix: push→pull timing
- **Root cause:** When a game ended, `saveSessionResult()` dispatched `xhz:dojo-hof-updated` and fired `pushToSupabase()` synchronously. The event listener immediately pulled from Supabase — which beat the async push. Pull returned empty → "No global rankings yet". Push completed moments later but nothing triggered a re-render.
- **Fix 1 (`shared/supabase-sync.js`):** `pushHallOfFameEntry()` now dispatches `xhz:dojo-hof-pushed` custom event after a successful upsert, so the Global tab re-renders when data actually arrives.
- **Fix 2 (`dojo.html`):** New `xhz:dojo-hof-pushed` listener re-renders the Global tab. Also added a 2-second delayed retry in the `xhz:dojo-hof-updated` handler as a safety net for the race.
- **Verification:** User confirmed "found the Test score" — Global tab working end-to-end.
- **Commit:** `6a86025`

### Session 35 — Sushi plate layout refinements, HUD simplification, custom image directory
- **Sushi plate layout:** Fixed height (106px) for perfectly round plates, `flex-direction: column; justify-content: space-between` layout with text at upper border and emoji at lower border
- **White glow on text:** Replaced `-webkit-text-stroke` (which ate into character strokes) with 4-layer `text-shadow` — tight bright core + layered soft halo, making characters visibly float over the emoji
- **Character position swapped:** `.plate-flag` first (top), `.plate-emoji` last (bottom) — consistent across belt plates, selected plate, and drag ghost
- **HUD simplified:** 5 red card-style items → 2 clean indicators (star counter left, timer right), big 36px Bangers font with 4-layer glow, no backgrounds
- **Custom sushi image directory:** Created `games/public/images/sushi/` with README documenting 128×128px PNG conventions, 8 naming rules, and migration guide for switching from emojis to `<img>` tags
- **Commits:** `594a572` (sushi readability), `b54dbf3` (stronger glow), `a6d35be` (text at top, emoji at bottom), `c5b22f8` (round plates + overlaying text), `6d2092c` (simplified HUD), `8de7085` (swap plate children), `f0c42a3` (custom image directory)

### Session 36 — Spawn timer progress bar, customer area extension, SVG character avatars
- **Spawn timer:** Replaced "Next customer in {spawnTick}s" text with green juice-bar progress bar. Added `spawnMaxRef` for percentage tracking. Smooth 0.9s linear drain with shiny highlight streak.
- **Customer area extended to belt:** `.drop-zone` moved inside `.customer-area` DOM. `.customer-area` padding-bottom increased to 320px. `.belt` fully restored to original (no modifications). `.customer-row` uses `position: relative; top: 220px` to shift seats down without expanding layout.
- **Character SVG images:** Created `images/characters/` with 5 SVG placeholder faces (cat, bear, ninja, panda, fox). Replaced emoji text with `<img>` tags. CSS switched from `font-size` to `width/height: clamp(42px, 7vw, 54px)` with `object-fit: contain`.
- **Avatar sits on stool:** Added `margin-top: auto` to `.avatar` to push it to bottom of flex column, sitting right on the stool. Removed margin-bottom gap.
- **Commits:** `8f83344` (padding 320px + SVG chars), `8c1a8be` (top:220px), `8efe87d` (margin-top:auto)

### Session 37 — Drag-and-drop fixes, tap-to-select fix, drop zone redesign, customer scaling
- **Drag-and-drop fixes:**
  - Removed `setPointerCapture` from plate's `onPointerDown` (was stealing `pointerup` events from customer slots, breaking DnD)
  - Replaced with `document.elementFromPoint()` hit-test in game area's `onPointerUp` to find customer slot under pointer
  - Added document-level `pointerup` listener for cleanup when drag released outside game area
- **Tap-to-select fix:**
  - Game area's `onPointerUp` was unconditionally clearing `dragStateRef.current = null` before the `click` handler could check `dragStateRef.current?.active`
  - Now only clears inside the `if (active)` block — for taps, the ref persists through `pointerUp` so `click` correctly identifies it as a non-drag
- **Double-scoring fix:**
  - Game area's `onPointerUp` bubble-phase handler was also calling `resolveAttempt`, duplicating the customer slot's target-phase handler
  - Removed `resolveAttempt` from game area handler — customer slot handler already covers both drag-drop and tap-to-deliver
- **Drop zone → plain translucent square:**
  - Moved from bottom (`position: absolute; bottom: 10px`) to top-center (`top: 40px; left: 50%; transform: translateX(-50%)`)
  - 130×130px square, 18px rounded corners, translucent `rgba(255,248,231,0.75)`, no border, soft `box-shadow`, `backdrop-filter: blur(6px)`
  - No speech balloon tail, no mini bubbles, no chef emoji/text — completely minimal empty state
  - Cancel button overlaid at top-right corner (`top: -6px; right: -6px`), 24×24px
  - Mobile: 100×100px square
- **Customers and stools scaled 50% larger:**
  - Slot height 130→195px, width 90-150→135-225px
  - Avatar clamp 56-72→84-108px
  - Stool width 44→66px, height 8→12px, legs 14→21px
  - Bubble min-height 48→72px
  - Mobile: avatar 44-56→66-84px, slot 120→180px min-height
- **Customer area height extended:**
  - `padding-bottom` increased 160px → 225px (half belt height = ~65px added)
- **Commits:** `5d6a55e` (drop zone + customer scaling)
