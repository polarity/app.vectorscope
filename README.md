# Audio Vectorscope
Try it out [on the web: Demo](https://vectorscope.polarity.me)

## Description
Audio Vectorscope is a web-based application that provides real-time visualization of audio signals using a vectorscope display. It's built with modern vanilla JavaScript, HTML, and CSS, showcasing best practices in modular development without relying on external libraries.

A vectorscope is a specialized oscilloscope used in audio applications. Unlike a traditional oscilloscope, which plots signal versus time, a vectorscope shows an X-Y plot of two signals to reveal their relationship. In this application, it displays the relationship between the left and right channels of a stereo audio signal.

## Features

- Real-time audio visualization using a vectorscope display
- VU meters for Left, Right, Mid, and Side channels
- Adjustable input gain
- Customizable color themes (Default, Dark, Light)
- Blur effect control for the vectorscope display
- Responsive design that maintains a 1:1 aspect ratio
- Modular code structure for better maintainability
- Adherence to StandardJS linting rules

## Requirements

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js and npm (for development and running the local server)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/audio-vectorscope.git
   ```

2. Navigate to the project directory:
   ```
   cd audio-vectorscope
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the local development server:
   ```
   npm start
   ```

5. Open your web browser and visit `http://localhost:8080` (or the port specified by http-server).

## Usage

1. Once the application is loaded in your browser, you'll see the vectorscope display and controls.
2. Click the "Start Analyzing" button to begin audio analysis.
3. Grant microphone permissions when prompted by your browser.
4. Adjust the input gain using the slider if needed.
5. Experiment with different color themes and blur effects using the provided controls.
6. Observe the VU meters and vectorscope display to analyze your audio signal.

## Project Structure

```
audio-vectorscope/
│
├── index.html
├── styles.css
├── js/
│   ├── main.js
│   ├── vectorscope.js
│   ├── utils.js
│   ├── audio.js
│   ├── ui.js
│   └── overlay.js
├── package.json
├── README.md
└── LICENSE
```

## Development Guidelines

- Use modern vanilla JavaScript (ES6+)
- Follow StandardJS linting rules
- Use 2 spaces for indentation
- Omit semicolons at the end of statements (as per StandardJS)
- Create modular, encapsulated functions
- Use clear naming conventions
- Write comprehensive JSDoc comments for all functions
- Separate concerns by using multiple files for different functionalities

## Contributing

Contributions to the Audio Vectorscope project are welcome. Please ensure your code adheres to the project's coding standards and passes all linting checks.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.