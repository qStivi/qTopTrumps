import { useMemo, useState } from 'react'
import { ATTRIBUTE_LABELS } from '../card/attributes.ts'
import { AttributeIcon } from './AttributeIcon.tsx'
import { CropTool } from './CropTool.tsx'
import { extractPayload, embedPayload } from '../card/pngMetadata.ts'
import { renderCardPng } from '../card/renderCard.ts'
import { displayedValue, isTrumped } from '../card/cardData.ts'
import { loadTrumpMaxSettings, saveTrumpMaxSettings } from '../card/settings.ts'
import type { CardData, TrumpMaxSettings } from '../card/types.ts'

interface CardEditorProps {
  card: CardData
  onChange: (card: CardData) => void
}

export function CardEditor({ card, onChange }: CardEditorProps) {
  const [trumpMax, setTrumpMax] = useState<TrumpMaxSettings>(() => loadTrumpMaxSettings())
  const [pendingImage, setPendingImage] = useState<string | null>(null)

  const effective = useMemo(
    () => ({
      ...card,
      attributes: card.attributes.map((a) => ({
        ...a,
        trump: isTrumped(a.value, a.trump, trumpMax[a.key]),
      })),
    }),
    [card, trumpMax],
  )

  function updateAttribute(key: string, patch: Partial<{ value: number | null; trump: boolean }>) {
    onChange({
      ...card,
      attributes: card.attributes.map((a) => (a.key === key ? { ...a, ...patch } : a)),
    })
  }

  function updateTrumpMax(key: string, max: number) {
    const next = { ...trumpMax, [key]: max }
    setTrumpMax(next)
    saveTrumpMaxSettings(next)
  }

  async function onFileChosen(file: File) {
    const restored = await extractPayload(file)
    if (restored) {
      const reader = new FileReader()
      reader.onload = () => {
        onChange({
          ...card,
          characterName: restored.characterName ?? card.characterName,
          animeTitles: restored.animeTitles ?? card.animeTitles,
          attributes: restored.attributes ?? card.attributes,
          image: String(reader.result),
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
    const png = await renderCardPng(card, trumpMax)
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
        <div className="card-icons">
          {effective.attributes.map((a) => (
            <div key={a.key} className={`card-icon-cell${a.trump ? ' trump' : ''}`}>
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
        <h3>Attributes</h3>
        {card.attributes.map((a) => (
          <div className="attr-row" key={a.key}>
            <label>
              {ATTRIBUTE_LABELS[a.key]}
              <input
                type="number"
                min={0}
                value={a.value ?? ''}
                placeholder="—"
                onChange={(e) => {
                  const v = e.target.value
                  updateAttribute(a.key, { value: v === '' ? null : Number(v) })
                }}
              />
            </label>
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
        ))}
      </div>
    </div>
  )
}