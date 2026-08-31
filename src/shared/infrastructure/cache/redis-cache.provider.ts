import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { createClient, type RedisClientType } from 'redis'
import { CacheProvider } from '@/shared/application/cache/cache-provider'
import {
  parseCacheValue,
  stringifyCacheValue,
} from '@/shared/application/cache/cache-json'
import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service'

@Injectable()
export class RedisCacheProvider
  implements CacheProvider, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisCacheProvider.name)
  private readonly client: RedisClientType

  constructor(envConfig: EnvConfigService) {
    this.client = createClient({
      url: `redis://${envConfig.getRedisHost()}:${envConfig.getRedisPort()}`,
    })
    this.client.on('error', (error) => {
      this.logger.error('Redis Client Error', error)
    })
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect()
    } catch (error) {
      this.logger.error('Redis unavailable — API will run without cache', error)
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit()
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.client.isOpen) {
        return null
      }
      const raw = await this.client.get(key)
      if (raw === null) {
        return null
      }
      return parseCacheValue<T>(raw)
    } catch (error) {
      this.logger.error(`Redis GET failed for ${key}`, error)
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      if (!this.client.isOpen) {
        return
      }
      await this.client.set(key, stringifyCacheValue(value), {
        EX: ttlSeconds,
      })
    } catch (error) {
      this.logger.error(`Redis SET failed for ${key}`, error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        return
      }
      await this.client.del(key)
    } catch (error) {
      this.logger.error(`Redis DEL failed for ${key}`, error)
    }
  }

  async delByPrefix(prefix: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        return
      }
      let cursor = '0'
      do {
        const result = await this.client.scan(cursor, {
          MATCH: `${prefix}*`,
          COUNT: 100,
        })
        cursor = String(result.cursor)
        if (result.keys.length > 0) {
          await this.client.del(result.keys)
        }
      } while (cursor !== '0')
    } catch (error) {
      this.logger.error(`Redis SCAN/DEL failed for prefix ${prefix}`, error)
    }
  }
}
