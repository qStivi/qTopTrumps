import type { AttributeKey } from './attributes.ts'

export interface CardAttribute {
  key: AttributeKey
  value: number | null
  trump: boolean
}

export interface CardData {
  characterName: string
  animeTitles: string[]
  image: string | null
  description: string | null
  attributes: CardAttribute[]
}

export type TrumpMaxSettings = Record<AttributeKey, number>
