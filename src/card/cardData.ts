import { ATTRIBUTE_KEYS } from './attributes.ts'
import type { Character } from '../anilist/types.ts'
import type { CardAttribute, CardData, TrumpMaxSettings } from './types.ts'

export function emptyCard(): CardData {
  return {
    characterName: '',
    animeTitles: [],
    image: null,
    description: null,
    attributes: ATTRIBUTE_KEYS.map((key) => ({ key, value: null, trump: false, trumpDisabled: false })),
  }
}

export function cardFromCharacter(character: Character): CardData {
  return {
    ...emptyCard(),
    characterName: character.name,
    animeTitles: character.animeTitles,
    image: character.image,
    description: character.description,
  }
}

export function cardWithCharacter(card: CardData, character: Character): CardData {
  return {
    ...card,
    characterName: character.name,
    animeTitles: character.animeTitles,
    image: character.image,
    description: character.description,
  }
}

export function isTrumped(
  attr: Pick<CardAttribute, 'value' | 'trump' | 'trumpDisabled'>,
  trumpMax: number,
  enumOptions: string[] = [],
): boolean {
  if (attr.trumpDisabled) return false
  if (attr.trump) return true
  if (typeof attr.value === 'number') return attr.value >= trumpMax
  return enumOptions.length > 0 && attr.value === enumOptions[enumOptions.length - 1]
}

export function displayedValue(value: number | string | null, trumped: boolean): string {
  if (value === null) return '—'
  return trumped ? `${value}*` : `${value}`
}

export function withTrumpMaxes(card: CardData, settings: TrumpMaxSettings): CardData {
  return {
    ...card,
    attributes: card.attributes.map((a) => ({
      ...a,
      trump: isTrumped(a, settings[a.key]),
    })),
  }
}
