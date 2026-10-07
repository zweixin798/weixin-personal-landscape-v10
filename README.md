# Weixin Zhang — Personal Landscape

A static personal portfolio with nine full-screen chapters, based on the V10 content brief.

## Sections

Introduction → DeepWisdom → Baidu → Feishu FDE → Her Rhythm → undergraduate research → graduate research → private space → ending.

Company experience is concise and factual. Her Rhythm is the sole project. The private space contains books, photography, music, screen and notebook panels.

## Development

Node.js 20+; no install step or runtime dependencies.

```sh
npm run dev
npm run check
npm run build
```

The local server runs at http://127.0.0.1:4173. Build output is in `dist/`.

## GitHub Pages

Set Settings → Pages → Source to GitHub Actions, then run the included Pages workflow. Relative asset paths support project Pages URLs. Only `dist/` is deployed.

## Editing

- `index.html`: factual content and semantic static fallback.
- `styles.css`: V10 editorial cards, local typography, private-space illustrations and responsive layout.
- `scenes.js` / `scenes.css`: viewport navigation, wheel/touch/keyboard handling and overflow reading.
- `app.js`: collection panels, gallery enlargement, contact links and subtle object interaction.
- `content.js`: photo and contact configuration. Omitted contact fields remain hidden.

All content is readable without JavaScript; animated navigation and collection panels are progressive enhancements. Reduced motion is supported. Touch handling is implemented; real-device testing remains recommended.

DM Serif Display is bundled under the SIL Open Font License; see `assets/fonts/OFL-DMSerifDisplay.txt`. The Screen collection uses original typographic illustrations, not official series posters. Product diagrams are conceptual and contain no personal health records. Photography and personal content are not licensed for reuse.
