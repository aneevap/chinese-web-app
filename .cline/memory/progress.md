# Progress Log

## Session 1 — Bug Fixes (study.html + write.html)
- **study.html**: Fixed image illustration GC bug — `setImageWithFallback()` now re-creates `Image()` objects after GC clears them; `renderCompleteScreen()` also re-renders images
- **study.html**: Fixed star rating formula — `scoreToStarRating` changed from `wordCount*4+5` to `wordCount*3+5`
- **write.html**: Fixed position on revisit — added `savePosition()` in `loadChar`, guards in `selectTheme`/`selectCourse`, helpers `posKey()`/`savePosition()`/`restorePosition()`
- Pushed to GitHub: commit `96f1c84`

## Session 2 — Data Consolidation
- Deleted duplicate JSON files in `games/public/`
- Updated `vite.config.ts` and `vocab.ts` fetch paths to point to root `characters_1A.json` / `characters_1B.json`

## Session 3 — Phase 1 UI Standardization
- Migrated `index.html` to use `shared/design-system.css`
- Migrated `new-learner.html` to use `shared/design-system.css`
- Removed hard-coded styles, replaced colors/shadows/radius with CSS variables

## Session 4 — Phase 2 UI Standardization
- Migrated `dojo.html` to use `shared/design-system.css`
- Migrated `progress.html` to use `shared/design-system.css`
- **User feedback (unresolved)**:
  - dojo.html: "coloring of the one inside the frame (boxes) and the background seems to be in a reversal" — cards are lighter than page bg, need revision
  - progress.html: "I prefer having a plain off-white color for the boxes" — implemented as `#FAFAF5` solid

## Session 5 — Memory Bank Setup
- Created `.cline/memory/` folder
- Created `projectbrief.md`, `productContext.md`, `activeContext.md`, `progress.md`

## Known Issues
- dojo.html card/hall backgrounds need revision (too light vs page bg)
- progress.html card color may need further tweaking
- Phase 3 pending: write.html + React game CSS migration
- Supabase integration pending (user-added task)
