# Visual Flashcards for Obsidian

A clean, visual flashcard plugin for Obsidian with card-flip animations, score tracking, and session history. Built as an alternative to existing flashcard plugins that lack a proper visual interface.

---

## Features

- 🃏 3D card-flip animation — tap or click to reveal the answer
- ✓ / ✗ Got it / Missed it scoring
- 📝 End screen with score percentage and a list of cards that need practice
- ↺ Retry missed cards immediately after a session
- 📈 Session history per note — tracks your last 10 sessions so you can see improvement over time
- ⇌ Shuffle mode
- 📂 Note picker dropdown — choose any note in your vault directly from the panel
- Works on desktop and mobile

---

## How to Write Flashcards

Create a note in your vault and write your cards using this format:
```
Q: Why is my code not working?
A: You forgot to save the file

```

- Each card is a `Q:` line followed by an `A:` line
- Separate cards with enter
- The note can contain other content — only lines starting with `Q:` and `A:` are parsed

---

## Installation

### Manual

1. Download `main.js` and `manifest.json` from the latest release
2. In your vault, create the folder `.obsidian/plugins/visual-flashcards/`
3. Place both files inside that folder
4. Open Obsidian → Settings → Community Plugins → disable Restricted Mode if needed → enable **Visual Flashcards**
   
---

## How to Use

1. Open the flashcard panel via the ribbon icon (stacked layers) or Command Palette → **Open Flashcard View**
2. Select your flashcard note from the dropdown
3. Click **Load**
4. Tap a card to flip it and reveal the answer
5. Mark it ✓ Got it or ✗ Missed it
6. After the last card, view your score and any cards that need more practice

---

## Compatibility

- Obsidian 1.0.0+
- Desktop (Windows, macOS, Linux) and Mobile (iOS, Android)
- No external dependencies

---

## License

MIT — free to use, modify, and distribute.
