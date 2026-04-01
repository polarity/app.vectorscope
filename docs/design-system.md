# Design System

This project uses a single shared dark theme with cyan-blue accents across DOM UI and canvas rendering.

## Theme Tokens

- Define shared visual tokens in `styles.css` under `:root`.
- Prefer semantic names such as `--color-surface`, `--color-border`, and `--overlay-stroke` over raw color literals in component rules.
- Treat `--trace-color-low`, `--trace-color-mid`, `--trace-color-high`, and `--trace-color-air` as the canonical vectorscope trace ramp.
- Treat `--color-meter-left`, `--color-meter-right`, `--color-meter-mid`, and `--color-meter-side` as the canonical VU meter colors.

## Canvas Integration

- Canvas modules must not duplicate the palette in JavaScript.
- Read CSS custom properties through `js/theme.js` so overlay lines, labels, fade fills, and trace colors match the stylesheet.
- If the theme changes, update the CSS custom properties first and only extend `js/theme.js` when a new token must be read from JS.
- Temporal smoothing belongs in the renderer and audio-visualization path, not as a CSS blur filter on the finished canvas.

## UI Rules

- Keep controls on the same dark-surface palette as the canvas container.
- Use the shared accent colors for links, focus states, buttons, and interactive controls.
- Prefer existing spacing, radius, and border tokens before introducing new visual constants.
