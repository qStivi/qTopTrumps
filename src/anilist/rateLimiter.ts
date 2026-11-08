const MAX_REQUESTS_PER_MINUTE = 25
const MIN_GAP_MS = 2500
const WINDOW_MS = 60_000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class RateLimiter {
  private timestamps: number[] = []
  private lastRequestAt = 0

  async acquire(): Promise<void> {
    const gapWait = MIN_GAP_MS - (Date.now() - this.lastRequestAt)
    if (gapWait > 0) await sleep(gapWait)

    let cutoff = Date.now() - WINDOW_MS
    this.timestamps = this.timestamps.filter((t) => t > cutoff)
    if (this.timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
      const wait = this.timestamps[0] + WINDOW_MS - Date.now()
      if (wait > 0) await sleep(wait)
      cutoff = Date.now() - WINDOW_MS
      this.timestamps = this.timestamps.filter((t) => t > cutoff)
    }

    this.lastRequestAt = Date.now()
    this.timestamps.push(this.lastRequestAt)
  }

  async respectRetryAfter(response: Response): Promise<void> {
    if (response.status !== 429) return
    const header = response.headers.get('Retry-After')
    const seconds = header !== null ? Number(header) : NaN
    await sleep((Number.isFinite(seconds) && seconds > 0 ? seconds : 60) * 1000)
  }
}

export const sharedLimiter = new RateLimiter()
