import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
})

export type EnvVars = z.infer<typeof envSchema>

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (config: Record<string, unknown>) => {
        const parsed = envSchema.safeParse(config)

        if (!parsed.success) {
          const errors = parsed.error.format()
          throw new Error(
            `Invalid environment variables: ${JSON.stringify(errors)}`,
          )
        }

        return parsed.data
      },
    }),
  ],
  providers: [EnvConfigService],
  exports: [EnvConfigService],
})
export class EnvConfigModule {}
