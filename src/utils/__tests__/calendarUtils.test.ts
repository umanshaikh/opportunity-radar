import { describe, it, expect } from 'vitest'
import {
  formatUtcCalendarDate,
  formatDateOnly,
  parseOpportunityDeadlineDates,
  getGoogleCalendarUrl,
  generateIcsCalendarString,
} from '../calendarUtils'
import type { Opportunity } from '../../types'

const sampleOpp: Opportunity = {
  id: 'test-hackathon-01',
  title: 'Global AI Hackathon 2026',
  organization: 'Tech Community',
  category: 'Hackathon',
  description: 'Build cutting-edge generative AI applications.',
  tags: ['AI', 'Python', 'React'],
  eligibility: {
    summary: 'Open to all students',
    educationLevels: ['Undergraduate', 'Postgraduate'],
  },
  requiredSkills: ['Python', 'React'],
  educationLevels: ['Undergraduate', 'Postgraduate'],
  format: 'Online',
  location: 'Global / Virtual',
  deadline: '2026-11-20T23:59:00Z',
  officialUrl: 'https://example.com/ai-hackathon',
  sourceUrl: 'https://example.com/ai-hackathon',
  stipendOrPrize: '$50,000 USD in prizes',
  participationCost: 'Free',
  verificationStatus: 'Verified',
  isDemo: true,
  publishedAt: '2026-10-25',
  lastVerifiedAt: '2026-10-25',
}

const dateOnlyOpp: Opportunity = {
  ...sampleOpp,
  id: 'test-date-only',
  deadline: '2026-12-15',
}

describe('calendarUtils', () => {
  it('formats UTC calendar date correctly', () => {
    const d = new Date(Date.UTC(2026, 10, 20, 23, 59, 0))
    expect(formatUtcCalendarDate(d)).toBe('20261120T235900Z')
  })

  it('formats date only correctly', () => {
    const d = new Date(Date.UTC(2026, 11, 15))
    expect(formatDateOnly(d)).toBe('20261215')
  })

  it('parses timed deadline into 1-hour window', () => {
    const { startDate, endDate, isAllDay } = parseOpportunityDeadlineDates(sampleOpp)
    expect(isAllDay).toBe(false)
    expect(endDate.getTime() - startDate.getTime()).toBe(60 * 60 * 1000)
  })

  it('parses date-only deadline into 24-hour all-day window', () => {
    const { startDate, endDate, isAllDay } = parseOpportunityDeadlineDates(dateOnlyOpp)
    expect(isAllDay).toBe(true)
    expect(endDate.getTime() - startDate.getTime()).toBe(24 * 60 * 60 * 1000)
  })

  it('generates valid Google Calendar URL with query parameters', () => {
    const url = getGoogleCalendarUrl(sampleOpp)
    expect(url).toContain('https://calendar.google.com/calendar/render')
    expect(url).toContain('action=TEMPLATE')
    expect(url).toContain('Global+AI+Hackathon+2026')
    expect(url).toContain('https%3A%2F%2Fexample.com%2Fai-hackathon')
  })

  it('generates compliant RFC-5545 iCalendar (.ics) string', () => {
    const ics = generateIcsCalendarString(sampleOpp)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('SUMMARY:Deadline: Global AI Hackathon 2026 (Tech Community)')
    expect(ics).toContain('URL:https://example.com/ai-hackathon')
    expect(ics).toContain('BEGIN:VALARM')
    expect(ics).toContain('TRIGGER:-P1D')
    expect(ics).toContain('END:VCALENDAR')
  })
})
