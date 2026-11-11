import { anilistQuery } from './client.ts'
import type { Character, PageInfo } from './types.ts'

const CHARACTER_FIELDS = `
  id
  name { full native }
  image { large }
  description(asHtml: false)
`

const SEARCH_CHARACTERS = `
  query ($search: String!, $page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { currentPage hasNextPage lastPage total }
      characters(search: $search, sort: SEARCH_MATCH) {
        ${CHARACTER_FIELDS}
        media { nodes { title { userPreferred } } }
      }
    }
  }
`

const USER_ANIME_LIST = `
  query ($userName: String!, $page: Int!, $perPage: Int!) {
    MediaListCollection(userName: $userName, type: ANIME, chunk: $page, perChunk: $perPage) {
      hasNextChunk
      lists {
        entries {
          score(format: POINT_100)
          media {
            title { userPreferred }
            characters(page: 1, perPage: 25) {
              nodes {
                ${CHARACTER_FIELDS}
              }
            }
          }
        }
      }
    }
  }
`

interface RawCharacter {
  id: number
  name: { full: string | null; native: string | null }
  image: { large: string | null } | null
  description: string | null
  media?: { nodes: { title: { userPreferred: string | null } }[] } | null
}

function toCharacter(raw: RawCharacter, animeTitles: string[] = []): Character {
  const firstTitle = raw.media?.nodes
    ?.map((m) => m.title.userPreferred)
    .find((t): t is string => Boolean(t))
  return {
    id: raw.id,
    name: raw.name.full ?? raw.name.native ?? `Character #${raw.id}`,
    image: raw.image?.large ?? null,
    description: raw.description ?? null,
    animeTitles: firstTitle ? [firstTitle] : animeTitles,
  }
}

export async function searchCharacters(
  search: string,
  page = 1,
  perPage = 12,
): Promise<{ characters: Character[]; pageInfo: PageInfo }> {
  const data = await anilistQuery<{
    Page: {
      pageInfo: PageInfo
      characters: RawCharacter[]
    }
  }>(SEARCH_CHARACTERS, { search, page, perPage })

  const query = search.trim().toLowerCase()
  const characters = data.Page.characters
    .map((c) => toCharacter(c))
    .filter((c) => {
      if (query === '') return true
      return (
        c.name.toLowerCase().includes(query) ||
        (c.description ?? '').toLowerCase().includes(query)
      )
    })
  return { characters, pageInfo: data.Page.pageInfo }
}

export async function fetchUserCharacters(
  userName: string,
  maxPages = 4,
): Promise<Character[]> {
  const byId = new Map<number, Character>()
  let page = 1
  let hasNextPage = true

  while (hasNextPage && page <= maxPages) {
    const data = await anilistQuery<{
      MediaListCollection: {
        hasNextChunk: boolean
        lists: {
          entries: ({
            score: number | null
            media: {
              title: { userPreferred: string | null }
              characters: { nodes: RawCharacter[] }
            } | null
          } | null)[]
        }[]
      } | null
    }>(USER_ANIME_LIST, { userName, page, perPage: 25 })

    if (!data.MediaListCollection) break
    const collection = data.MediaListCollection

    for (const list of collection.lists) {
      for (const entry of list.entries ?? []) {
        if (!entry?.media) continue
        const animeTitle = entry.media.title.userPreferred ?? ''
        for (const raw of entry.media.characters.nodes) {
          const incoming = toCharacter(raw, animeTitle ? [animeTitle] : [])
          const existing = byId.get(raw.id)
          if (!existing) {
            byId.set(raw.id, incoming)
            continue
          }
          byId.set(raw.id, {
            id: existing.id,
            name: existing.name ?? incoming.name,
            image: existing.image ?? incoming.image,
            description: existing.description ?? incoming.description,
            animeTitles: existing.animeTitles.length > 0 ? existing.animeTitles : incoming.animeTitles,
          })
        }
      }
    }

    hasNextPage = collection.hasNextChunk
    page += 1
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
}
