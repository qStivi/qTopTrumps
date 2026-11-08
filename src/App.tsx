import { useState } from 'react'
import { CharacterPicker } from './components/CharacterPicker.tsx'
import { CardEditor } from './components/CardEditor.tsx'
import { cardFromCharacter } from './card/cardData.ts'
import type { Character } from './anilist/types.ts'
import type { CardData } from './card/types.ts'
import './App.css'

function App() {
  const [selected, setSelected] = useState<Character | null>(null)
  const [card, setCard] = useState<CardData | null>(null)

  function selectCharacter(character: Character) {
    setSelected(character)
    setCard(cardFromCharacter(character))
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>qTopTrumps</h1>
        <p>Pick an anime character to build a Top Trumps card.</p>
      </header>

      <CharacterPicker onSelect={selectCharacter} selected={selected} />

      {card && <CardEditor card={card} onChange={setCard} />}
    </main>
  )
}

export default App
