import { describe, it, expect } from 'vitest'
import { shuffle } from './shuffle'

describe('shuffle', () => {
  it('returns the same length as the input', () => {
    const input = [1, 2, 3, 4, 5 ]
    const result = shuffle(input)
    expect(result).toHaveLength(input.length)
  })
  it('returns the same elements as the input', () => {
    const input = [1, 2, 3, 4, 5 ]
    const result = shuffle(input)
    expect([...result].sort()).toEqual([...input].sort())

  })
  it('does not mutate the input array', () => {
    const input = [1, 2, 3, 4, 5]
    const inputCopy = [...input]
    shuffle(input)
    expect(input).toEqual(inputCopy)
  })      
})