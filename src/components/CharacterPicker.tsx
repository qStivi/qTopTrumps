import { useState } from 'react'
import type { Character } from '../anilist/types.ts'
import { fetchUserCharacters, searchCharacters } from '../anilist/queries.ts'

type Status = 'idle' | 'loading' | 'error'

interface CharacterPickerProps {
  onSelect: (character: Character) => void
  selected: Character | null
}

export function CharacterPicker({ onSelect, selected }: CharacterPickerProps) {
  const [username, setUsername] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Character[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function run(load: () => Promise<Character[]>) {
    setStatus('loading')
    setError(null)
    try {
      setResults(await load())
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }

  return (
    <div className="picker">
      <div className="picker-controls">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (username.trim()) void run(() => fetchUserCharacters(username.trim()))
          }}
        >
          <input
            type="text"
            placeholder="AniList username (browse list)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit" disabled={status === 'loading' || !username.trim()}>
            Load list
          </button>
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (query.trim()) void run(() => searchCharacters(query.trim()).then((r) => r.characters))
          }}
        >
          <input
            type="text"
            placeholder="Search characters by name or description"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={status === 'loading' || !query.trim()}>
            Search
          </button>
        </form>
      </div>

      {status === 'loading' && <p className="status">Loading…</p>}
      {status === 'error' && <p className="status error">{error}</p>}

      <div className="results">
        {results.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`result${selected?.id === c.id ? ' selected' : ''}`}
            onClick={() => onSelect(c)}
          >
            {c.image ? (
              <img src={c.image} alt={c.name} loading="lazy" />
            ) : (
              <span className="no-image" aria-hidden="true">?</span>
            )}
            <span className="result-name">{c.name}</span>
            {c.animeTitles.length > 0 && (
              <span className="result-anime">{c.animeTitles.slice(0, 2).join(', ')}</span>
            )}
            {c.description && (
              <span className="result-description">
                {c.description.replace(/~([^~]*)~/g, '$1').trim()}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
