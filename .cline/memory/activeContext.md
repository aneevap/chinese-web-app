# Active Context

# Active Context

## Current Session (Session 30) — Revert sushi belt to single row after iOS Safari animation failures

### Background: The Great Belt Animation Saga
We attempted to split the sushi conveyor belt into TWO rows on mobile (≤400px) to fit more characters (serpentine: top row scrolls left, bottom scrolls right). This broke the top row animation on iOS Safari. Multiple approaches were tried and failed:

1. **CSS animation on `.belt-track.top-row`** — top row didn't animate on iPhone
2. **Inline `style={{ animation: ... }}` via React** — same result, top row static
3. **`animation: none` on mobile `.belt-track`** to clear base cascade — still broken
4. **`will-change: transform`** hypothesis — not tested, user wanted revert

**Root cause (suspected):** iOS Safari has a bug where CSS `transform`-based animations on `flex-direction: column` children with `width: max-content` fail when the element is the first flex child. The bottom row (second flex child) always animated correctly. This may relate to Safari's compositing layer assignment for the first child in a flex column.

### Resolution: Single row belt for all screen sizes
- Removed `isMobile` state, `useEffect` for mobile detection, and `beltRows` splitting from SushiMode.tsx
- Belt always renders as a single `.belt-track` with the base `beltScroll` animation
- CSS: removed mobile two-row overrides (`height: 130px`, `flex-direction: column`, `.top-row`/`.bottom-row`, `animation: none` on `.belt-track`)
- Kept useful mobile improvements: edge-to-edge margins, smaller plates (54px), hidden door row, hidden belt fades
- `beltScrollRight` keyframe retained for future use if needed

### Tap-to-deliver on iPhone (HTML5 drag fallback)
- **Bug:** HTML5 Drag & Drop API doesn't work on touch devices — iPhone users could select a plate but couldn't deliver it to a customer
- **Fix:** Added `onPointerUp` to occupied customer slots that calls `resolveAttempt(customer.id)` when a word is selected. Flow: tap plate on belt → plate appears in drop zone → tap customer → delivery!
- Desktop drag & drop unaffected (onPointerUp doesn't fire after drag-drop)

### Coordinate-based plate matching for tap targeting
- **Bug:** On the CSS-animated belt, Safari's hit-testing sometimes selects the wrong plate (especially when few characters)
- **Fix:** Replaced `e.currentTarget` event-based word ID lookup with `getBoundingClientRect()` coordinate matching. On tap/pointerdown, the finger's `clientX`/`clientY` is compared to the center of all visible plates. The closest plate is selected.

### Doors hidden on mobile
- Added `display: none` to `.door-row` at the `max-width: 400px` breakpoint
- Customers no longer spawn from doors, so doors just waste space on small screens

### Belt edge-to-edge on mobile
- On mobile, belt uses `margin-left: -6px; margin-right: -6px` to counteract container padding
- Side borders removed (`border-left: none; border-right: none; border-radius: 0`)
- Edge fade gradients hidden (`.belt::after, .belt-fade-left { display: none }`)
- Belt-track padding reduced, gap reduced
- Result: **~6 plates visible** instead of ~5

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
- **Sushi mode:** Neo-brutalism redesign matching the board-game aesthetic
- **Error Boundary:** Catches render errors gracefully with fallback UI
- **Dojo page:** Neo-brutalism redesign with centered games grid, accent stripes, achievement card HOF
- **Print page:** Dual source (Course/Notebook), missing charsPerPage restored, notebook char enrichment
- **Progress page:** Full EN/TH i18n support for all dynamic content, improved font sizes
- **Notebook entries:** meaning_th stored alongside meaning, course data fallback for old entries
- **Supabase sync:** Notebook data sync support added
- **Guest dot:** Now hides immediately after sign-in on index page
- **Recovery page:** Fully functional with i18n support
- **Index page:** Sign-in option available alongside Add New Learner
- **Sushi iPhone:** Tap-to-deliver works, coordinate-based plate matching, doors hidden on mobile, belt edge-to-edge, single-row belt (reliable animation on all browsers)

## Known Issues
- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- User could close recovery modal without setting password (leaves recovery-limited session)
- `window.__SUPABASE_SYNC.pushAll()` called in auth-modal.js on sign-in success but method doesn't exist in supabase-sync.js (silent no-op)

## Next Steps
- Check matching game for same iPhone touch interaction issues
- Enhance progress tracking with detailed analytics
- Fix `pushAll()` missing method or replace with proper sync trigger after sign-in

- **"Sign In" card** added to the profile picker grid on `index.html`, positioned after the "Add New Learner" card
- Uses a 🔐 lock icon with ochre styling, consistent with the existing `add-card` design
- Calls `showAuthModal('signin')` to open the auth sign-in modal for returning users on a new device
- Includes a subtle hint text: "Already have an account? Sign in to access your saved progress."

### Recovery page: Fixed infinite loading
- Root cause: `recovery.html`'s JavaScript was **truncated** at line 221 (mid-function with `['view-loadin`), causing the spinner to spin forever
- Reconstructed the full script (~150 lines) with: `showView()` for view toggling, recovery detection (waits for Supabase, detects `type=recovery` URL hash), password strength meter, visibility toggles, form submission with validation calling `__supabaseUpdatePassword()`, success/error handling, PIN-cleared detection, and fallback for invalid links
- Fixed background image path: `../assets/textures/paper-grain.png` → `assets/textures/paper-grain.png`

### Recovery page: i18n support
- Added 9 new string keys to `strings.js` (EN + TH): `recovery_verifying`, `recovery_no_request`, `recovery_invalid_link`, `recovery_verify_failed`, `password_strength_weak/fair/good/strong/very_strong`
- Replaced all hardcoded text in `recovery.html` with `data-i18n` attributes and `t('key')` calls
- Fixed bug: removed `data-i18n` from `no-recovery-msg` to prevent `refreshStrings()` from overwriting dynamic text

### Progress page: Font size audit
- First pass: Bumped ~25+ selectors by 0.05–0.1em each (labels, badges, calendar, mastery grid, items, notebook)
- Second pass: Added `font-size: 112%` to `.page-content` for a proportional 12% base boost across everything
- Slightly increased mastery word button sizes and added `overflow: hidden` as safety net

### Guest dot: Now hides after sign-in
- **Bug:** After signing in on `index.html`, `repairAllProfilesFromSupabase()` updated profiles in localStorage but `renderProfiles()` was never called again — guest dots remained visible in the DOM
- **Fix:** In `shared/auth-modal.js`, captured the repair promise and chained `.then()` to call `renderProfiles()` on completion
- Only runs on pages where `renderProfiles` exists (guarded by `typeof` check)

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
- **Sushi mode:** Neo-brutalism redesign matching the board-game aesthetic
- **Error Boundary:** Catches render errors gracefully with fallback UI
- **Dojo page:** Neo-brutalism redesign with centered games grid, accent stripes, achievement card HOF
- **Print page:** Dual source (Course/Notebook), missing charsPerPage restored, notebook char enrichment
- **Progress page:** Full EN/TH i18n support for all dynamic content, improved font sizes
- **Notebook entries:** meaning_th stored alongside meaning, course data fallback for old entries
- **Supabase sync:** Notebook data sync support added
- **Guest dot:** Now hides immediately after sign-in on index page
- **Recovery page:** Fully functional with i18n support
- **Index page:** Sign-in option available alongside Add New Learner

## Known Issues
- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- User could close recovery modal without setting password (leaves recovery-limited session)
- `window.__SUPABASE_SYNC.pushAll()` called in auth-modal.js on sign-in success but method doesn't exist in supabase-sync.js (silent no-op)

## Next Steps
- Enhance progress tracking with detailed analytics
- Apply neo-brutalism to remaining core pages (study, write, progress)
- Fix `pushAll()` missing method or replace with proper sync trigger after sign-in
