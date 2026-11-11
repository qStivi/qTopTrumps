import { CARD_BORDER_W, CARD_H, CARD_IMAGE_RATIO, CARD_W, loadImage } from './renderCard.ts'

export async function cropToCardImageArea(src: string): Promise<string> {
  const img = await loadImage(src)
  const imgW = img.naturalWidth
  const imgH = img.naturalHeight
  const imageH = CARD_W / CARD_IMAGE_RATIO
  const x = (imgW * CARD_BORDER_W) / CARD_W
  const y = (imgH * CARD_BORDER_W) / CARD_H
  const w = imgW - 2 * x
  const h = Math.min(imgH - y, (imgH * (imageH - CARD_BORDER_W)) / CARD_H)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D not available')
  ctx.drawImage(img, x, y, w, h, 0, 0, w, h)
  return canvas.toDataURL('image/png')
}
