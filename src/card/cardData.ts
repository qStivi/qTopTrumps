import { ATTRIBUTE_KEYS } from './attributes.ts'
import type { Character } from '../anilist/types.ts'
import type { CardData, TrumpMaxSettings } from './types.ts'

export function cardFromCharacter(character: Character): CardData {
  return {
    characterName: character.name,
    animeTitles: character.animeTitles,
    image: character.image,
    description: character.description,
    attributes: ATTRIBUTE_KEYS.map((key) => ({ key, value: null, trump: false })),
  }
}

export function isTrumped(
  value: number | null,
  trump: boolean,
  trumpMax: number,
): boolean {
  if (trump) return true
  return value !== null && value >= trumpMax
}

export function displayedValue(value: number | null, trumped: boolean): string {
  if (value === null) return '—'
  return trumped ? `${value}*` : `${value}`
}

export function withTrumpMaxes(card: CardData, settings: TrumpMaxSettings): CardData {
  return {
    ...card,
    attributes: card.attributes.map((a) => ({
      ...a,
      trump: isTrumped(a.value, a.trump, settings[a.key]),
    })),
  }
}
