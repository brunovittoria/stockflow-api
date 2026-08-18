import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Allows running Prisma CLI commands against a specific env file.
// Example: DOTENV_FILE=.env.test npx prisma db push
const envFile = process.env.DOTENV_FILE ?? '.env'
config({ path: envFile, override: true })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
