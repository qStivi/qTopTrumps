import type { ReactNode } from 'react'

const INLINE = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g

function safeUrl(url: string): string | null {
  return /^https?:\/\//i.test(url) ? url : null
}

export function renderMarkdown(text: string): ReactNode[] {
  const out: ReactNode[] = []
  text.split('\n').forEach((line, li) => {
    if (li > 0) out.push(<br key={`br-${li}`} />)
    INLINE.lastIndex = 0
    let last = 0
    let m: RegExpExecArray | null
    let part = 0
    while ((m = INLINE.exec(line)) !== null) {
      if (m.index > last) out.push(line.slice(last, m.index))
      const key = `${li}-${part++}`
      if (m[1] !== undefined) {
        out.push(<strong key={key}>{m[1]}</strong>)
      } else if (m[2] !== undefined) {
        out.push(<em key={key}>{m[2]}</em>)
      } else if (m[3] !== undefined) {
        const href = safeUrl(m[4])
        out.push(
          href ? (
            <a key={key} href={href} target="_blank" rel="noreferrer">
              {m[3]}
            </a>
          ) : (
            <span key={key}>{m[0]}</span>
          ),
        )
      }
      last = m.index + m[0].length
    }
    if (last < line.length) out.push(line.slice(last))
  })
  return out
}
