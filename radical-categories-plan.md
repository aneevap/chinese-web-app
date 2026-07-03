# 🧪 Radical Categorization Plan — Doodle God Style Discovery

## Final Design Decisions

### Data Sources
- **radicals.json**: 230 entries → **218 unique** after removing 12 traditional variants (馬→马, 車→车, 鳥→鸟, etc.)
- **reactions.json**: 2,502 2-radical reactions for the mixing lab
- **chinese-lexicon-master**: Movie char frequency (SUBTLEX-CH) + Book char frequency (Jun Da) for ranking

---

## 1. Leveling Radicals (70 levels)

Sorted by: movie+book frequency rank, with reactions count as tiebreaker for variant forms that lack standalone frequency.

### Tier 1 — Frequency Ranked (Levels 1-51)

| Lv | Char | Doodle Cat | Reactions | Mov Rank | Bk Rank |
|:--:|:----:|:----------:|:---------:|:--------:|:-------:|
| 1 | 人 | body | 25 | #17 | #7 |
| 2 | 大* | abstract | 20 | #57 | #17 |
| 3 | 子 | body | 20 | #47 | #37 |
| 4 | 心 | body | 57 | #89 | #90 |
| 5 | 力 | abstract | 36 | #184 | #106 |
| 6 | 者 | abstract | 21 | #193 | #103 |
| 7 | 工 | civilization | 20 | #185 | #118 |
| 8 | 女 | body | 83 | #105 | #224 |
| 9 | 又 | abstract | 52 | #229 | #126 |
| 10 | 日* | nature | 58 | #317 | #101 |
| 11 | 白 | nature | 21 | #195 | #286 |
| 12 | 门 | civilization | 21 | #297 | #185 |
| 13 | 非 | other | 23 | #209 | #283 |
| 14 | 马 | fauna | 31 | #233 | #276 |
| 15 | 车 | civilization | 26 | #153 | #361 |
| 16 | 口 | body | 252 | #344 | #212 |
| 17 | 目* | body | 50 | #326 | #239 |
| 18 | 月 | nature | 12 | #416 | #169 |
| 19 | 金* | nature | 20 | #365 | #260 |
| 20 | 火 | nature | 67 | #378 | #433 |
| 21 | 言 | body | 97 | #511 | #355 |
| 22 | 各* | other | 21 | #658 | #209 |
| 23 | 王* | civilization | 45 | #652 | #299 |
| 24 | 山 | nature | 48 | #699 | #259 |
| 25 | 止 | body | 17 | #467 | #596 |
| 26 | 米 | fauna | 29 | #512 | #575 |
| 27 | 足 | body | 53 | #692 | #527 |
| 28 | 石* | nature | 53 | #835 | #414 |
| 29 | 广 | civilization | 31 | #1000 | #468 |
| 30 | 土* | nature | 89 | #1008 | #515 |
| 31 | 贝* | fauna | 37 | #395 | #1133 |
| 32 | 鱼 | fauna | 26 | #810 | #852 |
| 33 | 木* | nature | 174 | #996 | #694 |
| 34 | 耳 | body | 25 | #1101 | #887 |
| 35 | 刀 | civilization | 9 | #985 | #1067 |
| 36 | 雨 | nature | 25 | #1229 | #928 |
| 37 | 田 | nature | 18 | #1566 | #778 |
| 38 | 鸟 | fauna | 27 | #1187 | #1263 |
| 39 | 虫 | fauna | 76 | #1224 | #1287 |
| 40 | 羊 | fauna | 27 | #1429 | #1337 |
| 41 | 页 | body | 24 | #1722 | #1128 |
| 42 | 欠 | other | 23 | #1270 | #1948 |
| 43 | 寸 | abstract | 19 | #1712 | #1904 |
| 44 | 巾 | civilization | 22 | #1726 | #2281 |
| 45 | 穴* | civilization | 23 | #2152 | #1940 |
| 46 | 禾 | fauna | 42 | — | #3587 |
| 47 | 皿 | civilization | 18 | — | #3763 |
| 48 | 酉 | civilization | 31 | — | #3839 |
| 49 | 钅 | civilization | 78 | — | #5557 |
| 50 | 隹 | fauna | 29 | — | #5837 |
| 51 | 攵 | other | 28 | — | #5985 |

### Tier 2 — Reaction Sorted (Levels 52-65, variant forms)

| Lv | Char | Doodle Cat | Reactions | Note |
|:--:|:----:|:----------:|:---------:|:-----|
| 52 | 氵 | nature | 244 | +award 水(bonus) |
| 53 | 扌 | body | 214 | +award 手(bonus) |
| 54 | 艹 | nature | 147 | +award 草(missing from data) |
| 55 | 亻 | body | 135 | **merged with 人** |
| 56 | 忄 | body | 92 | **merged with 心** |
| 57 | 辶 | body | 86 | +award 走(bonus) |
| 58 | 讠 | body | 81 | **merged with 言** |
| 59 | ⺼ | body | 80 | +award 肉(bonus) |
| 60 | 纟 | civilization | 73 | +award 糸(bonus) |
| 61 | 疒* | other | 61 | also chainable |
| 62 | ⺮ | nature | 61 | +award 竹(bonus) |
| 63 | 阝 | civilization | 56 | +award 阜(missing) |
| 64 | 刂 | civilization | 49 | **merged with 刀** |
| 65 | 犭 | other | 45 | +award 犬(bonus) |

### Tier 3 — Remaining + Promoted (Levels 66-70)

| Lv | Char | Doodle Cat | Reactions | Note |
|:--:|:----:|:----------:|:---------:|:-----|
| 66 | 宀 | civilization | 40 | |
| 67 | 衤 | other | 31 | +award 衣(bonus) |
| 68 | 卩 | civilization | 22 | |
| 69 | 礻 | other | 22 | |
| 70 | 饣 | civilization | 20 | +award 食(bonus) |

**\* = chainable through mixing** — can be discovered in the lab before leveling up to this level. See §4 for spare replacements.

---

## 2. Variant + Full-Character Pairs

When a radical is unlocked, its full-character counterpart is also awarded (same meaning, different form).

### Merged Pairs (both were leveling — now 1 level instead of 2)
| Variant | Full | Kept Level | Frees Slot |
|:-------:|:----:|:----------:|:----------:|
| 亻 (person) | 人 (person) | 人's level | ✅ freed |
| 忄 (heart) | 心 (heart) | 心's level | ✅ freed |
| 讠 (speech) | 言 (speech) | 言's level | ✅ freed |
| 钅 (metal) | 金 (metal) | 金's level | ✅ freed |
| 刂 (knife) | 刀 (knife) | 刀's level | ✅ freed |

### Bonus Pairs (variant leveled, full was decomposition)
| Unlock This | Also Get |
|:-----------:|:--------:|
| 氵 (water) | 水 (water) |
| 扌 (hand) | 手 (hand) |
| 辶 (walk) | 走 (walk) |
| ⺼ (flesh) | 肉 (meat) |
| 纟 (silk) | 糸 (silk) |
| 饣 (food) | 食 (food) |
| 犭 (dog) | 犬 (dog) |
| 衤 (clothing) | 衣 (clothing) |
| ⺮ (bamboo) | 竹 (bamboo) |
| **火 (fire)** | **灬 (fire dots)** |

### Missing Full Counterparts (not in radicals.json)
- 草 (grass) — 艹's full form, not in data
- 阜 (mound) — 阝's full form, not in data

---

## 3. Promoted from Decomposition (5 new leveling radicals)

Filled the 5 freed slots from merged pairs with these decomposition-only radicals:

| Lv Range | Char | Meaning | Reactions | Movie Rank | Doodle Cat |
|:--------:|:----:|:--------|:---------:|:----------:|:----------:|
| late | **一** | one | 5 | **#9** | abstract |
| late | **小** | small | 3 | **#82** | abstract |
| late | **母** | mother | 3 | **#443** | body |
| late | **风** | wind | 6 | **#505** | nature |
| late | **龙** | dragon | 12 | **#1122** | fauna |

These have low reactions (hard to discover through mixing), so they're valuable as level-up rewards in later levels.

---

## 4. Chainable Leveling Radicals — Spare List

If a player discovers a leveling radical through mixing BEFORE earning it through leveling, the level-up reward is replaced with the spare:

| Chainable Radical | Scheduled Level | Replacement | Replacement Role |
|:-----------------:|:---------------:|:-----------:|:----------------:|
| 大 (big) | early | 公 (public) | abstract concept |
| 日 (sun) | early | 合 (combine) | Doodle God "combine" |
| 目 (eye) | mid | 彳 (step) | walking step radical |
| 木 (tree) | mid | 冫 (ice) | ice, basic element |
| 土 (earth) | mid | 生 (life) | life/birth, movie #48 |
| 金 (gold) | mid | 青 (blue) | color, nature |
| 王 (king) | mid | 弓 (bow) | tool, weapon |
| 贝 (shell) | mid | 羽 (feather) | bird component |
| 石 (stone) | mid | 气 (air) | air, basic element |
| 穴 (cave) | late | 戈 (spear) | ancient weapon |
| 疒 (sick) | late | 包 (wrap) | wrap, very productive |
| 各 (each) | late | 令 (order) | command, common word |

**Logic**: At level-up, system checks `player.earned_radicals`. If the scheduled radical is already owned (discovered through mixing), award the replacement instead.

---

## 5. Doodle God Categories

| Category | Count | Emoji | Color | Radicals |
|:---------|:-----:|:-----:|:------|:---------|
| **body** | 17 | 👤🖐️ | Coral #FF7043 | 人 子 心 女 口 目 言 止 足 耳 页 扌 亻 忄 辶 讠 ⺼ |
| **civilization** | 17 | 🏛️🔧 | Amber #FFB300 | 工 门 车 王 广 刀 巾 穴 皿 酉 钅 纟 阝 刂 宀 卩 饣 |
| **nature** | 14 | 🌿☀️ | Green #4CAF50 | 日 白 月 金 火 山 石 土 木 雨 田 氵 艹 ⺮ |
| **fauna** | 9 | 🌸🐾 | Pink #EC407A | 马 米 贝 鱼 鸟 虫 羊 禾 隹 |
| **abstract** | 5 | ✨🔢 | Indigo #5C6BC0 | 大 力 者 又 寸 |
| **other** | 8 | ❓ | Grey | 非 各 欠 攵 疒 犭 衤 礻 |
| **Total** | **70** | | | |

**Remaining**: 148 decomposition-only radicals (not listed here) are discoverable through the lab.

---

## 6. Discovery Tree (Doodle God Lab)

### Data
- **2,502** 2-radical reactions in `reactions.json`
- **54** reactions produce results that are ALSO in `radicals.json` → **chainable**
- **12** of those 54 are leveling radicals → spare list applies
- **574** reactions use only leveling radicals → available from day one

### Core Loop
1. Player selects 2 radicals they own
2. Check `reactions.json` for a matching reaction
3. If found → discover the result character
4. If result is in `radicals.json` → add to mixable collection (chain!)
5. If result is one of the 12 chainable leveling radicals → mark as "discovered early"

### Discovery Types
- **Normal** (2,448 reactions): Result is an ordinary character. Knowledge only.
- **Chainable** (54 reactions): Result IS a radical. Unlocks further mixing. Doodle God dopamine hit!
- **Early Leveling** (12 of the 54): Overlaps with leveling rewards → spare replacement at level-up.

---

## 7. Level-Up Flow

```
Player earns enough XP → Level Up at Level X
  → Determine scheduled radical for Level X
  → Check: Does player already own this radical? (from mixing?)
    → YES → award spare replacement instead
    → NO  → award scheduled radical
  → If paired: also award full-character counterpart
  → Show celebration animation
```

## 8. Next Steps

1. ⏳ **Update radicals.json** — Add `doodle_category` field, reorder by new level, move 12 trad variants to paired entries
2. ⏳ **Update lab-engine.js** — Add spare list logic, variant pair awards, chainable discovery detection
3. ⏳ **Build lab UI** — Mixing station with 2-slot selection, reaction check, discovery animation
4. ⏳ **Decomposition chamber** — 1-2/day decomposition for the remaining 148 radicals
5. ⏳ **Hint system** — When player is stuck, whisper Doodle God-style hints ("The sun and moon together...")
