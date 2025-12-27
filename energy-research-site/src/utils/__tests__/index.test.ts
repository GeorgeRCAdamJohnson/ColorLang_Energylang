import { formatEnergy, formatTime, formatMemory, calculateEfficiency } from '../index'

describe('Utility Functions', () => {
  describe('formatEnergy', () => {
    it('formats energy values with appropriate units', () => {
      expect(formatEnergy(0.0001)).toBe('100.00 µJ')
      expect(formatEnergy(0.5)).toBe('500.00 mJ')
      expect(formatEnergy(5)).toBe('5.00 J')
      expect(formatEnergy(5000)).toBe('5.00 kJ')
    })
  })

  describe('formatTime', () => {
    it('formats time values with appropriate units', () => {
      expect(formatTime(0.0001)).toBe('100.00 µs')
      expect(formatTime(0.5)).toBe('500.00 ms')
      expect(formatTime(5)).toBe('5.00 s')
      expect(formatTime(125)).toBe('2m 5.0s')
    })
  })

  describe('formatMemory', () => {
    it('formats memory values with appropriate units', () => {
      expect(formatMemory(512)).toBe('512.00 B')
      expect(formatMemory(1024)).toBe('1.00 KB')
      expect(formatMemory(1048576)).toBe('1.00 MB')
      expect(formatMemory(1073741824)).toBe('1.00 GB')
    })
  })

  describe('calculateEfficiency', () => {
    it('calculates energy efficiency correctly', () => {
      expect(calculateEfficiency(10, 1000)).toBe(0.01)
      expect(calculateEfficiency(5, 0)).toBe(0)
    })
  })
})
