import { Test, TestingModule } from '@nestjs/testing'
import { EnvConfigService } from '../env-config.service'
import { EnvConfigModule } from '../env-config.module'

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

  it('should return the jwt secret', () => {
    expect(sut.getJwtSecret()).toBeDefined()
  })
})