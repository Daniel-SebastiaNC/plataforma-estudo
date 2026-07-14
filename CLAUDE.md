# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"Aprende" is a static HTML/CSS/JS prototype (no build tooling, no package manager, no framework) of a course-lesson study platform, in Portuguese (pt-BR). It is a single-page UI mockup: `index.html` holds all markup, `style.css` all styling, and `script.js` all behavior. There is no backend — all data is hardcoded in-memory in `script.js` and resets on reload.

## Running the app

There is no build step or dev server tooling in this repo. Open `index.html` directly in a browser, or serve the directory with any static file server, e.g.:

```
npx serve .
```

There are no tests, linters, or package.json in this project.

## Architecture

The whole app is a single view split into three fixed columns via CSS grid (`.app { grid-template-columns: 280px 1fr 320px }`), all driven by one global `<script>` in `script.js` operating directly on the DOM (no framework, no modules, no build step):

- **Left column (`.aside-left`)** — lesson list, rendered from the `lessons` array. Clicking a lesson calls `selecionarAula(i)`, which just updates the active state and title text (it does not change the video/content/transcript body).
- **Center column (`.main`)** — video placeholder, lesson header, and two tabs (`Conteúdo da aula` / `Transcrição da aula`) toggled via `.tab` / `.tab-panel` classes. Transcript lines are rendered from the `transcript` array.
- **Right column (`.aside-right`)** — a 5-tab side panel (`Dúvidas`, `Revisão`, `Simulado`, `Caderno`, `Professor`) toggled via `.nav-tab` / `.panel` classes, switched with plain `onclick`/`querySelectorAll` toggling (mirrors the center tabs pattern).

Key interactive features, all state kept in plain JS variables/arrays (nothing persisted, nothing sent over the network):

- **Text annotation ("Caderno do aluno")**: selecting text in `#contentBody` shows a floating `.mark-popover` positioned at the selection's bounding rect. Users can either highlight the selection (`marcarTrecho` → wraps the range in a `<mark class="marca">`) or attach a note via a modal (`abrirObs`/`salvarObs`). Both actions push into the in-memory `notes` array, rendered by `renderNotebook()` into the Caderno panel.
- **Chats (Dúvidas / Professor)**: `enviarDuvida`/`enviarProf` append the user's message then simulate a canned reply via `setTimeout` — there is no real backend or LLM call.
- **Quiz (Simulado)**: `selOpt`/`conferir` do simple client-side answer checking against a hardcoded correct option.

Because everything lives in one `script.js` with top-level `const`/`function` declarations and inline `onclick="..."` handlers in the HTML, adding a new interactive element typically means: add the markup in `index.html`, add matching CSS in `style.css` (BEM-ish flat class names, CSS custom properties in `:root` for the color palette), and define the handler function in `script.js` as a global.

## Conventions

- Colors, spacing radius, and shadow are centralized as CSS custom properties in `:root` at the top of `style.css` (`--azul-*`, `--cinza-*`, `--verde`, `--sombra`, `--radius`) — reuse these instead of hardcoding new colors.
- UI copy is in Portuguese (pt-BR); keep new copy consistent with this.
- Panel/tab switching follows one repeated pattern: remove `active` from all siblings, add it to the clicked element and its corresponding content panel (see `.tab`/`.tab-panel` and `.nav-tab`/`.panel` handlers in `script.js`).
