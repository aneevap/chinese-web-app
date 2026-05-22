# 🏮 学汉字 — Study Hanzi

A gamified web app for children (ages 5–12) to learn Chinese characters through flashcards, writing practice, games, and progress tracking. Fully offline-capable with optional cloud sync.

## ✨ Features

- **📚 Study** — Flip flashcards with hanzi, pinyin, meaning, and audio pronunciation; quiz mode with star ratings
- **✍️ Write** — Watch stroke-order animations, trace characters with HanziWriter.js, voice recognition
- **🎮 Dojo** — Arcade-style games hub with Hall of Fame leaderboard:
  - **🍣 Sushi Drop** — Drag characters from conveyor belt to match customer orders. Features walking entrance/exit animations, slot-based customer positioning, and combo scoring
  - **🔤 Grid Buster** — Match character tiles to meaning tiles on a 4×4 grid. Multi-round gameplay with combo detection, course/theme selection, and neo-brutalism board-game aesthetic
- **📊 Progress** — Journey stats, mastery matrix, activity calendar, badges & unlockable items, parent settings
- **🔐 Auth** — Inline auth modal with upgrade (anonymous → email/password), sign-in, password reset flow, recovery page with password strength meter
- **🔑 Sign-in on all devices** — Profile picker includes a "Sign In" button for returning users on a new device
- **☁️ Cloud Sync** — Optional Supabase integration to save progress across devices
- **🌐 Bilingual** — English and Thai interface support via `strings.js`
- **🧸 Kid-friendly** — Duplicate profile detection with auto-merge; playful Botes paper design
- **📱 Guest dot indicator** — Profiles created without an account show a guest dot; disappears after signing in
- **🍣 Sushi game mobile fixes** — Tap-to-deliver on iPhone (touch fallback for HTML5 drag), doors hidden on small screens, belt extends edge-to-edge for more visible plates

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

The games are served through `dojo.html` which loads the built game bundle (`games/dist/`).

## 🗄️ Supabase Integration (Optional)

The app can sync data to Supabase for cloud backup. To enable:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the SQL migration** — open Supabase Dashboard → SQL Editor → paste `supabase-schema.sql` → Run
3. **Enable anonymous auth** — Supabase Dashboard → Authentication → Settings → toggle "Allow anonymous sign-ins" ON
4. **Update credentials** in `shared/supabase-client.js` (already configured for the current project)

Once enabled, the app auto-syncs profiles, scores, mastery, and items on every write. Works offline-first with graceful degradation.

### Auth Features
- Anonymous sign-in (automatic on first page load)
- Upgrade to email/password (inline modal, no separate signup page)
- Sign-in with existing credentials
- Password reset (email magic link)
- Set-new-password callback (auto-detected from recovery URL hash)
- "Create Account" button shown in settings when not signed in; hidden when signed in

## 🎨 Design System

The app uses a dual aesthetic: a warm **"Botes Paper Palette"** for core pages, and a bold **neo-brutalism board-game style** applied to the dojo page and both game modes.

### Botes Paper Palette (Core Pages & Sushi Mode)
A warm, tactile aesthetic inspired by physical activity books.

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
| `--highlight-red` | `#C84B3A` | Accent, errors |
| `--botes-ochre` | `#D4A574` | Warm accent borders |
| `--botes-sage` | `#94A88E` | Success states |
| `--botes-coral` | `#E8836F` | Button gradients |
| `--shadow-card` | `0 8px 24px rgba(74,56,40,.12)...` | Card shadows |
| `--shadow-lifted` | `0 16px 40px rgba(74,56,40,.18)...` | Hovered/active shadows |

### Neo-Brutalism Board-Game (Dojo & Games)
A bold, tactile board-game aesthetic applied to the dojo page and both game modes:
- **Colors:** Warm cream `#FAF8F5` bg, sunny yellow `#FCD34D` active states, royal blue `#1E40AF` headers, coral `#F43F5E` accents
- **Borders:** Thick 3-4px solid `#111827` on all interactive elements
- **Shadows:** Hard offset shadows (`4px 4px 0px 0px #111827` to `8px 8px 0px 0px #111827`) with push-down `:active` states (shadow shrinks, element shifts down)
- **Dojo features:** Centered game cards with per-game color accent stripes, Hall of Fame achievement cards with podium styling (gold/silver/bronze) and metallic medal badges, decorative corner brackets, staggered entrance animations, ZCOOL KuaiLe display font on headers

### Fonts

- **Bai Jamjuree** — Body text (Thai-friendly), weights 400–800
- **ZCOOL KuaiLe** — Hanzi characters (playful, child-friendly)
- **Nunito** — Pinyin text (clean, rounded), weights 400–900
- **Mali** — Thai translations, weights 400–700

> **Note:** Font weight loading is standardized across all pages now — all load Bai Jamjuree 400-800, Nunito 400-800, Mali 400-700.

## 📁 Project Structure

```
├── index.html              # Profile selection / home
├── new-learner.html        # New profile creation
├── study.html              # Flashcard study
├── write.html              # Character writing practice
├── dojo.html               # Games hub + Hall of Fame
├── progress.html           # Progress tracking dashboard + settings
├── print.html              # Printable worksheets
├── profiles.js             # Data layer (localStorage + sync hooks + auto-merge)
├── strings.js              # Internationalization (EN/TH)
├── nav.js                  # Navigation & shared utilities
├── courses.json            # Course structure & unlock rules
├── rewards.json            # Badges & unlockable items
├── characters_1A.json      # Vocabulary data (course 1A)
├── characters_1B.json      # Vocabulary data (course 1B)
├── supabase-schema.sql     # DB migration for cloud sync
├── shared/
│   ├── design-system.css   # CSS custom properties & base styles
│   ├── design-tokens.js    # JS token map (for dynamic use)
│   ├── auth-modal.js       # Inline auth modal (upgrade, sign-in, reset)
│   ├── supabase-client.js  # Supabase init & auth
│   └── supabase-sync.js    # Cloud sync service
├── assets/
│   └── textures/
│       └── paper-grain.png # Paper texture overlay
└── games/                  # React game sub-app (Vite + TS)
    ├── index.html
    ├── src/
    │   ├── main.tsx
    │   ├── style.css       # Game styles (Botes paper + neo-brutalism)
    │   ├── app/App.tsx
    │   ├── modes/
    │   │   ├── matching/   # Grid Buster matching game
    │   │   └── sushi/      # Sushi drop game mode
│   ├── core/
│   │   ├── ErrorBoundary.tsx  # React error boundary with fallback UI
│   │   ├── state/            # Game state management
│   │   ├── systems/          # Audio, scoring, hall of fame
│   │   └── types.ts
    │   ├── data/           # Shared vocab
    │   └── profile/        # Profile bridge
    ├── vite.config.ts
    └── package.json
```

## 🧠 Architecture

**Data flow:** All data is stored in `localStorage` via `profiles.js` (`XHZ` namespace). When Supabase sync is enabled, every write triggers a fire-and-forget push to the cloud. On page load, remote data is pulled and merged with local data.

**Duplicate profiles:** Auto-detected on `getAllProfiles()` — profiles with the same nickname (case-insensitive) are merged. The profile with the most total stars is kept; scores, mastery, and items from extras are consolidated into the keeper, then extras are deleted.

**Mastery system:** Each word progresses through: `unseen → seen → practiced → mastered`. Progress is tracked per profile per word. Course unlocking uses conditional gates (e.g., "see 100% of words in course 1A to unlock 1B").

**Scoring:** Writing quizzes award 1–3 stars based on mistakes (0 mistakes = 3 stars, 1–2 = 2 stars, 3+ = 1 star). Study flashcards award 1 star per card. Daily streaks and total stars are tracked. Dojo games save session results (score, stage, stars) to the Hall of Fame.

**Hall of Fame:** Game results auto-save to `localStorage` under `xhz_dojo_hall_of_fame` after each game session. The leaderboard ranks entries by score and displays top 5 in the result screen. A live Hall of Fame on `dojo.html` auto-refreshes via custom event `xhz:dojo-hof-updated`. Hall of Fame features:
- Constrained width (640px centered) with trophy card layout
- Podium styling for top 3 (gold/silver/bronze with ribbons and medal badges)
- Game badge pills and stagger entrance animations

## 🎮 Game Modes

### 🍣 Sushi Drop
Drag and drop characters from the conveyor belt to match customer orders.
- Customers walk in from entrance with bobbing gait, exit to the right when served
- Slot-based positioning — customers stay in their assigned spot (no shifting)
- Course/theme selection before starting
- Combo scoring for quick consecutive matches
- Neo-brutalism board-game aesthetic (thick borders, hard shadows, push-down interactions, yellow HUD, cream background)
- Walking exit with correct-flash (green) and wrong-answer (sad slouch) animations
- Uses `onAnimationEnd` for clean DOM removal

### 🔤 Grid Buster
Match character tiles to meaning tiles on a 4×4 grid.
- 60-second timed rounds with multi-round support (new set releases on full match)
- Combo detection (< 3s between matches = bonus points)
- Course and theme selection before starting
- Neo-brutalism board-game aesthetic (thick borders, hard shadows, push-down interactions)
- Score popups, combo announcements, "New Set!" flash animation
- Hall of Fame leaderboard in result screen (separate from sushi rankings)
- Wrong matches trigger shake + coral flash

## 🔐 Auth Flow

The app uses Supabase Auth with anonymous sign-in:

1. **Anonymous session** created on first page load (no email required)
2. **Upgrade** — user fills email + password in inline modal → triggers `supabase.auth.updateUser()`
3. **Sign in** — existing users enter credentials → session restored
4. **Password reset** — email sent via Supabase's `resetPasswordForEmail()`
5. **Recovery callback** — auto-detected from URL hash (`type=recovery`) → set-new-password form

## 🧪 Testing

The app is tested manually. To verify:

1. Create a profile and study some flashcards
2. Practice writing characters (check HanziWriter renders)
3. Visit the dojo and play Sushi Drop — check leaderboard appears in result screen
4. Play Grid Buster — verify matching, combo detection, multi-round, neo-brutalism styling
5. Check progress dashboard for updated stats
6. If Supabase is configured, verify data appears in Table Editor

## 📄 License

Made with ☕ by one developer. Licensed under MIT.
