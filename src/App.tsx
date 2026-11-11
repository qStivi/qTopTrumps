import { useState } from 'react'
import { CharacterPicker } from './components/CharacterPicker.tsx'
import { CardEditor } from './components/CardEditor.tsx'
import { cardWithCharacter, emptyCard } from './card/cardData.ts'
import type { Character } from './anilist/types.ts'
import type { CardData } from './card/types.ts'
import './App.css'

function App() {
  const [card, setCard] = useState<CardData>(() => emptyCard())

  function selectCharacter(character: Character) {
    setCard((current) => cardWithCharacter(current, character))
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>qTopTrumps</h1>
      </header>
      <div className="workspace">
        <aside className="picker-panel">
          <h2>Pick a character</h2>
          <CharacterPicker onSelect={selectCharacter} selected={null} />
        </aside>
        <CardEditor card={card} onChange={setCard} />
      </div>
    </main>
  )
}

export default App
