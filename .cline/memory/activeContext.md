# Active Context

## Current Session (Session 9) — Password Reset Callback Flow & Auth Improvements
- Added password reset callback handling: auto-detection of `type=recovery` in URL hash
- Added set-new-password form in auth modal (password + confirm fields)
- Added `__supabaseUpdatePassword()` and `__supabaseIsRecovery` to supabase-client.js
- Added `__supabaseResetPassword()` to supabase-client.js (from Session 8)
- Updated sign-in form with "Forgot password?" link → triggers password reset flow
- Added password reset form + "Check your email" confirmation view
- Added duplicate email detection on upgrade ("already registered" error → offers sign-in instead)
- Renamed modal labels from "Save your progress" to "Create Account" with updated explanations
- Added proper i18n keys for switch links (switch_to_signin, switch_to_upgrade)
- Fixed "Create Account" button in progress.html settings — hidden when user is already signed in
- Marked `signup.html` as deprecated in README

## Recent Changes
- `shared/supabase-client.js` — Added `__supabaseResetPassword(email)`, `__supabaseUpdatePassword(newPassword)`, `__supabaseIsRecovery` (URL hash detection), `__supabaseResetPassword()`
- `shared/auth-modal.js` — Added password reset form (buildResetPasswordForm, buildResetSentView), set-new-password form (buildSetNewPasswordForm, buildPasswordUpdatedView), handlers (handlePasswordReset, handleSetNewPassword), duplicate email detection with inline sign-in link, "Forgot password?" link in sign-in form, auto-detection of recovery flow on page load (checkRecoveryFlow), proper i18n switch link keys
- `strings.js` — Added auth_email_exists, forgot_password, reset_password_* (EN + TH), switch_to_signin/upgrade (EN + TH), set_new_password_* (EN + TH), updated upgrade_title/sub to "Create Account" wording
- `progress.html` — "Create Account" button in settings hidden when `__supabaseIsAnon === false`, guest banner & settings use `showAuthModal('upgrade')`
- `index.html` — Guest upgrade banner with `showAuthModal('upgrade')`
- `README.md` — Marked `signup.html` as deprecated
- `.cline/memory/activeContext.md` — Updated with session 9 details
- `.cline/memory/progress.md` — Updated with session 9 details

## Known Issues
- User could close recovery modal without setting password (leaves recovery-limited session)
- Dojo cards background still lighter than page (user preference: match paper-warm with grain)
- React game CSS (`games/`) not yet on design system

## Next Steps
- Phase 3: Migrate React game CSS to design system
- Add data export/backup feature
- Enhance analytics dashboard on progress page
- Possibly remove deprecated `signup.html` if no longer needed
