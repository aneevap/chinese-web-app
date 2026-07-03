# 🧪 Laboratory Page — Design Notes & Future Direction

## Overview

A chemistry-lab-themed minigame where users collect Chinese radicals (部首) and combine them to discover full characters — like **Doodle God meets a witch's cauldron**.

### Core Principle
Players collect radicals (ingredients), mix them in a cauldron, and discover Chinese characters. 218 radicals total — 70 earned through leveling up, 148 discovered through lab experimentation.

---

## Current State

### ✅ What's Built — All Functional

| Feature | Details |
|---------|---------|
| **Mixing Station** | Select 2 radicals → click Brew → check `reactions.json` (2,502 reactions) |
| **Same-Radical Mixing** | 火+火→炎, 口+口→吕 (36 reactions) |
| **Triple Blend** | 3rd slot appears dynamically for 3-radical chars (179 reactions) |
| **Chain Reactions** | After brew success, "Continue" buttons for extending (182 chains) |
| **Decomposition** | Break down course characters to extract rare radicals (2/day energy) |
| **Grimoire** | Full collection browser: 6 Doodle God categories, owned/locked filters |
| **Creations** | Journal of all discovered characters with recipe + source badge |
| **XP/Level System** | 80 levels, XP = total stars earned, auto-claim levels 1-5, branching from 6+ |
| **Sound Effects** | Web Audio API: click, success, fail, chain, decomp, levelup, sparkle, retreat |
| **Sparkle Trails** | Animated particles from chip → drop zone (forward and reverse) |
| **Cauldron Animation** | Flask shake on mix, smoke puffs, liquid color fill, result reveal |
| **Panda Speech Bubble** | Context-aware messages based on current mix state |
| **Orb Filters** | 6 category crystal balls with owned count badges |
| **Potion Bottle Chips** | Glass bottle radical cards with category-colored stoppers + liquid level |
| **Amber Glow** | Pulsing glow behind cauldron + floating ember particle |
| **Responsive** | 4 breakpoints: 960px, 720px, 520px, 360px |

### Current Layout (Desktop)

```
┌──────────────────────────────────────────────────────┐
│  🐼  Lv.5    ════ XP BAR ════      ⭐ 142   ⚡ 2/2  │ ← Top bar (frameless pills)
├──────────────────────────────────────────────────────┤
│  [🧪 Brew] [🔬 Extract] [📖 Grimoire] [⚗️ Creations] │ ← Tabs (pill style)
├──────────────────────────────────────────────────────┤
│                                                      │
│            🧪 CAULDRON (centered, compact)           │ ← ~280px natural height
│         [日] [月] → [明]  🐼 "Brew it!"              │
│              [⚗️ Brew!] [🔄 Clear]                    │
│              🔗 Chain: +水→ 泪 (if available)         │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [🔵All] [🌿Nature] [🫀Body] [🏛️Civ] [🐾Fauna] ...   │ ← Orb filters
├──────────────────────────────────────────────────────┤
│  🌿 Nature (12/26)                                   │ ← Dark wood pantry
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ │      (CSS grid, auto-fill)
│  │ 人 │ │ 大 │ │ 日 │ │ 月 │ │ 金 │ │ 火 │ │ 山 │ │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ │
│  🫀 Body (8/27)                                      │
│  ┌────┐ ┌────┐ ┌────┐                               │
│  │ 口 │ │ 目 │ │ 手 │ ...                            │
│  └────┘ └────┘ └────┘                               │
└──────────────────────────────────────────────────────┘
```

### Key Layout Details
- **Page width**: 1200px max-width (was 960px — widened for more pantry columns)
- **Layout**: Vertical stack (cauldron top, pantry bottom) — NOT side-by-side
- **Cauldron**: No forced max-height on desktop — sits at natural content height (~280px)
- **Pantry**: CSS Grid with `repeat(auto-fill, minmax(65px, 1fr))` — ~15 columns on desktop
- **Dark wood cabinet**: retained with wood grain overlay + magic sparkle corner

---

## 🛠️ Changes Made This Session (Layout Restructure)

### HTML Changes (`laboratory-playground.html`)
- Removed `.brew-layout` wrapper div
- Cauldron and pantry are now direct children of `#panel-brew` (flex column)

### CSS Changes (`shared/lab-styles.css`)

| Change | Before | After | Reason |
|--------|--------|-------|--------|
| Page width | 960px max | 1200px max | More breathing room for pantry columns |
| Layout | Left sidebar cauldron (280px) + right pantry (flex 1) | Vertical: cauldron top, pantry bottom | Cauldron is the hero, not a sidebar |
| Cauldron height | Fixed 280px width, constrained in 2-column | Natural height (~280px), centered | Compact when empty, grows with content |
| Pantry grid | `flex-wrap` with tiny inline chips | CSS Grid `repeat(auto-fill, minmax(65px, 1fr))` | Wider cards, more organized |
| Chip size | 44px wide, 1.2rem char | 56px wide, 1.35rem char | Bigger targets for tapping |
| Orb size | 36px | 42px | More visible |
| Atmosphere | — | Added amber `::before` glow + ember `::after` particle | Subtle magical feel |
| Breakpoints | 720px/520px/360px | Added 960px breakpoint, updated all | Smoother responsive scaling |

### No JS Changes
All 50+ element IDs, CSS classes, and JS references remain untouched. `lab-ui.js` and `lab-engine.js` were not modified.

---

## 🎨 Design Philosophy

### Current Identity: "Magical Potion Lab" 🧪✨
- Dark mysterious alchemy theme (not the dashboard's bright pastel toy aesthetic)
- Dark wood wizard cabinet with potion bottle ingredients
- Amber glow, floating embers, bubbling cauldron
- Panda lab assistant with speech bubble tips
- Glass bottle ingredient chips with colored liquid

### What Makes It Feel "Rigid" (Identified Issues)
1. **Vertical stack layout** — cauldron + pantry in a single column on a 1200px page feels unbalanced
2. **Pantry is dense** — even with 15 columns, it's still a long scrollable grid of small cards
3. **No visual hierarchy** — the cauldron is small (200px flask) and doesn't dominate visually
4. **The dark wood cabinet** — thematic but heavy; contrast with bright white cards above
5. **No background atmosphere** — the page is just flat cream with no immersive environment
6. **Panda is just an emoji + text bubble** — no character art, no personality
7. **Tabs are functional pills** — no animation or "room transition" feeling

---

## 🔮 Future Improvement Ideas

### HIGH PRIORITY

#### 1. Layout: Better Desktop Use of Space
The vertical stack on a 1200px page creates a narrow column feeling. Options:
- **Wider cauldron**: Make the flask larger (400px+), let cauldron take more horizontal space
- **Pantry as slide-out drawer**: Hide pantry behind a button, slide up from bottom when needed
- **Background pantry**: Radicals visible as floating bottles in the background, clickable
- **Full-width cauldron strip**: Cauldron takes full width at top (~40% height), pantry below fills the rest

#### 2. Cauldron as Visual Hero
The flask SVG is 200×240px — it's small on a 1200px page. Make it bigger:
- **BIG cauldron**: 400px+ flask that dominates the center
- **Animated idle state**: Gentle steam, floating particles, bubbling even when empty
- **Drop zones integrated into flask**: Currently separate divs overlaid — make the flask itself the ingredient area
- **Result shown in cauldron**: Character emerges from liquid with bubbling animation

#### 3. Panda Lab Assistant (Character Upgrade)
Currently just an emoji + text bubble. Could be:
- **Proper panda SVG or PNG art** — sitting next to the cauldron in a lab coat
- **Animated reactions** — claps on success, looks curious on idle, gets excited for chains
- **Tip system** — rotating tips about mixing combinations
- **Clickable** — click panda for a hint about what to mix next

### MEDIUM PRIORITY

#### 4. Immersive Background
- **Alchemy line art** behind the cauldron (faint beakers, scrolls, herbs)
- **Floating particles** — gentle sparkles drifting up
- **Category-colored ambient light** — when brewing, the background subtly shifts toward the ingredient category color
- **Wood table texture** — the cauldron sits on a visible wooden table edge

#### 5. Pantry Redesign Options
Current dark wood cabinet is heavy. Ideas:
- **Glass specimen jars**: Radicals displayed in labeled jars on scientific shelves
- **Herb bundles**: Hanging dried herbs for each category
- **Crystal display**: Radicals as floating crystals on pedestals
- **Book of ingredients**: Grimoire-style flipbook instead of grid

#### 6. Better Empty States
Current: text-heavy with muted emoji. Could be:
- **Panda holding an empty basket**: "Your pantry is empty! Study to earn ingredients!"
- **Dark, empty cauldron with smoke**: Atmospheric emptiness
- **Whispering hint**: Faint text suggesting the first combination to try

#### 7. Tab Transition Animations
When switching between Brew / Extract / Grimoire / Creations:
- **Slide/fade transition** between panels (currently instant snap)
- **Tab icon changes** when active (e.g., 🧪 → ⚗️ bubbling)
- **Brew tab is the "home"** — other tabs feel like you're going to a different workbench

### LOW PRIORITY

#### 8. Discovery Celebration
When a new character is found:
- **Full-screen sparkle burst** (not just toast)
- **Panda jumps up** with confetti
- **Character appears with glow** and slowly fades into the recipe
- **Sound: magical chime** + ascending notes

#### 9. Stats Panel Visual Pass
Grimoire stats are plain text numbers:
- **Mini donut charts** for success rate
- **Radical usage heat map** — which radicals you use most
- **Brew streak** — consecutive successful brews
- **Character discovery timeline** — when you discovered each character

#### 10. Weekend / Seasonal Themes
- **Halloween**: Pumpkin cauldron, spooky potions
- **Winter**: Ice crystals, snowflake particles
- **Spring**: Cherry blossom petals, pastel liquids

---

## 🏗️ Technical Architecture

### Files

| File | Role |
|------|------|
| `laboratory-playground.html` | Main page — DOM structure + inline CSS |
| `shared/lab-styles.css` | All lab CSS (~1200 lines) |
| `shared/lab-ui.js` | All JS (~950 lines) — init, events, rendering, animations |
| `shared/lab-engine.js` | XP/level engine on XHZ — level calc, storage, mixing, decomposition |
| `radicals.json` | 222 radicals with unlock levels, categories, frequency |
| `reactions.json` | 2,502 2-radical reactions |
| `chain_reactions.json` | 182 chain reactions |
| `three_component_reactions.json` | 69 three-radical reactions |

### JS Dependencies
```
nav.js → profiles.js (XHZ) → lab-engine.js → lab-ui.js
```

### Data Flow
1. `Lab.init()` called on DOMContentLoaded
2. Fetches `radicals.json` → `XHZ.loadRadicalData()`
3. Fetches `reactions.json` → `XHZ.loadReactionData()`
4. Fetches `chain_reactions.json` + `three_component_reactions.json`
5. Auto-claims levels 1-5, renders all UI

### Key APIs (on XHZ)
- `getLevel(pid)` / `getLevelProgress(pid)` — XP → level
- `getEarnedRadicals(pid)` / `hasRadical(pid, char)` / `addEarnedRadical(pid, char)`
- `getAllUserRadicals(pid)` — leveled + earned combined
- `checkReaction(r1, r2)` / `checkThreeComponentReaction(r1, r2, r3)`
- `getAffinities(char)` — compatible partners for a radical
- `getLabEnergy(pid)` / `useDecomposition(pid)` — 2/day
- `getUnclaimedLevelRewards(pid)` / `claimLevelReward(pid, level, char)`

---

## 📐 CSS Architecture

### Custom Properties (`:root`)
```
--lab-bg, --lab-card, --lab-border, --lab-text, --lab-text-soft, --lab-text-faint
--lab-brew, --lab-brew-dark, --lab-extract, --lab-extract-dark
--lab-glow, --lab-glow-dark, --lab-magic, --lab-magic-dark, --lab-vial
--shadow-card, --shadow-sm, --shadow-lg, --shadow-lift
```

### Key Selectors
| Selector | Component |
|----------|-----------|
| `.lab-page` | Outer container (1200px max) |
| `.lab-topbar` | Frameless stat row |
| `.lab-tabs` / `.lab-tab` | Tab bar with pill-style buttons |
| `.lab-panel` | Tab content panels (display: none / flex) |
| `.brew-cauldron` | Cauldron strip (top hero) |
| `.brew-flask-wrap` | Flask SVG container (200×240px) |
| `.brew-drop-zone` | Ingredient slots inside flask |
| `.brew-pantry` | Dark wood cabinet (bottom) |
| `.brew-orbs` / `.brew-orb` | Crystal ball filter row |
| `.brew-shelves` / `.brew-shelf` | Category shelves |
| `.brew-shelf-grid` | CSS Grid of chips |
| `.lab-chip` | Potion bottle ingredient card |
| `.panda-speech` | Speech bubble (Mali font) |
| `.brew-chains` | Chain reaction button row |
| `.brew-result` | Persistent result display |
| `.lab-flask-overlay` | Full-screen brew animation |
| `.lab-result-toast` | Discovery notification |
| `.lab-modal-overlay` | Level-up branching modal |
| `.lab-card` | Neo-brutalist white card |
| `.lab-btn` | 3D pill button |
| `.sparkle-particle` | Animated trail particle |

---

## ⚡ Performance Notes

- `radicals.json`: ~15 KB → fetched on init
- `reactions.json`: ~35 KB → fetched on init
- `chain_reactions.json`: ~5 KB → fetched on init
- `three_component_reactions.json`: ~3 KB → fetched on init
- Course data: 24 JSON files loaded by `Lab.loadCourseData()` (lazy)
- Lab state: `localStorage` via `xhz_lab_{profileId}` key
- No Supabase sync for lab data yet (future Phase 4)

---

## 🐛 Known Issues

- Arena lab card unlock gating loads `radicals.json` but doesn't show lab card until refresh
- No unclaimed level rewards notification on other pages (dashboard, arena, etc.)
- Lab data not synced to Supabase (localStorage only)
- Chain reactions data has 0 entries currently (structure ready, content pending)
- Sparkle trail glow pulse doesn't always trigger on reverse (retreat)
- Cauldron glow `::before` uses fixed pixel size (360×320) — not proportional on mobile
