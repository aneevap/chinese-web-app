# 🏮 学汉字 — Study Hanzi

A gamified web app for children (ages 5–12) to learn Chinese characters through flashcards, writing practice, games, and progress tracking. Fully offline-capable with optional cloud sync.

## ✨ Features

- **📚 Study** — Flip flashcards with hanzi, pinyin, meaning, and audio pronunciation; quiz mode with star ratings
- **✍️ Write** — Watch stroke-order animations, trace characters with HanziWriter.js, voice recognition
- **🎮 Arena** — Arcade-style games hub with Hall of Fame leaderboard, panda mascot avatar display, and daily mission tracker:
  - **🍣 Sushi Drop** — Tap a sushi plate from the conveyor belt to select it, then tap or drag it to a matching customer. Features:
    - Customers 50% larger with wooden stools, speech balloons, and SVG character avatars
    - Selected plate appears in a translucent square drop zone centered above customers
    - Walking entrance/exit animations with per-slot bobbing gait
    - Custom pointer-based drag-and-drop (no HTML5 drag API — works on iPhone)
    - Tap-to-select and tap-to-deliver as an alternative to drag-and-drop
    - Course/theme selection, combo scoring, coin/confetti effects
    - Green juice-bar spawn timer with shiny highlight streak
    - Neo-brutalism board-game aesthetic throughout
  - **🔤 Grid Buster** — Match character tiles to meaning tiles on a 4×4 grid. Multi-round gameplay with combo detection, course/theme selection, and neo-brutalism board-game aesthetic
- **🧪 Laboratory** (Planned) — Chemistry-lab-themed minigame where users collect Chinese radicals (部首) and mix them to discover full characters. Features:
  - **Level system (80 levels):** XP = total stars earned. Each level unlocks a new radical. Paced for ~150 hours total playtime.
  - **Mixing station:** Select 2 radicals → check if they form a real character → discover it!
  - **Decomposition chamber:** Break down course characters to extract rare radicals (1-2 decompositions per day)
  - **Branching rewards:** From Level 6+, choose which radical to unlock from 3 themed options
  - **222 radicals total:** 80 from leveling, 142 discovered through lab experimentation only
- **📊 Progress** — Journey stats, mastery matrix, activity calendar, badges & unlockable items, parent settings
- **🔐 Auth** — Inline auth modal with upgrade (anonymous → email/password), sign-in, password reset flow, recovery page with password strength meter
- **🔑 Sign-in on all devices** — Profile picker includes a "Sign In" button for returning users on a new device
- **☁️ Cloud Sync** — Optional Supabase integration to save progress across devices
- **🌐 Bilingual** — English and Thai interface support via `strings.js`
- **🧸 Kid-friendly** — Duplicate profile detection with auto-merge; playful Botes paper design
- **📱 Guest dot indicator** — Profiles created without an account show a guest dot; disappears after signing in
- **🍣 Sushi game mobile fixes** — Tap-to-deliver on iPhone (onPointerUp on customer slots), coordinate-based plate matching (getBoundingClientRect bypasses Safari's unreliable hit-testing on animated elements), doors hidden on small screens, belt extends edge-to-edge for more visible plates, single-row belt (two-row serpentine layout had iOS Safari animation bugs on the top row), custom pointer-based drag

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

The games are served through `arena.html` which loads the built game bundle (`games/dist/`).

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
| `--shadow-lifted` | `0 16px 40px rgba(74,56,40,.18)...` | Hovered/active shadows |### Neo-Brutalism Board-Game (Arena & Games)

A bold, tactile board-game aesthetic applied to the arena page and both game modes:
- **Colors:** Warm cream `#FAF8F5` bg, sunny yellow `#FCD34D` active states, royal blue `#1E40AF` headers, coral `#F43F5E` accents
- **Borders:** Thick 3-4px solid `#111827` on all interactive elements
- **Shadows:** Hard offset shadows (`4px 4px 0px 0px #111827` to `8px 8px 0px 0px #111827`) with push-down `:active` states (shadow shrinks, element shifts down)
- **Arena features:** Centered game cards with per-game color accent stripes, Hall of Fame achievement cards with podium styling (gold/silver/bronze) and metallic medal badges, decorative corner brackets, staggered entrance animations, ZCOOL KuaiLe display font on headers

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
├── arena.html              # Games hub + Hall of Fame
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

## 🐛 Known Issues

- **Git push silently fails ~50% of the time** from the assistant (basher agent). The command outputs "Everything up-to-date" even when there are unpushed commits. Fix: always run `git push origin main` explicitly and verify by comparing `git rev-parse HEAD` vs `git rev-parse origin/main`.
- **Stage 2 and 3 share the same 3×4 grid config** — consider adding a new config for stage 3 to increase progressive difficulty.
- **Stage 1 (3×3) has 1 empty cell** — 9 cells with only 8 tiles (4 pairs), leaving the bottom-right cell unfilled. This is the intended layout.
- **Arena cards background** still lighter than page (user preference: match paper-warm with grain).
- **Recovery modal** can be closed without setting a password, leaving a recovery-limited session.
- **Flash Match touch interaction** on iPhone not yet fully verified.

## 🔧 Troubleshooting Guide

### Changes not appearing on live site

This project has a **dual delivery setup**: source files are edited with Vite, but the live site loads a pre-built production bundle. If your changes don't show up:

1. **Rebuild the bundle:**
   ```bash
   cd games
   npm run build
   ```
   This writes the compiled output to `games/dist/assets/game.js`.

2. **Bump the cache buster** in `arena.html` — increment the `?v=` query parameter on the script tag:
   ```html
   <script src="games/dist/assets/game.js?v=43"></script>
   ```

3. **Hard refresh** the browser — Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac) to bypass the browser cache.

4. **Wait for GitHub Pages deploy** (if pushed to remote) — the GitHub Actions workflow takes ~2 minutes to complete. Then do another hard refresh to clear the CDN cache.

### Image paths resolve from arena.html, not component files

React components in `games/src/modes/matching/MatchingMode.tsx` reference images like:
```tsx
src="assets/mascot/pandarocket.png"
```

Despite the component file being nested 5 directories deep (`games/src/modes/matching/`), **the path is relative to `arena.html` at the project root**. Using `../assets/mascot/` goes one level above the repo root → image not found.

**Always use paths relative to the project root** (without `../`) for images in React game components:
- ✅ `src="assets/mascot/pandarocket.png"`
- ❌ `src="../assets/mascot/pandarocket.png"`

### iOS Safari grid centering

`align-self: center` on a flex child works in most browsers but can fail on iOS Safari, especially when the child is `display: grid`.

**Fix:** Use `align-items: center` on the parent flex container, then undo with `align-self: stretch` on children that need full width (like the HUD and game header).

### iPhone tap/drag interaction

For games that need reliable tap and drag on iPhone:
- Use custom pointer-based DnD (no HTML5 drag API — doesn't work on Safari)
- Use `onPointerUp` instead of `onClick` on animated elements (Safari has unreliable hit-testing on animated items)
- Use `getBoundingClientRect()` + `document.elementFromPoint()` for coordinate-based matching instead of relying on event targets
- Avoid `setPointerCapture()` — it breaks DnD on iOS

## 🧠 Architecture

**Data flow:** All data is stored in `localStorage` via `profiles.js` (`XHZ` namespace). When Supabase sync is enabled, every write triggers a fire-and-forget push to the cloud. On page load, remote data is pulled and merged with local data.

**Duplicate profiles:** Auto-detected on `getAllProfiles()` — profiles with the same nickname (case-insensitive) are merged. The profile with the most total stars is kept; scores, mastery, and items from extras are consolidated into the keeper, then extras are deleted.

**Mastery system:** Each word progresses through: `unseen → seen → practiced → mastered`. Progress is tracked per profile per word. **Mastery requires both activities:** users must both study (complete the flashcard quiz) AND practice (score 3 stars twice in writing) to reach "mastered". Course unlocking uses conditional gates (e.g., "see 100% of words in course 1A to unlock 1B").

**Scoring:** Writing quizzes award 1–3 stars based on mistakes (0 mistakes = 3 stars, 1–2 = 2 stars, 3+ = 1 star). Study flashcards award 1 star per card. Daily streaks and total stars are tracked. Arena games save session results (score, stage, stars) to the Hall of Fame.

**Hall of Fame:** Game results auto-save to `localStorage` under `xhz_dojo_hall_of_fame` after each game session. The leaderboard ranks entries by score and displays top 5 in the result screen. A live Hall of Fame on `arena.html` auto-refreshes via custom event `xhz:arena-hof-updated`. Hall of Fame features:
- Constrained width (640px centered) with trophy card layout
- Podium styling for top 3 (gold/silver/bronze with ribbons and medal badges)
- Game badge pills and stagger entrance animations

## 🎮 Game Modes

### 🍣 Sushi Drop
Tap a sushi plate from the conveyor belt to select it, then tap or drag it to a customer. Customers are seated on wooden stools with speech balloons showing their order in Thai.

- **Drop zone:** Selected plate appears in a plain translucent square (130×130px) centered above the customers, with a cancel button overlaid at the top-right corner
- **Customers scaled 50% larger** — 84-108px avatars, 66px stools, 195px slots
- **Interaction:** Tap-to-select a plate, then tap a customer or drag-and-drop to deliver. Custom pointer-based DnD works reliably on iPhone (no HTML5 drag API)
- **Walking animations:** Customers walk in from entrance with bobbing gait, exit to the right when served. Wrong answers trigger a sad-slouch exit
- **Slot-based positioning:** Customers stay in their assigned spot (no shifting), with per-slot CSS custom properties for walk distances
- **Course/theme selection** before starting with mastery-aware word weighting
- **Combo scoring** for quick consecutive matches, with confetti, coins, and score popup effects
- **Green juice-bar spawn timer** with smooth drain and shiny highlight streak
- **Neo-brutalism board-game aesthetic** (thick borders, hard shadows, push-down interactions, warm wood-toned belt, cream background with plank floor pattern)

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
3. Visit the arena and play Sushi Drop — try both tap-to-deliver and drag-and-drop; check leaderboard appears in result screen
4. Play Grid Buster — verify matching, combo detection, multi-round, neo-brutalism styling
5. Check progress dashboard for updated stats
6. If Supabase is configured, verify data appears in Table Editor

## 📄 License

Made with ☕ by one developer. Licensed under MIT.
