# 🧪 Laboratory & XP System — Design Plan

## Overview

A chemistry-lab-themed minigame where users collect Chinese radicals (部首) and experiment by mixing them to discover full characters. Tied to a new XP/leveling progression that rewards radical unlocks at each level.

---

## 1. XP & Leveling System

### Core Principle
**XP = total stars earned** (lifetime sum of `write_score + study_score`). No separate XP tracking needed — `XHZ.getTotalStars(profileId)` already exists.

- Stars already track 100% of learning activity (writing + studying)
- Making XP = stars gives stars a second purpose beyond badges
- Users immediately have a level from day one (backward compatible)

### Level Thresholds (80 levels) — Paced for ~150 hours total
**Target:** ~150 hours of playtime to reach Lv 80 (at 30 min/day, 49 stars/day).
This follows industry benchmarks (Duolingo: 45-300 hrs, Khan Academy: 50-100 hrs per subject).

| Level | Stars Required | Regular (30 min) | Casual (15 min) | Committed (45 min) | Note |
|-------|---------------|:----------------:|:----------------:|:------------------:|------|
| 1 | 0 | Day 1 | Day 1 | Day 1 | ⭐ Start |
| 2 | 23 | Day 1 | Day 1 | Day 1 | |
| 3 | 49 | Day 1 | Day 2 | Day 1 | |
| 4 | 77 | Day 2 | Day 4 | Day 1 | |
| 5 | 107 | **Day 3** | Day 5 | Day 2 | 🔬 Lab unlocks |
| 10 | 301 | **Day 7** | Day 13 | Day 5 | 🌿 Branching |
| 15 | 605 | Day 13 | Day 25 | Day 9 | |
| 20 | 975 | Day 20 | Day 39 | Day 13 | |
| 25 | 1,498 | **Day 31** | Day 60 | Day 20 | ⚗️ Advanced mixing |
| 35 | 2,876 | Day 59 | Day 116 | Day 39 | |
| 50 | 6,077 | Day 125 (~4 mo) | Day 244 | Day 82 | Mid-game |
| 65 | 10,091 | Day 206 (~7 mo) | Day 404 | Day 135 | |
| 80 | 14,700 | **Day 300 (~10 mo, 150 hrs)** | Day 588 | Day 196 | 🏁 Max level |

Full progression data is embedded in `radicals.json` under `level_thresholds[].stars_required`.

### Level Progression Design
- **80 leveled radicals** (levels 1-80): Guaranteed through leveling up
- **142 decomposition-only radicals**: Discovered through lab experimentation only
- **Selection logic**: First 25 levels are manually curated (educational order: foundation → core → common → thematic). Levels 26-80 are data-driven by a score formula: `frequency * 0.3 + reaction_count * 0.7`.
- The top 80 most versatile/usable radicals become leveled rewards. The remaining 142 are rarer components (traditional variants, specialized forms) that make exciting lab discoveries.

### Data Storage
- XP: no new field — derived from total stars
- Level: computed from stars, cached in profile as `level` field for quick lookup
- Radicals earned: stored in profile's `items` storage alongside earned items
  - New key: `xhz_lab_{profileId}` → `{ earned_radicals: ["口","日","月",...], discovered_chars: {...}, decomposed_chars: {...}, lab_energy: {...}, claimed_levels: [...] }`

---

## 2. Radical Collection

### Radicals Data (`radicals.json`)
Structured list of all radicals relevant to the game:

```json
{
  "radicals": [
    {
      "id": "kou",
      "char": "口",
      "pinyin": "kǒu",
      "meaning": "mouth",
      "stroke_count": 3,
      "unlock_level": 1,
      "category": "body"
    },
    {
      "id": "ri",
      "char": "日",
      "pinyin": "rì",
      "meaning": "sun",
      "stroke_count": 4,
      "unlock_level": 2,
      "category": "nature"
    }
  ]
}
```

### Categories (for branching)
Radicals are organized into thematic categories:
- **Nature:** 日 (sun), 月 (moon), 山 (mountain), 水 (water), 火 (fire), 土 (earth), 木 (tree)
- **Body:** 口 (mouth), 目 (eye), 手 (hand), 足 (foot), 心 (heart)
- **People:** 人 (person), 女 (woman), 子 (child), 父 (father), 母 (mother)
- **Actions:** 言 (speech), 辶 (walk), 彳 (step), 力 (power)
- **Animals:** 马 (horse), 虫 (insect), 鱼 (fish), 鸟 (bird)
- **Objects:** 刀 (knife), 车 (vehicle), 门 (door), 田 (field)

### Collection UI
- Grid display of all radicals (collected vs uncollected)
- Collected: full color, shows character + meaning
- Uncollected: dimmed silhouette with lock icon
- Detail popup on click: shows the radical, its meaning, examples of characters it forms, and the level at which it unlocks

---

## 3. Laboratory Game — Core Mechanics

### Setting
A chemistry lab with beakers, Bunsen burners, flasks, and bubbling vials — paper aesthetic matching the app's "Botes" design system.

### Mechanic 1: MIXING (化合)
**The core gameplay loop:**

1. User selects **2 radicals** from their collected pool
2. Drags them into a mixing flask
3. Animation: liquids combine, swirling, color change
4. **Result:**
   - ✅ **SUCCESS:** These 2 radicals form a real Chinese character
     - Character is revealed with pinyin + meaning
     - Added to user's "Discovered Characters" collection
     - Brief celebration animation
   - ❌ **FAIL:** No character exists from this combination
     - Animation of failed reaction (fizzle, smoke, color change)
     - Encouraging message: "Not a match — try another combination!"

### Mechanic 2: DECOMPOSITION (分解) — Unlocking Rare Radicals

The second station in the lab: a **Decomposition Chamber** (centrifuge) where course characters are broken down into their component radicals.

**Why this matters:** 142 out of 222 radicals are **decomposition-only** (marked as `unlock_level: null`). Leveling up gives you the 80 most common radicals. The other 142 can only be discovered through decomposition.

**Critical insight:** Decomposing characters you discovered through mixing (日+月→明) is a closed loop — you already owned both radicals. Instead, decomposition works on **course characters** you've studied. Cracking them open reveals rare radicals you may not own yet.

**The flow:**
```
📚 Study 很 in HSK 2 course
🧪 Lab → decompose 很 → 彳 + 艮
🌟 彳 is decomposition-only → NEW RADICAL! Added to collection.
🔄 Mix 彳 with other radicals → discover more characters
```

### Decomposability rules (3 categories)

| Category | Both radicals are... | Decomposable? | What user gets |
|----------|--------------------|:-------------:|---------------|
| **Both leveled** | In the leveling rewards | ❌ No | Both already owned. No point. |
| **Both decomp-only** | In the decomposition pool | ✅ Yes | Both radicals are NEW! (Full reward) |
| **Mixed** | One leveled + one decomp-only | ✅ Yes | Only the **decomp-only radical** is earned. The leveled one shows as "🔒 Locked — level up to unlock this component." |

**Why mixed decomposition exists:** 35 decomposition-only radicals (like 且, 交, 由, 几, 加, 少, 牙) ONLY appear in mixed characters. Without decomposing mixed characters, these radicals would be permanently unobtainable.

### Pacing constraints
- **Lab energy**: Max 1-2 decompositions per day (recharges on daily reset)
- **Mastery gate**: Character must be mastered to ★★★ in the course
- **Once per character**: First decomposition gives the radical reward. Subsequent times show the breakdown educationally but give no new rewards.
- **Cross-promotion**: Locked leveled components show "Need XP/Level up to unlock" — encouraging users to study and level up.

### UI flow (mixed character example)
```
┌─────────────────────────────────┐
│  🔬 DECOMPOSITION CHAMBER       │
│                                 │
│  Character loaded: 很 (very)    │
│                                 │
│  [⚗️ RUN DECOMPOSITION]        │
│  Energy remaining: 1/2 〰️〰️○  │
│                                 │
│  ──── Result ────              │
│                                 │
│  很 decomposes into:            │
│                                 │
│  ╔═══╗   +   ╔═══╗             │
│  ║ 彳 ║       ║ 艮 ║             │
│  ╚═══╝       ╚═══╝             │
│  step         root              │
│  [NEW! 🎉]   [🔒 Locked]       │
│  Unlocked!   Reach LV 35 to     │
│              unlock this comp.  │
│                                 │
└─────────────────────────────────┘
```

### Stats
- **117 both-decomp characters**: Decompose → earn both radicals
- **1,010 mixed characters**: Decompose → earn the decomposition-only radical, shows locked component for the leveled one
- **316 both-leveled characters**: Not decomposable (both already owned)
- All **142 decomposition-only radicals** are earnable through decomposition (zero orphans)

### Mechanic 3: BRANCHING (On Level-Up)
When leveling up, the user earns **one** new radical — but they **choose** from 3 options:

```
🎉 Level 6! Choose your new element:

  ╔══════════════╗    ╔══════════════╗    ╔══════════════╗
  ║      火       ║    ║      山       ║    ║      手       ║
  ║  FIRE        ║    ║  MOUNTAIN    ║    ║  HAND        ║
  ║  Unlocks:    ║    ║  Unlocks:    ║    ║  Unlocks:    ║
  ║  烧, 灯, 热   ║    ║  峰, 岩, 岛   ║    ║  打, 拿, 持   ║
  ╚══════════════╝    ╚══════════════╝    ╚══════════════╝
```

The 3 options are themed — the user chooses which "path" to explore (nature, body, actions, etc.).

### Visual Feedback Design
- **Mix animation:** Drag radicals into flask → swirling liquid (with color based on radicals)
- **Success reaction:** Bright flash, sparkles, character emerges from flask with glow
- **Fail reaction:** Fizzle sound, color change to brown/gray, small puff of smoke
- **Decomposition:** Character enters machine → animation of splitting into parts → parts pop out

---

## 4. Reaction Data Table

### Source
Extracted from the chinese-lexicon etymology data. Real data from the lexicon:

| Component Count | Entries | % of Total |
|-----------------|---------|-----------|
| 2-component | 4,454 | 87.5% |
| 3-component | 157 | 3.1% |
| 4+ component | 24 | 0.5% |
| No decomposition | ~453 | 8.9% |
| **Total** | **5,088** | **100%** |

**Key insight:** 87.5% of decomposed characters are exactly 2-component. Multi-radical chars are real but rare — which makes the guidance problem solvable.

### Structure (`reactions.json`)
```json
{
  "reactions": [
    {
      "radicals": ["日", "月"],
      "result": "明",
      "pinyin": "míng",
      "meaning": "bright",
      "semantic": "日",
      "phonetic": "月",
      "strokes": 8,
      "hsk_level": null
    },
    {
      "radicals": ["女", "子"],
      "result": "好",
      "pinyin": "hǎo",
      "meaning": "good",
      "semantic": "女",
      "phonetic": "子",
      "strokes": 6,
      "hsk_level": null
    },
    {
      "radicals": ["木", "木"],
      "result": "林",
      "pinyin": "lín",
      "meaning": "forest",
      "semantic": null,
      "phonetic": null,
      "strokes": 8,
      "hsk_level": null
    }
  ]
}
```

### Rules for inclusion
1. Character must be decomposed into exactly **2 component radicals** in the etymology data
2. Both components must be in the radicals list (identifiable as radicals)
3. Character can be *any* Chinese character — not limited to course data

### Estimated Size
From ~4,454 two-component character decompositions, roughly **600-1,000** valid 2-radical reactions are expected.

### Multi-Radical Extension Table
Separate data structure for 3+ radical reactions:
```json
{
  "chain_reactions": [
    {
      "intermediate": "林",
      "intermediate_recipe": ["木", "木"],
      "added_radical": "木",
      "result": "森",
      "pinyin": "sēn",
      "meaning": "forest"
    },
    {
      "intermediate": "明",
      "intermediate_recipe": ["日", "月"],
      "added_radical": "艹",
      "result": "萌",
      "pinyin": "méng",
      "meaning": "sprout"
    }
  ]
}
```

These are **two-step reactions**: mix (A + B) → intermediate character, then optionally add C → final character.

---

## 5. Multi-Radical Guidance System (Key Design)

### The Problem
If a user randomly combines 3 radicals, only ~0.1% of possible triples form real characters. Unassisted 3-radical mixing would be deeply frustrating.

### The Solution: "Build-Up" Synthesis

Instead of throwing 3 radicals into a single flask and hoping, the lab uses **stepwise synthesis**:

```
Step 1: 日 + 月  →  🧪 SUCCESS: 明 (bright)!
Step 2: "Continue synthesis?"  →  User adds 艹
Step 3: 明 + 艹  →  🧪 SUCCESS: 萌 (sprout)!  🎉
```

**Why this works:**
- **Step 1 always succeeds** — the 2-radical mix uses a known reaction
- **Step 2 is optional** — user can stop anytime with a positive result
- **No blind guessing** — the user adds one element at a time, seeing intermediate results
- **The failure at step 3 is low-stakes** — user already got 明, extending to 萌 is a bonus

### Mechanical Flow

**Stage 1: SELECT (2 radicals)**
- User picks 2 radicals from their collection
- Before mixing, show affinity hints on each radical:
  - "日 is compatible with 月, 木, 生, 十..."

**Stage 2: REACTION (check known 2-radical combos)**
- ✅ Success: Character emerges! Show pinyin + meaning
  - Buttons: "Claim" | "Continue Synthesis ➕"
- ❌ Failure: Fizzle animation + helpful message
  - "Not a match. Try: 日 + 月 = ?" (hints at a known reaction)

**Stage 3: EXTEND (add 3rd radical — optional)**
- Only available if the result character can be extended
- Shows: "The solution is unstable. Add one more element?"
- User selects a 3rd radical from collection
- Check chain_reactions table:
  - ✅ Success: "🧪 Multi-element synthesis!" + bigger celebration
  - ❌ Failure: "The reaction stabilizes. 明 is your final compound." (no loss)

**Stage 4: TRIPLE BLEND (Level 25+)**
- At higher levels, unlock simultaneous 3-radical mixing
- But still with guidance:
  - Show category hints: "This reaction needs: 🌿 + 🔥 + something"
  - Show structure hint: "This character has a top-bottom structure"

### Affinity Indicators (Pre-Mix Hints)

Before mixing, each radical shows "affinities" — other radicals it commonly pairs with:

```
Selected: 日 ☀️
Known affinities:
  ⚡ 月 → 明 (bright)
  ⚡ 木 → 果 (fruit)  
  ⚡ 十 → 早 (early)
  ⚡ 生 → 星 (star)
```

This:
- Guides users toward successful reactions
- Teaches character composition organically
- Reduces blind-guess frustration
- Gets users excited: "I know 日 + 月 = 明!"

### Progressive Unlock of Multi-Radical

| Level | Feature | Rationale |
|-------|---------|----------|
| 5-9 | 2-radical mixing only | Build confidence, learn the system |
| 10 | "Synthesis Extension" unlocked | Can add 3rd radical after success |
| 15 | Affinity hints revealed | See all compatible pairs before mixing |
| 25 | "Triple Blend" unlocked | 3 radicals simultaneously (with hints) |

---

## 6. Discovered Characters Collection

### Storage
- Separate from course mastery data
- Stores: character, pinyin, meaning, date discovered, recipe (which radicals + combination), chain (if extended)
- Accessible from user profile (new tab/section)

### UI
- Grid of discovered characters, sorted by discovery date
- Each card shows: character, meaning, recipe
- Chain reactions shown as: 日 + 月 → 明 + 艹 → 萌
- Filtering/searching

### Learning Value
- When a user later encounters a "discovered" character in a course, it shows a special badge: "🧪 Discovered in Lab!"
- This gamifies the moment of recognition

---

## 6. XP Sources & Progression Flow

### XP Earned By
| Activity | XP | Notes |
|----------|-----|-------|
| Write practice (3 stars) | 3 | Per word, capped daily |
| Study flashcard | 1 | Per card |
| Lab: successful reaction | 2 | Per discovery (one-time per character) |
| Lab: failed reaction | 0 | But unlocks "try again" dopamine |
| Decomposition | 1 | Per character decomposed |
| Daily login | — | Already gives coins, not XP |

### Level-Unlock Progression
| Stage | Level | Unlock |
|-------|-------|--------|
| Tutorial | 1 | First radical (口) |
| Basic mixing | 2-4 | 3 more radicals, can mix |
| **Lab unlocked** | **5** | **Laboratory game becomes available** |
| Branching | 6+ | Choose radical on level-up |
| Categories | 10+ | Can filter radicals by category |
| Advanced | 25+ | Triple-radical mixing |

---

## 7. Implementation Phases

### Phase 1: Data Foundation ✅
- [x] Extract reaction table from chinese-lexicon etymology data
- [x] Create `radicals.json` with 222 radicals (80 leveled + 142 decomp)
- [x] Create `reactions.json` with 1,443 valid 2-radical → character mappings
- [x] Write data extraction script (`scripts/extract-lab-data.js`)

### Phase 2: XP/Level Engine ✅
- [x] Add level computation to `XHZ` (`shared/lab-engine.js`)
- [x] Add radical storage (`xhz_lab_{profileId}` — earned radicals, decomposed chars, claimed levels)
- [x] Add level-up reward logic (branching choices for levels 6+, auto-claim for 1-5)
- [x] Add discovered characters storage
- [x] Add lab energy system (2/day, daily reset)
- [x] Add mixing helpers (checkReaction, getAffinities, loadReactionData)

### Phase 3: Laboratory Playground ✅
- [x] Build `laboratory-playground.html` (standalone, like zombie game)
- [x] Implement mixing mechanic (select 2 radicals → check reaction)
- [x] Success/failure animations (CSS-based, result toast overlay)
- [x] Discovered characters display (tab with recipe, pinyin, decomposed badge)
- [x] Decomposition mechanic (energy system, ★★★ mastery gate, both_decomp/mixed rewards)
- [x] Affinity hints wired into mixing station (beaker affinities + compatible chip highlighting)
- [x] Stepwise synthesis ("Continue Synthesis ➕" after successful 2-radical mix, 3rd radical picker, chain reactions)
- [x] Triple blend mode (×3 toggle at Level 25+, 3-beaker layout, simultaneous 3-radical mixing via XHZ.checkThreeComponentReaction())

### Phase 3.5: Data Extraction & API ✅
- [x] Create `chain_reactions.json` (182 build-up chains from 16 intermediates)
- [x] Create `three_component_reactions.json` (69 direct 3-radical reactions, filtered from 124 chinese-lexicon entries)
- [x] Write extraction scripts (`scripts/extract-chain-reactions.js`, `scripts/extract-three-component-decomps.js`)
- [x] Add API methods to `shared/lab-engine.js`:
  - [x] `XHZ.loadChainReactionData()` / `XHZ.checkChainReaction()` / `XHZ.getChainReactions()`
  - [x] `XHZ.loadThreeComponentData()` / `XHZ.checkThreeComponentReaction()` / `XHZ.getAllThreeComponentReactions()` / `XHZ.getThreeComponentByRadical()`

### Phase 4: Integration — Complete Page-by-Page Audit

Below is the complete audit of every HTML page in the app, categorized by XP integration scope.

| # | Page | Purpose | Scripts Already Loaded | Needs lab-engine.js? | XP Features to Add | Priority |
|---|------|---------|----------------------|:------------------:|-------------------|----------|
| 1 | **index.html** | Settings/login | nav, profiles, supabase, strings, auth-modal | ✅ Yes | Show **current level badge** in profile display. Minimal readout. | 🟡 Low |
| 2 | **new-learner.html** | Onboarding | nav, profiles, supabase, strings | ✅ Yes | After profile creation, **auto-claim levels 1-5** via `autoClaimLevelRewards()`. Show brief level intro. | 🟡 Low |
| 3 | **dashboard.html** | Hub / main landing | design-tokens, supabase, profiles, nav, strings, auth-modal | ✅ Yes | **Level badge in top bar** (next to streak). **XP progress bar** toward next level. **Unclaimed rewards notification** dot. **Level-up toast** when stars cross threshold. | 🔴 High |
| 4 | **arena.html** | Games arena | nav, profiles, supabase, strings | ✅ Yes | **Level in pc-stats-row** (stars \| streak \| level). **"🧪 Laboratory" game card** (locked until Lv 5). Lab HOF section when available. | 🔴 High |
| 5 | **write.html** | Writing practice | nav, profiles, supabase, strings, auth-modal, hanzi-writer | ✅ Yes | **Level badge** in info-strip or score-bar. **Auto-claim levels 1-5** after star-earning. **Level-up toast**. | 🟡 Medium |
| 6 | **study.html** | Study flashcards | nav, profiles, supabase, strings, auth-modal | ✅ Yes | **Level badge** in session header. **Auto-claim levels 1-5** after quiz. **Level-up toast**. | 🟡 Medium |
| 7 | **progress.html** | Progress/profile | nav, profiles, supabase, strings, auth-modal | ✅ Yes | **Radical collection grid** (222 radicals, collected/uncollected). **Discovered characters** section. **Decomposition stats**. **Unclaimed rewards** with claim/branching UI. Optional: level in stats grid. | 🔴 High |
| 8 | **zombie-game-playground.html** | Zombie game (standalone) | nav, hanzi-writer | ❌ No | None — standalone with no profile dependency. | ⚫ None |
| 9 | **avatar-playground.html** | Avatar sandbox | nav | ❌ No | None — test page only. | ⚫ None |
| 10 | **recovery.html** | Data recovery | supabase, strings, nav | ❌ No | None — utility page. | ⚫ None |
| 11 | **print.html** | Print worksheets | hanzi-writer, nav, profiles, supabase, strings | ❌ No | None — print-only, no interactive needed. | ⚫ None |
| 12 | **laboratory-playground.html** | ✅ Built — Lab game page | nav, profiles, lab-engine, design-system | ✅ Yes | Full game: mixing station, decomposition chamber, radical collection, energy display, discovered chars. | ✅ Phase 3 Complete |

#### Page-by-Page Integration Checklist

**3 pages: Load lab-engine.js + data + minimal level readout**

| Detail | index.html | new-learner.html | write.html |
|--------|:----------:|:----------------:|:----------:|
| Add `<script src="shared/lab-engine.js"></script>` | ✅ | ✅ | ✅ |
| Fetch `radicals.json` + `reactions.json` on init | ✅ Brief | ✅ Brief | ✅ At DOMContentLoaded |
| Show level badge | ✅ In profile display | ✅ After profile created | ✅ In info-strip or score-bar |
| Auto-claim levels 1-5 | — | ✅ After creation | ✅ After earning stars |
| Level-up toast | — | — | ✅ On level threshold crossed |

**2 pages: Load lab-engine.js + level display + auto-claim + toast**

| Detail | study.html |
|--------|:----------:|
| Add `<script src="shared/lab-engine.js"></script>` | ✅ |
| Fetch radicals.json + reactions.json on init | ✅ In loadAllData() |
| Show level badge | ✅ In session header (next to progress) |
| Auto-claim levels 1-5 | ✅ After quiz batch completes |
| Level-up toast | ✅ On star-earning events |
| Unclaimed rewards notification | ✅ On session complete |

**2 pages: Load lab-engine.js + full XP widgets + lab game gating**

| Detail | dashboard.html | arena.html |
|--------|:---------------:|:----------:|
| Add `<script src="shared/lab-engine.js"></script>` | ✅ | ✅ |
| Fetch radicals.json + reactions.json | ✅ In loadData() | ✅ In DOMContentLoaded |
| Level badge in top bar | ✅ Next to streak | ✅ In pc-stats-row |
| XP progress bar | ✅ In journey card or quest | — |
| Unclaimed rewards notification | ✅ Dot on profile/journey card | — |
| Lab game card | — | ✅ New GAMES entry (locked Lv 1-4) |
| Level-up toast | ✅ On load | — |
| Hall of Fame for lab | — | ✅ Future: lab HOF section |

**1 page: Full XP profile — radical collection + rewards + discovery**

| Detail | progress.html |
|--------|:-------------:|
| Add `<script src="shared/lab-engine.js"></script>` | ✅ |
| Fetch radicals.json + reactions.json | ✅ In init |
| Radical collection grid | ✅ New card after badges |
| Discovered characters list | ✅ New card below collection |
| Decomposition stats | ✅ In collection card |
| Unclaimed rewards with claim UI | ✅ New card or in collection |
| Branching choice on level 6+ | ✅ Modal/popup in claim flow |
| Level in stats grid | ✅ Optional addition |

**1 page to build: Full lab gameplay**

| Detail | laboratory-playground.html |
|--------|:--------------------------:|
| Scripts: profiles.js, lab-engine.js | ✅ |
| Load radicals.json + reactions.json | ✅ On init |
| Mixing station UI | ✅ 2-radical selection + flask |
| Success/failure animation | ✅ CSS-based animations; ❌ sound effects not yet implemented |
| Decomposition chamber | ✅ Course character input + centrifuge |
| Lab energy display | ✅ Remaining/total indicator |
| Radical collection browser | ✅ All owned radicals visible |
| Discovered characters list | ✅ From mixing + decomposition |
| Affinity hints (Level 15+) | ✅ Below-beaker hints + compatible highlighting in picker grid |
| Stepwise synthesis (Lv 10+) | ✅ "Continue Synthesis ➕" → 3rd radical picker → chain_reactions.json |
| Triple blend (Level 25+) | ✅ ×2/×3 toggle → 3-beaker layout → three_component_reactions.json |
| Chain reactions data | ✅ `chain_reactions.json` (182 chains, 16 intermediates) |
| 3-component reactions data | ✅ `three_component_reactions.json` (69 reactions) |
| Chain reaction API | ✅ `XHZ.loadChainReactionData()`, `XHZ.checkChainReaction()`, `XHZ.getChainReactions()` |
| 3-component API | ✅ `XHZ.loadThreeComponentData()`, `XHZ.checkThreeComponentReaction()`, etc. |

---

#### Key Script Loading Order (for all XP-enabled pages)

```html
<!-- EXISTING: load these first -->
<script src="profiles.js"></script>

<!-- NEW: load lab-engine (depends on XHZ existing) -->
<script src="shared/lab-engine.js"></script>

<!-- EXISTING: then load page-specific scripts -->
<script src="nav.js"></script>

<!-- Data init (in page script): -->
<script>
Promise.all([
  fetch('radicals.json').then(function(r) { return r.json(); }),
  fetch('reactions.json').then(function(r) { return r.json(); })
]).then(function(results) {
  XHZ.loadRadicalData(results[0]);
  XHZ.loadReactionData(results[1]);
  // Continue page init...
});
</script>
```

#### Data Files Needed on Every XP Page

| File | Purpose | Size | Loading Method |
|------|---------|------|---------------|
| `radicals.json` | Radical list + level thresholds | ~15 KB | `fetch()` + `XHZ.loadRadicalData()` |
| `reactions.json` | Mixing reactions | ~35 KB | `fetch()` + `XHZ.loadReactionData()` |
| `shared/lab-engine.js` | XP/level engine | ~8 KB | `<script src="...">` tag |

#### Caching Strategy
- `radicals.json` and `reactions.json` are static — can be cached via HTTP cache headers
- Consider using `localStorage` with version check for offline support (Phase 5)
- Lab data (`xhz_lab_{profileId}`) already uses localStorage

### Phase 5: Polish ✅
- [x] Chemistry lab visual theme (beakers, flasks, glassmorphism, animations)
- [x] Sound effects for reactions (Web Audio API: success/fail/chain/decomp/levelup tones)
- [x] "Branching" choice UI on level-up (notification dot + 3-option modal for Lv 6+ rewards)
- [x] Educational tooltips (reaction count shown on radical chips in picker modes)
- [x] Statistics: reactions attempted, success/fail rate, favorite radicals, syntheses, decompositions

### Phase 3.5: Game-ification (IN PROGRESS)

After initial build, game design feedback identified that the radical inventory felt like a spreadsheet.

**Done:**
- [x] Wings show distinct content (Partners vs Others) with headers
- [x] Removed empty beaker result box, tightened layout
- [x] Restored @keyframes resultPop animation for flask overlay

**In Progress:**
- [ ] Parchment-style radical cards (textured, drop-shadowed, tactile)
- [ ] Elemental Orb category filters with animation
- [ ] Work tray glow states for wings
- [ ] Background decorative line art
- [ ] Discovery reveal animation for new radicals
### Phase 6: Integration (Next)
- [ ] Load lab-engine.js on dashboard, arena, write, study, progress, index, new-learner
- [ ] Add XP level badge + progress bar to dashboard top bar
- [ ] Add lab game card to arena (locked until Lv 5)
- [ ] Add radical collection + discovered chars sections to progress.html
- [ ] Level-up toast on star-earning events
- [ ] Auto-claim levels 1-5 after writing/studying

---

## 8. Open Questions (Resolved)

- Should the reaction table be client-side (JSON file) or server-side?
  - **Decision:** Client-side JSON (same pattern as character data) ✅
- How to handle multi-component characters (3+ radicals)?
  - **Phase 1:** 2-radical combinations ✅
  - **Phase 3.5:** Sequential mixing (stepwise synthesis) via chain_reactions.json ✅
  - **Phase 3.5:** Simultaneous 3-radical mixing (triple blend) via three_component_reactions.json ✅
- Should failed reactions award pity XP?
  - **Decision:** No XP for failures, but interesting failed messages ("Almost! Try 日 + 月 instead?") ✅
- What about radical variants (e.g., 氵 vs 水, 忄 vs 心)?
  - Tracked as variants of the same radical. Both forms unlock together. ✅

---

## 9. Resources

- **chinese-lexicon** repo: `/Users/gu2026/Downloads/chinese-lexicon-master/`
  - `etymology/index.js` — 4,042 characters with component decomposition
  - `dictionary/cedict.js` — 116,935 CEDICT entries with pinyin + definitions
- **Existing course data** in project root: Already has `etymology.components` for many characters
