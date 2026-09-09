import { describe, expect, it } from 'vitest'
import { circularOffset, showcasePose, wrapIndex } from './motion'

describe('continuous carousel geometry', () => {
  it('wraps negative and multi-revolution positions without empty windows', () => {
    for (const position of [-1000.25, -36, -6.1, -0.2, 0, 5.9, 6, 1000.75]) {
      const offsets = Array.from({ length: 6 }, (_, index) => circularOffset(index, position, 6))
      expect(offsets.filter((offset) => Math.abs(offset) < 1.5).length).toBeGreaterThanOrEqual(2)
      expect(offsets.every((offset) => offset >= -3 && offset < 3)).toBe(true)
    }
    expect(wrapIndex(-61, 6)).toBe(5)
    expect(wrapIndex(61, 6)).toBe(1)
  })

  it('interpolates the showcase stack continuously while dragging', () => {
    expect(showcasePose(0)).toEqual({ x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 })
    expect(showcasePose(0.5)).toEqual({ x: 12.5, y: 2.5, rotation: 2.5, scale: 0.95, opacity: 1 })
    expect(showcasePose(-1).x).toBe(-25)
    expect(showcasePose(2).scale).toBe(0.75)
    expect(showcasePose(3).opacity).toBe(0)
  })
})
