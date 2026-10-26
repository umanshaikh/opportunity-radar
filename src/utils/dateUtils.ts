import type { DeadlineInfo, DeadlineUrgency } from '../types'

/**
 * Checks if a string contains an explicit time component.
 * e.g., '2026-11-05T18:00:00Z' has time; '2026-11-05' does not.
 */
export function hasTimeComponent(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false
  return dateStr.includes('T') || /\d{1,2}:\d{2}/.test(dateStr)
}

/**
 * Parses a date safely. If string is YYYY-MM-DD, parse as end-of-day in local time
 * so deadlines don't expire prematurely at 00:00:00 of the due day.
 */
export function parseDeadlineDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  const trimmed = dateStr.trim()
  if (!trimmed) return null

  // Check if pure date format YYYY-MM-DD
  const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/
  const match = trimmed.match(dateOnlyPattern)
  if (match) {
    const year = parseInt(match[1], 10)
    const month = parseInt(match[2], 10) - 1
    const day = parseInt(match[3], 10)
    // End of that day: 23:59:59.999
    return new Date(year, month, day, 23, 59, 59, 999)
  }

  const parsed = new Date(trimmed)
  if (isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

/**
 * Evaluates deadline urgency and remaining time compared to reference date (defaults to new Date()).
 */
export function getDeadlineInfo(dateStr: string, referenceDate: Date = new Date()): DeadlineInfo {
  const parsed = parseDeadlineDate(dateStr)
  const hasTime = hasTimeComponent(dateStr)

  if (!parsed) {
    return {
      urgency: 'invalid',
      daysRemaining: 0,
      hoursRemaining: 0,
      formattedDeadline: dateStr || 'No deadline provided',
      isOverdue: false,
      hasTime: false,
    }
  }

  const diffMs = parsed.getTime() - referenceDate.getTime()
  const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60))
  const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const isOverdue = diffMs < 0

  let urgency: DeadlineUrgency = 'later'
  if (isOverdue) {
    urgency = 'overdue'
  } else if (diffMs <= 24 * 60 * 60 * 1000) {
    urgency = 'within_24h'
  } else if (diffMs <= 3 * 24 * 60 * 60 * 1000) {
    urgency = 'within_3d'
  } else if (diffMs <= 7 * 24 * 60 * 60 * 1000) {
    urgency = 'within_7d'
  } else {
    urgency = 'later'
  }

  const formattedDeadline = formatDeadlineDisplay(parsed, hasTime)

  return {
    urgency,
    daysRemaining,
    hoursRemaining,
    formattedDeadline,
    isOverdue,
    hasTime,
  }
}

/**
 * Formats deadline date for user display.
 * Avoids inventing time if only date was provided.
 */
export function formatDeadlineDisplay(date: Date, hasTime: boolean = false): string {
  if (!date || isNaN(date.getTime())) return 'Invalid date'

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }

  if (hasTime) {
    const timeOptions: Intl.DateTimeFormatOptions = {
      ...dateOptions,
      hour: '2-digit',
      minute: '2-digit',
    }
    return date.toLocaleDateString(undefined, timeOptions)
  }

  return date.toLocaleDateString(undefined, dateOptions)
}

/**
 * Returns human-friendly relative deadline text, e.g. "Overdue by 2 days", "Due in 4 hours", "Due tomorrow", "In 12 days"
 */
export function getRelativeDeadlineLabel(info: DeadlineInfo): string {
  if (info.urgency === 'invalid') return 'Deadline invalid'
  if (info.isOverdue) {
    const absDays = Math.abs(info.daysRemaining)
    if (absDays === 0) {
      return 'Expired earlier today'
    } else if (absDays === 1) {
      return 'Overdue by 1 day'
    } else {
      return `Overdue by ${absDays} days`
    }
  }

  if (info.hoursRemaining <= 0) {
    return 'Due shortly'
  } else if (info.hoursRemaining < 24) {
    return `Due in ${info.hoursRemaining} hour${info.hoursRemaining === 1 ? '' : 's'}`
  } else if (info.daysRemaining === 1) {
    return 'Due tomorrow'
  } else {
    return `In ${info.daysRemaining} days`
  }
}

/**
 * Color badge config for deadline urgencies
 */
export function getDeadlineBadgeStyle(urgency: DeadlineUrgency): {
  bg: string
  text: string
  border: string
  label: string
} {
  switch (urgency) {
    case 'overdue':
      return {
        bg: 'bg-rose-950/60',
        text: 'text-rose-400',
        border: 'border-rose-800/60',
        label: 'Overdue',
      }
    case 'within_24h':
      return {
        bg: 'bg-red-950/70',
        text: 'text-red-300',
        border: 'border-red-600/70',
        label: '< 24 Hours Left',
      }
    case 'within_3d':
      return {
        bg: 'bg-amber-950/60',
        text: 'text-amber-300',
        border: 'border-amber-600/60',
        label: 'Due in ≤ 3 Days',
      }
    case 'within_7d':
      return {
        bg: 'bg-yellow-950/40',
        text: 'text-yellow-300',
        border: 'border-yellow-600/40',
        label: 'Due this week',
      }
    case 'later':
      return {
        bg: 'bg-slate-800/60',
        text: 'text-slate-300',
        border: 'border-slate-700',
        label: 'Upcoming',
      }
    default:
      return {
        bg: 'bg-slate-900',
        text: 'text-slate-500',
        border: 'border-slate-800',
        label: 'Unspecified',
      }
  }
}
