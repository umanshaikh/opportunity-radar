import type { Opportunity } from '../types'

/**
 * Pads a single digit number with a leading zero.
 */
function pad(num: number): string {
  return num < 10 ? `0${num}` : `${num}`
}

/**
 * Formats a Date object into UTC YYYYMMDDTHHmmssZ string.
 */
export function formatUtcCalendarDate(date: Date): string {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  )
}

/**
 * Formats a Date object into YYYYMMDD string for date-only all-day events.
 */
export function formatDateOnly(date: Date): string {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate())
  )
}

/**
 * Parses an opportunity deadline into a valid start and end Date.
 * If deadline is date-only (length <= 10), sets an all-day or end-of-day window.
 */
export function parseOpportunityDeadlineDates(opp: Opportunity): {
  startDate: Date
  endDate: Date
  isAllDay: boolean
} {
  const isDateOnly = opp.deadline.length <= 10 && !opp.deadline.includes('T')
  const baseDate = new Date(opp.deadline)

  if (isNaN(baseDate.getTime())) {
    const fallback = new Date()
    return { startDate: fallback, endDate: fallback, isAllDay: true }
  }

  if (isDateOnly) {
    // All-day event: start of day to next day start
    const start = new Date(baseDate.getTime())
    const end = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
    return { startDate: start, endDate: end, isAllDay: true }
  }

  // Event with deadline time: 1-hour submission reminder window before deadline
  const end = new Date(baseDate.getTime())
  const start = new Date(baseDate.getTime() - 60 * 60 * 1000)
  return { startDate: start, endDate: end, isAllDay: false }
}

/**
 * Generates a direct Google Calendar web URL to add the deadline.
 */
export function getGoogleCalendarUrl(opp: Opportunity): string {
  const { startDate, endDate, isAllDay } = parseOpportunityDeadlineDates(opp)

  const datesParam = isAllDay
    ? `${formatDateOnly(startDate)}/${formatDateOnly(endDate)}`
    : `${formatUtcCalendarDate(startDate)}/${formatUtcCalendarDate(endDate)}`

  const title = `Deadline: ${opp.title} (${opp.organization})`
  const details = `${opp.description}\n\nProgram Category: ${opp.category}\nFormat: ${opp.format}\nOfficial Application Link: ${opp.officialUrl}\n\nTracked via OpportunityRadar`
  const location = opp.location || (opp.format === 'Online' ? 'Online' : 'Global')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: datesParam,
    details: details,
    location: location,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generates an RFC-5545 compliant iCalendar (.ics) string.
 */
export function generateIcsCalendarString(opp: Opportunity): string {
  const { startDate, endDate, isAllDay } = parseOpportunityDeadlineDates(opp)
  const now = new Date()

  // Clean description for ICS format (escape newlines and special characters)
  const cleanSummary = `Deadline: ${opp.title} (${opp.organization})`.replace(/[,;]/g, '\\$&')
  const cleanDescription = `${opp.description} \\n\\nOfficial URL: ${opp.officialUrl} \\nTracked via OpportunityRadar`
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
  const cleanLocation = (opp.location || 'Online').replace(/[,;]/g, '\\$&')

  const dtStart = isAllDay
    ? `DTSTART;VALUE=DATE:${formatDateOnly(startDate)}`
    : `DTSTART:${formatUtcCalendarDate(startDate)}`

  const dtEnd = isAllDay
    ? `DTEND;VALUE=DATE:${formatDateOnly(endDate)}`
    : `DTEND:${formatUtcCalendarDate(endDate)}`

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OpportunityRadar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:opp-${opp.id}-${now.getTime()}@opportunityradar.app`,
    `DTSTAMP:${formatUtcCalendarDate(now)}`,
    dtStart,
    dtEnd,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${cleanLocation}`,
    `URL:${opp.officialUrl}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Opportunity deadline in 24 hours!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

/**
 * Triggers a browser download of the .ics calendar file.
 */
export function downloadIcsCalendar(opp: Opportunity): void {
  const icsContent = generateIcsCalendarString(opp)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const safeFilename = `${opp.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-deadline.ics`

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', safeFilename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
