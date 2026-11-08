import { useMemo, useState } from 'react'
import { ATTRIBUTE_LABELS } from '../card/attributes.ts'
import { displayedValue, isTrumped } from '../card/cardData.ts'
import { loadTrumpMaxSettings, saveTrumpMaxSettings } from '../card/settings.ts'
import type { CardData, TrumpMaxSettings } from '../card/types.ts'

interface CardEditorProps {
  card: CardData
  onChange: (card: CardData) => void
}

export function CardEditor({ card, onChange }: CardEditorProps) {
  const [trumpMax, setTrumpMax] = useState<TrumpMaxSettings>(() => loadTrumpMaxSettings())

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

  return (
    <div className="editor">
      <div className="card-preview" aria-label="Card preview">
        {effective.image ? (
          <img className="card-image" src={effective.image} alt={effective.characterName} />
        ) : (
          <div className="card-image placeholder">No image yet</div>
        )}
        <div className="card-body">
          <h2 className="card-name">{effective.characterName}</h2>
          {effective.animeTitles.length > 0 && (
            <p className="card-anime">{effective.animeTitles.join(', ')}</p>
          )}
          <ul className="card-attributes">
            {effective.attributes.map((a) => (
              <li key={a.key} className={a.trump ? 'trump' : ''}>
                <span className="attr-label">{ATTRIBUTE_LABELS[a.key]}</span>
                <span className="attr-value">{displayedValue(a.value, a.trump)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="editor-controls">
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