# Product Context

## Target Audience
- Children aged 5–12 learning Chinese
- Parents/teachers managing profiles
- Bilingual learners (English/Thai interface via `strings.js`)

## Design Style
- **"Botes Paper Palette"** — warm, tactile, activity-book aesthetic
- Paper tones: `--paper-cream` (#F5EDD8), `--paper-warm` (#FAEFD3), `--paper-cool` (#EDE5D0)
- Ink tones: `--ink-dark` (#170E07), `--ink-medium` (#4A3828), `--ink-soft` (#6B5544), `--ink-light` (#A89580)
- Shadows: Soft brown-tinted (`rgba(74,56,40,...)`) for a paper feel
- Fonts: *Bai Jamjuree* (body), *ZCOOL KuaiLe* (hanzi), *Nunito* (pinyin), *Mali* (Thai)
- Textures: `paper-grain.png` blended with backgrounds

## User Workflows
1. **Index** — Create/select/manage profiles (guest or named)
2. **Study** — Flip flashcards with pinyin, meaning, audio; quiz mode
3. **Write** — Watch stroke animations, trace characters with HanziWriter, speech recognition
4. **Dojo** — Arcade-style games (matching, sushi drop) with hall of fame
5. **Progress** — Journey stats, mastery matrix, activity calendar, badges & items, parent settings

## Critical Logic
- **Course unlocking:** Sequential — courses lock until previous words are "seen 100%" or "mastered 80%"
- **Mastery levels:** unseen → seen → practiced → mastered (per word_id per profile)
- **Scoring:** Stars (1–3) based on mistakes in writing quiz; streak tracking
- **Guest profiles:** Created without account; upgrade prompt to signup
- **Sync:** Local-first; every `_save` in `profiles.js` triggers fire-and-forget Supabase push with pending queue for writes during init

## Supabase Architecture
- **Auth:** Anonymous sign-in (upgradeable to real auth later)
- **Tables:** `profiles`, `scores`, `mastery`, `items` with RLS policies
- **Sync:** Push on every write, pull + merge on page load
- **Offline:** Graceful — if Supabase unavailable, app works exactly as before
