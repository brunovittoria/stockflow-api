import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnvConfig } from '@/shared/infrastructure/env-config/env-config.interface'

@Injectable()
export class EnvConfigService implements EnvConfig {
  constructor(private configService: ConfigService) {}

  getPort(): number {
    return Number(this.configService.getOrThrow<number>('PORT'))
  }

  getNodeEnv(): string {
    return this.configService.getOrThrow<string>('NODE_ENV')
  }

  getDatabaseUrl(): string {
    return this.configService.getOrThrow<string>('DATABASE_URL')
  }

  getAuth0Domain(): string {
    return this.configService.getOrThrow<string>('AUTH0_DOMAIN')
  }

  getAuth0Audience(): string {
    return this.configService.getOrThrow<string>('AUTH0_AUDIENCE')
  }

  getRedisHost(): string {
    return this.configService.getOrThrow<string>('REDIS_HOST')
  }

  getRedisPort(): number {
    return Number(this.configService.getOrThrow<number>('REDIS_PORT'))
  }
}
