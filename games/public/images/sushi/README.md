# Custom Sushi Images

Your custom sushi artwork lives here! Imported in `SushiMode.tsx` via `getSushiEmoji()`.

## Image files

| File | Description |
|------|-------------|
| `salmon_nigiri.png` | Salmon nigiri |
| `ebi_nigiri.png` | Shrimp (ebi) nigiri |
| `tuna_nigiri.png` | Tuna nigiri |
| `ika_nigiri.png` | Squid (ika) nigiri |
| `tago_nigiri.png` | Octopus (tago) nigiri |
| `tamago_nigiri.png` | Egg (tamago) nigiri |
| `green_maki.png` | Green maki roll |
| `red_makii.png` | Red maki roll |

## File type

- **PNG with transparency** — keeps the rounded plate look clean
- Recommended source size: **128×128 px** (crisp on retina at 42px display size)

## Server path

Images are served at runtime as `/images/sushi/<filename>` (Vite serves `public/` as the root).

## Adding new images

If you add or rename images, update the `SUSHI_IMAGES` array in `SushiMode.tsx` to match.

To add more than 8 images, increase the array size — the hash-based assignment will automatically spread words across them.
