# 🏮 学汉字 — Study Hanzi

A gamified web app for children (ages 5–12) to learn Chinese characters through flashcards, writing practice, games, and progress tracking. Fully offline-capable with optional cloud sync.

## ✨ Features

- **📚 Study** — Flip flashcards with hanzi, pinyin, meaning, and audio pronunciation
- **✍️ Write** — Watch stroke-order animations, trace characters with HanziWriter.js, voice recognition
- **🎮 Dojo** — Arcade-style games (matching, sushi drop) with hall of fame leaderboards
- **📊 Progress** — Journey stats, mastery matrix, activity calendar, badges & unlockable items
- **☁️ Cloud Sync** — Optional Supabase integration to save progress across devices
- **🌐 Bilingual** — English and Thai interface support via `strings.js`

## 🚀 Getting Started

### Prerequisites

- A local web server (any will do — Python, VS Code Live Server, etc.)
- Node.js 18+ (only for the React game sub-app)
- A modern browser (Chrome, Firefox, Safari, Edge)

### Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/aneevap/chinese-web-app.git
   cd chinese-web-app
   ```

2. **Serve the app**
   ```bash
   # Option A: Python
   python -m http.server 3000

   # Option B: VS Code — install Live Server extension, right-click index.html → Open with Live Server
   ```

3. **Open in browser** — navigate to `http://localhost:3000`

4. **Create a profile** — select an avatar, enter a nickname, and start learning!

### Running Games Sub-app

The React game suite (`games/`) requires a separate build step:

```bash
cd games
npm install
npm run dev     # Development server on port 5173
npm run build   # Production build → dist/
```

The games are served through `dojo.html` which loads the built game bundle.

## 🗄️ Supabase Integration (Optional)

The app can sync data to Supabase for cloud backup. To enable:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the SQL migration** — open Supabase Dashboard → SQL Editor → paste `supabase-schema.sql` → Run
3. **Enable anonymous auth** — Supabase Dashboard → Authentication → Settings → toggle "Allow anonymous sign-ins" ON
4. **Update credentials** in `shared/supabase-client.js` (already configured for the current project)

Once enabled, the app auto-syncs profiles, scores, mastery, and items on every write. Works offline-first with graceful degradation.

## 🎨 Design System

The app uses a "Botes Paper Palette" — a warm, tactile aesthetic inspired by physical activity books.

### Tokens (defined in `shared/design-tokens.js`)

| Token | Value | Usage |
|-------|-------|-------|
| `--paper-cream` | `#F5EDD8` | Page backgrounds |
| `--paper-warm` | `#FAEFD3` | Cards, banners |
| `--paper-cool` | `#EDE5D0` | Subdued containers |
| `--paper-deep` | `#E8DDC0` | Borders, separators |
| `--ink-dark` | `#170E07` | Primary text |
| `--ink-medium` | `#4A3828` | Body text |
| `--ink-soft` | `#6B5544` | Secondary text |
| `--ink-light` | `#A89580` | Muted text, hints |
| `--shadow-card` | `0 8px 24px rgba(74,56,40,.12)...` | Card shadows |
| `--shadow-lifted` | `0 16px 40px rgba(74,56,40,.18)...` | Hovered/active shadows |

### Fonts

- **Bai Jamjuree** — Body text (Thai-friendly)
- **ZCOOL KuaiLe** — Hanzi characters (playful, child-friendly)
- **Nunito** — Pinyin text (clean, rounded)
- **Mali** — Thai translations

## 📁 Project Structure

```
├── index.html           # Profile selection / home
├── new-learner.html     # New profile creation
├── study.html           # Flashcard study
├── write.html           # Character writing practice
├── dojo.html            # Games hub
├── progress.html        # Progress tracking dashboard
├── print.html           # Printable worksheets
├── signup.html          # Account sign-up (dark theme)
├── profiles.js          # Data layer (localStorage + sync hooks)
├── strings.js           # Internationalization (EN/TH)
├── nav.js               # Navigation & shared utilities
├── courses.json         # Course structure & unlock rules
├── rewards.json         # Badges & unlockable items
├── characters_1A.json   # Vocabulary data (course 1A)
├── characters_1B.json   # Vocabulary data (course 1B)
├── supabase-schema.sql  # DB migration for cloud sync
├── shared/
│   ├── design-system.css # CSS custom properties & base styles
│   ├── design-tokens.js  # JS token map (for dynamic use)
│   ├── supabase-client.js # Supabase init & auth
│   └── supabase-sync.js   # Cloud sync service
├── assets/
│   ├── textures/         # Paper grain images
│   └── mascot/           # Panda mascot files
└── games/               # React game sub-app (Vite + TS)
    ├── src/
    │   ├── modes/        # Matching, Sushi game modes
    │   ├── core/         # Game state, scoring, audio
    │   └── data/         # Shared vocab data
    └── package.json
```

## 🧠 Architecture

**Data flow:** All data is stored in `localStorage` via `profiles.js` (`XHZ` namespace). When Supabase sync is enabled, every write triggers a fire-and-forget push to the cloud. On page load, remote data is pulled and merged with local data.

**Mastery system:** Each word progresses through: `unseen → seen → practiced → mastered`. Progress is tracked per profile per word. Course unlocking uses conditional gates (e.g., "see 100% of words in course 1A to unlock 1B").

**Scoring:** Writing quizzes award 1–3 stars based on mistakes (0 mistakes = 3 stars, 1–2 = 2 stars, 3+ = 1 star). Study flashcards award 1 star per card. Daily streaks and total stars are tracked.

## 🧪 Testing

The app is tested manually. To verify:

1. Create a profile and study some flashcards
2. Practice writing characters (check HanziWriter renders)
3. Visit the dojo and play a game
4. Check progress dashboard for updated stats
5. If Supabase is configured, verify data appears in Table Editor

## 📄 License

Made with ☕ by one developer. Licensed under MIT.
