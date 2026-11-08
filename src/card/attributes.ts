export const ATTRIBUTE_KEYS = ['power', 'age', 'height', 'weight', 'bust', 'cuteness'] as const

export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number]

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  power: 'Power',
  age: 'Age',
  height: 'Height',
  weight: 'Weight',
  bust: 'Bust Size',
  cuteness: 'Cuteness',
}

export const DEFAULT_TRUMP_MAX = 10
