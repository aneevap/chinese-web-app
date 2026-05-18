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
- Created `shared/auth-modal.js` — full inline modal UI for upgrade and sign-in
  - Upgrade form (email, password, confirm, name fields) with validation
  - Sign-in form (email, password) with validation
  - Success view after account creation
  - Design system styling with paper tones and ochre accent
  - i18n support via `strings.js`
  - Auto-sets `is_guest: false` on successful upgrade
- Enhanced `shared/supabase-client.js` with auth APIs:
  - Auth state tracking: `__supabaseAuthUser`, `__supabaseIsAnon`, `__supabaseEmail`, `__supabaseSession`
  - `__supabaseUpgrade(email, password)` — upgrade anonymous session
  - `__supabaseSignIn(email, password)` — sign in with credentials
  - `__supabaseSignOut()` — sign out
  - `__supabaseOnAuth()` — register auth state change listeners
  - Session restoration via `getSession()` on init
  - `onAuthStateChange` listener for real-time auth state updates
- Added auth i18n strings (EN + TH) to `strings.js`
- Integrated auth modal into 4 pages: `index.html`, `progress.html`, `study.html`, `write.html`
  - All guest banners now call `showAuthModal('upgrade')` instead of redirecting to `signup.html`
- Added `is_guest` to `profiles.js` `updateProfile()` allowed fields

### Session 9 — Password Reset Callback Flow & Auth Improvements
- **Password reset flow (3 new forms in auth modal):**
  - "Forgot password?" link on sign-in form → triggers password reset email
  - Password reset form (enter email → "Send Reset Link")
  - "Check your email" confirmation view (privacy-safe: same message regardless of whether email exists)
  - Email sent via `__supabaseResetPassword(email)` — Supabase's built-in `resetPasswordForEmail()`
- **Password reset callback handling:**
  - `__supabaseIsRecovery` — detects `type=recovery` in URL hash **before** Supabase client initializes
  - `__supabaseUpdatePassword(newPassword)` — calls `auth.updateUser({ password })`
  - Auto-detection via `checkRecoveryFlow()` on page load — waits for Supabase ready (5s timeout), then opens modal in set-password mode
  - Set-new-password form (password + confirm fields)
  - Success view ("Password updated! ✅" → "Go to app")
- **Duplicate email handling:**
  - Catches "already registered" / "email already in use" error during upgrade
  - Shows inline link: "This email is already registered. Sign in instead? [Sign In]"
- **Label updates:**
  - `upgrade_title` → "Create Account" (was "Save your progress")
  - `upgrade_sub` → updated explanation text
  - Added proper i18n keys for switch links (`switch_to_signin`, `switch_to_upgrade`)
- **UX fixes:**
  - `progress.html`: "Create Account" button hidden when `__supabaseIsAnon === false` (already signed in)
  - `README.md`: `signup.html` marked as deprecated
- **Commits:** `8345677` (Session 8), `ec1afbc` (label updates), `988d311` (password reset callback)

## Pending
- [ ] Migrate React game CSS (`games/`) to design system (Phase 3)
- [ ] Enhance progress tracking with detailed analytics
- [ ] Add data export/backup feature
- [ ] Remove deprecated `signup.html` if no longer needed
