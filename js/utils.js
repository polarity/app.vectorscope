/**
 * Calculates the Root Mean Square (RMS) of an array of audio samples
 * @param {Float32Array} samples - Array of audio samples
 * @returns {number} The RMS value
 */
export function calculateRMS(samples) {
  const sum = samples.reduce((acc, val) => acc + val * val, 0)
  return Math.sqrt(sum / samples.length)
}
