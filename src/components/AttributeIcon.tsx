import type { AttributeKey } from '../card/attributes.ts'

export const ICONS: Record<AttributeKey, { color: string; path: string }> = {
  power: {
    color: '#fab387',
    path: 'M3 21l1-4L15 6l3 3L7 20l-4 1zm11-13l2-2 3 3-2 2-3-3z',
  },
  age: {
    color: '#a6e3a1',
    path: 'M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5',
  },
  height: {
    color: '#89b4fa',
    path: 'M12 3v18M12 3L8 7m4-4l4 4M12 21l-4-4m4 4l4-4',
  },
  weight: {
    color: '#a6e3a1',
    path: 'M9 8a3 3 0 0 1 6 0M6 8h12v3a6 6 0 0 1-12 0V8z',
  },
  bust: {
    color: '#cba6f7',
    path: 'M4 7h16M4 7c0 5 2.5 8 6 8 2.5 0 4-1.5 4-4M20 7c0 5-2.5 8-6 8-2.5 0-4-1.5-4-4M4 7l2-3m14 3l-2-3',
  },
  cuteness: {
    color: '#f38ba8',
    path: 'M12 21S4.5 16.5 2.5 12C1 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 5 23 8.5 21.5 12 19.5 16.5 12 21 12 21z',
  },
}

export function AttributeIcon({ attribute }: { attribute: AttributeKey }) {
  const icon = ICONS[attribute]
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke={icon.color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  )
}
