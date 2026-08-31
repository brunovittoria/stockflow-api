import { Global, Module } from '@nestjs/common'
import { CACHE_PROVIDER } from '@/shared/application/cache/cache-provider'
import { RedisCacheProvider } from '@/shared/infrastructure/cache/redis-cache.provider'
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'
import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service'

@Global()
@Module({
  imports: [EnvConfigModule],
  providers: [
    {
      provide: CACHE_PROVIDER,
      useFactory: (env: EnvConfigService) => new RedisCacheProvider(env),
      inject: [EnvConfigService],
    },
  ],
  exports: [CACHE_PROVIDER],
})
export class RedisModule {}
