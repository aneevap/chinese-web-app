# Custom Sushi Images

Drop your custom sushi artwork here to replace the emoji placeholders.

## Location

All images go in this directory:
```
games/public/images/sushi/
```

Served at runtime as /images/sushi/<filename> (Vite serves public/ as the root).

## File type

PNG with transparency - best for illustrations with a rounded plate look.

## Recommended size

128 x 128 pixels (square).

The emoji displays at 42px (desktop) / 32px (mobile). At 128px, the image is crisp on retina screens.

## Naming convention

The app uses 8 sushi types mapped to words by hash:

| File name   | Emoji | What it is          |
|-------------|-------|---------------------|
| sushi.png   | Sushi | Nigiri sushi        |
| ebi.png     | Shrimp| Fried shrimp        |
| onigiri.png | Rice  | Rice ball (onigiri) |
| bento.png   | Bento | Bento box           |
| ramen.png   | Ramen | Ramen noodles       |
| dango.png   | Dango | Dango skewers       |
| gyoza.png   | Gyoza | Gyoza dumplings     |
| rice.png    | Rice  | Bowl of rice        |

### Rules
- Lowercase filenames (ebi.png, not Ebi.png)
- Use the English food name, no spaces (hyphens ok)
- WebP can sit alongside PNG with same name

## How to switch from emojis to images

When you have your images ready, update getSushiEmoji() in SushiMode.tsx to return an <img> tag:

1. File -> /images/sushi/<name>.png
2. CSS -> .sushi-img { width: 42px; height: 42px; display: block; }

Happy to help with the migration when you have your images ready!
