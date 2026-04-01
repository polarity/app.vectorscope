# Agents Guide

This file gives coding agents a project-specific guide for `app.vectorscope`.

## Project Scope

- This repository is a browser-based audio vectorscope built with vanilla HTML, CSS, and JavaScript modules.
- The app captures live stereo audio input, renders a vectorscope on canvas, and shows L/R/M/S VU meters.
- Keep changes framework-free unless the user explicitly asks for a stack change.

## Architecture Map

- `index.html`: Entry document, metadata, root mount node (`#vectorscope-app`), module bootstrap.
- `styles.css`: Application styling and layout.
- `js/main.js`: App bootstrap (`setupUI`, resize listener).
- `js/ui.js`: DOM creation, UI controls, app state, resize handling, VU meter updates, and audio input selector UI.
- `js/audio.js`: Web Audio setup, media stream access, analyzers, animation loop hook.
- `js/vectorscope.js`: Main vectorscope drawing routine, including temporal smoothing state for the trace.
- `js/overlay.js`: Static overlay guides and labels.
- `js/theme.js`: Shared theme helpers for reading CSS tokens from JavaScript.
- `js/utils.js`: Shared helpers such as RMS calculation.

## Conventions To Follow

- JavaScript style follows StandardJS conventions used in the repo:
  - 2-space indentation
  - No semicolons
  - Keep functions small and modular
- Separate UI concerns from audio/render logic when adding features.
- Add or maintain JSDoc for exported functions and non-obvious logic.
- For HTML:
  - Keep semantic structure and accessibility in mind
  - Keep external styling in CSS (no inline styles)
  - Preserve required metadata tags
- For CSS:
  - Keep property ordering consistent and readable
  - Prefer reusable variables for shared values when introducing new style tokens
  - Keep visual tokens centralized in `:root` and avoid adding hard-coded colors in component rules when a shared token can be reused

## Documentation Rules

- Keep `README.md` synchronized with the real behavior of the current code.
- Keep `docs/design-system.md` and `.github/instructions/` aligned with the current theme and project structure.
- Do not document features that are not implemented.
- If module responsibilities change, update both this file and the README structure section.

## Agent Workflow

1. Read the touched module(s) before making edits to preserve existing patterns.
2. Make minimal, focused changes that match existing naming and architecture.
3. Run local verification steps when possible:
   - `npm install`
   - `npm start`
4. Manually verify core behavior in browser:
   - App loads without console errors
   - Start button flow works and microphone permission prompt appears
   - Audio input selection updates after access is granted
   - Vectorscope trace updates in real time
   - L/R/M/S VU meters react to incoming signal
   - Gain and smoothing controls affect output
   - Canvas scales correctly on resize

## Known Constraints

- There is currently no test suite or lint script in `package.json`; rely on careful manual verification.
- Audio capture depends on browser permissions and available input devices.
- Keep instructions and code aligned with the static app setup (`http-server`) currently used by the repo.
