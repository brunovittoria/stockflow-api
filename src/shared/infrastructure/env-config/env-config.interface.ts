export interface EnvConfig {
  getPort(): number
  getNodeEnv(): string
  getDatabaseUrl(): string
  getAuth0Domain(): string
  getAuth0Audience(): string
  getRedisHost(): string
  getRedisPort(): number
}
