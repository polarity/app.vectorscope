import { getVectorscope } from './ui.js'
import { getTheme, getTraceColor } from './theme.js'

let smoothedLeft
let smoothedRight

/**
 * Draws the vectorscope on the canvas
 * @param {Float32Array} dataArrayLeft - Time domain data for the left channel
 * @param {Float32Array} dataArrayRight - Time domain data for the right channel
 * @param {Uint8Array} frequencyDataLeft - Frequency data for the left channel
 * @param {Uint8Array} frequencyDataRight - Frequency data for the right channel
 * @param {number} smoothing - Temporal smoothing amount from 0 to 100
 */
export function drawVectorscope(dataArrayLeft, dataArrayRight, frequencyDataLeft, frequencyDataRight, smoothing) {
  const vectorscope = getVectorscope()
  const canvasCtx = vectorscope.getContext('2d')
  const width = canvasCtx.canvas.width
  const height = canvasCtx.canvas.height
  const theme = getTheme()
  const dominantFrequency = getDominantFrequency(frequencyDataLeft, frequencyDataRight)
  const { leftChannel, rightChannel } = getTemporalSmoothing(dataArrayLeft, dataArrayRight, smoothing)

  // Fade the previous frame slightly to keep a short persistence trail
  canvasCtx.fillStyle = theme.scopeFadeFill
  canvasCtx.fillRect(0, 0, width, height)

  canvasCtx.lineWidth = 2
  
  const centerX = width / 2
  const centerY = height / 2
  const traceColor = getTraceColor(dominantFrequency)
  canvasCtx.strokeStyle = traceColor

  for (let i = 0; i < leftChannel.length; i++) {
    const mid = (leftChannel[i] + rightChannel[i]) / 2
    const side = (leftChannel[i] - rightChannel[i]) / 2

    const x = centerX + side * (width / 2)
    const y = centerY - mid * (height / 2)
    
    canvasCtx.beginPath()
    canvasCtx.moveTo(x, y)
    canvasCtx.lineTo(x + 1, y + 1)
    canvasCtx.stroke()
  }
}

/**
 * Resets the temporal smoothing state
 */
export function resetVectorscopeState() {
  smoothedLeft = null
  smoothedRight = null
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

/**
 * Applies temporal smoothing to the left and right channels
 * @param {Float32Array} dataArrayLeft - Raw left channel data
 * @param {Float32Array} dataArrayRight - Raw right channel data
 * @param {number} smoothing - Temporal smoothing amount from 0 to 100
 * @returns {{ leftChannel: Float32Array, rightChannel: Float32Array }} Smoothed or raw channel buffers
 */
function getTemporalSmoothing(dataArrayLeft, dataArrayRight, smoothing) {
  if (smoothing <= 0) {
    resetVectorscopeState()
    return {
      leftChannel: dataArrayLeft,
      rightChannel: dataArrayRight
    }
  }

  if (!smoothedLeft || smoothedLeft.length !== dataArrayLeft.length) {
    smoothedLeft = new Float32Array(dataArrayLeft)
    smoothedRight = new Float32Array(dataArrayRight)
  }

  const normalized = smoothing / 100
  const alpha = 1 - 0.94 * Math.pow(normalized, 1.5)

  for (let i = 0; i < dataArrayLeft.length; i++) {
    smoothedLeft[i] += (dataArrayLeft[i] - smoothedLeft[i]) * alpha
    smoothedRight[i] += (dataArrayRight[i] - smoothedRight[i]) * alpha
  }

  return {
    leftChannel: smoothedLeft,
    rightChannel: smoothedRight
  }
}
