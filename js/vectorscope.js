import { getVectorscope } from './ui.js'
import { getFrequencyColor } from './utils.js'

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

  // Apply a semi-transparent fill to create a motion blur effect
  canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.1)' // Fixed background color
  canvasCtx.fillRect(0, 0, width, height)

  canvasCtx.lineWidth = 2
  
  const centerX = width / 2
  const centerY = height / 2

  const frequencyBinCount = frequencyDataLeft.length
  const nyquist = 22050 // Assuming a 44.1kHz sample rate

  for (let i = 0; i < dataArrayLeft.length; i++) {
    const mid = (dataArrayLeft[i] + dataArrayRight[i]) / 2
    const side = (dataArrayLeft[i] - dataArrayRight[i]) / 2

    const x = centerX + side * (width / 2)
    const y = centerY - mid * (height / 2)

    // Find the dominant frequency
    let maxAmplitude = 0
    let dominantFrequencyBin = 0
    for (let j = 0; j < frequencyBinCount; j++) {
      const amplitude = Math.max(frequencyDataLeft[j], frequencyDataRight[j])
      if (amplitude > maxAmplitude) {
        maxAmplitude = amplitude
        dominantFrequencyBin = j
      }
    }

    // Calculate the actual frequency of the dominant bin
    const dominantFrequency = (dominantFrequencyBin / frequencyBinCount) * nyquist

    // Get color based on the dominant frequency
    const color = getFrequencyColor(dominantFrequency)

    canvasCtx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
    
    canvasCtx.beginPath()
    canvasCtx.moveTo(x, y)
    canvasCtx.lineTo(x + 1, y + 1)
    canvasCtx.stroke()
  }
}
