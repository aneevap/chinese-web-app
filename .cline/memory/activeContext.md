# Active Context

## Current Session (Session 22) — Auto-Repair Stale Profiles After Supabase Sign-In

- **Added `repairAllProfilesFromSupabase()` to `profiles.js`:** Iterates ALL local profiles, sets `is_guest: false` on any that are still stale, saves only if changes were made. Includes placeholder comment for future auto-repair fields.
- **Updated all guest banner locations** (`progress.html`, `study.html`, `write.html`) — now call the comprehensive repair function instead of per-profile repair, ensuring sibling profiles also get repaired
- **Fixed `auth-modal.js` bug:** `profile` variable was declared inside an `else` block, causing post-sign-in `window.__SUPABASE_SYNC && profile` to evaluate `undefined` and silently skip the sync trigger. Now declared at function scope.
- **Defensive typeof guards** on auth-modal.js and write.html's `showGuestWarningIfNeeded()` for backward compatibility

## Recent Changes (Sessions 14-21)

### Session 21 — Dojo Page Neo-Brutalism Redesign
- **Games grid centered** with `justify-content: center` (previously left-aligned)
- **Full CSS overhaul** of dojo.html with neo-brutalism board-game aesthetic (thick borders, hard shadows, push-down interactions, cream/yellow/blue/coral palette)
- **Game cards** now have `data-game` attributes for accent stripes (orange sushi, purple matching)
- **Hall of Fame** redesigned with achievement card layout, podium styling, metallic medals, decorative corner brackets, staggered animations
- **ZCOOL KuaiLe** display font applied to dojo header and HOF title
- **Fixed:** Matching card stripe color changed from blue `#1E40AF` to purple `#7E57C2` to match game definition
- **Cache buster:** Updated to `v=24`

### Session 20 — Sushi Mode Neo-Brutalism Redesign
- **CSS overhaul:** All sushi-specific elements now use thick black borders, hard offset shadows, and the cream/yellow/blue/coral palette
- **TSX cleanup:** All inline styles replaced with existing CSS classes (course buttons, theme chips, leaderboard, etc.)
- **HUD grid:** Always 6 columns, personal-best item shows `-` when no PB exists
- **Cache buster:** Updated to `v=24`

### Session 19 — Error Boundary & Crash Fixes
- **TDZ fix:** Moved `startNewRound` before the `useEffect` that depends on it, cleaned up unused code
- **ErrorBoundary.tsx:** Created with fallback UI, retry/back-to-dojo buttons, inline error-styling
- **App.tsx:** Wrapped game modes in `<ErrorBoundary>` so render errors are caught gracefully
- **Investigation:** Game-disappearing issue was the TDZ crash (not navigation logic)
- **Cache buster:** Updated to `v=23`

### Session 18 — Grid Buster Multi-Round & Visual Redesign
- **Multi-round gameplay:** When all 8 pairs matched before time runs up, a "🔄 New Set!" flash appears and fresh tiles are released. Timer keeps running. Words tracked across rounds via `usedWordIdsRef` — no repetition until pool exhausted.
- **Neo-brutalism visual redesign:** Complete board-game aesthetic overhaul with thick borders, hard shadows, push-down interactions, and new color palette (cream/yellow/blue/coral).
- **Cache buster:** Updated to `v=21`

### Session 17 — Grid Buster Game & Dojo Cleanup
- **Removed Write Practice and Study Cards** from Dojo game cards
- **Grid Buster matching game implemented:** 4×4 grid (8 char-meaning pairs), 60-second timer, combo detection, course/theme selection, match/wrong animations, score popups, Hall of Fame leaderboard
- Deleted `MatchingPlaceholder.tsx`
- **Multi-round fix:** Grid-building effect had `!gameStarted` instead of `gameStarted` — tiles never appeared. Fixed.

### Session 16 — Hall of Fame Redesign
- Constrained width to 640px centered (no more full-width table)
- Trophy cards with white bg, rounded corners, hover lift effect
- Podium styling for top 3: gold/silver/bronze with gradient backgrounds, colored left-edge accents, medal badges, ribbon accents
- Game badge pills per entry (sushi/matching colors)
- Stagger entrance animation (fade+slide, 0.06s delay per item)
- Decorative corner flourishes and gradient header line

### Session 15 — Sushi Mode Animations & Slot Positioning
- **Bigger characters:** Hanzi font 20px→28px, plates 80px→90px
- **Slot-based positioning:** Customers assigned `slotIndex` at spawn, rendering uses `customers.find(c => c.slotIndex === index)` — no more shifting when others leave
- **Walking entrance:** Bobbing gait from left entrance door, per-slot CSS custom properties for walk distance
- **Walking exit:** Served customers walk to right exit, wrong answers get sad-slouch exit. Uses `onAnimationEnd` for DOM removal (no setTimeout)
- **CSS cascade fix:** Combined `walkOut` + `correctFlash` animations on `.exiting` class so correct-flash doesn't override the exit walk

### Session 14 — Hall of Fame Save Flow Fix
- Fixed `getGameHighScore()` from `.find()` (returned first match) to a `for` loop finding max `bestScore`
- Added game card auto-refresh on `xhz:dojo-hof-updated` event
- Fixed Hall of Fame save race condition: transition-based observer detecting secondsLeft 1→0 instead of relying on `ended` state

## ✅ Working Correctly
- **Design system migration:** All 8 pages use design system CSS variables
- **paper-grain.png:** Exists at `assets/textures/paper-grain.png` (788 bytes)
- **signup.html:** Deleted
- **Hall of Fame:** Auto-saves scores, leaderboard in result screens, live refresh on dojo.html
- **Duplicate profiles:** Name-only check, auto-merge on `getAllProfiles()`
- **Auth flow:** Upgrade, sign-in, password reset, set-new-password, recovery detection
- **Font weights:** All pages identical (Bai 400-800, Nunito 400-800, Mali 400-700)
- **Sushi mode:** Walking entrance/exit animations, slot-based positioning, bigger hanzi
- **Grid Buster:** 4×4 matching game, multi-round, neo-brutalism board-game aesthetic
- **Sushi mode:** Neo-brutalism redesign matching the board-game aesthetic (same palette, borders, shadows, push-down interactions)
- **Error Boundary:** Catches render errors gracefully with fallback UI (Try Again / Back to Dojo)
- **TDZ fixed:** `startNewRound` no longer crashes on load
- **Dojo page:** Neo-brutalism redesign with centered games grid, accent stripes, achievement card HOF, ZCOOL KuaiLe display font, decorative corner brackets

### 🔧 Recently Modified Files (Uncommitted)
| File | Changes |
|------|---------|
| `dojo.html` | Full neo-brutalism CSS redesign (games grid centered, thick borders, hard shadows, HOF achievement cards, ZCOOL KuaiLe font, data-game attributes, responsive) |
| `.cline/memory/activeContext.md` | Session 21 updates |
| `.cline/memory/progress.md` | Session 21 entry added |

## Known Issues
- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- User could close recovery modal without setting password (leaves recovery-limited session)

## Next Steps
- Enhance progress tracking with detailed analytics
- Apply neo-brutalism to remaining core pages (study, write, progress)
