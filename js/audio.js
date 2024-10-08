import { drawVectorscope } from './vectorscope.js'
import { updateVUMeter, setGainNode, createAudioInputSelect, showStartButton } from './ui.js'

let audioContext
let currentStream

/**
 * Starts the audio analysis process
 */
export async function startAnalyzing() {
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
    processAudio(stream)
    
    // If we successfully got the stream, we can update audio inputs
    await updateAudioInputs()
  } catch (error) {
    console.error('Error accessing audio stream:', error)
    alert('Failed to access audio stream. Please check your audio input settings and try again.')
  }
}

/**
 * Requests access to the user's audio input
 * @returns {Promise<MediaStream>} The audio stream
 */
async function getAudioStream() {
  const audioInputSelect = document.getElementById('audioInputSelect')
  const selectedDeviceId = audioInputSelect ? audioInputSelect.value : undefined

  console.log('Requesting audio stream')
  return navigator.mediaDevices.getUserMedia({ 
    audio: {
      deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
      sampleRate: 44100,
      sampleSize: 16,
      channelCount: 2,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    }
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

    drawVectorscope(dataArrayLeft, dataArrayRight, frequencyDataLeft, frequencyDataRight)
    updateVUMeter(dataArrayLeft, dataArrayRight)
  }

  draw()
}

/**
 * Updates the list of available audio inputs
 */
export async function updateAudioInputs() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const audioInputs = devices.filter(device => device.kind === 'audioinput')
    createAudioInputSelect(audioInputs, startAnalyzing)
  } catch (error) {
    console.error('Error enumerating audio devices:', error)
  }
}
