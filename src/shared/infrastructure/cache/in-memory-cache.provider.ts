import { CacheProvider } from '@/shared/application/cache/cache-provider'
import {
  parseCacheValue,
  stringifyCacheValue,
} from '@/shared/application/cache/cache-json'

type Entry = { raw: string; expiresAt: number }

export class InMemoryCacheProvider implements CacheProvider {
  private readonly store = new Map<string, Entry>()

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key)
    if (!entry) {
      return null
    }
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return parseCacheValue<T>(entry.raw)
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      raw: stringifyCacheValue(value),
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }

  async del(key: string): Promise<void> {
    this.store.delete(key)
  }

  async delByPrefix(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key)
      }
    }
  }
}
