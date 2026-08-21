import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'
import { JwtStrategy } from '@/auth/infrastructure/jwt.strategy'

@Module({
  imports: [
    EnvConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [JwtStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
