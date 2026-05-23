# Active Context

## Current Session (Session 30) — Mode tab hiding abandoned (all approaches failed on iPhone)

### Attempted: Hiding mode tabs during gameplay

**Goal:** The Sushi/Matching tab buttons in the game app should be hidden during gameplay (when the countdown finishes) so they don't clutter the screen.

**All approaches failed on the user's iPhone. No root cause identified.**

#### Approach 1: Custom events
- SushiMode/MatchingMode dispatch `xhz:game-playing` / `xhz:game-idle` events
- App.tsx listens and sets `modeTabsHidden` state → `display: none`
- **Result:** Tabs still visible during gameplay

#### Approach 2: CSS class toggle on `<body>`
- SushiMode/MatchingMode toggle `document.body.classList.toggle('game-active', ...)` via useEffect
- CSS: `body.game-active .mode-tabs { display: none !important; }`
- **Result:** Tabs still visible during gameplay

#### Approach 3: Direct DOM querySelector + style.display
- Removed all React-based approaches
- `document.querySelector('.mode-tabs').style.display = 'none'` called synchronously inside the countdown setInterval callback
- **Result:** Tabs still visible during gameplay

#### Approach 4: Pure React callback prop
- App.tsx: `const [gameActive, setGameActive] = useState(false)`
- Pass `onGameActiveChange={setGameActive}` as prop to both game modes
- Game modes call `onGameActiveChange(true)` via useEffect when actively playing
- `.mode-tabs` rendered conditionally: `{!gameActive && (<div className="mode-tabs">...)}`
- **Result:** User reports "there is no change at all" — tabs still visible

#### Suspected causes (not confirmed):
- Browser caching — the `?v=24` cache buster on `game.js` might not have been updated after the changes
- The deploy workflow might not have picked up the latest commits
- Some iOS Safari quirk preventing the React state from propagating correctly

#### Given up for now. User moved on.

---

## Previous Session (Session 29) — Sushi game iPhone fixes: tap-to-deliver, two-row belt, etc.

### Background: The Great Belt Animation Saga
We attempted to split the sushi conveyor belt into TWO rows on mobile (≤480px) to fit more characters (serpentine: top row scrolls left, bottom scrolls right). This initially broke the top row animation on iOS Safari. Multiple approaches were tried and eventually fixed:

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
- **Mode tabs (Sushi/Matching) not hidden during gameplay on iPhone** — all 4 approaches failed (custom events, body class toggle, DOM querySelector, React callback prop). Likely browser caching or iOS Safari quirk. Abandoned for now.

## Next Steps
- Check matching game for same iPhone touch interaction issues
- Enhance progress tracking with detailed analytics
- Fix `pushAll()` missing method or replace with proper sync trigger after sign-in
