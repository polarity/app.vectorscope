---
applyTo: '**/*.js'
---
# JavaScript Instructions

- Follow StandardJS conventions used by the repo: 2-space indentation and no semicolons.
- Keep UI code in `js/ui.js`, audio setup in `js/audio.js`, canvas drawing in `js/vectorscope.js` and `js/overlay.js`, and shared theme access in `js/theme.js`.
- Add or maintain JSDoc for exported functions and non-obvious logic.
- Prefer small, focused functions and avoid duplicating logic across modules.
- Do not duplicate CSS palette values in JavaScript; read theme tokens through the shared theme helper instead.
