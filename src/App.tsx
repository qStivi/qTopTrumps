import { useState } from 'react'
import { CharacterPicker } from './components/CharacterPicker.tsx'
import { CardEditor } from './components/CardEditor.tsx'
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
        <aside className="picker-panel">
          <h2>Pick a character</h2>
          <CharacterPicker onSelect={selectCharacter} selected={selected} />
        </aside>
        <CardEditor card={card} onChange={setCard} />
      </div>
    </main>
  )
}

export default App
