import { InMemoryCacheProvider } from '@/shared/infrastructure/cache/in-memory-cache.provider'

describe('InMemoryCacheProvider', () => {
  let sut: InMemoryCacheProvider

  beforeEach(() => {
    sut = new InMemoryCacheProvider()
  })

  it('should return null on miss', async () => {
    await expect(sut.get('missing')).resolves.toBeNull()
  })

  it('should set and get a value', async () => {
    await sut.set('product:1', { name: 'Whey' }, 60)
    await expect(sut.get('product:1')).resolves.toEqual({ name: 'Whey' })
  })

  it('should revive Date after JSON roundtrip', async () => {
    const createdAt = new Date('2026-01-15T12:00:00.000Z')
    await sut.set('product:1', { createdAt }, 60)
    const cached = await sut.get<{ createdAt: Date }>('product:1')
    expect(cached?.createdAt).toBeInstanceOf(Date)
    expect(cached?.createdAt.toISOString()).toBe(createdAt.toISOString())
  })

  it('should expire after ttl', async () => {
    jest.useFakeTimers()
    await sut.set('k', 'v', 1)
    jest.advanceTimersByTime(1001)
    await expect(sut.get('k')).resolves.toBeNull()
    jest.useRealTimers()
  })

  it('should delete a key', async () => {
    await sut.set('k', 'v', 60)
    await sut.del('k')
    await expect(sut.get('k')).resolves.toBeNull()
  })

  it('should delete by prefix', async () => {
    await sut.set('products:list:a', 1, 60)
    await sut.set('products:list:b', 2, 60)
    await sut.set('product:1', 3, 60)
    await sut.delByPrefix('products:list:')
    await expect(sut.get('products:list:a')).resolves.toBeNull()
    await expect(sut.get('product:1')).resolves.toBe(3)
  })
})
