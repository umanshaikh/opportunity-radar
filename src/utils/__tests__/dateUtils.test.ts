import { describe, it, expect } from 'vitest'
import {
  parseDeadlineDate,
  getDeadlineInfo,
  hasTimeComponent,
  getRelativeDeadlineLabel,
} from '../dateUtils'

describe('Date Utilities Tests', () => {
  const refTime = new Date('2026-10-26T12:00:00Z')

  it('detects presence of time component correctly', () => {
    expect(hasTimeComponent('2026-10-26T18:00:00Z')).toBe(true)
    expect(hasTimeComponent('2026-10-26 15:30')).toBe(true)
    expect(hasTimeComponent('2026-10-26')).toBe(false)
  })

  it('safely parses date-only strings to end-of-day', () => {
    const parsed = parseDeadlineDate('2026-11-15')
    expect(parsed).not.toBeNull()
    expect(parsed?.getFullYear()).toBe(2026)
    expect(parsed?.getMonth()).toBe(10) // 0-indexed November
    expect(parsed?.getDate()).toBe(15)
    expect(parsed?.getHours()).toBe(23)
  })

  it('handles invalid or empty dates gracefully without throwing', () => {
    expect(parseDeadlineDate('')).toBeNull()
    expect(parseDeadlineDate('not-a-valid-date')).toBeNull()

    const info = getDeadlineInfo('invalid-string', refTime)
    expect(info.urgency).toBe('invalid')
    expect(info.isOverdue).toBe(false)
  })

  it('accurately groups deadlines into overdue, within_24h, within_3d, within_7d, and later', () => {
    // Overdue by 1 day
    const overdue = getDeadlineInfo('2026-10-25T12:00:00Z', refTime)
    expect(overdue.urgency).toBe('overdue')
    expect(overdue.isOverdue).toBe(true)
    expect(getRelativeDeadlineLabel(overdue)).toBe('Overdue by 1 day')

    // Within 24 hours (due in 8 hours)
    const within24h = getDeadlineInfo('2026-10-26T20:00:00Z', refTime)
    expect(within24h.urgency).toBe('within_24h')
    expect(within24h.hoursRemaining).toBe(8)
    expect(getRelativeDeadlineLabel(within24h)).toBe('Due in 8 hours')

    // Within 3 days (due in 2 days)
    const within3d = getDeadlineInfo('2026-10-28T12:00:00Z', refTime)
    expect(within3d.urgency).toBe('within_3d')

    // Within 7 days (due in 5 days)
    const within7d = getDeadlineInfo('2026-10-31T12:00:00Z', refTime)
    expect(within7d.urgency).toBe('within_7d')

    // Later (due in 20 days)
    const later = getDeadlineInfo('2026-11-15T12:00:00Z', refTime)
    expect(later.urgency).toBe('later')
  })
})
