# Active Context

## Current Session (Session 7)
- Migrated `write.html` to design system (paper-grain bg, CSS variables, fonts, shadows)
- Fixed `currentTheme=0` bug causing word list not to appear on initial page load
- Updated memory bank with all progress

## Recent Changes
- `write.html` — UI standardization + `currentTheme=-1` fix
- `supabase-schema.sql` — created 4 tables with RLS
- `shared/supabase-client.js` — Supabase init with anonymous auth
- `shared/supabase-sync.js` — sync service with pending write queue
- `profiles.js` — `_triggerSync` hooks for auto-sync
- All 7 HTML pages — added supabase script tags

## Known Issues
- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- React game CSS (`games/`) not yet on design system
- Anonymous auth upgrade flow not implemented

## Next Steps
- Phase 3: Migrate React game CSS to design system
- Add account upgrade (anonymous → email/password)
- Add data export/backup
- Enhance analytics dashboard on progress page
