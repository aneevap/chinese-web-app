# 🧪 Laboratory — Redesign: The Potion Shop

> **Vibe:** Doodle God meets witch's cauldron. You're a little alchemist brewing Chinese characters by combining magical ingredients (radicals). The flask is the star. Every brew is a discovery.

---

## 1. Design Direction

### Aesthetic: Neo-Brutalist Pastel Toy ("Cozy Potion Shop")

Same dashboard aesthetic, but with warmer/magical feel:

| Token | Value |
|-------|-------|
| Background | `#f2efe5` (warm beige) with subtle **magic swirl** SVG pattern |
| Card bg | `#FFFFFF` (pure white) |
| Border | `3px solid #4A3B2C` |
| Border radius | `24px` |
| Card shadow | `6px 6px 0 0 var(--db-border)` |
| Button style | 3D pill with squish `:active` |

### Lab-Specific Colors

```
--lab-brew:       #7BC8A4    (mint — brew success, flask liquid)
--lab-brew-dark:  #5BA884
--lab-extract:    #E8836F    (coral — extraction/decomposition)
--lab-extract-dark:#C9624E
--lab-glow:       #F0D060    (gold — discoveries, new items)
--lab-magic:      #A58EDB    (purple — chain reactions, triple brews)
--lab-magic-dark: #7A68A8
--lab-vial:       #6CA7E8    (blue — info, stats)
```

---

## 2. Page Layout (Full Visual)

```
┌───────────────────────────────────────────────────────┐
│  🐼 Lab Assistant  │  Lv 5  │  [████░░░░] 60%  │  ⭐ 142  │  ⚡ 2/2  │
└───────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────┐
│  🧪 Brew  │  🔬 Extract  │  📖 Grimoire  │  ⚗️ Creations  │  📊 Log  │
└───────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────┐
│                                                       │
│  TAB CONTENT PANEL (varies by tab)                    │
│                                                       │
│  See sections 4-8 for each tab's layout               │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## 3. Top Bar — Layout

**Frameless horizontal row** (matches dashboard):

```
┌──┬──────┬──────────────────────┬────────┬────────┐
│🐼│ Lv 5 │ [████░░░░░░] 45%     │ ⭐ 142 │ ⚡ 2/2 │
└──┴──────┴──────────────────────┴────────┴────────┘
```

- **🐼**: Small panda emoji, clickable → links to progress.html
- **Lv 5** (purple text, pill badge): Current lab level
- **XP bar** (flex: 1): Thin progress bar with "earned / needed" label
- **⭐ 142** (gold pill): Total stars (XP)
- **⚡ 2/2** (green pill → red when empty): Lab energy for extractions

**States:**
- Energy = 0 → red text, subtle pulse animation
- New levels → gold glow on level badge

---

## 4. Tab Bar — Layout

**4 tabs** (removed Stats — merged into Grimoire):

```
┌──────────┬──────────┬──────────┬───────────┐
│  🧪 Brew │ 🔬 Extract│ 📖 Grim.│ ⚗️ Creat. │
└──────────┴──────────┴──────────┴───────────┘
```

Each tab is a pill. Active tab has:
- Pastel colored fill (per-tab color)
- 3px bottom accent bar
- Bold (800) weight

| Tab | Icon | Full Name | Accent Color |
|-----|------|-----------|-------------|
| 1 | 🧪 | **Brew** | `--lab-brew` (mint) |
| 2 | 🔬 | **Extract** | `--lab-extract` (coral) |
| 3 | 📖 | **Grimoire** | `--lab-vial` (blue) |
| 4 | ⚗️ | **Creations** | `--lab-glow` (gold) |

---

## 5. TAB 1: BREW — The Main Event

### 5.1 Layout

```
┌───────────────────────────────────────────────┐
│              THE CAULDRON                      │
│  ┌─────────────────────────────────────────┐  │
│  │           ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░  │  │
│  │    🧪    BIG FLASK SVG (animated)       │  │
│  │   ~bubbling~    ╱‾‾‾╲    ~steam~        │  │
│  │         🔤  [?]  +  [?]  🔤              │  │
│  │  Drop zone 1     Drop zone 2              │  │
│  │          📦 [?]  (3rd slot)              │  │
│  │  (appears for 3-rad mixes)                │  │
│  └─────────────────────────────────────────┘  │
│  ⬆ Mix!  │  🔄 Clear                         │
│  ──────────────────────────────────────────── │
│  🔗 Chain: +口  +日  +水  (if available)      │
│                                               │
│  Panda says: "Try mixing 日 + 月! 🌞🌙"       │
└───────────────────────────────────────────────┘
┌───────────────────────────────────────────────┐
│  INGREDIENT PANTRY                             │
│  🌿 All │ ☀️ Nature │ 🫀 Body │ 🏛️ Civ │ ...  │
│  ┌─────────────────────────────────────────┐  │
│  │ 🌿 Nature                     (12/26)   │  │
│  │ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐  │  │
│  │ │ 日 │ │ 月 │ │ 火 │ │ 水 │ │ 木 │ │ 金 │  │  │
│  │ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘  │  │
│  │ ┌───┐ ┌───┐                            │  │
│  │ │ 土 │ │ 山 │  ...                      │  │
│  │ └───┘ └───┘                            │  │
│  │ 🫀 Body                        (8/27)   │  │
│  │ ┌───┐ ┌───┐ ┌───┐                      │  │
│  │ │ 口 │ │ 目 │ │ 手 │  ...                │  │
│  │ └───┘ └───┘ └───┘                      │  │
│  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
```

**The page is split into two vertical halves:**
- **Left (40-50%)**: The Cauldron — flask + controls + panda assistant
- **Right (50-60%)**: The Pantry — ingredient shelves with orb filters

On mobile (≤640px): stacks vertically — cauldron on top, pantry below.

### 5.2 The Cauldron (Left Side)

**Centerpiece:** The **flask SVG** (existing one, kept) — but now it's **animated**:
- Always shows a gentle bubbling animation (small circles rising in liquid)
- When hovering ingredients → slight glow anticipation
- When mixing → big shake + smoke + flash → result appears

**Drop Zones (inside the flask):**
- **Slot 1** (left inside flask): First ingredient
- **Slot 2** (right inside flask): Second ingredient
- **Slot 3** (bottom center): Appears **only when 3 radicals are needed**
  - Shows/hides dynamically — some reactions need 3 radicals (e.g., 力+力+力)
  - User can tap slot 3 to add a third radical

**State flow of the cauldron:**

```
[EMPTY]
  The cauldron is empty with gentle bubbling animation
  Drop zones show "?" placeholders
  Panda says: "Drop some ingredients in the cauldron! 🌿"
  Mix button disabled

[1 INGREDIENT SELECTED]
  One drop zone filled with radical character + soft glow
  Drop zone animates with a subtle pulse
  Panda says: "Pick a second ingredient!"
  Mix button still disabled

[2 INGREDIENTS SELECTED]
  Both drop zones filled with glowing characters
  Flask liquid takes on the color of the first radical's category
  Panda says: "Ready to brew! ⚗️"
  Mix button ENABLED (3D pill pops up)
  Chain reaction buttons appear below if applicable

[3 INGREDIENTS SELECTED (if applicable)]
  Third slot appears (animated slide-in)
  All three drop zones filled
  Panda says: "A triple brew! This could be powerful! ✨"
```

**Chain Reaction Row** (below cauldron buttons):
- Shows small pill buttons: "+口" "+日" "+水"
- Each button adds that radical to the third slot
- Only appears when a 2-rad mix CAN be extended to 3-rads
- If the third radical isn't owned → button is gray with lock icon

### 5.3 The Pantry (Right Side)

**Orb Filter Row** (top of pantry):
- Same circular orbs as current design (🌿 ☀️ 🫀 🏛️ 🐾 💭)
- Each orb shows a count badge (e.g., "12" = 12 owned in that category)
- Active orb gets a colored ring + glow

**Shelves below:**
Grouped by category. Each shelf has:
- Category header with emoji + name + "12/26 owned" count
- Grid of radical chips (small neo-brutalist cards):
  - **Owned:** White card, 2px border, colored top accent, shows character + pinyin, hover lifts
  - **Locked:** Dimmed with lock icon, shows "Lv 5" requirement
  - **Selected:** Green border, pulse glow, shows in both slot and shelf
  - **Compatible:** Gold accent — glows if this radical works with current selection
- Click owned radical → fills next empty drop zone (or replaces slot 3 if full)

**Scrolling:** Pantry scrolls independently if shelves are tall.

### 5.4 The Mixing Button

```
┌─────────────────────┐
│  ⚗️  BREW!           │  ← 3D mint-green pill
├─────────────────────┤    Shadow: 0 5px 0 #5BA884
│                     │    :active: translateY(4px), shadow=0
└─────────────────────┘
```

**Disabled state:** Gray, flat, "Select 2+ ingredients"

### 5.5 Brew Modes (All Supported)

#### Mode 1: 2-Radical Brew (Standard)
User picks 2 radicals → Mix → checks `checkReaction(r1, r2)`
- Same-radical works too (e.g., 火+火 → 炎, 口+口 → 吕)
- 2,502 reactions available, 36 are same-radical

#### Mode 2: 3-Radical Brew (Triple)
After picking 2, if a third slot is available AND user adds a 3rd radical:
- Checks `checkThreeComponentReaction(r1, r2, r3)` (179 reactions)
- Example: 力+力+力 → 劍
- Example: 口+口+口 → 品
- Third slot appears ONLY when 3-comp reactions exist for the current pair

#### Mode 3: Chain Brew
After picking 2 radicals that form a valid 2-rad character:
- If chain data exists, shows "+[radical]" buttons below
- Click chain button → adds third radical → immediate triple brew
- Currently 0 chain reactions in data (feature ready, data TBD)

### 5.6 Brew Result → Flask Overlay

Clicking "Brew!" triggers the **flask overlay animation**:

```
┌───────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░                                   ░░  │
│  ░░        ┌─────────────────┐        ░░  │
│  ░░        │   🧪 FLASK SVG   │        ░░  │
│  ░░        │  ~BUBBLING~     │        ░░  │
│  ░░        │  ~SHAKING~      │        ░░  │
│  ░░        └─────────────────┘        ░░  │
│  ░░                                   ░░  │
│  ░░      💨  ~puff~  💨               ░░  │
│  ░░                                   ░░  │
│  ░░   ✨✨✨ DISCOVERY! ✨✨✨          ░░  │
│  ░░                                   ░░  │
│  ░░           FIRE 🔥                  ░░  │
│  ░░        huǒ · fire                  ░░  │
│  ░░     火 + 火 → 炎 (yán) blaze       ░░  │
│  ░░         [🔥 Wait... triple??]      ░░  │
│  ░░                                   ░░  │
│  ░░   ┌────────────────────────┐      ░░  │
│  ░░   │  ← Back  │  → Awesome! │      ░░  │
│  ░░   └────────────────────────┘      ░░  │
│  ░░                                   ░░  │
│  └─────────────────────────────────────┘  │
└───────────────────────────────────────────┘
```

**Animation sequence (1.5s total):**
1. 0-0.3s: Overlay fades in (dark backdrop + blur)
2. 0.3-0.7s: Flask appears with scale-up animation
3. 0.3-0.7s: Flask liquid fills with category color, starts bubbling
4. 0.7-1.0s: Flask shakes + smoke puffs rise
5. 1.0-1.5s: Smoke clears, result card slides in
6. 1.5s+: "Continue" button appears

**Success:** Gold glow on character, sparkle particles, `Lab.sfx.success()`
**Failure:** "💥 Nothing happened..." with dim result, `Lab.sfx.fail()`
**First-time discovery:** Toast notification after overlay closes "🎉 New character discovered!"

### 5.7 Panda Assistant

**Position:** Floating beside the cauldron, inside a small white neo-brutalist speech bubble

**Messages (context-aware):**
```
[empty]     "Drop some ingredients in the cauldron! 🌿"
[1 filled]  "Pick a second ingredient to brew!"
[2 filled]  "Ready to brew! Hit the button! ⚗️"
[3 filled]  "A triple brew! This could be powerful! ✨"
[success]   "You discovered ✨FIRE🔥! Amazing!"
[fail]      "Nothing happened... try different ingredients!"
[locked]    "You need more stars to unlock that ingredient! ⭐"
```

**At start, show a rotating tip** (changes each visit):
- "Try mixing 火 + 火 = 炎! 🔥"
- "日 + 月 = 明! (bright) 🌞🌙"
- "口 + 口 + 口 = 品! 🔤"
- "力 + 力 + 力 = 劍! ⚔️"
- "You have 208 ingredients to collect!"

---

## 6. TAB 2: EXTRACT (Decomposition Chamber)

### 6.1 Layout

```
┌───────────────────────────────────────┐
│  🔬 EXTRACTION STATION                │
│  Break down characters you've studied │
│  to extract hidden ingredients!       │
│                                       │
│  ⚡ 2 extractions remaining today      │
├───────────────────────────────────────┤
│  ┌──[LIST OF BREWABLE CHARACTERS]──┐  │
│  │                                   │  │
│  │  ┌───────────────────────────┐   │  │
│  │  │ 明  míng · bright    ⚡Ready│   │  │
│  │  ├───────────────────────────┤   │  │
│  │  │ 炎  yán · blaze     ✅Done│   │  │
│  │  ├───────────────────────────┤   │  │
│  │  │ 林  lín · forest    🔒Lckd│   │  │
│  │  └───────────────────────────┘   │  │
│  │  ...                              │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌──[EXTRACTION DETAIL]──────────────┐  │
│  │   Character: 明                    │  │
│  │   ┌────┐         ┌────┐           │  │
│  │   │ 日 │   +     │ 月 │           │  │
│  │   │sun │         │moon│           │  │
│  │   └────┘         └────┘           │  │
│  │   [🌟 NEW!]                       │  │
│  │   Extract these to add them to    │  │
│  │   your ingredient pantry!         │  │
│  │                                   │  │
│  │   ┌─────────────────────┐         │  │
│  │   │  🔬  EXTRACT!       │         │  │
│  │   └─────────────────────┘         │  │
│  │   ┌─────────┐                     │  │
│  │   │  ✕ Cancel│                    │  │
│  │   └─────────┘                     │  │
│  └───────────────────────────────────┘  │
└───────────────────────────────────────┘
```

### 6.2 Flow
1. List shows characters the user has studied (from course mastery data)
2. Each card shows: character, pinyin, meaning, status
3. Status: ⚡ Ready (can extract), ✅ Done (already extracted), 🔒 Locked (no energy)
4. Click ⚡ Ready card → opens detail drawer below
5. Detail shows the character's 2 radical components side-by-side
6. "🌟 NEW!" tag on radicals not yet in collection
7. Click "🔬 Extract!" → animation → adds radicals to pantry → costs 1 energy

---

## 7. TAB 3: GRIMOIRE (Radical Collection + Stats)

### 7.1 Layout

```
┌───────────────────────────────────────┐
│  📖 ALCHEMIST'S GRIMOIRE              │
│  Your collection of 208 ingredients   │
│                                       │
│  [===████████░░░░] 42/208 (20%)      │
└───────────────────────────────────────┘
┌───────────────────────────────────────┐
│  🌿 All │ ☀️ Nature │ 🫀 Body │ ...    │  ← category filters (pills)
├───────────────────────────────────────┤
│  All  │  ⭐ Owned  │  🔒 Locked        │  ← ownership filters
├───────────────────────────────────────┤
│  ┌─────────────────────────────────┐  │
│  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐     │  │
│  │  │日│ │月│ │火│ │水│ │木│  ... │  │
│  │  └──┘ └──┘ └──┘ └──┘ └──┘     │  │
│  │  ┌──┐ ┌──┐                    │  │
│  │  │金│ │土│  ...               │  │
│  │  └──┘ └──┘                    │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ┌──[GRIMOIRE STATS]───────────────┐  │
│  │  🔥 Most Used: 火 (12x)         │  │
│  │  💪 Total Brews: 47             │  │
│  │  🎯 Success Rate: 72%           │  │
│  │  ✨ Characters Found: 31        │  │
│  │  🏆 Level: 5                    │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

### 7.2 Grimoire Sections

**Top:** Progress bar — "42/208 ingredients collected (20%)"

**Filter row 1:** Category pills (same 6 categories + All)
**Filter row 2:** Ownership pills (All / Owned / Locked)

**Grid:** Small radical cards in flex-wrap:
- Owned: Full color, green border, shows character + pinyin + category
- Locked: Dimmed, shows "???🔒" and level requirement
- Hover: Slight lift animation

**Stats Panel** (bottom of grimoire):
- 2×2 grid of neo-brutalist stat cards
- Most-used ingredient, total brews, success rate, characters found
- Level display

---

## 8. TAB 4: CREATIONS (Discovered Characters)

### 8.1 Layout

```
┌───────────────────────────────────────┐
│  ⚗️ POTION JOURNAL                    │
│  Every character you've discovered    │
│  through brewing!                     │
├───────────────────────────────────────┤
│  ┌──[DISCOVERY LIST]───────────────┐  │
│  │                                   │  │
│  │  ┌───────────────────────────┐   │  │
│  │  │ 🔥 炎 (yán) blaze         │   │  │
│  │  │ Recipe: 火 + 火      🧪 Brewed│  │  │
│  │  ├───────────────────────────┤   │  │
│  │  │ 💡 明 (míng) bright       │   │  │
│  │  │ Recipe: 日 + 月      🔬 Extr.│  │  │
│  │  ├───────────────────────────┤   │  │
│  │  │ ⚔️ 劍 (jiàn) sword        │   │  │
│  │  │ Recipe: 力+力+力    🧪 Brewed│  │  │
│  │  └───────────────────────────┘   │  │
│  │                                   │  │
│  │  [Empty state:]                   │  │
│  │  "Your potion journal is empty!   │  │
│  │   Start brewing in the cauldron!" │  │
│  └───────────────────────────────────┘  │
└───────────────────────────────────────┘
```

### 8.2 Details
- Each card: character (large gold), pinyin, meaning, recipe
- Badge: 🧪 Brewed (from mixing) or 🔬 Extracted (from decomposition)
- Empty state: Panda speech bubble

---

## 9. Level-Up / Branching Modal

```
┌───────────────────────────────────────┐
│                                       │
│  ┌───────────────────────────────┐    │
│  │     🎉  LEVEL UP! 🎉          │    │
│  │                               │    │
│  │   You reached Level 10!       │    │
│  │   Choose a new ingredient:    │    │
│  │                               │    │
│  │  ┌─────────────────────────┐  │    │
│  │  │ ☀️  日  SUN              │  │    │
│  │  │     The sun, daytime     │  │    │
│  │  └─────────────────────────┘  │    │
│  │  ┌─────────────────────────┐  │    │
│  │  │ 🌙  月  MOON             │  │    │
│  │  │     The moon, month      │  │    │
│  │  └─────────────────────────┘  │    │
│  │  ┌─────────────────────────┐  │    │
│  │  │ 🔥  火  FIRE             │  │    │
│  │  │     Fire, flame          │  │    │
│  │  └─────────────────────────┘  │    │
│  │                               │    │
│  └───────────────────────────────┘    │
│                                       │
└───────────────────────────────────────┘
```

- White neo-brutalist card on dark blur backdrop
- 3 options, each different category
- Click → adds radical → closes → success toast

---

## 10. Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| ≤900px | Brew tab: cauldron + pantry stack vertically |
| ≤640px | Top bar compact (smaller pills), tabs smaller font |
| ≤520px | Orb filters wrap, pantry chips smaller |
| ≤360px | Minimal padding, single-column, smallest chips |

---

## 11. Features Checklist ✅

All existing features accounted for:

| Feature | Tab | Implementation |
|---------|-----|----------------|
| 2-radical mixing | 🧪 Brew | `checkReaction(r1,r2)` — 2,502 reactions |
| Same-radical mixing | 🧪 Brew | 36 same-rad reactions (e.g., 火+火→炎) |
| 3-radical mixing | 🧪 Brew | Third slot appears dynamically → `checkThreeComponentReaction()` — 179 reactions |
| Chain reactions | 🧪 Brew | Chain buttons appear below cauldron (data structure ready, content TBD) |
| Decomposition | 🔬 Extract | Energy system (2/day), extracts radicals from studied chars |
| Radical collection | 📖 Grimoire | 208 radicals, 6 categories, filter by category + ownership |
| Discovered characters | ⚗️ Creations | Shows all brewed/extracted chars with recipe |
| Lab stats | 📖 Grimoire (bottom) | Total brews, success rate, most-used radical, discoveries |
| Level/XP system | Top bar | Level 1-80, XP = total stars |
| Branching rewards | Modal | Levels 6+: pick from 3 category-different options |
| Auto-claim 1-5 | Background | Levels 1-5 auto-awarded on init |
| Energy system | Top bar + Extract | 2 extractions/day, resets daily |
| Orb filters | 🧪 Brew (pantry) | 6 category orbs with owned count |
| Flask overlay | 🧪 Brew | Mix animation: shake → smoke → result reveal |
| Sound effects | 🧪 Brew + Extract | SFX for click, success, fail, chain, extract, level-up |

---

## 12. CSS Architecture

Key classes following `--lab-*` token system:

```css
:root {
  --lab-bg:     #f2efe5;
  --lab-card:   #FFFFFF;
  --lab-border: #4A3B2C;
  --lab-text:   #2D1C12;
  --lab-brew:   #7BC8A4;
  --lab-extract:#E8836F;
  --lab-glow:   #F0D060;
  --lab-magic:  #A58EDB;
  --shadow-card: 0px 6px 0px 0px var(--lab-border);
  --shadow-sm:   0px 3px 0px 0px var(--lab-border);
}

/* Layout containers */
.lab-page { }           /* Main flex column */
.lab-topbar { }         /* Frameless stat row */
.lab-tabs { }           /* Pill tab bar */

/* Brew tab */
.brew-cauldron { }      /* Left/major: flask + controls */
.brew-pantry { }        /* Right: ingredient shelves */
.brew-flask { }         /* SVG flask container */
.brew-drop-zone { }     /* One of the 3 ingredient slots inside flask */
.brew-chain-row { }     /* Chain reaction pill buttons */
.panda-says { }         /* Panda speech bubble */

/* Extract tab */
.extract-list { }       /* Character list */
.extract-detail { }     /* Detail drawer */

/* Grimoire tab */
.grimoire-grid { }      /* Radical card grid */
.grimoire-stats { }     /* Stats panel at bottom */

/* Creations tab */
.creations-list { }     /* Discovered character cards */

/* Shared */
.lab-card { }           /* Neo-brutalist white card */
.lab-btn { }            /* 3D pill button with squish */
.lab-chip { }           /* Small ingredient chip */
```

---

## 13. Implementation Plan

### Phase A — Shared extraction (no design changes)
1. Create `shared/lab-styles.css` — extract all CSS
2. Create `shared/lab-ui.js` — extract all JS
3. Update `laboratory-playground.html` to reference both

### Phase B — Layout restructure
1. Brew tab: cauldron (left) + pantry (right) layout
2. Top bar: frameless pill badges
3. Tab bar: 4 tabs with pill styling
4. Tab names: Brew, Extract, Grimoire, Creations
5. Panda speech bubble in Brew tab
6. Third drop zone (dynamic show/hide for 3-rad mixes)

### Phase C — Visual refresh
1. Neo-brutalist cards everywhere (white + 3px border + solid shadow)
2. 3D squish buttons on all interactions
3. Flask overlay gets neo-brutalist card treatment
4. Level-up modal gets neo-brutalist treatment
5. Empty states with panda messages

### Phase D — Polish
1. Background magic swirl SVG pattern
2. Flask bubbling animation (gentle, always-on)
3. Extract tab animation
4. Toast notifications styling
5. Responsive fine-tuning
