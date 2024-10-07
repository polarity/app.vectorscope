import { getVectorscopeOverlay } from './ui.js'

/**
 * Draws the overlay with guides on the vectorscope
 */
export function drawOverlay() {
  const vectorscopeOverlay = getVectorscopeOverlay()
  const ctx = vectorscopeOverlay.getContext('2d')
  const width = vectorscopeOverlay.width
  const height = vectorscopeOverlay.height

  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 1

  // Draw diagonal lines
  ctx.beginPath()
  ctx.moveTo(0, height)
  ctx.lineTo(width, 0)
  ctx.moveTo(0, 0)
  ctx.lineTo(width, height)
  ctx.stroke()

  // Draw circles
  const radii = [0.25, 0.5, 0.75, 1]
  radii.forEach(radius => {
    ctx.beginPath()
    ctx.arc(width / 2, height / 2, radius * width / 2, 0, 2 * Math.PI)
    ctx.stroke()
  })

  // Draw labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = `${width / 50}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Left label
  ctx.save()
  ctx.translate(width * 0.1, height * 0.9)
  ctx.rotate(-Math.PI / 4)
  ctx.fillText('Left', 0, 0)
  ctx.restore()

  // Right label
  ctx.save()
  ctx.translate(width * 0.9, height * 0.9)
  ctx.rotate(Math.PI / 4)
  ctx.fillText('Right', 0, 0)
  ctx.restore()

  // Top label
  ctx.fillText('Left + Right', width / 2, height * 0.05)

  // Bottom label
  ctx.fillText('Left - Right', width / 2, height * 0.95)
}