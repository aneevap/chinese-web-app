# Product Context

## Target Audience
- Children aged 5–12 learning Chinese
- Parents/teachers managing profiles
- Bilingual learners (English/Thai interface via `strings.js`)

## Design Style
- **"Botes Paper Palette"** — warm, tactile, activity-book aesthetic
- Paper tones: `--paper-cream` (#F5EDD8), `--paper-warm` (#FAEFD3), `--paper-cool` (#EDE5D0), `--paper-deep` (#E8DDC0)
- Ink tones: `--ink-dark` (#170E07), `--ink-medium` (#4A3828), `--ink-soft` (#6B5544), `--ink-light` (#A89580)
- Shadows: Soft brown-tinted (`rgba(74,56,40,...)`) for a paper feel
- Fonts: *Bai Jamjuree* (body), *ZCOOL KuaiLe* (hanzi), *Nunito* (pinyin), *Mali* (Thai)
- Textures: `assets/textures/paper-grain.png` blended with backgrounds via `background-blend-mode: multiply`

## Page Inventory
| Page | Purpose | Design System |
|------|---------|---------------|
| `index.html` | Profile selection / home | ✅ Migrated |
| `new-learner.html` | New profile creation | ✅ Migrated |
| `study.html` | Flashcard study + quiz mode | ✅ Migrated |
| `write.html` | Character writing practice (HanziWriter) | ✅ Migrated |
| `arena.html` | Games hub + Hall of Fame | ✅ Migrated |
| `progress.html` | Progress dashboard + settings | ✅ Migrated |
| `print.html` | Printable worksheets | ✅ Migrated |
| `games/` (React sub-app) | Sushi drop + matching games | ✅ Migrated |
| ~~`signup.html`~~ | ~~Legacy sign-up page~~ | ❌ Deleted |

## User Workflows
1. **Index** → **New Learner** — Create/select/manage profiles (guest or named)
2. **Study** — Flip flashcards with pinyin, meaning, audio; quiz mode with star rating
3. **Write** — Watch stroke animations, trace characters with HanziWriter, speech recognition
4. **Arena** — Arcade-style games (matching, sushi drop) with auto-saved Hall of Fame leaderboard
5. **Progress** — Journey stats, mastery matrix, activity calendar, badges & items, parent settings (auth, export, PIN)

## Critical Logic
- **Course unlocking:** Sequential — courses lock until previous words are "seen 100%" or "mastered 80%"
- **Mastery levels:** `unseen → seen → practiced → mastered` (per word_id per profile)
- **Mastery requires both activities:** A word reaches "mastered" only when BOTH conditions are met:
  1. **2 perfect writing scores** (3 stars each, tracked via `write_cleared_count`) — in `write.html`
  2. **Quiz cleared** (passed the flashcard quiz, tracked via `quiz_cleared`) — in `study.html`
  This ensures users must both study (flashcard quiz) and practice (writing) to progress, preventing mastery from writing alone.
- **Anti-farming:** Max 3 write scores per word per day. Once mastered, no more stars awarded for that word.
- **Auto-scroll (write.html):** Toggle button that auto-advances to the next word after completion. Triggers when a word reaches `write_cleared_count >= 2` (2 perfect 3-star writes) OR `status === 'mastered'`. This fixes the issue where "mastered" now requires both study quiz + 2 perfect writes.
- **Scoring:** Stars (1–3) based on mistakes in writing quiz; study flashcards award 1 star per card
- **Duplicate profiles:** Now checked by nickname only (not nickname+avatar as before). Auto-merge on getAllProfiles() consolidates scores/mastery/items into the keeper profile (most total stars)
- **Guest profiles:** Created without account; upgrade prompt via inline auth modal (`showAuthModal('upgrade')`)
- **Sync:** Local-first; every `_save` in `profiles.js` triggers fire-and-forget Supabase push with pending queue for writes during init

## Supabase Architecture
- **Auth:** Anonymous sign-in with upgrade to email/password; password reset via magic link; session restoration on page load
- **Auth APIs:** `__supabaseUpgrade()`, `__supabaseSignIn()`, `__supabaseSignOut()`, `__supabaseOnAuth()`, `__supabaseResetPassword()`, `__supabaseUpdatePassword()`, `__supabaseIsRecovery`
- **Auth Modal:** `shared/auth-modal.js` — inline modal with 6+ form states: upgrade, sign-in, forgot password, reset sent, set new password, password updated
- **Tables:** `profiles`, `scores`, `mastery`, `items` with RLS policies (see `supabase-schema.sql`)
- **Sync:** Push on every write, pull + merge on page load (`shared/supabase-sync.js`)
- **Offline:** Graceful — if Supabase unavailable, app works exactly as before

## Zombie Spell Defense — Standalone Playground Built

A stroke-writing game where players use a magic wand to draw Chinese characters and fight off zombies. HanziWriter.js `quiz()` API validates each stroke in real-time — correct strokes damage the zombie, wrong strokes let it advance. Two difficulty levels (Easy with stroke guide, Normal without). Locked behind full course 1A mastery. Rewards +2 🪙 per completion.

**Status:** ✅ Standalone playground built (`zombie-game-playground.html`). Code-reviewed with 6 bugs fixed. Pending user review before porting into React sub-app and adding unlock gating to arena.

See `activeContext.md → Zombie Spell Defense — Playground Built` for full implementation details.

## Design Evolution — Dashboard Exploring Pastel Toy Aesthetic

As of Session 65, `dashboard.html` is piloting a **pastel toy aesthetic** diverging from the original "Botes paper palette":
- **Cards:** Pure white `#FFFFFF` with `3px solid var(--text-dark)` (#2C1A0B deep brown) border, `24px` radius, `6px 6px 0px` solid offset shadow
- **Buttons:** 3D pill-shaped with pastel fills (mint green `#A3E4D7`, apricot `#FAD7A0`, buttery yellow `#F9E79F`), dark brown text, `5px` unified text-dark shadow, `:active` squish
- **No more paper-grain textures** on dashboard cards (pure white surface)
- **No more `overflow: hidden`** on cards — aura glow can extend naturally

**Status:** ✅ Session 67 polish complete — responsive layout overhauled for iPhone, quest board with 9-slice SVG borders, mastery percentage fixed, daily quest reward system added. Dead CSS cleaned up. Desktop ribbon uses absolute positioning (`top: -60px`) — known fragile magic number.

## Known Inconsistencies (Noted)
- **Font weight loading varies by page:**
  - `index.html`, `new-learner.html`, `study.html`, `print.html`: Bai Jamjuree (400,600,700), Nunito (400,700,800,900), Mali (400,700)
  - `arena.html`, `progress.html`, `write.html`, `games/index.html`: Bai Jamjuree (400,600,700,800), Nunito (400,700,800), Mali (400,600,700)
- **`strings.js` still contains legacy `signup_*` keys** that were for the deleted `signup.html` page
