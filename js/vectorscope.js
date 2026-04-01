import { getVectorscope } from './ui.js'
import { getTheme, getTraceColor } from './theme.js'

/**
 * Draws the vectorscope on the canvas
 * @param {Float32Array} dataArrayLeft - Time domain data for the left channel
 * @param {Float32Array} dataArrayRight - Time domain data for the right channel
 * @param {Uint8Array} frequencyDataLeft - Frequency data for the left channel
 * @param {Uint8Array} frequencyDataRight - Frequency data for the right channel
 */
export function drawVectorscope(dataArrayLeft, dataArrayRight, frequencyDataLeft, frequencyDataRight) {
  const vectorscope = getVectorscope()
  const canvasCtx = vectorscope.getContext('2d')
  const width = canvasCtx.canvas.width
  const height = canvasCtx.canvas.height
  const theme = getTheme()
  const dominantFrequency = getDominantFrequency(frequencyDataLeft, frequencyDataRight)

  // Apply a semi-transparent fill to create a motion blur effect
  canvasCtx.fillStyle = theme.scopeFadeFill
  canvasCtx.fillRect(0, 0, width, height)

  canvasCtx.lineWidth = 2
  
  const centerX = width / 2
  const centerY = height / 2
  const traceColor = getTraceColor(dominantFrequency)
  canvasCtx.strokeStyle = traceColor

  for (let i = 0; i < dataArrayLeft.length; i++) {
    const mid = (dataArrayLeft[i] + dataArrayRight[i]) / 2
    const side = (dataArrayLeft[i] - dataArrayRight[i]) / 2

    const x = centerX + side * (width / 2)
    const y = centerY - mid * (height / 2)
    
    canvasCtx.beginPath()
    canvasCtx.moveTo(x, y)
    canvasCtx.lineTo(x + 1, y + 1)
    canvasCtx.stroke()
  }
}

/**
 * Returns the dominant frequency across the two channel analyser buffers
 * @param {Uint8Array} frequencyDataLeft - Frequency data for the left channel
 * @param {Uint8Array} frequencyDataRight - Frequency data for the right channel
 * @returns {number} Dominant frequency in Hz
 */
function getDominantFrequency(frequencyDataLeft, frequencyDataRight) {
  let maxAmplitude = 0
  let dominantFrequencyBin = 0

  for (let i = 0; i < frequencyDataLeft.length; i++) {
    const amplitude = Math.max(frequencyDataLeft[i], frequencyDataRight[i])
    if (amplitude > maxAmplitude) {
      maxAmplitude = amplitude
      dominantFrequencyBin = i
    }
  }

  return (dominantFrequencyBin / frequencyDataLeft.length) * 22050
}
