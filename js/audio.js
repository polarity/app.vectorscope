import { drawVectorscope, resetVectorscopeState } from './vectorscope.js'
import { updateVUMeter, setGainNode, createAudioInputSelect, showStartButton, getSmoothingAmount } from './ui.js'

let audioContext
let currentStream
let selectedAudioInputId = ''

/**
 * Starts the audio analysis process
 * @param {string} [deviceId] - Requested audio input device id
 */
export async function startAnalyzing(deviceId) {
  if (typeof deviceId === 'string') {
    selectedAudioInputId = deviceId
  }

  if (audioContext) {
    audioContext.close()
  }
  audioContext = new (window.AudioContext || window.webkitAudioContext)()
  
  try {
    const stream = await getAudioStream()
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop())
    }
    currentStream = stream
    resetVectorscopeState()
    processAudio(stream)
    
    // If we successfully got the stream, we can update audio inputs
    await updateAudioInputs(stream)
  } catch (error) {
    console.error('Error accessing audio stream:', error)
    showStartButton()
    alert('Failed to access audio stream. Please check your audio input settings and try again.')
  }
}

/**
 * Requests access to the user's audio input
 * @returns {Promise<MediaStream>} The audio stream
 */
async function getAudioStream() {
  console.log('Requesting audio stream')
  return navigator.mediaDevices.getUserMedia({
    audio: getAudioConstraints()
  })
}

/**
 * Processes the audio stream and starts the animation loop
 * @param {MediaStream} stream - The audio stream
 */
function processAudio(stream) {
  const source = audioContext.createMediaStreamSource(stream)

  // Create and connect the gain node
  const gainNode = audioContext.createGain()
  source.connect(gainNode)

  // Set the gainNode in the UI module
  setGainNode(gainNode)

  // Set initial gain from the gain slider value
  const gainSlider = document.getElementById('gainSlider')
  if (gainSlider) {
    const initialGain = parseFloat(gainSlider.value)
    // Set the initial gain value
    gainNode.gain.setValueAtTime(initialGain, audioContext.currentTime)
  } else {
    console.warn('Gain slider not found. Using default gain.')
  }

  const splitter = audioContext.createChannelSplitter(2)
  gainNode.connect(splitter)

  const analyserLeft = audioContext.createAnalyser()
  const analyserRight = audioContext.createAnalyser()
  analyserLeft.fftSize = 2048
  analyserRight.fftSize = 2048

  splitter.connect(analyserLeft, 0)
  splitter.connect(analyserRight, 1)

  const bufferLength = analyserLeft.fftSize
  const dataArrayLeft = new Float32Array(bufferLength)
  const dataArrayRight = new Float32Array(bufferLength)

  // Create frequency data arrays
  const frequencyDataLeft = new Uint8Array(analyserLeft.frequencyBinCount)
  const frequencyDataRight = new Uint8Array(analyserRight.frequencyBinCount)

  function draw() {
    window.requestAnimationFrame(draw)

    analyserLeft.getFloatTimeDomainData(dataArrayLeft)
    analyserRight.getFloatTimeDomainData(dataArrayRight)

    analyserLeft.getByteFrequencyData(frequencyDataLeft)
    analyserRight.getByteFrequencyData(frequencyDataRight)

    drawVectorscope(
      dataArrayLeft,
      dataArrayRight,
      frequencyDataLeft,
      frequencyDataRight,
      getSmoothingAmount()
    )
    updateVUMeter(dataArrayLeft, dataArrayRight)
  }

  draw()
}

/**
 * Updates the list of available audio inputs
 * @param {MediaStream} [stream] - Current active audio stream
 */
export async function updateAudioInputs(stream = currentStream) {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const audioInputs = devices.filter(device => device.kind === 'audioinput')
    selectedAudioInputId = resolveSelectedAudioInputId(audioInputs, stream)
    createAudioInputSelect(audioInputs, selectedAudioInputId, handleAudioInputChange)
  } catch (error) {
    console.error('Error enumerating audio devices:', error)
  }
}

/**
 * Handles audio input selection changes from the UI
 * @param {string} deviceId - Selected audio input device id
 */
function handleAudioInputChange(deviceId) {
  startAnalyzing(deviceId)
}

/**
 * Returns getUserMedia audio constraints for the selected device
 * @returns {MediaTrackConstraints} Audio constraints
 */
function getAudioConstraints() {
  const constraints = {
    sampleRate: 44100,
    sampleSize: 16,
    channelCount: 2,
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false
  }

  if (selectedAudioInputId) {
    constraints.deviceId = { exact: selectedAudioInputId }
  }

  return constraints
}

/**
 * Resolves which device id should be shown as selected in the UI
 * @param {MediaDeviceInfo[]} audioInputs - Available audio input devices
 * @param {MediaStream} [stream] - Current active audio stream
 * @returns {string} The selected device id or empty string for default
 */
function resolveSelectedAudioInputId(audioInputs, stream) {
  const availableDeviceIds = new Set(audioInputs.map(input => input.deviceId))
  const activeTrack = stream ? stream.getAudioTracks()[0] : null
  const activeDeviceId = activeTrack && activeTrack.getSettings
    ? activeTrack.getSettings().deviceId
    : ''

  if (activeDeviceId && availableDeviceIds.has(activeDeviceId)) {
    return activeDeviceId
  }

  if (selectedAudioInputId && availableDeviceIds.has(selectedAudioInputId)) {
    return selectedAudioInputId
  }

  return ''
}
