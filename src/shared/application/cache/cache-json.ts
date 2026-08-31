const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/

export const stringifyCacheValue = (value: unknown): string =>
  JSON.stringify(value)

export const parseCacheValue = <T>(raw: string): T =>
  JSON.parse(raw, (_key, value) => {
    if (typeof value === 'string' && ISO_DATE.test(value)) {
      return new Date(value)
    }
    return value
  }) as T
