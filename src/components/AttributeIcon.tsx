import type { AttributeKey } from '../card/attributes.ts'
import { ICONS } from '../card/icons.ts'

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
