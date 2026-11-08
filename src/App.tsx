import { useState } from 'react'
import { CharacterPicker } from './components/CharacterPicker.tsx'
import { CardEditor } from './components/CardEditor.tsx'
import { cardWithCharacter, emptyCard } from './card/cardData.ts'
import type { Character } from './anilist/types.ts'
import type { CardData } from './card/types.ts'
import './App.css'

function App() {
  const [card, setCard] = useState<CardData>(() => emptyCard())
  const [pickerOpen, setPickerOpen] = useState(false)

  function selectCharacter(character: Character) {
    setCard((current) => cardWithCharacter(current, character))
    setPickerOpen(false)
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>qTopTrumps</h1>
        <button type="button" className="ghost-button" onClick={() => setPickerOpen(true)}>
          Load character from AniList
        </button>
      </header>

      <CardEditor card={card} onChange={setCard} />

      {pickerOpen && (
        <div className="overlay" onClick={() => setPickerOpen(false)}>
          <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
            <div className="overlay-header">
              <h2>Pick a character</h2>
              <button type="button" className="ghost-button" onClick={() => setPickerOpen(false)}>
                Close
              </button>
            </div>
            <CharacterPicker onSelect={selectCharacter} selected={null} />
          </div>
        </div>
      )}
    </main>
  )
}

export default App
