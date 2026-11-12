import { useState } from 'react'
import { CharacterPicker } from './components/CharacterPicker.tsx'
import { CardEditor } from './components/CardEditor.tsx'
import { renderMarkdown } from './components/markdown.tsx'
import { cardWithCharacter, emptyCard } from './card/cardData.ts'
import type { Character } from './anilist/types.ts'
import type { CardData } from './card/types.ts'
import './App.css'

function App() {
  const [card, setCard] = useState<CardData>(() => emptyCard())
  const [selected, setSelected] = useState<Character | null>(null)

  function selectCharacter(character: Character) {
    setCard((current) => cardWithCharacter(current, character))
    setSelected(character)
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>qTopTrumps</h1>
      </header>
      <div className="workspace">
        <aside className="info-panel">
          {selected ? (
            <>
              <span className="result-name">{selected.name}</span>
              {selected.animeTitles.length > 0 && (
                <span className="result-anime">{selected.animeTitles.join(', ')}</span>
              )}
              {selected.description && (
                <div className="info-panel-description">
                  {renderMarkdown(selected.description.replace(/~([^~]*)~/g, '$1').trim())}
                </div>
              )}
            </>
          ) : (
            <span className="picker-selected-empty">Select a character to see its details</span>
          )}
        </aside>
        <CardEditor card={card} onChange={setCard} />
        <aside className="search-panel">
          <h2>Pick a character</h2>
          <CharacterPicker onSelect={selectCharacter} selected={selected} />
        </aside>
      </div>
    </main>
  )
}

export default App
