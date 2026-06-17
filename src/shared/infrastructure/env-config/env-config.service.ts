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

  getJwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET')
  }

  getJwtExpiresIn(): string {
    return this.configService.getOrThrow<string>('JWT_EXPIRES_IN')
  }
}
