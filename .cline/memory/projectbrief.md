# 学汉字 (Study Hanzi) — Project Brief

## Overview
A Chinese character learning web app for kids (ages 5-12). Features flashcards, writing practice (HanziWriter.js), games, progress tracking, and a paper-texture Botes design system. Built as a single-page HTML app with localStorage persistence. No backend server — data stored locally.

## Tech Stack
- **Frontend**: Vanilla HTML/CSS/JS (no framework)
- **Game**: React app in `games/` subdirectory, built with Vite + TypeScript
- **Character Writing**: HanziWriter.js library
- **Design**: Custom CSS design system (`shared/design-system.css`) — "Botes paper palette"
- **Data**: JSON files (`courses.json`, `characters_1A.json`, `characters_1B.json`, `rewards.json`)
- **Storage**: localStorage via `profiles.js` (XHZ namespace)
- **Internationalization**: `strings.js` with `data-i18n` attributes + `refreshStrings()`
- **Git**: Hosted at https://github.com/aneevap/chinese-web-app.git

## Pages
| Page | Purpose | Status |
|------|---------|--------|
| `index.html` | Profile picker / home | ✅ Migrated to design system |
| `new-learner.html` | Create learner profile | ✅ Migrated to design system |
| `dojo.html` | Game launcher (4 games) | Need revision |
| `progress.html` | Stats, calendar, word mastery | ✅ Migrated to design system |
| `study.html` | Flashcards + quiz | ✅ Already used design system |
| `print.html` | Printable character sheets | ✅ Already used design system |
| `write.html` | HanziWriter stroke practice | ⬜ Phase 3 target |
| `signup.html` | Sign-up page (dark theme) | ⬜ May be intentionally different |
| React game (`games/`) | Sushi Conveyor game | ⬜ Phase 3 target |

## Key Data Files
- `profiles.js` — All profile/storage logic under `XHZ` global namespace
- `nav.js` — Navigation bar component
- `strings.js` — i18n strings
- `shared/design-system.css` — Botes paper palette design tokens
- `shared/design-tokens.js` — JS counterpart of design tokens
- `courses.json` — Course definitions with `data_file` references
- `rewards.json` — Badge/title/item definitions

## Design System (Botes Paper Palette)
- Paper tones: `--paper-cream`, `--paper-warm`, `--paper-cool`, `--paper-deep`
- Accent colors: mustard, sky, coral, sage, terracotta, ochre, rose, olive
- Ink colors: `--ink-dark`, `--ink-medium`, `--ink-soft`, `--ink-light`
- Shadows: `--shadow-soft`, `--shadow-card`, `--shadow-lifted`
- Typography: Bai Jamjuree (main), ZCOOL KuaiLe (hanzi), Nunito (pinyin), Mali (Thai)
- Paper-grain texture: `url('../assets/textures/paper-grain.png')` with `background-blend-mode: multiply`
