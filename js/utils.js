/**
 * Generates a color for a given frequency using a rainbow gradient
 * @param {number} frequency - The frequency in Hz
 * @param {number} minFreq - The minimum frequency of the range (e.g., 20Hz)
 * @param {number} maxFreq - The maximum frequency of the range (e.g., 16000Hz)
 * @returns {Object} An object with r, g, b values
 */
export function getFrequencyColor(frequency, minFreq = 20, maxFreq = 16000) {
  // Normalize the frequency to a value between 0 and 1
  const normalizedFreq = (Math.log(frequency) - Math.log(minFreq)) / (Math.log(maxFreq) - Math.log(minFreq))
  
  // Use the normalized frequency to get a hue value (0 to 1)
  const hue = normalizedFreq
  
  // Convert HSV to RGB (assuming full saturation and value)
  const h = hue * 6
  const x = 1 - Math.abs((h % 2) - 1)
  
  let r, g, b
  if (h < 1) { r = 1; g = x; b = 0 }
  else if (h < 2) { r = x; g = 1; b = 0 }
  else if (h < 3) { r = 0; g = 1; b = x }
  else if (h < 4) { r = 0; g = x; b = 1 }
  else if (h < 5) { r = x; g = 0; b = 1 }
  else { r = 1; g = 0; b = x }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

/**
 * Calculates the Root Mean Square (RMS) of an array of audio samples
 * @param {Float32Array} samples - Array of audio samples
 * @returns {number} The RMS value
 */
export function calculateRMS(samples) {
  const sum = samples.reduce((acc, val) => acc + val * val, 0)
  return Math.sqrt(sum / samples.length)
}