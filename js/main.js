import { setupUI, handleResize } from './ui.js'

/**
 * Initializes the audio vectorscope application
 */
function init() {
  setupUI()
  window.addEventListener('resize', handleResize)
}

window.addEventListener('load', init)