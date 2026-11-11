import { ATTRIBUTE_LABELS } from './attributes.ts'
import type { AttributeKey } from './attributes.ts'
import { displayedValue, isTrumped } from './cardData.ts'
import { ICONS } from './icons.ts'
import type { CardData, EnumSettings, TrumpMaxSettings } from './types.ts'

export const CARD_W = 630
export const CARD_H = 880
export const CARD_IMAGE_RATIO = 63 / 61 // w/h of the image area in an exported card
export const CARD_BORDER_W = 8 // solid border stroke width around an exported card

const COLORS = {
  base: '#1e1e2e',
  mantle: '#181825',
  crust: '#11111b',
  surface0: '#313244',
  mauve: '#cba6f7',
  text: '#cdd6f4',
  subtext: '#a6adc8',
}

export async function renderCardPng(
  card: CardData,
  trumpMax: TrumpMaxSettings,
  enums: EnumSettings,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D not available')

  ctx.fillStyle = COLORS.mantle
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  const nameBarH = 56
  const iconsH = 170
  const footerH = 44
  const imgX = CARD_BORDER_W
  const imgY = CARD_BORDER_W
  const imgW = CARD_W - 2 * CARD_BORDER_W
  const imageH = Math.round(imgW / CARD_IMAGE_RATIO)

  if (card.image) {
    const img = await loadImage(card.image)
    const scale = Math.max(imgW / img.naturalWidth, imageH / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    ctx.save()
    ctx.beginPath()
    roundRect(ctx, imgX, imgY, imgW, imageH, 14)
    ctx.clip()
    ctx.drawImage(img, imgX + (imgW - w) / 2, imgY + (imageH - h) / 2, w, h)
    ctx.restore()
  } else {
    ctx.fillStyle = COLORS.surface0
    roundRect(ctx, imgX, imgY, imgW, imageH, 14)
    ctx.fill()
  }

  ctx.fillStyle = COLORS.mantle
  ctx.fillRect(0, imgY + imageH + nameBarH, CARD_W, iconsH)

  ctx.fillStyle = COLORS.crust
  ctx.fillRect(0, imgY + imageH, CARD_W, nameBarH)
  ctx.fillStyle = COLORS.text
  ctx.font = '700 30px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(card.characterName || 'New card', CARD_W / 2, imgY + imageH + nameBarH / 2, CARD_W - 32)

  const cellW = CARD_W / 6
  const attrs = card.attributes.map((a) => ({
    ...a,
    trump: isTrumped(a, trumpMax[a.key], enums[a.key]),
  }))
  for (let i = 0; i < attrs.length; i++) {
    const a = attrs[i]
    const cx = i * cellW + cellW / 2
    const cy = imgY + imageH + nameBarH + iconsH / 2
    if (a.trump) {
      ctx.fillStyle = COLORS.surface0
      ctx.strokeStyle = COLORS.mauve
      ctx.lineWidth = 4
      roundRect(ctx, i * cellW + 8, imgY + imageH + nameBarH + 14, cellW - 16, iconsH - 28, 12)
      ctx.fill()
      ctx.stroke()
    }
    const iconImg = await loadIcon(a.key)
    ctx.drawImage(iconImg, cx - 28, cy - 52, 56, 56)

    ctx.fillStyle = a.trump ? COLORS.mauve : COLORS.text
    ctx.font = '700 26px system-ui, sans-serif'
    ctx.fillText(displayedValue(a.value, a.trump), cx, cy + 16)

    ctx.fillStyle = COLORS.subtext
    ctx.font = '15px system-ui, sans-serif'
    ctx.fillText(ATTRIBUTE_LABELS[a.key].toUpperCase(), cx, cy + 44, cellW - 12)
  }

  ctx.fillStyle = COLORS.crust
  ctx.fillRect(0, CARD_H - footerH, CARD_W, footerH)
  ctx.fillStyle = COLORS.subtext
  ctx.font = '20px system-ui, sans-serif'
  ctx.fillText(card.animeTitles.join(', ') || '—', CARD_W / 2, CARD_H - footerH / 2, CARD_W - 32)

  ctx.strokeStyle = COLORS.crust
  ctx.lineWidth = CARD_BORDER_W
  roundRect(ctx, CARD_BORDER_W / 2, CARD_BORDER_W / 2, CARD_W - CARD_BORDER_W, CARD_H - CARD_BORDER_W, 22)
  ctx.stroke()

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encode failed'))), 'image/png'),
  )
}

const iconCache: Partial<Record<AttributeKey, HTMLImageElement>> = {}

async function loadIcon(key: AttributeKey): Promise<HTMLImageElement> {
  let img = iconCache[key]
  if (!img) {
    img = await loadImage(ICONS[key])
    iconCache[key] = img
  }
  return img
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (!src.startsWith('data:')) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image failed to load'))
    img.src = src
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
