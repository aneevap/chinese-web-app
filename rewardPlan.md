# 🐼 Reward System Redesign Plan

> **Status:** Final — Phases 1, 2, 4 complete  
> **Date:** 2025-07-24  
> **Author:** Codebuff

---

## Table of Contents

1. [Current System Analysis](#1-current-system-analysis)
2. [Problem: Game Stars Flood Badges](#2-problem-game-stars-flood-badges)
3. [Proposal: Three-Tier Economy](#3-proposal-three-tier-economy)
4. [Key Design Decisions](#4-key-design-decisions)
5. [Badge Rebalancing](#5-badge-rebalancing)
6. [Game Score Calibration](#6-game-score-calibration)
7. [Shop Economy](#7-shop-economy)
8. [Item Catalog (Expanded)](#8-item-catalog-expanded)
9. [Panda Mascot Interactive Display](#9-panda-mascot-interactive-display)
10. [Implementation Phases](#10-implementation-phases)

---

## 1. Current System Analysis

### 1.1 Score Sources

| Source | Stars | `addScore()` call |
|---|---|---|
| **write.html** — quiz complete | +3 / +2 / +1 | `addScore('write', stars, [wordId])` |
| **study.html** — flip card | +1 | `addScore('study', 1, [wordId])` |
| **study.html** — quiz 1st try | +3 | `addScore('study', 3, [wordId])` |
| **study.html** — quiz 2nd try | +1 | `addScore('study', 1, [wordId])` |
| **study.html** — perfect round bonus | +5 | `addScore('study', 5, [])` |
| **Sushi Mode** — correct answer | variable | ⚠️ Calls `addStudyStars()` → `addScore('study', stars, wordIds)` |
| **Flash Match** — correct match | variable | ⚠️ Calls `addStudyStars()` → `addScore('study', stars, wordIds)` |

### 1.2 Badge Logic (in `profiles.js` — `addScore()`)

```js
// Every addScore() call does this:
entry.write_score += pointsAwarded;  // if source === 'write'
entry.study_score += points;        // if source === 'study'

const totalScore = entry.write_score + entry.study_score;
entry.badge       = getBadgeTier(totalScore);        // daily combined badges
entry.study_badge = getStudyBadgeTier(entry.study_score); // study-only badges
```

**Daily Badges** (combined write + study):

| Threshold | Badge |
|---|---|
| ≥ 50 | 🥉 Keep Going! |
| ≥ 150 | 🏅 Practice Hero |
| ≥ 300 | 🌟 Rising Star |
| ≥ 500 | 🐼 Panda Master |

**Study Badges** (study only):

| Threshold | Badge |
|---|---|
| ≥ 20 | 📚 Good Learner |
| ≥ 50 | 🔬 Deep Thinker |

### 1.3 Effort Items Logic (in `profiles.js`)

Effort items are unlocked based on **total lifetime stars** (all-time cumulative):

```js
function _checkEffortItemUnlock(profileId, totalStars) {
  // Finds items where totalStars >= item.min_stars AND item not yet earned
  // Auto-adds to profile's earned array
}
```

**Effort Item Catalog** (from `rewards.json`):

| Stars | Item | Category |
|---|---|---|
| 100 | 🍬 Candy Bag | food |
| 300 | 🎋 Bamboo Stick | tool |
| 500 | 🌟 Sparkle Aura | aura |
| 600 | 👒 Straw Hat | accessory |
| 1,000 | 🥟 Giant Dumpling | food |
| 1,500 | 🗡️ Wooden Sword | tool |
| 2,000 | 🪭 Magic Fan | accessory |
| 2,500 | 🧋 Boba Tea | food |
| 3,000 | 🔥 Flame Aura | aura |
| 3,500 | 🖌️ Ink Brush | tool |
| 5,000 | 🦸 Dragon Cape | accessory |
| 7,000 | ✨ Golden Dumpling | food |
| 8,000 | 🌈 Rainbow Aura | aura |
| 10,000 | 🐉 Dragon Staff | tool |

### 1.4 Current Equip System

- `equipItem(profileId, itemId, category)` — sets `equipped[category] = itemId`
- `unequipItem(profileId, category)` — sets `equipped[category] = null`
- Since category is the key, one item per category can be equipped
- Already enforces: cannot equip 2 items of the same category

---

## 2. Problem: Game Stars Flood Badges

**Root cause:** Game stars are added as `source: 'study'` via `addStudyStars()`, which directly feeds into:
1. Today's `study_score` → **daily badge threshold** (50, 150, 300, 500)
2. Combined total → **study badge threshold** (20, 50)
3. Lifetime total → **effort item unlocks** (100–10,000)

**Impact:**
- A single Flash Match session (~45s) can earn **87 stars** — that's more than most kids earn in a full study session
- Flash Match: ~87 stars in 45s vs Sushi: ~34 stars in 75s → **imbalance between games**
- A child playing 3–4 game sessions can hit Panda Master (500) in days
- Effort items also unlock too fast since they use the same total

**The core issue:** Games and study share the same star pool, but they serve different motivational purposes.

---

## 3. Proposal: Three-Tier Economy

We introduce three distinct currencies/rewards that don't overlap:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       THREE-TIER REWARD SYSTEM                            │
├─────────────────┬──────────────────────┬─────────────────────────────────┤
│   ⭐ STUDY STARS │    🏅 BADGES         │   🪙 COINS                      │
│                 │                      │                                 │
│   Earn from:    │   Earn from:         │   Earn from:                    │
│   • Flashcards  │   • ⭐ milestone      │   • 🏅 Badge earned             │
│   • Writing     │     reached daily     │     (+1 coin per tier)         │
│   • Quiz        │                      │   • 🎮 Game completed           │
│                 │   Used for:          │     (+1 coin per game/day max)  │
│   Used for:     │   • Journey title    │   • 📅 Daily login               │
│   • Badge       │     progress         │     (+1 coin per day)           │
│   • Word mastery│   • Streaks          │   • 📅 Weekly streak bonus      │
│   • Badge       │     progress         │                                 │
│     thresholds  │   • Streaks          │   Used for:                     │
│   • Word mastery│   • Daily motivation │   • 🏪 Purchase items in Shop   │
│     tracking    │                      │                                 │
│                 │                      │   Key constraint:               │
│ (unchanged)     │ (unchanged)          │   ≤ ~10 coins/day total         │
│                 │                      │   (savings model — coins        │
│                 │                      │    accumulate across days)      │
└─────────────────┴──────────────────────┴─────────────────────────────────┘
```

### Key differences from v1 plan:

| Aspect | v1 (old plan) | v2 (current plan) |
|---|---|---|
| **Game stars** | Separate as `game_score`, still fed into profile | **Removed entirely.** Games produce score + coins only |
| **Game → coins** | +3 coins per game, no daily cap | **+1 coin per game per day max** (each game = 1 mission) |
| **Badge → coins** | +10 coins per badge (any tier) | **+1 coin per badge tier** (up to 4/day) |
| **Daily max coins** | ~15+ (no hard cap) | **~8–10 coins/day** (soft cap via design) |
| **Item pricing** | 5–150 coins | **6–150 coins** (tuned for 8 coins/day earning rate) |
| **Catalog size** | 14 items | **22 items** (8 new additions) |
| **Game score role** | Badge calculation input | **Leaderboard only** — no effect on badges, items, or progression |

---

## 4. Key Design Decisions

### Decision 1: Remove `addStudyStars()` from games entirely

**No game star currency.** Games produce only:
- **Score** → Hall of Fame leaderboard only (no badge/currency effect)
- **Coins** → shop currency (earned once per game per day)

The `addStudyStars()` bridge function and all game-side calls to it will be **deleted**. This is the cleanest separation — games and study become completely independent reward tracks.

**Files to change:**
- `games/src/profile/profileBridge.ts` — remove `addStudyStars()` (or rename to game-specific coin award)
- `games/src/modes/sushi/SushiMode.tsx` — remove `addStudyStars()` call on correct answer
- `games/src/modes/matching/MatchingMode.tsx` — remove `addStudyStars()` call on correct match

### Decision 2: Coins are a savings model

Coins accumulate across days — there is no daily reset on the coin balance. Kids save up over multiple days to buy bigger items. This teaches delayed gratification and gives them a goal to work toward.

### Decision 3: Score is leaderboard-only

Game score (`state.score`) serves **only** the Hall of Fame leaderboard. It has no effect on badges, items, or any other progression system. This means we should calibrate scores between games (see §6).

### Decision 4: Badges remain study-purist

Only `write_score` and `study_score` (from flashcards, writing practice, and quizzes) count toward daily badges. Game contributions are zero.

---

## 5. Badge Rebalancing

### 5.1 Change: Games no longer contribute to badges

Since games are stripped of `addStudyStars()` entirely, badges are **automatically pure** — they only see real study/writing scores. No code change to badge calculation is needed beyond removing the game star calls.

| Badge | Threshold | Expected Daily Reality |
|---|---|---|
| 🥉 Keep Going! | 50 | ~10–20 mins of study → reasonable |
| 🏅 Practice Hero | 150 | ~30–45 mins → achievable but earned |
| 🌟 Rising Star | 300 | ~1 hour → a great day |
| 🐼 Panda Master | 500 | ~1.5+ hours → rare, special |

**Keep thresholds as-is** and monitor after implementation.

---

## 6. Game Score Calibration

Since score is now purely for the leaderboard, both games should produce **comparable score ranges** so neither game is inherently "better" for climbing the Hall of Fame.

### Current state (uncalibrated):

| Metric | Sushi Mode (75s) | Flash Match (45s) | Ratio |
|---|---|---|---|
| **Stars per round** | ~34 | ~87 | Flash is ~2.6× higher |
| **Score per round** | ~74 | ~222 | Flash is ~3× higher |
| **Duration** | 75s | 45s | Flash is 60% shorter |

**This is unfair** — Flash Match gives ~3× the leaderboard score in 60% of the time.

### Score formula analysis:

**Sushi** (`applyCorrect` in `scoring.ts`):
```
score += 3 (first try stars) + min(combo, 5)
```
Per correct: 4–8 points. With 12 orders: ~74 total.

**Flash Match** (`dispatch({ type: 'CORRECT' })` → same `applyCorrect`):
```
score += 3 + min(combo, 5)
```
Same formula but many more matches (29 per full run). Per match: 4–8 points.

**The discrepancy comes from match count, not formula.** Flash Match runs through more rounds/stages in the same time, generating more scoring events.

### Calibration target:

Both games should max out in the **150–300 score range** for a skilled play:

| Game | Target Score Range (skilled) |
|---|---|
| Sushi Mode | 150–250 |
| Flash Match | 150–250 |
| Future games | 150–250 |

### Proposed fix:

Since both games use the same `applyCorrect()` from `scoring.ts`, and the score difference comes from Flash Match generating more correct actions per second, the calibration needs to reduce Flash Match's per-action score weight.

**Approach:** Add a `gameId` parameter to `applyCorrect()` so different games can use different scoring multipliers:

```ts
// In scoring.ts — ACTUAL IMPLEMENTED VALUES
const SCORE_MULTIPLIERS: Record<string, number> = {
  sushi: 1.0,      // baseline
  matching: 0.33,   // Flash Match has more actions → divide by ~3
};

export function applyCorrect(prev: ScoreState, attempts: number, gameId?: string): ScoreState {
  const multiplier = SCORE_MULTIPLIERS[gameId ?? 'sushi'] ?? 1.0;
  const stars = attempts === 1 ? 3 : 1;
  const combo = prev.combo + 1;
  const gained = stars + Math.min(combo, 5);
  const score = prev.score + Math.round(gained * multiplier);
  // ...
}
```

> **Actual calibration result:** Flash Match scoring multiplier set to **0.33** (not 0.5 as originally planned). Testing showed 0.33 better balanced the leaderboard — old Flash Match scores (~200+) are divided by 3 on page load via a one-time migration (both localStorage and Supabase).

This keeps the leaderboard fair while letting each game's internal feel unchanged. Future games simply add their multiplier to the lookup table.

---

## 7. Shop Economy

### 7.1 New Currency: 🪙 Coins

Coins are a **slow, cumulative saving currency** — max ~8–10 per day, never reset.

### 7.2 Coin Sources

| Source | Coins | Frequency | Daily Max |
|---|---|---|---|
| **🎮 Complete a game** (win) | +1 🪙 | Once per game per day | 3 (3 games) |
| **🏅 Earn a daily badge** (per tier) | +1 🪙 | Once per tier per day | 4 (4 tiers) |
| **📅 Daily login** (visit arena) | +1 🪙 | Once per day | 1 |
| **📅 Weekly streak** (7-day streak) | +2 🪙 | Once per week | ~0.3/day avg |
| **Total daily max** | | | **~8–10 🪙** |

#### Daily coin cap design:

```
        ┌──────────────────────────────┐
        │       DAILY COIN CAP          │
        │                               │
        │  📅 Daily login  ───→  +1 🪙  │  ← 1 coin per day (arena visit)
        │  Sushi Mode  ───────→  +1 🪙  │  ← 1 coin per game per day
        │  Flash Match ───────→  +1 🪙  │
        │  Future Game ───────→  +1 🪙  │
        │                               │
        │  Keep Going!  ───────→  +1 🪙  │  ← 1 coin per badge tier
        │  Practice Hero ──────→  +1 🪙  │
        │  Rising Star  ───────→  +1 🪙  │
        │  Panda Master ───────→  +1 🪙  │
        │                               │
        │  ≈ 8–10 coins/day total       │
        └──────────────────────────────┘
```

**Important constraints:**
- Playing the same game twice in a day does NOT earn a second coin
- Badge coin is earned once per tier per day (e.g., if you reach Panda Master, you get 4 coins — one for each tier passed)
- Coins never expire or reset

### 7.3 Coin Sinks (Item Prices)

Items are priced so that a kid earning ~8 coins/day can:

| Goal | Timeframe |
|---|---|
| First item (🍬 Candy Bag) | Day 1 ✅ |
| Second item (🎋 Bamboo Stick) | ~Day 3 ✅ |
| A mid-range item | ~1 week |
| Premium item (🐉 Dragon Staff) | ~3+ weeks |

### 7.4 Storage

```js
profile.coins = 0;              // spendable balance
profile.coins_earned_total = 0; // lifetime coins earned (for stats)
profile.coins_sources = {       // daily tracking for caps
  daily_login: "2025-09-25",    // +1 coin per day (arena visit)
  game_sushi: "2025-09-25",
  game_matching: "2025-09-25",
  badge_keep_going: "2025-09-25",
  badge_practice_hero: null,
  badge_rising_star: null,
  badge_panda_master: null,
};
```

> **Note:** Future games are added to `coins_sources` by convention using the format `game_{gameId}`. Each unique `gameId` gets its own daily cap — 1 coin per game per day, enforced by checking if today's date matches the stored date for that key. This extends automatically to any new game without code changes to the cap system.
>
> **Note:** `daily_login` is a special source that awards +1 coin per day just for visiting the arena page. Like game coins, it's daily-capped — once earned, revisiting the page the same day gives nothing.

#### Toast notification on daily login coin

When a user visits **arena.html**, `study.html`, or **write.html** for the first time each day, they receive a subtle slide-in toast notification:

```
🪙 +1 Daily login coin!
```

- The toast appears at the **top-right** of the screen (positioned via global `#toast-container` + `design-system.css`)
- Auto-dismisses after **2.5 seconds** with a fade-out animation (`toastOut`)
- Only shows on **first visit of the day** — subsequent page visits return 0 coins, so no toast
- Each page has its own `showToast()` implementation with consistent behavior
- No game bundle rebuild needed (no cache buster bump)

### 7.5 Unlocking vs Purchasing

**Old system:** `_checkEffortItemUnlock()` auto-unlocked items when total stars crossed thresholds.

**New system:**
- Items are **displayed in the Shop** on `progress.html`
- Each item shows a **lock icon** + **price tag** (`🪙 6`)
- Owned items show a **checkmark** or **"Owned"** badge
- Tapping a locked item shows: "Cost: 6 🪙. Buy?"
- After purchase, item appears in **Collection** (same shelf concept)
- `_checkEffortItemUnlock()` is **removed**

### 7.6 Data Migration

For existing users who already earned items via stars:
- All previously earned items remain owned (stored in `xhz_items_[profileId]`)
- Award a one-time coin bonus: **5 coins per previously earned item**
- New items must be purchased with coins

---

## 8. Item Catalog (Expanded)

### 8.1 New Items Added

8 new items bring the catalog from **14 → 22 items**:

| # | Item | Emoji | Category | New? |
|---|---|---|---|---|
| 1 | Candy Bag | 🍬 | food | |
| 2 | Lollipop | 🍭 | food | **🆕** |
| 3 | Giant Dumpling | 🥟 | food | |
| 4 | Boba Tea | 🧋 | food | |
| 5 | Ice Cream | 🍦 | food | **🆕** |
| 6 | Golden Dumpling | ✨ | food | |
| 7 | Donut | 🍩 | food | **🆕** |
| 8 | Bamboo Stick | 🎋 | tool | |
| 9 | Wooden Sword | 🗡️ | tool | |
| 10 | Ink Brush | 🖌️ | tool | |
| 11 | Dragon Staff | 🐉 | tool | |
| 12 | Party Popper | 🎊 | tool | **🆕** |
| 13 | Paper Lantern | 🏮 | tool | **🆕** |
| 14 | Straw Hat | 👒 | accessory | |
| 15 | Magic Fan | 🪭 | accessory | |
| 16 | Dragon Cape | 🦸 | accessory | |
| 17 | Hair Bow | 🎀 | accessory | **🆕** |
| 18 | Cool Glasses | 🕶️ | accessory | **🆕** |
| 19 | Sparkle Aura | 🌟 | aura | |
| 20 | Flame Aura | 🔥 | aura | |
| 21 | Rainbow Aura | 🌈 | aura | |
| 22 | Star Glow | 💫 | aura | **🆕** |

### 8.2 Pricing (tiered by category + progression)

| Category | Coins | Days to afford | How many items |
|---|---|---|---|
| 🍬 Food | 6 / 10 / 15 / 20 / 25 / 30 / 40 | 1–6 days | 7 |
| 🛠️ Tool | 15 / 25 / 40 / 65 / 80 / 100 | 3–14 days | 6 |
| 👒 Accessory | 20 / 30 / 55 / 70 / 90 | 3–13 days | 5 |
| 🌟 Aura | 20 / 50 / 85 / 150 | 3–22 days | 4 |

### 8.3 Full Price Table

| # | Item | Emoji | Category | 🪙 Price | Days to afford (~8 coin/day) |
|---|---|---|---|---|---|
| 1 | Candy Bag | 🍬 | food | **6** | Day 1 |
| 2 | Lollipop | 🍭 | food | **10** | Day 2 |
| 3 | Bamboo Stick | 🎋 | tool | **15** | Day 3 |
| 4 | Ice Cream | 🍦 | food | **15** | Day 3 |
| 5 | Straw Hat | 👒 | accessory | **20** | Day 4 |
| 6 | Sparkle Aura | 🌟 | aura | **20** | Day 4 |
| 7 | Donut | 🍩 | food | **20** | Day 4 |
| 8 | Giant Dumpling | 🥟 | food | **25** | Day 5 |
| 9 | Wooden Sword | 🗡️ | tool | **25** | Day 5 |
| 10 | Magic Fan | 🪭 | accessory | **30** | Day 6 |
| 11 | Boba Tea | 🧋 | food | **30** | Day 6 |
| 12 | Hair Bow | 🎀 | accessory | **30** | Day 6 |
| 13 | Party Popper | 🎊 | tool | **40** | ~1 week |
| 14 | Flame Aura | 🔥 | aura | **50** | ~1 week |
| 15 | Ink Brush | 🖌️ | tool | **50** | ~1 week |
| 16 | Dragon Cape | 🦸 | accessory | **55** | ~1 week |
| 17 | Cool Glasses | 🕶️ | accessory | **55** | ~1 week |
| 18 | Paper Lantern | 🏮 | tool | **65** | ~10 days |
| 19 | Dragon Staff | 🐉 | tool | **80** | ~12 days |
| 20 | Star Glow | 💫 | aura | **85** | ~13 days |
| 21 | Rainbow Aura | 🌈 | aura | **100** | ~2 weeks |
| 22 | Golden Dumpling | ✨ | food | **100** | ~2 weeks |


### 8.4 Spending Pace Example

| Day | Coins earned | Coins spent | Balance | Purchase |
|---|---|---|---|---|
| 1 | +8 | -6 | 2 | 🍬 Candy Bag |
| 2 | +8 | 0 | 10 | Saving |
| 3 | +8 | -15 | 3 | 🎋 Bamboo Stick |
| 4 | +8 | 0 | 11 | |
| 5 | +8 | 0 | 19 | |
| 6 | +8 | -20 | 7 | 👒 Straw Hat |
| ... | | | | |

### 8.5 Category Balance

| Category | Count | Price range | Purchase frequency |
|---|---|---|---|
| 🍬 Food | 7 | 6–100 | Most frequent (cheapest, most variety) |
| 🛠️ Tool | 6 | 15–80 | Moderate |
| 👒 Accessory | 5 | 20–55 | Moderate |
| 🌟 Aura | 4 | 20–150 | Least frequent (premium, long-term goals) |
| **Total** | **22** | **6–150** | |

---

## 9. Panda Mascot Interactive Display

*(Unchanged from v1 — see original document for full details)*

### 9.1 Vision

A dedicated interactive panda display where:
- Items are arranged in **slots** around the panda (not just a flat shelf)
- Selecting an item shows it on the panda's body
- Items in the same **category** conflict (can't be on simultaneously)
- The panda has subtle reactions (blink, eat food animation, hold tools)

### 9.2 Category → Body Location Mapping

| Category | Location | Visual |
|---|---|---|
| **food** | Mouth / held in paws | Panda holds/drinks the item |
| **tool** | Held in right paw | Panda holds the tool |
| **accessory** | Head / body | Hat on head, cape on back, fan in paw |
| **aura** | Surrounding | Glow/sparkles around the panda body |

### 9.3 Implementation

**Start with Option A: Pure CSS/HTML on progress.html**
- Panda represented as a div with positioned emoji/character
- Items appear as absolutely positioned elements around it
- CSS transitions for equip/unequip animations
- Upgrade to SVG later if needed

---

## 11. Paper Doll Asset Inventory

### 11.1 Asset Locations

| Layer | Directory |
|---|---|
| **Base poses** (4 variants) | `assets/mascot/` |
| **Overlay layers** (all items) | `assets/avatars/` |

### 11.2 Base — 4 Variant Poses

All saved to `assets/mascot/` as **500×500px transparent PNGs**:

| Filename | Variant | When it displays |
|---|---|---|
| `panda_stand.png` | Stand-still 🐼 | No food, no tool equipped |
| `panda_foody.png` | Foody 🍭 | Food equipped, no tool |
| `panda_warrior.png` | Warrior ⚔️ | Tool equipped, no food |
| `panda_foody_warrior.png` | Foody Warrior ⚔️🍭 | Both food + tool equipped |

> **Fallback:** If a variant PNG is missing, the code falls back to `panda_dojo.png`.

### 11.3 Overlay Layers — Complete Item Asset Table

All saved to `assets/avatars/` as **500×500px transparent PNGs**.

Naming convention: **`{layer}_{item_id}.png`**

#### Auras (z-index: 10 — Background glow)

| Item ID | Filename | Emoji |
|---|---|---|
| `sparkle_aura` | `aura_sparkle.png` | 🌟 |
| `flame_aura` | `aura_flame.png` | 🔥 |
| `rainbow_aura` | `aura_rainbow.png` | 🌈 |
| `star_glow` | `aura_star_glow.png` | 💫 |

#### Clothing (z-index: 30 — Body overlay)

| Item ID | Filename | Emoji |
|---|---|---|
| `dragon_cape` | `clothing_dragon_cape.png` | 🦸 |
| `silk_scarf` | `clothing_silk_scarf.png` | 🧣 |
| `jade_ring` | `clothing_jade_ring.png` | 💍 |

#### Headwear (z-index: 40 — Head/face area)

| Item ID | Filename | Emoji |
|---|---|---|
| `straw_hat` | `head_straw_hat.png` | 👒 |
| `magic_fan` | `head_magic_fan.png` | 🪭 |
| `hair_bow` | `head_hair_bow.png` | 🎀 |
| `cool_glasses` | `head_cool_glasses.png` | 🕶️ |
| `golden_crown` | `head_golden_crown.png` | 👑 |

#### Tools (z-index: 45 — Back hand / paw area)

| Item ID | Filename | Emoji |
|---|---|---|
| `bamboo_stick` | `tool_bamboo_stick.png` | 🎋 |
| `scroll` | `tool_scroll.png` | 📜 |
| `lantern` | `tool_lantern.png` | 🏮 |
| `wooden_sword` | `tool_wooden_sword.png` | 🗡️ |
| `ink_brush` | `tool_ink_brush.png` | 🖌️ |
| `dragon_staff` | `tool_dragon_staff.png` | 🐉 |

#### Food (z-index: 55 — Front hand / mouth area)

| Item ID | Filename | Emoji |
|---|---|---|
| `candy_bag` | `food_candy_bag.png` | 🍬 |
| `lollipop` | `food_lollipop.png` | 🍭 |
| `ice_cream` | `food_ice_cream.png` | 🍦 |
| `dumpling` | `food_dumpling.png` | 🥟 |
| `boba_tea` | `food_boba_tea.png` | 🧋 |
| `moon_cake` | `food_moon_cake.png` | 🥮 |

### 11.4 Layer Stack Summary

```
Back ——————————————————————————————————————→ Front
 ┌─────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
 │  Aura   │  Base    │ Clothing │  Head    │  Tool    │  Food    │
 │ z:10    │  z:20    │  z:30    │  z:40    │  z:45    │  z:55    │
 ├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
 │ aura_*  │ panda_*  │clothing_*│ head_*   │ tool_*   │ food_*   │
 │ .png    │ .png     │ .png     │ .png     │ .png     │ .png     │
 └─────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

### 11.5 Rules for All Assets

1. **Canvas:** Every single PNG must be exactly **500×500px** (uniform throughout)
2. **Transparency:** All assets are transparent PNGs — only the art is opaque
3. **Positioning:** Baked into the image by the designer — CSS does **no** positioning, margins, tops, or lefts
4. **Naming:** `{layer}_{item_id}.png` — lowercase, snake_case, no spaces
5. **Base poses:** 4 separate full-body PNGs, one per variant
6. **Overlays:** Each item is drawn on the full 500×500 canvas at the correct position for its layer
   - E.g., a Straw Hat appears at the top of the canvas; a Lollipop appears near the mouth area
7. **Fallback:** The HTML already has `onerror="this.src='assets/mascot/panda_dojo.png'"` on the base `<img>` — so any missing variant gracefully falls back

### 11.6 Total Asset Count

| Type | Count |
|---|---|
| Base poses | 4 PNGs |
| Auras | 4 PNGs |
| Clothing | 3 PNGs |
| Headwear | 5 PNGs |
| Tools | 6 PNGs |
| Food | 6 PNGs |
| **Total** | **28 PNGs** |

---

## 10. Implementation Phases

### ✅ Phase 1: Strip Game Stars & Decouple Scoring (COMPLETE)

**Files affected:** `games/src/profile/profileBridge.ts`, `games/src/modes/sushi/SushiMode.tsx`, `games/src/modes/matching/MatchingMode.tsx`, `games/src/core/systems/scoring.ts`, `games/src/core/state/gameState.tsx`

**Changes:**
1. ✅ Removed `addStudyStars()` from `profileBridge.ts`
2. ✅ Removed `addStudyStars()` calls from SushiMode.tsx and MatchingMode.tsx
3. ✅ Removed `stars` field from `ScoreState` (gameState.tsx, scoring.ts)
4. ✅ Removed `bestStars` from `HallOfFameEntry` type and `hallOfFame.ts` sort logic
5. ✅ Removed `bestStars` from `dojo.html` plain JS leaderboard (5 references)
6. ✅ Score calibration: Flash Match scores multiplied by 0.33 via `gameId` param
7. ✅ Old Flash Match scores migrated (divided by 3) — both localStorage and Supabase
8. ✅ Game score now purely feeds Hall of Fame (no badge/item effect)
9. ✅ Added `npm run watch` (vite build --watch) for auto-rebuild

**Extra work (scope expansion):**
- Removed `stars` field entirely from ScoreState + all game HUD/result screen displays
- Removed `bestStars` from Hall of Fame (local + global leaderboards)
- One-time migrations: localStorage (`xhz_hof_migrated_v1`) and Supabase (`xhz_supabase_hof_migrated_v1`)
- Added `cache-buster` tracking section to activeContext.md

**Effort:** ~1 day  
**Risk:** Low — all changes verified, TypeScript compiles clean

### ✅ Phase 2: Coin Economy + Daily Cap System (COMPLETE)

**Files changed:** `profiles.js`, `rewards.json`, `games/src/profile/profileBridge.ts`, `games/src/modes/matching/MatchingMode.tsx`, `games/src/modes/sushi/SushiMode.tsx`, `strings.js`

**Changes (all implemented):**
1. Added `coins`, `coins_earned_total`, `coins_sources` fields to profile model ✅
2. Added `addCoins(profileId, amount, source)` and `spendCoins(profileId, amount)` methods ✅
3. Added daily cap enforcement via `coins_sources` date tracking (once per source per day) ✅
4. Award coin on game completion via `awardGameCoin(gameId)` bridge ✅
5. Award coin on badge tier reached in `addScore()` (fixed: per tier, not all tiers) ✅
6. Removed `_checkEffortItemUnlock()` — items no longer auto-unlock ✅
7. Updated `rewards.json` with 22 items using `coin_cost` instead of `min_stars` ✅
8. Migration: existing earned items kept + 5 coins per item awarded ✅
9. Updated `items_empty` string in `strings.js` to reference coins ✅
10. Fixed badge coin awarding bug (was looping all 4 tiers on any badge change) ✅

**Remaining for Phase 3:** Shop UI on `progress.html` (purchase flow, daily cap indicators)

### Phase 3: Shop UI

**Files affected:** `progress.html`, `strings.js`, `shared/design-system.css`

**Changes:**
1. Add "🏪 Shop" section to progress page
2. Show all 22 items with prices and owned status
3. Purchase flow: tap → confirm → deduct coins → add to earned
4. Daily cap indicators (show remaining coins available today)
5. Toast/confirmation animation on purchase
6. Empty state (no coins yet, hint to play games/study)

**Effort:** ~2 days  
**Risk:** Low — UI only, data model established in Phase 2

### ✅ Phase 4: Score Calibration (COMPLETE)

**Files changed:** `games/src/core/systems/scoring.ts`, `games/src/core/state/gameState.tsx`, `games/src/modes/matching/MatchingMode.tsx`, `games/src/modes/sushi/SushiMode.tsx`

**Changes (all implemented in Session 44 alongside Phase 1):**
1. Added `gameId` parameter to `applyCorrect()` in `scoring.ts` ✅
2. Added `SCORE_MULTIPLIERS` lookup table (sushi: 1.0, matching: 0.33) ✅
3. Passed `gameId` through `dispatch({ type: 'CORRECT', attempts, gameId })` ✅
4. Old Flash Match scores migrated (divided by 3) — both localStorage and Supabase ✅

**Actual multiplier:** 0.33 (not 0.5 as originally planned). Testing showed 0.33 better balanced the leaderboard.

**Effort:** ~1 day (done alongside Phase 1)  
**Risk:** Low ✅ — Verified, TypeScript compiles clean

### Phase 5: Panda Interactive Display

**Files affected:** `progress.html`, `strings.js`

**Changes:**
1. Add panda display section to progress page
2. Position panda with CSS grid/flex
3. Item slots arranged around panda by category
4. Equip/unequip interaction (improved from current basic toggle)
5. Equipped items render on panda (positioned absolutely)
6. Simple CSS animations for equip (fade-in, scale)
7. Same-category conflict enforcement (already exists in `equipItem()`)

**Effort:** ~3 days  
**Risk:** Medium — visual polish across screen sizes

### Phase 6: Polish & Tuning

**Changes:**
1. Tune coin economy based on real usage data
2. Add coin animations (similar to sushi game's coin popups)
3. Panda animations (blink, eat, celebrate)
4. Sound effects for purchases and badge conversions
5. Add Shop entry point on dojo page and study/write pages

**Effort:** ~2 days  
**Risk:** Low

---

## Summary: Data Model Changes

### Profile Object (new fields)

```js
// Current profile:
{
  id: "xhz_abc123",
  nickname: "Mia",
  avatar: "🐼",
  color: { name: "Orange", hex: "#FFB347" },
  is_guest: true,
  created_at: "2025-07-01",
  equipped_items: { food: "candy_bag", tool: "bamboo_stick" },
  // NEW:
  coins: 45,
  coins_earned_total: 120,
  coins_sources: {
    daily_login: "2025-09-25",
    game_sushi: "2025-09-25",
    game_matching: "2025-09-22",
    badge_keep_going: "2025-09-25",
    badge_practice_hero: "2025-09-23",
  }
}
```

### Daily Entry (unchanged — games no longer write to profile)

```js
// Current daily entry:
{
  write_score: 12,
  study_score: 8,
  chars_practiced: ["1A_001", "1A_002"],
  cards_studied: ["1A_003"],
  badge: "rising_star",
  study_badge: "good_learner",
  write_attempts: { "1A_001": 2 },
  // NO game_score field needed — games don't write to study/badge system
}
```

### rewards.json (updated with 22 items + coin prices)

```json
{
  "effort_items": [
    {
      "id": "candy_bag",
      "label": "Candy Bag",
      "emoji": "🍬",
      "category": "food",
      "coin_cost": 6,
      "message": "You bought a Candy Bag! Sweet!"
    },
    {
      "id": "lollipop",
      "label": "Lollipop",
      "emoji": "🍭",
      "category": "food",
      "coin_cost": 10,
      "message": "Lollipop — a sweet treat!"
    },
    // ... 20 more items
  ]
}
```

---

## Change Log

| Version | Date | Changes |
|---|---|---|
| v1 | 2025-07-23 | Initial draft |
| v2 | 2025-07-23 | Removed game stars entirely; redesigned coin economy (1 coin/game/day + badge coins, max ~7-9/day); adjusted prices (6-150); expanded catalog to 22 items; added score calibration section |
| v3 | 2025-07-24 | Phases 1, 2, 4 fully implemented; updated status tracking
| v4 | 2025-09-25 | Added daily login coin (+1/day, source `daily_login`); updated daily max to ~8–10 coins; updated coin sources table and storage example
| v5 | 2025-09-25 | Added visual toast notification on daily login coin award (arena.html, study.html, write.html)
