# 学汉字 (Study Hanzi) — Product Context

## Why This App Exists
- Help children (ages 5-12) learn to read and write Chinese characters
- Provide a fun, gamified, paper-texture aesthetic (Botes design) that feels warm and approachable
- Works completely offline (localStorage) — no server, no login required

## User Experience Goals
- **Paper aesthetic**: Warm cream/tan tones, paper-grain texture backgrounds, soft shadows — feels like a physical activity book
- **Child-friendly**: Large emoji, panda mascot, badge rewards, streaks, star ratings
- **Simple navigation**: Bottom nav bar across all pages, profile picker on home
- **No account friction**: Start as guest immediately, optional sign-up later
- **Multi-learner**: Family support with parent PIN-protected settings, multiple profiles

## Key Workflows
1. **Profile Selection** (index.html) → Pick a learner or create new
2. **Study Flashcards** (study.html) → Flip cards, see character + image + pinyin + meaning, then quiz mode with 4 options
3. **Write Practice** (write.html) → HanziWriter stroke-by-stroke animation + draw-on-screen practice
4. **Games** (dojo.html) → Sushi Conveyor (React), Matching Game, Write Practice link, Study Cards link (will update more later)
5. **Progress** (progress.html) → Stats, mastery titles, badges, activity calendar, word mastery grid, collectibles

## Design Rules (Botes Paper Palette)
- **Body bg**: `var(--paper-cream)` (#F5EDD8) with paper-grain texture
- **Cards**: `var(--paper-warm)` (#FAEFD3) with paper-grain texture by default
- **Text**: `var(--ink-dark)` (#170E07) for headings, `var(--ink-medium)` (#4A3828) for body
- **Muted text**: `var(--ink-light)` (#A89580) for labels
- **Theme color**: Dynamic per stage/page (ochre for progress, sage for default)
- **Shadows**: Soft brown-tinted (`rgba(74, 56, 40, ...)`)
- **Buttons**: Pill-shaped (`--radius-pill`), dark ink or theme colored
- **Font**: Bai Jamjuree for body, ZCOOL KuaiLe for hanzi, Nunito for pinyin, Mali for Thai

## Recent User Feedback (Unresolved)
1. **dojo.html coloring**: User said "the coloring of the one inside the frame (boxes) and the background seems to be in a reversal" — cards/hall have `background: #FAFAF5` which looks lighter than page bg. Need to revise card backgrounds to be slightly darker than page bg (e.g. `var(--paper-warm)` with paper-grain texture) or adjust so boxes are distinct from background.
2. **progress.html cards**: User prefers "plain off-white color for the boxes of Journey, Stats, Badges, Activity calendar" — currently changed to `#FAFAF5` solid. This was implemented but user may want further tweaks (e.g. slightly different shade).
