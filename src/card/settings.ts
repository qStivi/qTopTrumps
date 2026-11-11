import { ATTRIBUTE_KEYS, DEFAULT_TRUMP_MAX } from './attributes.ts'
import type { AttributeKey } from './attributes.ts'
import type { EnumSettings, TrumpMaxSettings } from './types.ts'

const STORAGE_KEY = 'qtoptrumps:trumpMax'

export function loadTrumpMaxSettings(): TrumpMaxSettings {
  const settings = {} as TrumpMaxSettings
  for (const key of ATTRIBUTE_KEYS) settings[key] = DEFAULT_TRUMP_MAX
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return settings
    const parsed = JSON.parse(raw) as Partial<Record<AttributeKey, unknown>>
    for (const key of ATTRIBUTE_KEYS) {
      const v = parsed[key]
      if (typeof v === 'number' && Number.isFinite(v)) settings[key] = v
    }
  } catch {
    // corrupted storage — fall back to defaults
  }
  return settings
}

export function saveTrumpMaxSettings(settings: TrumpMaxSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

const ENUM_STORAGE_KEY = 'qtoptrumps:enums'

export function loadEnumSettings(): EnumSettings {
  const settings = {} as EnumSettings
  for (const key of ATTRIBUTE_KEYS) settings[key] = []
  try {
    const raw = localStorage.getItem(ENUM_STORAGE_KEY)
    if (!raw) return settings
    const parsed = JSON.parse(raw) as Partial<Record<AttributeKey, unknown>>
    for (const key of ATTRIBUTE_KEYS) {
      const v = parsed[key]
      if (Array.isArray(v)) settings[key] = v.filter((x): x is string => typeof x === 'string')
    }
  } catch {
    // corrupted storage — fall back to defaults
  }
  return settings
}

export function saveEnumSettings(settings: EnumSettings): void {
  localStorage.setItem(ENUM_STORAGE_KEY, JSON.stringify(settings))
}
