import { useEffect, useRef } from 'react'
import {
  CARD_BORDER_W,
  CARD_H,
  CARD_IMG_H,
  CARD_SECTIONS,
  CARD_W,
  drawCard,
} from '../card/renderCard.ts'
import type { AttributeKey } from '../card/attributes.ts'
import { isTrumped } from '../card/cardData.ts'
import type { CardData, EnumSettings, TrumpMaxSettings } from '../card/types.ts'

const PREVIEW_W = 340

interface CardPreviewCanvasProps {
  card: CardData
  trumpMax: TrumpMaxSettings
  enums: EnumSettings
  onToggleTrump: (key: AttributeKey, currentlyTrumped: boolean) => void
  onNudgeValue: (key: AttributeKey, dir: 1 | -1) => void
}

export function CardPreviewCanvas({
  card,
  trumpMax,
  enums,
  onToggleTrump,
  onNudgeValue,
}: CardPreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = PREVIEW_W
    canvas.height = Math.round((PREVIEW_W * CARD_H) / CARD_W)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const scale = PREVIEW_W / CARD_W
    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    void drawCard(ctx, card, trumpMax, enums).catch(() => {})
  }, [card, trumpMax, enums])

  function cardCoords(e: React.MouseEvent | React.WheelEvent) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scale = CARD_W / rect.width
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    }
  }

  function cellAt(pt: { x: number; y: number }): AttributeKey | null {
    const iconsTop = CARD_BORDER_W + CARD_IMG_H + CARD_SECTIONS.nameBarH
    const iconsBottom = iconsTop + CARD_SECTIONS.iconsH
    if (pt.y < iconsTop || pt.y > iconsBottom || pt.x < 0 || pt.x > CARD_W) return null
    const i = Math.min(5, Math.floor(pt.x / (CARD_W / 6)))
    return card.attributes[i]?.key ?? null
  }

  function onClick(e: React.MouseEvent) {
    const pt = cardCoords(e)
    if (!pt) return
    const key = cellAt(pt)
    if (!key) return
    const attr = card.attributes.find((a) => a.key === key)
    if (!attr) return
    onToggleTrump(key, isTrumped(attr, trumpMax[key], enums[key]))
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const target: HTMLCanvasElement = canvas
    function onWheel(e: WheelEvent) {
      const rect = target.getBoundingClientRect()
      const scale = CARD_W / rect.width
      const pt = { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale }
      const iconsTop = CARD_BORDER_W + CARD_IMG_H + CARD_SECTIONS.nameBarH
      const iconsBottom = iconsTop + CARD_SECTIONS.iconsH
      if (pt.y < iconsTop || pt.y > iconsBottom || pt.x < 0 || pt.x > CARD_W) return
      e.preventDefault()
      const i = Math.min(5, Math.floor(pt.x / (CARD_W / 6)))
      const key = card.attributes[i]?.key
      if (key) onNudgeValue(key, e.deltaY < 0 ? 1 : -1)
    }
    target.addEventListener('wheel', onWheel, { passive: false })
    return () => target.removeEventListener('wheel', onWheel)
  }, [card, onNudgeValue])

  return (
    <canvas
      ref={canvasRef}
      className="card-preview-canvas"
      aria-label="Card preview"
      onClick={onClick}
    />
  )
}
