import { useState } from 'react'
import { CharacterPicker } from './components/CharacterPicker.tsx'
import type { Character } from './anilist/types.ts'
import './App.css'

function App() {
  const [selected, setSelected] = useState<Character | null>(null)

  return (
    <main className="app">
      <header className="app-header">
        <h1>qTopTrumps</h1>
        <p>Pick an anime character to build a Top Trumps card.</p>
      </header>

      <CharacterPicker onSelect={setSelected} selected={selected} />

      {selected && (
        <aside className="selected-panel">
          {selected.image && <img src={selected.image} alt={selected.name} />}
          <div>
            <h2>{selected.name}</h2>
            {selected.animeTitles.length > 0 && (
              <p className="anime">{selected.animeTitles.join(', ')}</p>
            )}
            {selected.description && <p className="description">{selected.description}</p>}
          </div>
        </aside>
      )}
    </main>
  )
}

export default App
