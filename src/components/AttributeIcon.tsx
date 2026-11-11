import type { AttributeKey } from '../card/attributes.ts'
import { ICONS } from '../card/icons.ts'

export function AttributeIcon({ attribute }: { attribute: AttributeKey }) {
  return <img src={ICONS[attribute]} width="40" height="40" alt="" aria-hidden="true" />
}
