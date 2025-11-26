# Squaredle-for-Two — Proposal Skeleton

A tiny client-side web app inspired by squaredle.app used as a personal proposal skeleton. It shows a welcome screen asking a visitor if they'd like to begin, prompts for a name, and when the name is "Rushi" shows a 5x5 grid animation that reveals a message.

## Development
Open `index.html` in your browser or host via GitHub Pages.

Local preview (single file):

```bash
# from inside the project folder
open index.html   # macOS — double-click index.html also works
```

Local preview (recommended):

```bash
# simple static server — Node/npm required
npx http-server -c-1 .  # then open http://localhost:8080
```

## Hosting on GitHub Pages
1. Create a GitHub repo and push the contents of this folder to the repo.
2. In GitHub -> Settings -> Pages, set the branch to `main` (or `gh-pages`) and the folder to `/ (root)`.

## Customization
- Update `script.js` top-level `ROWS` array: it should contain exactly 5 strings (each length 5) — each string is a row of characters for the grid.
- The default animation flips each tile to a red background revealing white characters.

Layout / spacing config:
- The grid padding is controlled via the CSS variable `--grid-padding` in `styles.css` (default 28px). Change that value to increase or reduce the spacing around the 5×5 grid.

Tip: To change which name is allowed, edit the check in `script.js` (currently matches exactly `Rushi`). You can make the match case-insensitive if you prefer.

## License
Personal/Private project.
# secret-rushi-project
