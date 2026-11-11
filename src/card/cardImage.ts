import { CARD_IMAGE_RATIO, loadImage } from './renderCard.ts'

export async function cropToCardImageArea(src: string): Promise<string> {
  const img = await loadImage(src)
  const w = img.naturalWidth
  const h = Math.min(img.naturalHeight, w / CARD_IMAGE_RATIO)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D not available')
  ctx.drawImage(img, 0, 0, w, h, 0, 0, w, h)
  return canvas.toDataURL('image/png')
}
