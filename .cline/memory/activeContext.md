# Active Context

## Current Session (Session 8)
- Implemented full anonymous → email/password account upgrade flow
- Created `shared/auth-modal.js` — inline modal for upgrade and sign-in
- Enhanced `shared/supabase-client.js` with auth state tracking, upgrade/sign-in/sign-out functions, session restoration, and auth listener
- Added auth-related i18n strings (EN + TH) in `strings.js`
- Integrated auth modal into `index.html` (guest banner in activity picker), `progress.html`, `study.html`, and `write.html`
- Updated `profiles.js` to allow `is_guest` field updates
- Updated memory bank with latest changes

## Recent Changes
- `shared/auth-modal.js` (new) — Upgrade & sign-in modal with validation, i18n, design system styling
- `shared/supabase-client.js` — Auth state tracking (`__supabaseAuthUser`, `__supabaseIsAnon`, `__supabaseEmail`, `__supabaseSession`), `__supabaseUpgrade()`, `__supabaseSignIn()`, `__supabaseSignOut()`, `__supabaseOnAuth()`, session restoration via `getSession()`, `onAuthStateChange` listener
- `strings.js` — Auth strings for upgrade, sign-in, validation, and guest banner (EN + TH)
- `index.html` — Guest upgrade banner in activity picker, auth-modal.js script tag
- `progress.html` — Guest banner & settings buttons use `showAuthModal('upgrade')` instead of redirecting to `signup.html`
- `study.html` — Guest banner button uses `showAuthModal('upgrade')`
- `write.html` — Guest banner button uses `showAuthModal('upgrade')`
- `profiles.js` — Added `is_guest` to updatable fields in `updateProfile()`

## Known Issues
- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- React game CSS (`games/`) not yet on design system

## Next Steps
- Phase 3: Migrate React game CSS to design system
- Add data export/backup feature
- Enhance analytics dashboard on progress page
- Possibly remove deprecated `signup.html` if no longer needed
