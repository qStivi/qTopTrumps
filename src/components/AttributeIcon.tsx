import type { AttributeKey } from '../card/attributes.ts'
import { ICONS } from '../card/icons.ts'

export function AttributeIcon({ attribute }: { attribute: AttributeKey }) {
  return <img src={ICONS[attribute]} width="26" height="26" alt="" aria-hidden="true" />
}
