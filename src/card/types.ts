import type { AttributeKey } from './attributes.ts'

export interface CardAttribute {
  key: AttributeKey
  value: number | string | null
  trump: boolean
  trumpDisabled: boolean
}

export interface CardData {
  characterName: string
  animeTitles: string[]
  image: string | null
  description: string | null
  attributes: CardAttribute[]
}

export type TrumpMaxSettings = Record<AttributeKey, number>

export type EnumSettings = Record<AttributeKey, string[]>
