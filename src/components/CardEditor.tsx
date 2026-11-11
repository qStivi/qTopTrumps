import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ATTRIBUTE_LABELS } from '../card/attributes.ts'
import type { AttributeKey } from '../card/attributes.ts'
import { AttributeIcon } from './AttributeIcon.tsx'
import { CropTool } from './CropTool.tsx'
import { extractPayload, embedPayload } from '../card/pngMetadata.ts'
import { cropToCardImageArea } from '../card/cardImage.ts'
import { renderCardPng } from '../card/renderCard.ts'
import { displayedValue, isTrumped } from '../card/cardData.ts'
import { loadEnumSettings, loadTrumpMaxSettings, saveEnumSettings, saveTrumpMaxSettings } from '../card/settings.ts'
import type { CardData, EnumSettings, TrumpMaxSettings } from '../card/types.ts'

interface CardEditorProps {
  card: CardData
  onChange: (card: CardData) => void
}

export function CardEditor({ card, onChange }: CardEditorProps) {
  const [trumpMax, setTrumpMax] = useState<TrumpMaxSettings>(() => loadTrumpMaxSettings())
  const [enums, setEnums] = useState<EnumSettings>(() => loadEnumSettings())
  const [enumEditorOpen, setEnumEditorOpen] = useState<AttributeKey | null>(null)
  const [newEnum, setNewEnum] = useState('')
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const iconsRef = useRef<HTMLDivElement>(null)

  const updateAttribute = useCallback(
    (key: string, patch: Partial<{ value: number | string | null; trump: boolean; trumpDisabled: boolean }>) => {
      onChange({
        ...card,
        attributes: card.attributes.map((a) => (a.key === key ? { ...a, ...patch } : a)),
      })
    },
    [card, onChange],
  )

  useEffect(() => {
    const el = iconsRef.current
    if (!el) return
    function onWheel(e: WheelEvent) {
      const cell = (e.target as HTMLElement).closest('.card-icon-cell')
      const key = cell?.getAttribute('data-attr')
      if (!key) return
      const attr = card.attributes.find((a) => a.key === key)
      if (!attr) return
      const dir = e.deltaY < 0 ? 1 : -1
      e.preventDefault()
      const options = enums[key as AttributeKey] ?? []
      if (options.length > 0) {
        const idx = typeof attr.value === 'string' ? options.indexOf(attr.value) : -1
        updateAttribute(key, { value: options[(idx + dir + options.length) % options.length] })
        return
      }
      if (attr.value === null && dir < 0) return
      updateAttribute(key, { value: Math.max(0, (typeof attr.value === 'number' ? attr.value : 0) + dir) })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [card, updateAttribute, enums])

  const effective = useMemo(
    () => ({
      ...card,
      attributes: card.attributes.map((a) => ({
        ...a,
        trump: isTrumped(a, trumpMax[a.key], enums[a.key]),
      })),
    }),
    [card, trumpMax, enums],
  )

  function updateTrumpMax(key: string, max: number) {
    const next = { ...trumpMax, [key]: max }
    setTrumpMax(next)
    saveTrumpMaxSettings(next)
  }

  function updateEnums(key: AttributeKey, options: string[]) {
    const next = { ...enums, [key]: options }
    setEnums(next)
    saveEnumSettings(next)
  }

  function moveEnum(key: AttributeKey, index: number, delta: number) {
    const options = [...enums[key]]
    const target = index + delta
    if (target < 0 || target >= options.length) return
    const [item] = options.splice(index, 1)
    options.splice(target, 0, item)
    updateEnums(key, options)
  }

  async function onFileChosen(file: File) {
    const restored = await extractPayload(file)
    if (restored) {
      const reader = new FileReader()
      reader.onload = async () => {
        const image = await cropToCardImageArea(String(reader.result))
        onChange({
          ...card,
          characterName: restored.characterName ?? card.characterName,
          animeTitles: restored.animeTitles ?? card.animeTitles,
          attributes: restored.attributes ?? card.attributes,
          image,
        })
      }
      reader.readAsDataURL(file)
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPendingImage(String(reader.result))
    reader.readAsDataURL(file)
  }

  async function downloadCard() {
    const png = await renderCardPng(card, trumpMax, enums)
    const withData = await embedPayload(png, card)
    const url = URL.createObjectURL(withData)
    const a = document.createElement('a')
    a.href = url
    a.download = `${card.characterName || 'card'}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="editor">
      <div className="card-preview" aria-label="Card preview">
        {effective.image ? (
          <img className="card-image" src={effective.image} alt={effective.characterName} />
        ) : (
          <div className="card-image placeholder">No image yet</div>
        )}
        <div className="card-name-bar">{effective.characterName || 'New card'}</div>
        <div className="card-icons" ref={iconsRef}>
          {effective.attributes.map((a) => (
            <div
              key={a.key}
              className={`card-icon-cell${a.trump ? ' trump' : ''}`}
              data-attr={a.key}
              onClick={() =>
                updateAttribute(
                  a.key,
                  a.trump
                    ? { trump: false, trumpDisabled: true }
                    : { trump: true, trumpDisabled: false },
                )
              }
            >
              <AttributeIcon attribute={a.key} />
              <span className="card-icon-value">{displayedValue(a.value, a.trump)}</span>
              <span className="card-icon-label">{ATTRIBUTE_LABELS[a.key]}</span>
            </div>
          ))}
        </div>
        <div className="card-footer">
          {effective.animeTitles.length > 0 ? effective.animeTitles.join(', ') : '—'}
        </div>
      </div>

      <div className="editor-controls">
        <div className="image-controls">
          <label className="ghost-button upload-button">
            Upload image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                void onFileChosen(file)
                e.target.value = ''
              }}
            />
          </label>
          <button type="button" className="ghost-button" onClick={() => void downloadCard()}>
            Download PNG
          </button>
        </div>
        {pendingImage && (
          <CropTool
            imageSrc={pendingImage}
            defaultBackground="#1e1e2e"
            onDone={(dataUrl) => {
              onChange({ ...card, image: dataUrl })
              setPendingImage(null)
            }}
            onCancel={() => setPendingImage(null)}
          />
        )}
        <label className="name-field">
          Character name
          <input
            type="text"
            value={card.characterName}
            placeholder="New card"
            onChange={(e) => onChange({ ...card, characterName: e.target.value })}
          />
        </label>
        <label className="name-field">
          Anime (one per line)
          <textarea
            rows={2}
            value={card.animeTitles.join('\n')}
            placeholder="—"
            onChange={(e) =>
              onChange({
                ...card,
                animeTitles: e.target.value.split('\n').map((s) => s.trim()).filter((s) => s.length > 0),
              })
            }
          />
        </label>
        <h3>Attributes</h3>
        {card.attributes.map((a) => {
          const options = enums[a.key]
          const hasEnums = options.length > 0
          const selectValue = typeof a.value === 'string' ? a.value : ''
          const selectOptions =
            hasEnums && selectValue !== '' && !options.includes(selectValue)
              ? [...options, selectValue]
              : options
          return (
            <div className="attr-block" key={a.key}>
              <div className="attr-row">
                <label>
                  {ATTRIBUTE_LABELS[a.key]}
                  {hasEnums ? (
                    <select
                      value={selectValue}
                      onChange={(e) =>
                        updateAttribute(a.key, { value: e.target.value === '' ? null : e.target.value })
                      }
                    >
                      <option value="">—</option>
                      {selectOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      value={typeof a.value === 'number' ? a.value : ''}
                      placeholder="—"
                      onChange={(e) => {
                        const v = e.target.value
                        updateAttribute(a.key, { value: v === '' ? null : Number(v) })
                      }}
                    />
                  )}
                </label>
                <button
                  type="button"
                  className="ghost-button enum-toggle"
                  onClick={() => setEnumEditorOpen(enumEditorOpen === a.key ? null : a.key)}
                >
                  enum{hasEnums ? ` (${options.length})` : ''}
                </button>
                <label className="trump-toggle">
                  <input
                    type="checkbox"
                    checked={a.trump}
                    onChange={(e) => updateAttribute(a.key, { trump: e.target.checked })}
                  />
                  trump
                </label>
                <label className="trump-max">
                  max
                  <input
                    type="number"
                    min={0}
                    value={trumpMax[a.key]}
                    onChange={(e) => updateTrumpMax(a.key, Number(e.target.value))}
                  />
                </label>
              </div>
              {enumEditorOpen === a.key && (
                <div className="enum-editor">
                  {options.map((opt, i) => (
                    <div className="enum-option" key={opt}>
                      <span className="enum-option-label">{opt}</span>
                      <button type="button" disabled={i === 0} onClick={() => moveEnum(a.key, i, -1)}>
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={i === options.length - 1}
                        onClick={() => moveEnum(a.key, i, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => updateEnums(a.key, options.filter((_, j) => j !== i))}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <form
                    className="enum-add"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const v = newEnum.trim()
                      if (v && !options.includes(v)) updateEnums(a.key, [...options, v])
                      setNewEnum('')
                    }}
                  >
                    <input
                      type="text"
                      value={newEnum}
                      placeholder="New option"
                      onChange={(e) => setNewEnum(e.target.value)}
                    />
                    <button type="submit" disabled={!newEnum.trim()}>
                      Add
                    </button>
                  </form>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}