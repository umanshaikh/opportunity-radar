import type { Opportunity, UserProfile, SavedOpportunity, Application, InAppReminder } from '../types'
import { SAMPLE_OPPORTUNITIES } from '../data/sampleOpportunities'

export const STORAGE_VERSION = 'v1'
export const KEYS = {
  VERSION: 'opradar_version',
  OPPORTUNITIES: `opradar_opportunities_${STORAGE_VERSION}`,
  PROFILE: `opradar_profile_${STORAGE_VERSION}`,
  SAVED: `opradar_saved_${STORAGE_VERSION}`,
  APPLICATIONS: `opradar_applications_${STORAGE_VERSION}`,
  REMINDERS: `opradar_reminders_${STORAGE_VERSION}`,
} as const

export const DEFAULT_PROFILE: UserProfile = {
  interests: ['AI/ML', 'Python', 'Web Development', 'Hackathons'],
  skills: ['Python', 'React', 'Git', 'TypeScript'],
  educationLevel: 'Undergraduate',
  preferredCategories: ['Hackathon', 'Internship', 'Fellowship', 'Free Learning'],
  preferredFormat: 'Any',
  preferredLocation: 'Global / Remote',
  prefersFreeOpportunities: true,
  onboardingCompleted: false,
}

// Initial sample application tracker item for demonstration
const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-init-01',
    opportunityId: 'demo-opp-02',
    status: 'Preparing',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Drafting distributed systems architecture case study. Need to polish GitHub links.',
    nextAction: 'Complete systems architecture take-home challenge',
    nextActionDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'app-init-02',
    opportunityId: 'demo-opp-01',
    status: 'Interested',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Brainstorming Quantum simulator ideas with college classmates.',
    nextAction: 'Form team of 3 by tomorrow morning',
    nextActionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
]

const INITIAL_SAVED: SavedOpportunity[] = [
  {
    opportunityId: 'demo-opp-01',
    savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    opportunityId: 'demo-opp-04',
    savedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    opportunityId: 'demo-opp-06',
    savedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * Checks if localStorage is available in browser
 */
function isStorageAvailable(): boolean {
  try {
    const testKey = '__opradar_test__'
    window.localStorage.setItem(testKey, testKey)
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Safe get item from localStorage with JSON validation and fallback
 */
export function safeGetItem<T>(key: string, fallback: T): T {
  if (!isStorageAvailable()) {
    return fallback
  }
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null || raw === undefined) {
      return fallback
    }
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn(`[OpportunityRadar Storage] Failed to parse key "${key}". Returning fallback.`, error)
    return fallback
  }
}

/**
 * Safe set item into localStorage
 */
export function safeSetItem<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) {
    console.warn('[OpportunityRadar Storage] localStorage is unavailable (cookies/storage blocked).')
    return false
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`[OpportunityRadar Storage] Failed to write key "${key}". Storage might be full.`, error)
    return false
  }
}

/**
 * Initializes data if first time visit
 */
export function initializeStorageIfEmpty(): void {
  if (!isStorageAvailable()) return

  const storedVersion = window.localStorage.getItem(KEYS.VERSION)

  if (!storedVersion) {
    // First time setup
    safeSetItem(KEYS.VERSION, STORAGE_VERSION)
    safeSetItem(KEYS.OPPORTUNITIES, SAMPLE_OPPORTUNITIES)
    safeSetItem(KEYS.PROFILE, DEFAULT_PROFILE)
    safeSetItem(KEYS.SAVED, INITIAL_SAVED)
    safeSetItem(KEYS.APPLICATIONS, INITIAL_APPLICATIONS)
    safeSetItem(KEYS.REMINDERS, [])
  } else {
    // Check if opportunities array is missing
    const opps = window.localStorage.getItem(KEYS.OPPORTUNITIES)
    if (!opps) {
      safeSetItem(KEYS.OPPORTUNITIES, SAMPLE_OPPORTUNITIES)
    }
  }
}

/**
 * Reset Demo Opportunities to initial sample set without affecting user applications/profile
 */
export function resetDemoOpportunities(): void {
  safeSetItem(KEYS.OPPORTUNITIES, SAMPLE_OPPORTUNITIES)
}

/**
 * Full factory reset: wipes all OpportunityRadar keys and re-populates baseline demo state
 */
export function resetAllAppData(): void {
  if (!isStorageAvailable()) return
  Object.values(KEYS).forEach(k => {
    window.localStorage.removeItem(k)
  })
  safeSetItem(KEYS.VERSION, STORAGE_VERSION)
  safeSetItem(KEYS.OPPORTUNITIES, SAMPLE_OPPORTUNITIES)
  safeSetItem(KEYS.PROFILE, DEFAULT_PROFILE)
  safeSetItem(KEYS.SAVED, INITIAL_SAVED)
  safeSetItem(KEYS.APPLICATIONS, INITIAL_APPLICATIONS)
  safeSetItem(KEYS.REMINDERS, [])
}

/**
 * Computes storage metrics for settings page
 */
export function getStorageStats(): {
  isAvailable: boolean
  usedBytes: number
  opportunitiesCount: number
  savedCount: number
  applicationsCount: number
  profileName: string
} {
  const isAvailable = isStorageAvailable()
  if (!isAvailable) {
    return {
      isAvailable: false,
      usedBytes: 0,
      opportunitiesCount: 0,
      savedCount: 0,
      applicationsCount: 0,
      profileName: 'Storage Disabled',
    }
  }

  let usedBytes = 0
  for (const key of Object.values(KEYS)) {
    const item = window.localStorage.getItem(key)
    if (item) {
      usedBytes += (key.length + item.length) * 2 // UTF-16 byte estimate
    }
  }

  const opps = safeGetItem<Opportunity[]>(KEYS.OPPORTUNITIES, [])
  const saved = safeGetItem<SavedOpportunity[]>(KEYS.SAVED, [])
  const apps = safeGetItem<Application[]>(KEYS.APPLICATIONS, [])
  const prof = safeGetItem<UserProfile>(KEYS.PROFILE, DEFAULT_PROFILE)

  return {
    isAvailable: true,
    usedBytes,
    opportunitiesCount: opps.length,
    savedCount: saved.length,
    applicationsCount: apps.length,
    profileName: prof.educationLevel,
  }
}

export interface AppExportData {
  version: string
  exportedAt: string
  opportunities: Opportunity[]
  profile: UserProfile
  saved: SavedOpportunity[]
  applications: Application[]
  reminders: InAppReminder[]
}

/**
 * Exports all local data as structured JSON string
 */
export function exportAppData(): string {
  const data: AppExportData = {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    opportunities: safeGetItem<Opportunity[]>(KEYS.OPPORTUNITIES, SAMPLE_OPPORTUNITIES),
    profile: safeGetItem<UserProfile>(KEYS.PROFILE, DEFAULT_PROFILE),
    saved: safeGetItem<SavedOpportunity[]>(KEYS.SAVED, []),
    applications: safeGetItem<Application[]>(KEYS.APPLICATIONS, []),
    reminders: safeGetItem<InAppReminder[]>(KEYS.REMINDERS, []),
  }
  return JSON.stringify(data, null, 2)
}

/**
 * Validates and imports user data JSON string
 */
export function importAppData(jsonStr: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonStr) as Partial<AppExportData>
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid file format: Not a JSON object.' }
    }

    if (!Array.isArray(parsed.opportunities) && !Array.isArray(parsed.applications)) {
      return {
        success: false,
        message: 'Invalid schema: Missing opportunities or applications array.',
      }
    }

    if (Array.isArray(parsed.opportunities)) {
      safeSetItem(KEYS.OPPORTUNITIES, parsed.opportunities)
    }
    if (parsed.profile && typeof parsed.profile === 'object') {
      safeSetItem(KEYS.PROFILE, { ...DEFAULT_PROFILE, ...parsed.profile })
    }
    if (Array.isArray(parsed.saved)) {
      safeSetItem(KEYS.SAVED, parsed.saved)
    }
    if (Array.isArray(parsed.applications)) {
      safeSetItem(KEYS.APPLICATIONS, parsed.applications)
    }
    if (Array.isArray(parsed.reminders)) {
      safeSetItem(KEYS.REMINDERS, parsed.reminders)
    }

    return { success: true, message: 'Data imported and verified successfully.' }
  } catch (error) {
    return {
      success: false,
      message: `Failed to import JSON: ${error instanceof Error ? error.message : 'Syntax error'}`,
    }
  }
}
