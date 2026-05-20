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

## Pending
- [x] Standardize font weight loading across all pages (completed in Sessions 3-4)
- [x] Clean up unused `signup_*` i18n keys from `strings.js` (completed in Session 14)
- [x] Apply neo-brutalism aesthetic to sushi mode (completed in Session 20)
- [x] Apply neo-brutalism aesthetic to dojo page (completed in Session 21)
- [ ] Enhance progress tracking with detailed analytics
- [ ] Add data export/backup feature
