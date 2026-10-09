# Weixin Zhang — Personal Landscape

A static personal portfolio with six chapters, with a continuous Experience section and a desktop horizontal Education map and a full-bleed desktop 3D private room.

## Sections

Introduction → Experience (DeepWisdom → Baidu → Feishu FDE in one section) → Her Rhythm → Education (Undergraduate → Question Shift → Graduate) → private space → ending.

Company experience is concise and factual. Her Rhythm is the sole project. The private space contains books, photography, music, screen and notebook panels.

## Development

Node.js 20+. Three.js is the only runtime library; it is pinned and bundled locally. No React, physics engine, external CDN or 3D model service is required.

```sh
npm ci
npm run vendor
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
- `app.js`: portrait, contact links and the optional project URL.
- `experience.js` / `experience.css`: shared growing path, internal scroll progress and two light keyword expansions.
- `education.js` / `education.css`: one desktop Undergraduate → Question Shift → Graduate map, with stacked mobile reading and internal anchors.
- `private-room.js` / `private-room.css`: accessible HTML reading layers, mobile fallback, gallery and focus management.
- `room-3d.js`: lazily loaded room geometry, raycasting, lighting, book hinges and object/camera transitions.
- `scripts/vendor.mjs`: copies the pinned Three.js modules and license into the build assets.
- `content.js`: photographs, contacts, book metadata, introductions, nullable personal notes and notebook words. Set `projectUrl` to a real HTTP(S) URL to reveal “View Project”. Omitted links stay hidden. Personal reading notes are deliberately empty until supplied by the owner.

All content is readable without JavaScript; animated navigation and collection panels are progressive enhancements. Reduced motion is supported. Touch handling is implemented; real-device testing remains recommended.

DM Serif Display is bundled under the SIL Open Font License; see `assets/fonts/OFL-DMSerifDisplay.txt`. The Screen collection uses original typographic illustrations, not official series posters. Product diagrams are conceptual and contain no personal health records. Photography and personal content are not licensed for reuse.

## Private-room verification

After starting the local server, open `/tests/room.test.html`. The development-only page checks reduced-motion timing, dormant rendering, interrupted selection, context-loss callbacks and disposal against the actual Three.js room. It is excluded from `dist/`.

Desktop entry lazily loads the local 3D module. Leaving the scene, hiding the document or using mobile stops its render loop. Mobile initial loads do not initialize WebGL; the existing object illustrations and keyboard-accessible HTML controls remain available. Book title/author labels, geometry and typographic covers are rendered locally, not fetched from a cover service. The first six entries support introductions and the full opening sequence; all notes currently read “Notes coming later”. The Dostoevsky entry remains an author collection rather than an invented specific title.

Short book introductions were checked against the publisher/author and institutional sources stored in `content.js`. The UI never presents these descriptions as the owner's personal reading notes.

Pushing to `main` runs the GitHub Pages workflow. The published site is updated only after the build and deployment jobs succeed.

## Room arrival and internal education anchors

The desktop room fills its scene below the global header and above the scene controls. Its title and dock float over the canvas. A coordinated 800 ms card expansion, mild forward dolly and exposure change replace the default vertical scene movement on entry. Reduced motion skips the expansion and dolly; leaving cancels pending entry work.

`#undergraduate`, `#question-shift` and `#understanding` remain shareable internal anchors within the single `#education` scene. They do not create extra scenes. Experience illustrations are inline SVG, while the existing scroll controller and factual copy remain unchanged.

## Visual system

English display titles use DM Serif Display at weight 400, line-height 1.04 (1.08 for the motto), and letter spacing −0.02em. UI, metadata, buttons and small labels use the system sans stack at weight 500/600. Chinese body text keeps the PingFang/system sans stack. `typography.css` applies these roles consistently.

Private Space uses the Sunlit Editorial Room palette: light cream walls, warm wood floors, oak furniture, sage/powder-blue objects and terracotta details. Its floating dock is charcoal. Material role colors are centralized in `ROOM_PALETTE` in `room-3d.js`; matching HTML fallback colors are scoped to Private Space.
