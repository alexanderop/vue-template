import { describe, it, expect } from 'vitest'
import { tryCatch } from '@/utils/tryCatch'

describe('tryCatch', () => {
  it('returns data and null error for resolved promise', async () => {
    const result = await tryCatch(Promise.resolve(42))
    expect(result.data).toBe(42)
    expect(result.error).toBeNull()
  })

  it('returns null data and error for rejected promise', async () => {
    const result = await tryCatch(Promise.reject(new Error('fail')))
    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toBe('fail')
  })

  it('wraps non-Error rejections in an Error', async () => {
    const result = await tryCatch(Promise.reject('string error'))
    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toBe('string error')
  })
})
