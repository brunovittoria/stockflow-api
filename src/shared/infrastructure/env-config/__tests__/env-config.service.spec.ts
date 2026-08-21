import { Test, TestingModule } from '@nestjs/testing'
import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service'
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'

describe('EnvConfigService', () => {
  let sut: EnvConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EnvConfigModule],
    }).compile()

    sut = module.get<EnvConfigService>(EnvConfigService)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should return the port', () => {
    expect(sut.getPort()).toBe(3000)
  })

  it('should return the Auth0 domain', () => {
    expect(sut.getAuth0Domain()).toBeDefined()
  })

  it('should return the Auth0 audience', () => {
    expect(sut.getAuth0Audience()).toBe('https://stockflow-api')
  })
})
