# Active Context

## What We Just Did (Last Session)
- Completed **Phase 2** UI migration: `dojo.html` and `progress.html` migrated to use `shared/design-system.css`
- User cancelled (`"cancel"`) after feedback about dojo.html color reversal and progress.html card preference
- User then asked to create Memory Bank in `.cline/memory/`

## Current State of Files

### `dojo.html` — Need Revision
- Currently uses `background: #FAFAF5` (off-white solid) for `.game-card`, `#dojo-game-root`, and `.hall`
- User reported: "The coloring of the one inside the frame (boxes) and the background seems to be in a reversal"
- **Issue**: Cards are lighter than the body background (`var(--paper-cream)` = #F5EDD8), making them look like negative space. Should be darker/warmer than the page bg.
- **Likely fix**: Change to `var(--paper-warm)` with paper-grain texture (which is darker than cream) — same as what design-system.css uses for `.card`

### `progress.html` — Migrated with user preference
- Uses `background: #FAFAF5` solid for `.card` and `.profile-header` (plain off-white)
- User said: "I prefer having a plain off-white color for the boxes of Journey, Stats, Badges, Activity calendar"
- This was implemented. User hasn't seen it yet (said "cancel" before seeing the result)

### `study.html` — Previously fixed bugs
- **Bug 1 (Image GC)**: Fixed `setImageWithFallback` + `renderCompleteScreen` — images were not displayed after GC cleared them
- **Bug 2 (Star rating)**: Fixed `scoreToStarRating` formula from `wordCount*4+5` to `wordCount*3+5`
- Both pushed in commit `96f1c84`

### `write.html` — Previously fixed bugs
- Fixed position on revisit: Added `savePosition()` in `loadChar`, guards in `selectTheme`/`selectCourse`, helpers `posKey()`/`savePosition()`/`restorePosition()`

## Remaining Work (Phase 3)
- `write.html` — Migrate to design system (HIGH risk — uses HanziWriter, canvas sizing must not break)
- React game (`games/`) — Migrate CSS to design system (separate Vite pipeline)
- Connect to Supabase to store user profiles

## Git Info
- Latest commit: `6c0005b4c9dc5560b667f7d2c5a046c0625dbaa8`
- Remote: https://github.com/aneevap/chinese-web-app.git

## Key Architecture Notes
- All JS logic untouched by CSS migrations — only `<style>` blocks and `<link>` tags changed
- Design system loaded first via `<link>` in `<head>`, page-specific overrides in inline `<style>` after it
- `profiles.js` (XHZ namespace) handles all localStorage CRUD for profiles, scores, mastery, items
- Strings use `data-i18n` attributes + `strings.js` `refreshStrings()` + `t()` function
- Nav bar initialized with `initNav(pageName)` on each page
