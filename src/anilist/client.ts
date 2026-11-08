import { sharedLimiter } from './rateLimiter.ts'

const ANILIST_URL = 'https://graphql.anilist.co'

export async function anilistQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
  retries = 3,
): Promise<T> {
  await sharedLimiter.acquire()
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (response.status === 429) {
    await sharedLimiter.respectRetryAfter(response)
    if (retries > 0) return anilistQuery<T>(query, variables, retries - 1)
    throw new Error('AniList rate limit exceeded (429) after backoff')
  }
  if (!response.ok) {
    throw new Error(`AniList request failed: HTTP ${response.status}`)
  }

  const json = (await response.json()) as { data?: T; errors?: { message: string }[] }
  if (json.errors && json.errors.length > 0) {
    throw new Error(`AniList error: ${json.errors.map((e) => e.message).join('; ')}`)
  }
  if (json.data === undefined) {
    throw new Error('AniList returned no data')
  }
  return json.data
}
