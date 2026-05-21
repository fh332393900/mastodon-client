import { describe, expect, it } from 'vitest'

describe('sum', () => {
  function sum(a: number, b: number) {
    return a + b
  }

  it('adds numbers correctly', () => {
    expect(sum(1, 2)).toBe(3)
  })
})
