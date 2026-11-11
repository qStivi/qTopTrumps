import type { ReactNode } from 'react'

const INLINE = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g

function safeUrl(url: string): string | null {
  return /^https?:\/\//i.test(url) ? url : null
}

export function renderMarkdown(text: string): ReactNode[] {
  const out: ReactNode[] = []
  text.split('\n').forEach((line, li) => {
    if (li > 0) out.push(<br key={`br-${li}`} />)
    line.split(INLINE).forEach((part, pi) => {
      if (!part) return
      const key = `${li}-${pi}`
      let m = part.match(/^\*\*([^*]+)\*\*$/)
      if (m) {
        out.push(<strong key={key}>{m[1]}</strong>)
        return
      }
      m = part.match(/^\*([^*]+)\*$/)
      if (m) {
        out.push(<em key={key}>{m[1]}</em>)
        return
      }
      m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
      if (m) {
        const href = safeUrl(m[2])
        out.push(
          href ? (
            <a key={key} href={href} target="_blank" rel="noreferrer">
              {m[1]}
            </a>
          ) : (
            <span key={key}>{part}</span>
          ),
        )
        return
      }
      out.push(part)
    })
  })
  return out
}
