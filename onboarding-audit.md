# 🧭 Onboarding UX Audit

> **Date:** June 5, 2026  
> **Source:** User feedback from a first-time visitor  
> **Purpose:** Diagnose why newcomers find the app overwhelming and propose specific improvements

---

## 1. Executive Summary

A first-time user reported that the app has **"too many things"** and is **"too difficult for a newcomer to understand where to start."** After reviewing every page in the new-user flow, this diagnosis confirms the criticism is fair.

**Root cause:** There is no guided on-ramp. New users are dropped directly into `write.html` — the most complex page in the app — with no welcome, no tutorial, no "what to do first," and a navigation bar that gives equal weight to 5 destinations when only 2 matter to a beginner.

---

## 2. User Journey Map (Current)

```
index.html (profile picker)
    │
    ├─ New user → new-learner.html (pick name + avatar)
    │                    │
    │                    └─ write.html ← FIRST EXPERIENCE (overwhelming)
    │
    └─ Returning user → directly to write.html (last known page)
```

### What a new user sees immediately:

1. A HanziWriter canvas with no instruction on how to use it
2. A grid of Chinese characters (all showing "0 stars") in a scrollable word list
3. Star counters, daily score, streak data (all zero — meaningless)
4. An auto-scroll toggle button they've never heard of
5. A notebook system with record/playback
6. A nav bar with 5 icons: **Study** · **Write** · **Print** · **Arena** · **Progress**
7. No hint about whether to Study first or Write first
8. No concept of "finished for today"

---

## 3. Specific Issues

### 3.1 No onboarding / welcome flow

| Issue | Detail |
|-------|--------|
| First screen is write.html | The most complex page in the entire app loads first |
| No tutorial overlay | No "here's how this works" — even a 3-tip tooltip would help |
| No welcome message | "Welcome, [name]! Start by studying your first character" — zero |
| No first-task guidance | No suggested action like "Try studying 3 characters" |

### 3.2 Navigation is flat — no hierarchy

The 5 nav tabs are visually equal:

```
🎴 Study    ✍️ Write    🖨️ Print    ⚔️ Arena    📊 Progress
```

**Reality:**
- **Study** (core daily activity) — needs prominence
- **Write** (core daily activity) — needs prominence
- **Print** (nice-to-have, minority use) — should be secondary
- **Arena** (reward/break, not daily) — should be secondary
- **Progress** (dashboard, for later) — should be secondary

A newcomer has no way to know which to click first, or whether they should do all five.

### 3.3 write.html is a firehose of features

The writing page packs in everything at once:

| Feature | Useful for | Distracting for new user? |
|---------|-----------|--------------------------|
| HanziWriter canvas | Core | Yes — no instruction on stroke order or quiz mode |
| Word grid (color-coded) | Navigation | Yes — mastery colors mean nothing to a beginner |
| Star counter (total) | Motivation | Yes — starts at 0, no context |
| Star counter (today) | Daily tracking | Yes — starts at 0, no goal |
| Streak display | Gamification | Yes — zero streak, meaningless |
| Auto-scroll toggle | Advanced | Yes — shouldn't appear until relevant |
| Notebook (record/play) | Advanced | Yes — hidden complexity |
| Speech engine button | Pronunciation | Maybe — potentially useful if explained |
| Camera emoji (images) | Memory aid | Maybe — potentially useful |

**Total distinct interactive elements on page load:** ~15-20

### 3.4 Arena looks like a core activity

The ⚔️ icon and equal nav placement suggest the Arena is equally important to Study and Write. But Arena is:
- A game mode for when you want a break
- Locked behind course mastery
- Not a daily learning activity

A beginner might feel pressure to "do the arena" on day one.

### 3.5 No session goal or "done" state

There's no:
- "Complete 3 characters today" counter
- "You're done for today — come back tomorrow!" message
- Visual progress toward a daily goal
- Streak incentive shown upfront

The app is **open-ended tooling** rather than a **guided practice session.**

### 3.6 Activity picker (after login) has no guidance

After creating a profile, the user sees a list of courses/activities with buttons like "Study" and "Write" — but no recommendation, no "Start here" badge, no explanation of what each does.

---

## 4. Proposed Improvements

### Priority 1: First-time redirect to study.html

**Change:** Instead of sending new users to `write.html`, redirect to `study.html` with the first word of Course 1A already loaded.

**Why:** Study is simpler — just flashcards (character → pinyin/meaning). It teaches a word *before* asking the user to write it. This establishes the learning loop: **Learn → Practice → Write**.

**Files affected:** `profiles.js` (the redirect logic after profile creation)

**Complexity:** 🟢 Trivial (change one URL path)

---

### Priority 2: Onboarding overlay / welcome card

**Change:** On first visit (localStorage flag), show a welcoming modal with 3-4 brief tips:

> **🎉 Welcome, [name]!**
>
> Here's how to get started:
>
> 1. **📖 Study first** — Learn a character's meaning and pronunciation with flashcards
> 2. **✍️ Write it** — Practice writing with stroke-by-stroke guidance
> 3. **🎯 Master it** — Get 3 stars twice in writing, and you're done!
>
> _Your first goal: complete 3 characters today._
>
> [ **Let's go! →** ]

**Why:** Sets expectations, gives a clear loop, and provides a concrete first goal.

**Complexity:** 🟢 Trivial (add HTML/CSS/JS to `write.html` or a shared script)

---

### Priority 3: Activity navigation hierarchy

**Change:** Reduce the visual weight of Print and Arena in the nav bar. Options:
- **A)** Show Study/Write as primary icons, move Print/Arena/Progress to a "⋮ More" dropdown
- **B)** Make Study/Write slightly larger or with a background, dim the others
- **C)** For new users (first 7 days), show only Study + Write + Progress, hide Print and Arena

**Why:** Clear visual priority guides the user toward what matters.

**Files affected:** `nav.js` + each page's nav bar HTML

**Complexity:** 🟡 Medium

---

### Priority 4: Progressive disclosure on write.html

**Change:** For users with zero data, hide or simplify non-essential elements:
- Hide auto-scroll toggle until first word mastered
- Hide notebook/record buttons until the user has been active for 3+ days
- Replace the "Today's score" section with a "Your goal" section showing 0/3 characters written today
- Add a subtle hint above the canvas on first visit: "✍️ Write the character shown on the right. Each stroke must match the correct order."

**Why:** Reduces cognitive load by showing features only when they're relevant.

**Files affected:** `write.html`

**Complexity:** 🟡 Medium

---

### Priority 5: Session goal system

**Change:** Introduce a simple "Session Goal" — by default, master 3 characters per day:
- Show a progress ring/bar: "📍 Today: 2 / 3 characters mastered"
- When goal is met: "🎉 You've completed today's goal! Come back tomorrow."
- Track in localStorage or profile data

**Why:** Gives a clear stopping point and sense of accomplishment. Without it, the app feels bottomless.

**Files affected:** `write.html`, `profiles.js`

**Complexity:** 🟡 Medium

---

### Priority 6: Guided activity picker

**Change:** Reorder and annotate the activity buttons (shown after selecting a profile):

```
🌟 Start here:
[ 📖 Study Course 1A ]     ← prominent, recommended badge

Then practice:
[ ✍️ Write Course 1A ]     ← visible, secondary

Extras:
[ 🖨️ Print ]  [ ⚔️ Arena ]  [ 📊 Progress ]  ← smaller, below
```

Add a brief description under each rather than just a button.

**Why:** Guides the user through the correct sequence without guessing.

**Files affected:** `write.html` (the course picker / activity selection UI)

**Complexity:** 🟢 Trivial

---

## 5. Low-fidelity Mockups

### 5.1 Welcome overlay (Priority 2)

```
┌──────────────────────────────────────┐
│  🎉           WELCOME!               │
│                                      │
│   Hi, Alex! Ready to learn           │
│   your first Chinese character?      │
│                                      │
│   Here's the loop:                   │
│                                      │
│   📖  Study → learn meaning          │
│   ✍️  Write → practice strokes       │
│   🎯  Master → get 3 stars twice     │
│                                      │
│   Your first goal:                   │
│   Master 3 characters today 💪       │
│                                      │
│        [ Let's go! → ]               │
└──────────────────────────────────────┘
```

### 5.2 New nav hierarchy (Priority 3)

```
 Current                         Proposed (Option A)
 ───────                         ───────────────────
 [🎴][✍️][🖨️][⚔️][📊]           [🎴][✍️]  [ ⋮ More ]
  S   W   P   A   P              Study Write  [Print]
                                              [Arena]
                                              [Progress]
```

### 5.3 Simplified write.html for beginners (Priority 4)

```
┌─────────────────────────────────────────────────┐
│  📍 Today: 0 / 3 characters mastered            │
│  ─────────────────────────────────────────────── │
│                                                  │
│           ┌──────────────┐                       │
│           │              │       你               │
│           │  Canvas      │                       │
│           │              │     nǐ                │
│           │              │     you (informal)    │
│           └──────────────┘                       │
│                                                  │
│   ✍️ Write each stroke in the correct order      │
│                                                  │
│  ─────────────────────────────────────────────── │
│  你  好  谢  我  是                                    │
│  ●    ○   ○   ○   ○                               │
└─────────────────────────────────────────────────┘
```

---

## 6. Implementation Recommendations

| Order | Change | Effort | Impact | Dependencies |
|-------|--------|--------|--------|-------------|
| 1 | First-time redirect to study.html | ⭐ (5 min) | 🔥 High | None |
| 2 | Guided activity picker reorder | ⭐ (15 min) | 🔥 High | None |
| 3 | Welcome overlay | ⭐⭐ (30 min) | 🔥 High | Needs string translation |
| 4 | Session goal system | ⭐⭐⭐ (1-2 hr) | 🔥🔥 Very High | `profiles.js` + `write.html` |
| 5 | Progressive disclosure on write.html | ⭐⭐⭐ (1-2 hr) | 🔥 High | write.html |
| 6 | Navigation hierarchy | ⭐⭐⭐⭐ (2-3 hr) | 🔥 High | `nav.js` + all pages |

All changes are **additive** — they don't break existing functionality, just layer guidance on top.

---

## 7. Dashboard Redesign Impact (Session 65)

### Changes applied that address onboarding issues

| Audit Issue | Dashboard Fix |
|-------------|---------------|
| **Box-ception** (3.3 — too many nested frames) | Completely removed inner frames from quest rows. Action launch rows float freely with dashed dividers — no box nesting. Applied to dashboard avatar + stamp card bento cards. |
| **Lack of affordance** (3.3 — nothing says "Click Me!") | Replaced flat rows with 3D pastel pill buttons with `:active` squish feedback. Each pathway (study/write/arena) has a distinct colored button with action verbs ("Let's Study!", "Start Writing!", "Enter Arena!"). |
| **No session goal or "done" state** (3.5) | Stamp circles below each quest label show completion state. Pastel-yellow stamps fill in as quests progress. Completed rows dim to 55% opacity. CTA button at bottom for "Start Today's Mission". |

### Still pending from this session

- The pastel toy aesthetic needs revision — user felt it "doesn't look right yet"
- Once approved, the design pattern (action buttons, 3D shadows, pure white cards) could propagate to other pages

---

## 8. 9-Slice Border Setup (CSS `border-image`)

> **Status:** 🟡 Placeholder — SVGs not yet created. CSS and HTML are cleaned up and ready.

### Overview

The quest board (`.quest-board`) and the "TODAY'S QUEST" ribbon header (`.quest-ribbon`) on `dashboard.html` will use **9-slice scaling** via CSS `border-image` with custom SVGs. This replaces the earlier 3-layer CSS frame approach.

### Target file structure

Create SVGs and place them here:

```
assets/
  frames/
    quest-board.svg        ← Frame for the main quest board panel
    quest-ribbon.svg       ← Frame for the "TODAY'S QUEST" ribbon header
```

### SVG slice guide

Each SVG should be designed as an **80×80 pixel** 9-slice grid:

```
┌──────────┬──────────────────┬──────────┐
│ top-left │   top (tile)     │ top-right │
│  (fixed) │                  │  (fixed)  │
│ 20×20px  │    20×40px       │ 20×20px   │
├──────────┼──────────────────┼──────────┤
│ left     │   center (tile)  │ right     │
│ (tile)   │   transparent    │ (tile)    │
│ 20×40px  │   or fill        │ 20×40px   │
├──────────┼──────────────────┼──────────┤
│ bot-left │   bottom (tile)  │ bot-right │
│  (fixed) │                  │  (fixed)  │
│ 20×20px  │    20×40px       │ 20×20px   │
└──────────┴──────────────────┴──────────┘
```

- **Total SVG canvas:** 80 × 80 px
- **Slice width/height:** 20 px on each side → `border-width: 20px` or use `border-image-slice: 20 fill`
- **Corner pieces (4):** Fixed — won't stretch. Each is 20×20 px.
- **Edge pieces (4):** Stretch/tile horizontally or vertically. Middle section of each edge: 40 px wide/tall, 20 px thick.
- **Center:** Leave transparent or a fill color — the element's `background` will show through.

### CSS to apply once SVGs are ready

#### quest-board (main panel)

Replace the `border` / `border-radius` placeholder in `.quest-board` with:

```css
.quest-board {
  border: 20px solid transparent;
  border-image-source: url('assets/frames/quest-board.svg');
  border-image-slice: 20 fill;
  border-image-repeat: stretch stretch;
  border-image-outset: 0;
  /* Remove border-radius — 9-slice handles corners */
}
```

#### quest-ribbon (header)

Replace the `border` / `border-radius` placeholder in `.quest-ribbon` with:

```css
.quest-ribbon {
  border: 20px solid transparent;
  border-image-source: url('assets/frames/quest-ribbon.svg');
  border-image-slice: 20 fill;
  border-image-repeat: stretch stretch;
  border-image-outset: 0;
}
```

> **Note:** `border-image-slice: 20 fill` — the `fill` keyword lets the center region of the SVG render as the element's background, so the element's own `background` property is ignored. If your SVG center is transparent, use `border-image-slice: 20` (no fill) and the element's CSS `background` will show through.

### Steps to activate

1. Create the two SVGs and place them in `assets/frames/`
2. In `dashboard.html` CSS, replace the placeholder border blocks (marked with comments `/* ══ PLACEHOLDER ══ */`) with the `border-image` rules above
3. Remove `border-radius` from both selectors (9-slice handles rounded corners via SVG)
4. Test in browser

---

## 9. Principles for Going Forward

1. **The first 10 seconds decide retention** — make them count
2. **One clear action > five good options** — always suggest a next step
3. **Show, don't overwhelm** — reveal features progressively as the user needs them
4. **"Done" is as important as "Start"** — users need a feeling of completion
5. **Every page should answer "What do I do here?"** — if a beginner can't answer in 5 seconds, simplify
