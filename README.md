# Audio Vectorscope

Audio Vectorscope is a browser-based stereo audio visualizer built with vanilla HTML, CSS, and JavaScript modules. It captures live microphone input, renders a real-time vectorscope on canvas, and displays VU meters for Left, Right, Mid, and Side channels.

Try it on the web: [Demo](https://vectorscope.polarity.me)

## Features

- Real-time stereo vectorscope rendering on canvas
- Frequency-reactive trace coloring driven by shared theme tokens
- Temporal smoothing control for a steadier vectorscope trace
- VU meters for L/R/M/S channels
- Input gain control
- Audio input device selection after permission is granted
- Responsive layout with a square vectorscope area

## Requirements

- A modern browser with Web Audio support (Chrome, Firefox, Safari, Edge)
- Node.js and npm for the local development server

## Installation

1. Clone this repository:

   ```bash
   git clone <your-repo-url>
   ```

2. Move into the project directory:

   ```bash
   cd app.vectorscope
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the local server:

   ```bash
   npm start
   ```

5. Open the local URL printed by `http-server` (typically `http://localhost:8080`).

## Usage

1. Open the app in your browser.
2. Click `Start Analyzing`.
3. Allow microphone access when prompted.
4. Use `Input Gain` and `Smoothing` to shape the visualization.
5. If multiple devices are available, choose one from the `Audio Input` selector.
6. Monitor stereo image and phase using the vectorscope trace and L/R/M/S meters.

## Theme And Styling

- Visual tokens live in `styles.css` as CSS custom properties for background, surfaces, borders, text, links, overlay colors, trace colors, and VU meter colors.
- Canvas-based rendering reads the same CSS variables through `js/theme.js`, so the DOM and the canvas stay in sync.
- New color or typography changes should update the shared tokens first instead of adding new hard-coded values in JS or CSS.
- Additional design notes live in [`docs/design-system.md`](docs/design-system.md).

## Project Structure

```text
app.vectorscope/
|- index.html
|- styles.css
|- js/
|  |- main.js
|  |- ui.js
|  |- audio.js
|  |- vectorscope.js
|  |- overlay.js
|  |- theme.js
|  `- utils.js
|- docs/
|  `- design-system.md
|- .github/
|  `- instructions/
|     |- javascript.instructions.md
|     |- css.instructions.md
|     |- html.instructions.md
|     `- markdown.instructions.md
|- README.md
`- LICENSE
```

## Development

- Keep the app framework-free unless there is an explicit decision to change stack.
- Follow StandardJS style: 2 spaces, no semicolons.
- Keep UI code in `js/ui.js`, audio setup in `js/audio.js`, canvas drawing in `js/vectorscope.js` and `js/overlay.js`, and shared theme access in `js/theme.js`.
- Maintain JSDoc on exported functions and non-obvious logic.
- Keep `README.md`, `agents.md`, and the `.github/instructions/` files aligned with the actual behavior of the app.
- There is currently no automated test suite; verify behavior manually in the browser.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
