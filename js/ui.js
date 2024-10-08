import { startAnalyzing, updateAudioInputs } from './audio.js'
import { drawOverlay } from './overlay.js'
import { calculateRMS } from './utils.js'

let gainNode
let vuMeterLeft
let vuMeterRight
let vuMeterMid
let vuMeterSide
let vectorscope
let vectorscopeOverlay

const state = {
  gain: 1,
  blur: 0
}

/**
 * Sets up the user interface and event listeners
 */
export function setupUI() {
  const container = document.getElementById('vectorscope-app')
  container.innerHTML = '' // Clear existing content

  createVectorscopeContainer(container)
  createControls(container)
  createInstructions(container)

  handleResize()
  window.addEventListener('resize', handleResize)

  // Show the start button initially
  showStartButton()

  // Listen for device changes and update the audio input list
  navigator.mediaDevices.addEventListener('devicechange', () => {
    // Only update audio inputs if we have already started analyzing
    if (document.getElementById('audioInputSelect')) {
      updateAudioInputs()
    }
  })
}

/**
 * Creates the vectorscope container and canvas elements
 * @param {HTMLElement} parent - The parent element to append to
 */
function createVectorscopeContainer(parent) {
  const container = createElement('div', { id: 'vectorscope-container' })
  vectorscope = createElement('canvas', { id: 'vectorscope' })
  vectorscopeOverlay = createElement('canvas', { id: 'vectorscope-overlay' })
  container.appendChild(vectorscope)
  container.appendChild(vectorscopeOverlay)
  parent.appendChild(container)
}

/**
 * Creates the control elements
 * @param {HTMLElement} parent - The parent element to append to
 */
function createControls(parent) {
  const controls = createElement('div', { id: 'controls' })

  createVUMeters(controls)
  createGainControl(controls)
  createBlurSlider(controls)
  createStartButton(controls)
  
  // Create a placeholder for the audio input select
  const audioInputPlaceholder = createElement('div', { id: 'audioInputPlaceholder' })
  controls.appendChild(audioInputPlaceholder)

  parent.appendChild(controls)
}

/**
 * Creates the VU meter elements
 * @param {HTMLElement} parent - The parent element to append to
 */
function createVUMeters(parent) {
  const vuMeterGroup = createElement('div', { class: 'vu-meter-group' })
  const meterLabels = ['L', 'R', 'M', 'S']
  const meterIds = ['left', 'right', 'mid', 'side']

  meterIds.forEach((id, index) => {
    const meter = createElement('div', { class: 'vu-meter' })
    meter.appendChild(createElement('div', { class: 'vu-meter-label', textContent: meterLabels[index] }))
    meter.appendChild(createElement('div', { id: `vu-meter-${id}`, class: 'vu-meter-bar' }))
    vuMeterGroup.appendChild(meter)
  })

  parent.appendChild(vuMeterGroup)

  vuMeterLeft = document.getElementById('vu-meter-left')
  vuMeterRight = document.getElementById('vu-meter-right')
  vuMeterMid = document.getElementById('vu-meter-mid')
  vuMeterSide = document.getElementById('vu-meter-side')
}

/**
 * Creates the gain control elements
 * @param {HTMLElement} parent - The parent element to append to
 */
function createGainControl(parent) {
  const gainControl = createElement('div', { class: 'gain-control' })
  gainControl.appendChild(createElement('label', { for: 'gainSlider', textContent: 'Input Gain:' }))
  const gainSlider = createElement('input', { 
    type: 'range', 
    id: 'gainSlider', 
    min: 0, 
    max: 10, 
    step: 0.1, 
    value: state.gain 
  })
  const gainValue = createElement('span', { id: 'gainValue', textContent: state.gain.toFixed(1) })

  gainSlider.addEventListener('input', (e) => {
    const gain = parseFloat(e.target.value)
    state.gain = gain
    gainValue.textContent = gain.toFixed(1)
    if (gainNode) {
      gainNode.gain.setValueAtTime(gain, gainNode.context.currentTime)
    }
  })

  gainControl.appendChild(gainSlider)
  gainControl.appendChild(gainValue)
  parent.appendChild(gainControl)
}

/**
 * Creates the start button
 * @param {HTMLElement} parent - The parent element to append to
 */
function createStartButton(parent) {
  const startButton = createElement('button', { id: 'startButton', textContent: 'Start Analyzing' })
  startButton.addEventListener('click', startAnalyzing)
  parent.appendChild(startButton)
}

/**
 * Creates the blur slider
 * @param {HTMLElement} parent - The parent element to append to
 */
function createBlurSlider(parent) {
  const blurControl = createElement('div', { class: 'blur-control' })
  blurControl.appendChild(createElement('label', { for: 'blurSlider', textContent: 'Blur:' }))
  const blurSlider = createElement('input', { 
    type: 'range', 
    id: 'blurSlider', 
    min: 0, 
    max: 100, 
    step: 1,
    value: state.blur 
  })
  const blurValue = createElement('span', { id: 'blurValue', textContent: state.blur.toFixed(0) })

  blurSlider.addEventListener('input', (e) => {
    const blurAmount = parseInt(e.target.value)
    state.blur = blurAmount
    blurValue.textContent = blurAmount.toFixed(0)
    vectorscope.style.filter = `blur(${blurAmount / 10}px)`
  })

  blurControl.appendChild(blurSlider)
  blurControl.appendChild(blurValue)
  parent.appendChild(blurControl)
}

/**
 * Creates the instructions element
 * @param {HTMLElement} parent - The parent element to append to
 */
function createInstructions(parent) {
  const instructions = createElement('div', { id: 'instructions' })
  instructions.appendChild(createElement('p', { 
    textContent: 'How to read the vectorscope: The horizontal axis represents the left channel, and the vertical axis represents the right channel. The center point is silence, while the corners represent maximum amplitude in both channels. The shape and movement of the trace indicate the stereo image and phase relationship of the audio signal.' 
  }))
  parent.appendChild(instructions)
}

/**
 * Helper function to create HTML elements
 * @param {string} tag - The HTML tag name
 * @param {Object} attributes - The attributes to set on the element
 * @returns {HTMLElement} The created element
 */
function createElement(tag, attributes = {}) {
  const element = document.createElement(tag)
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'textContent') {
      element.textContent = value
    } else {
      element.setAttribute(key, value)
    }
  })
  return element
}

/**
 * Sets the gainNode
 * @param {GainNode} node - The GainNode to set
 */
export function setGainNode(node) {
  gainNode = node
}

/**
 * Handles window resize events
 */
export function handleResize() {
  adjustCanvasSize()
}

/**
 * Adjusts the canvas size to maintain a 1:1 aspect ratio
 * and fit within the browser window
 */
function adjustCanvasSize() {
  const container = document.getElementById('vectorscope-container')
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  let size = windowWidth
  let containerHeight = size

  // If the calculated height is greater than the window height, adjust the size
  if (containerHeight > windowHeight * 0.8) {
    size = windowHeight * 0.8
    containerHeight = size
  }

  vectorscope.width = size
  vectorscope.height = containerHeight
  vectorscopeOverlay.width = size
  vectorscopeOverlay.height = containerHeight

  drawOverlay() // Redraw the overlay when size changes
}

/**
 * Updates the VU meter display
 * @param {Float32Array} dataArrayLeft - Time domain data for the left channel
 * @param {Float32Array} dataArrayRight - Time domain data for the right channel
 */
export function updateVUMeter(dataArrayLeft, dataArrayRight) {
  const vuMeterLeft = document.getElementById('vu-meter-left')
  const vuMeterRight = document.getElementById('vu-meter-right')
  const vuMeterMid = document.getElementById('vu-meter-mid')
  const vuMeterSide = document.getElementById('vu-meter-side')

  if (!vuMeterLeft || !vuMeterRight || !vuMeterMid || !vuMeterSide) {
    console.warn('VU meter elements not found. Skipping update.')
    return
  }

  const rmsLeft = calculateRMS(dataArrayLeft)
  const rmsRight = calculateRMS(dataArrayRight)

  // Calculate Mid and Side
  const dataMid = new Float32Array(dataArrayLeft.length)
  const dataSide = new Float32Array(dataArrayLeft.length)
  for (let i = 0; i < dataArrayLeft.length; i++) {
    dataMid[i] = (dataArrayLeft[i] + dataArrayRight[i]) / 2
    dataSide[i] = (dataArrayLeft[i] - dataArrayRight[i]) / 2
  }

  const rmsMid = calculateRMS(dataMid)
  const rmsSide = calculateRMS(dataSide)

  // Convert RMS to dB and map to percentage
  const dbToPercentage = (db) => Math.min(100, Math.max(0, (db + 60) / 60 * 100))

  vuMeterLeft.style.setProperty('--level', `${dbToPercentage(20 * Math.log10(rmsLeft))}%`)
  vuMeterRight.style.setProperty('--level', `${dbToPercentage(20 * Math.log10(rmsRight))}%`)
  vuMeterMid.style.setProperty('--level', `${dbToPercentage(20 * Math.log10(rmsMid))}%`)
  vuMeterSide.style.setProperty('--level', `${dbToPercentage(20 * Math.log10(rmsSide))}%`)
}

export function getVectorscope() {
  return vectorscope
}

export function getVectorscopeOverlay() {
  return vectorscopeOverlay
}

/**
 * Creates the audio input selection dropdown
 * @param {MediaDeviceInfo[]} audioInputs - List of available audio input devices
 * @param {function} onSelect - Callback function when a device is selected
 */
export function createAudioInputSelect(audioInputs, onSelect) {
  let select = document.getElementById('audioInputSelect')
  const startButton = document.getElementById('startButton')
  const placeholder = document.getElementById('audioInputPlaceholder')
  
  if (!select) {
    select = createElement('select', { id: 'audioInputSelect' })
    const label = createElement('label', { for: 'audioInputSelect', textContent: 'Audio Input: ' })
    
    if (placeholder) {
      placeholder.appendChild(label)
      placeholder.appendChild(select)
    } else {
      console.warn('Audio input placeholder not found')
      const container = document.getElementById('controls')
      if (container) {
        container.appendChild(label)
        container.appendChild(select)
      }
    }
  }

  // Clear existing options
  select.innerHTML = ''

  // Add default option
  const defaultOption = createElement('option', { value: '', textContent: 'Default' })
  select.appendChild(defaultOption)

  // Add options for each audio input
  audioInputs.forEach(input => {
    const option = createElement('option', {
      value: input.deviceId,
      textContent: input.label || `(${input.deviceId.slice(0, 5)}...)`
    })
    select.appendChild(option)
  })

  select.addEventListener('change', () => {
    onSelect()
  })

  // Show the audio input select and hide the start button
  select.style.display = 'block'
  if (startButton) startButton.style.display = 'none'
}

/**
 * Shows the start button and hides the audio input select
 */
export function showStartButton() {
  const startButton = document.getElementById('startButton')
  const audioInputSelect = document.getElementById('audioInputSelect')
  if (startButton) startButton.style.display = 'block'
  if (audioInputSelect) audioInputSelect.style.display = 'none'
}
