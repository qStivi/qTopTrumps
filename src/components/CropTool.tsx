import { useEffect, useRef, useState } from 'react'

export const CARD_RATIO = 63 / 88 // width / height, fixed by spec
export const EXPORT_WIDTH = 630
export const EXPORT_HEIGHT = 880
const SNAP_THRESHOLD_PX = 12 // screen pixels

interface CropRect {
  x: number
  y: number
  w: number
  h: number
}

interface CropToolProps {
  imageSrc: string
  defaultBackground: string
  onDone: (dataUrl: string) => void
  onCancel: () => void
}

function cropToFill(imgW: number, imgH: number): CropRect {
  const targetH = imgW / CARD_RATIO
  if (targetH <= imgH) {
    return { x: 0, y: (imgH - targetH) / 2, w: imgW, h: targetH }
  }
  const w = imgH * CARD_RATIO
  return { x: (imgW - w) / 2, y: 0, w, h: imgH }
}

export function CropTool({ imageSrc, defaultBackground, onDone, onCancel }: CropToolProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [crop, setCrop] = useState<CropRect | null>(null)
  const [background, setBackground] = useState(defaultBackground)
  const [loadError, setLoadError] = useState(false)
  const dragRef = useRef<null | { mode: 'move' | 'resize'; startX: number; startY: number; orig: CropRect }>(null)

  useEffect(() => {
    const img = new Image()
    if (!imageSrc.startsWith('data:')) img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight })
      setCrop(cropToFill(img.naturalWidth, img.naturalHeight))
    }
    img.onerror = () => setLoadError(true)
    img.src = imageSrc
  }, [imageSrc])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setContainerWidth(el.clientWidth))
    observer.observe(el)
    setContainerWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [imgSize])

  if (loadError) return <p className="status error">Could not load that image.</p>
  if (!imgSize || !crop) return <p className="status">Loading image…</p>

  const imgW = imgSize.w
  const imgH = imgSize.h
  const scale = containerWidth > 0 ? containerWidth / imgW : 1

  function snap(value: number, target: number): number {
    return Math.abs(value - target) < SNAP_THRESHOLD_PX / Math.max(scale, 0.01) ? target : value
  }

  function applySnap(rect: CropRect): CropRect {
    let { x, y, w, h } = rect
    x = snap(x + w / 2, imgW / 2) - w / 2
    y = snap(y + h / 2, imgH / 2) - h / 2
    x = snap(x, 0)
    y = snap(y, 0)
    if (x + w > imgW) x = snap(x + w, imgW) - w
    if (y + h > imgH) y = snap(y + h, imgH) - h
    return { x, y, w, h }
  }

  function onPointerDown(e: React.PointerEvent, mode: 'move' | 'resize') {
    if (!crop) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, orig: crop }
  }

  function onPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current
    if (!drag || !crop) return
    const dx = (e.clientX - drag.startX) / scale
    const dy = (e.clientY - drag.startY) / scale
    if (drag.mode === 'move') {
      setCrop(applySnap({ ...drag.orig, x: drag.orig.x + dx, y: drag.orig.y + dy }))
    } else {
      const w = Math.max(40, drag.orig.w + dx)
      setCrop(applySnap({ ...drag.orig, w, h: w / CARD_RATIO }))
    }
  }

  function onPointerUp() {
    dragRef.current = null
  }

  function apply() {
    if (!crop || !imgSize) return
    const { w: imgW, h: imgH } = imgSize
    const canvas = document.createElement('canvas')
    canvas.width = EXPORT_WIDTH
    canvas.height = EXPORT_HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = background
    ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT)
    const img = new Image()
    if (!imageSrc.startsWith('data:')) img.crossOrigin = 'anonymous'
    img.onload = () => {
      const sx = Math.max(0, crop.x)
      const sy = Math.max(0, crop.y)
      const sx2 = Math.min(imgW, crop.x + crop.w)
      const sy2 = Math.min(imgH, crop.y + crop.h)
      const sw = sx2 - sx
      const sh = sy2 - sy
      if (sw > 0 && sh > 0) {
        const dw = ((sx - crop.x) / crop.w) * EXPORT_WIDTH
        const dh = ((sy - crop.y) / crop.h) * EXPORT_HEIGHT
        const dWidth = (sw / crop.w) * EXPORT_WIDTH
        const dHeight = (sh / crop.h) * EXPORT_HEIGHT
        ctx.drawImage(img, sx, sy, sw, sh, dw, dh, dWidth, dHeight)
      }
      onDone(canvas.toDataURL('image/png'))
    }
    img.onerror = () => setLoadError(true)
    img.src = imageSrc
  }

  const left = crop.x * scale
  const top = crop.y * scale
  const width = crop.w * scale
  const height = crop.h * scale

  return (
    <div className="crop-tool">
      <div
        ref={containerRef}
        className="crop-container"
        style={{ height: imgH * scale }}
      >
        <img src={imageSrc} alt="To crop" draggable={false} />
        <div
          className="crop-rect"
          style={{ left, top, width, height }}
          onPointerDown={(e) => onPointerDown(e, 'move')}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div
            className="crop-handle"
            onPointerDown={(e) => {
              e.stopPropagation()
              onPointerDown(e, 'resize')
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        </div>
      </div>
      <div className="crop-actions">
        <label>
          Over-crop background
          <input
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          />
        </label>
        <button type="button" onClick={apply}>Apply crop</button>
        <button type="button" className="ghost-button" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
