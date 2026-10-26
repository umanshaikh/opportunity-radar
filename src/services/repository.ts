import type {
  Opportunity,
  UserProfile,
  SavedOpportunity,
  Application,
  InAppReminder,
  ApplicationStatus,
} from '../types'
import {
  KEYS,
  DEFAULT_PROFILE,
  safeGetItem,
  safeSetItem,
  initializeStorageIfEmpty,
} from './storage'
import { SAMPLE_OPPORTUNITIES } from '../data/sampleOpportunities'

// Guarantee storage is initialized
initializeStorageIfEmpty()

export interface DataRepository {
  // Opportunities
  getOpportunities(): Promise<Opportunity[]>
  getOpportunityById(id: string): Promise<Opportunity | null>

  // Profile
  getProfile(): Promise<UserProfile>
  saveProfile(profile: UserProfile): Promise<UserProfile>

  // Saved Opportunities
  getSaved(): Promise<SavedOpportunity[]>
  isSaved(opportunityId: string): Promise<boolean>
  toggleSave(opportunityId: string): Promise<{ saved: boolean }>

  // Application Tracking
  getApplications(): Promise<Application[]>
  getApplicationByOpportunityId(opportunityId: string): Promise<Application | null>
  saveApplication(app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Application>
  deleteApplication(id: string): Promise<boolean>

  // In-App Reminders
  getReminders(): Promise<InAppReminder[]>
  dismissReminder(id: string): Promise<void>
}

/**
 * LocalStorage implementation of DataRepository
 */
class LocalStorageRepository implements DataRepository {
  async getOpportunities(): Promise<Opportunity[]> {
    const list = safeGetItem<Opportunity[]>(KEYS.OPPORTUNITIES, SAMPLE_OPPORTUNITIES)
    return list
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    const list = await this.getOpportunities()
    return list.find(o => o.id === id) || null
  }

  async getProfile(): Promise<UserProfile> {
    return safeGetItem<UserProfile>(KEYS.PROFILE, DEFAULT_PROFILE)
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    safeSetItem(KEYS.PROFILE, profile)
    window.dispatchEvent(new Event('opradar_profile_updated'))
    return profile
  }

  async getSaved(): Promise<SavedOpportunity[]> {
    return safeGetItem<SavedOpportunity[]>(KEYS.SAVED, [])
  }

  async isSaved(opportunityId: string): Promise<boolean> {
    const list = await this.getSaved()
    return list.some(s => s.opportunityId === opportunityId)
  }

  async toggleSave(opportunityId: string): Promise<{ saved: boolean }> {
    const list = await this.getSaved()
    const index = list.findIndex(s => s.opportunityId === opportunityId)

    let updated: SavedOpportunity[]
    let saved: boolean

    if (index >= 0) {
      updated = list.filter(s => s.opportunityId !== opportunityId)
      saved = false
    } else {
      updated = [{ opportunityId, savedAt: new Date().toISOString() }, ...list]
      saved = true
    }

    safeSetItem(KEYS.SAVED, updated)
    window.dispatchEvent(new Event('opradar_saved_updated'))
    return { saved }
  }

  async getApplications(): Promise<Application[]> {
    return safeGetItem<Application[]>(KEYS.APPLICATIONS, [])
  }

  async getApplicationByOpportunityId(opportunityId: string): Promise<Application | null> {
    const list = await this.getApplications()
    return list.find(a => a.opportunityId === opportunityId) || null
  }

  async saveApplication(
    appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<Application> {
    const list = await this.getApplications()
    const now = new Date().toISOString()

    if (appData.id) {
      // Update existing
      const existingIndex = list.findIndex(a => a.id === appData.id)
      if (existingIndex >= 0) {
        const updatedApp: Application = {
          ...list[existingIndex],
          status: appData.status,
          notes: appData.notes,
          nextAction: appData.nextAction,
          nextActionDate: appData.nextActionDate,
          appliedAt:
            appData.status === 'Applied' && !list[existingIndex].appliedAt
              ? now
              : list[existingIndex].appliedAt,
          updatedAt: now,
        }
        list[existingIndex] = updatedApp
        safeSetItem(KEYS.APPLICATIONS, list)
        window.dispatchEvent(new Event('opradar_applications_updated'))
        return updatedApp
      }
    }

    // New application entry
    const newApp: Application = {
      id: appData.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      opportunityId: appData.opportunityId,
      status: appData.status || ('Interested' as ApplicationStatus),
      createdAt: now,
      updatedAt: now,
      appliedAt: appData.status === 'Applied' ? now : undefined,
      notes: appData.notes || '',
      nextAction: appData.nextAction || '',
      nextActionDate: appData.nextActionDate,
    }

    const updatedList = [newApp, ...list]
    safeSetItem(KEYS.APPLICATIONS, updatedList)
    window.dispatchEvent(new Event('opradar_applications_updated'))
    return newApp
  }

  async deleteApplication(id: string): Promise<boolean> {
    const list = await this.getApplications()
    const filtered = list.filter(a => a.id !== id)
    safeSetItem(KEYS.APPLICATIONS, filtered)
    window.dispatchEvent(new Event('opradar_applications_updated'))
    return true
  }

  async getReminders(): Promise<InAppReminder[]> {
    return safeGetItem<InAppReminder[]>(KEYS.REMINDERS, [])
  }

  async dismissReminder(id: string): Promise<void> {
    const list = await this.getReminders()
    const updated = list.map(r => (r.id === id ? { ...r, dismissed: true } : r))
    safeSetItem(KEYS.REMINDERS, updated)
    window.dispatchEvent(new Event('opradar_reminders_updated'))
  }
}

// Single export instance conforming to DataRepository
export const repository: DataRepository = new LocalStorageRepository()
