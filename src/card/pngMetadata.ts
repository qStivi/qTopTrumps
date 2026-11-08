import { ATTRIBUTE_KEYS } from './attributes.ts'
import type { AttributeKey } from './attributes.ts'
import type { CardData } from './types.ts'

const KEYWORD = 'qTopTrumps'
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function encodePayload(card: CardData): string {
  const lines = [
    `name=${card.characterName}`,
    `anime=${card.animeTitles.join(' | ')}`,
    ...card.attributes.map((a) => `attr.${a.key}=${a.value === null ? '' : a.trump ? `${a.value}*` : `${a.value}`}`),
  ]
  return lines.join('\n')
}

function decodePayload(text: string): Partial<CardData> {
  const out: Partial<CardData> = { attributes: undefined }
  const attrs: CardData['attributes'] = ATTRIBUTE_KEYS.map((key) => ({ key, value: null, trump: false }))
  for (const line of text.split('\n')) {
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq)
    const value = line.slice(eq + 1)
    if (key === 'name') out.characterName = value
    else if (key === 'anime') out.animeTitles = value ? value.split(' | ') : []
    else if (key.startsWith('attr.')) {
      const attrKey = key.slice(5) as AttributeKey
      const attr = attrs.find((a) => a.key === attrKey)
      if (!attr) continue
      if (value === '') continue
      const trump = value.endsWith('*')
      const num = Number(trump ? value.slice(0, -1) : value)
      if (Number.isFinite(num)) {
        attr.value = num
        attr.trump = trump
      }
    }
  }
  out.attributes = attrs
  return out
}

function makeChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length)
  const view = new DataView(out.buffer)
  view.setUint32(0, data.length)
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i)
  out.set(data, 8)
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)))
  return out
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const p of parts) {
    out.set(p, offset)
    offset += p.length
  }
  return out
}

export async function embedPayload(png: Blob, card: CardData): Promise<Blob> {
  const bytes = new Uint8Array(await png.arrayBuffer())
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) throw new Error('Not a PNG file')
  }
  const payload = new TextEncoder().encode(encodePayload(card))
  const compressed = new Uint8Array(
    await new Response(new Blob([payload]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer(),
  )
  const keyword = new TextEncoder().encode(KEYWORD)
  const data = concat(keyword, new Uint8Array([0, 0]), compressed)
  const chunk = makeChunk('zTXt', data)

  const out = new Uint8Array(bytes.length + chunk.length)
  out.set(bytes.subarray(0, bytes.length - 12), 0)
  out.set(chunk, bytes.length - 12)
  out.set(bytes.subarray(bytes.length - 12), bytes.length - 12 + chunk.length)
  return new Blob([out], { type: 'image/png' })
}

export async function extractPayload(file: Blob): Promise<Partial<CardData> | null> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) return null
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = 8
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset)
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7])
    const dataStart = offset + 8
    if (type === 'zTXt' || type === 'tEXt') {
      const data = bytes.subarray(dataStart, dataStart + length)
      const nul = data.indexOf(0)
      if (nul > 0 && new TextDecoder().decode(data.subarray(0, nul)) === KEYWORD) {
        let text: string
        if (type === 'zTXt') {
          const compressed = data.subarray(nul + 2)
          text = new TextDecoder().decode(
            await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer(),
          )
        } else {
          text = new TextDecoder().decode(data.subarray(nul + 1))
        }
        return decodePayload(text)
      }
    }
    offset = dataStart + length + 4
    if (type === 'IEND') break
  }
  return null
}
