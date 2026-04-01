const FALLBACK_THEME = {
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  overlayStroke: 'rgba(153, 230, 250, 0.18)',
  overlayText: 'rgba(227, 240, 248, 0.56)',
  scopeFadeFill: 'rgba(11, 16, 20, 0.12)',
  traceStops: ['#03afd9', '#29d391', '#f3d35c', '#ff8a5b'].map(parseColor)
}

let cachedTheme

/**
 * Returns the current theme values from CSS custom properties
 * @returns {{
 *   fontFamily: string,
 *   overlayStroke: string,
 *   overlayText: string,
 *   scopeFadeFill: string,
 *   traceStops: { r: number, g: number, b: number }[]
 * }}
 */
export function getTheme() {
  if (cachedTheme) {
    return cachedTheme
  }

  if (typeof window === 'undefined') {
    return FALLBACK_THEME
  }

  const styles = window.getComputedStyle(document.documentElement)

  cachedTheme = {
    fontFamily: getCustomProperty(styles, '--font-ui', FALLBACK_THEME.fontFamily),
    overlayStroke: getCustomProperty(styles, '--overlay-stroke', FALLBACK_THEME.overlayStroke),
    overlayText: getCustomProperty(styles, '--overlay-text', FALLBACK_THEME.overlayText),
    scopeFadeFill: getCustomProperty(styles, '--scope-fade-fill', FALLBACK_THEME.scopeFadeFill),
    traceStops: [
      getCustomProperty(styles, '--trace-color-low', '#03afd9'),
      getCustomProperty(styles, '--trace-color-mid', '#29d391'),
      getCustomProperty(styles, '--trace-color-high', '#f3d35c'),
      getCustomProperty(styles, '--trace-color-air', '#ff8a5b')
    ].map(parseColor)
  }

  return cachedTheme
}

/**
 * Clears the cached theme so the next access re-reads CSS custom properties
 */
export function resetThemeCache() {
  cachedTheme = null
}

/**
 * Maps a frequency to a trace color using the current theme ramp
 * @param {number} frequency - The dominant frequency in Hz
 * @param {number} minFreq - The minimum frequency of the range
 * @param {number} maxFreq - The maximum frequency of the range
 * @returns {string} CSS rgb color string
 */
export function getTraceColor(frequency, minFreq = 20, maxFreq = 16000) {
  const safeFrequency = Number.isFinite(frequency) && frequency > 0 ? frequency : minFreq
  const normalized = clamp(
    (Math.log(safeFrequency) - Math.log(minFreq)) / (Math.log(maxFreq) - Math.log(minFreq)),
    0,
    1
  )
  const color = interpolateStops(getTheme().traceStops, normalized)
  return `rgb(${color.r}, ${color.g}, ${color.b})`
}

/**
 * Reads a CSS custom property with a fallback value
 * @param {CSSStyleDeclaration} styles - Computed styles
 * @param {string} name - CSS custom property name
 * @param {string} fallback - Fallback value
 * @returns {string} The property value or fallback
 */
function getCustomProperty(styles, name, fallback) {
  const value = styles.getPropertyValue(name).trim()
  return value || fallback
}

/**
 * Parses a hex or rgb color string to an RGB object
 * @param {string} value - CSS color string
 * @returns {{ r: number, g: number, b: number }} Parsed color
 */
function parseColor(value) {
  if (value.startsWith('#')) {
    return parseHexColor(value)
  }

  const rgbMatch = value.match(/^rgba?\(([^)]+)\)$/i)
  if (rgbMatch) {
    const [r = '0', g = '0', b = '0'] = rgbMatch[1].split(',').map(part => part.trim())
    return {
      r: parseInteger(r),
      g: parseInteger(g),
      b: parseInteger(b)
    }
  }

  return parseHexColor('#03afd9')
}

/**
 * Parses a hex color string to an RGB object
 * @param {string} value - Hex color string
 * @returns {{ r: number, g: number, b: number }} Parsed color
 */
function parseHexColor(value) {
  let normalized = value.replace('#', '')

  if (normalized.length === 3) {
    normalized = normalized.split('').map(char => `${char}${char}`).join('')
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  }
}

/**
 * Samples a multi-stop color ramp
 * @param {{ r: number, g: number, b: number }[]} stops - Color stops
 * @param {number} position - Normalized position from 0 to 1
 * @returns {{ r: number, g: number, b: number }} Interpolated color
 */
function interpolateStops(stops, position) {
  if (stops.length === 0) {
    return parseHexColor('#03afd9')
  }

  if (stops.length === 1) {
    return stops[0]
  }

  const scaledPosition = position * (stops.length - 1)
  const index = Math.min(stops.length - 2, Math.floor(scaledPosition))
  const localPosition = scaledPosition - index

  return {
    r: interpolateChannel(stops[index].r, stops[index + 1].r, localPosition),
    g: interpolateChannel(stops[index].g, stops[index + 1].g, localPosition),
    b: interpolateChannel(stops[index].b, stops[index + 1].b, localPosition)
  }
}

/**
 * Interpolates a single color channel
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} position - Normalized position from 0 to 1
 * @returns {number} Interpolated value
 */
function interpolateChannel(start, end, position) {
  return Math.round(start + (end - start) * position)
}

/**
 * Clamps a number to the given range
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Parses an integer color channel value safely
 * @param {string} value - Raw channel value
 * @returns {number} Parsed value
 */
function parseInteger(value) {
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? 0 : parsed
}
