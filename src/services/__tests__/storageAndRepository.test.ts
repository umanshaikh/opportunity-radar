import { describe, it, expect, beforeEach } from 'vitest'
import {
  exportAppData,
  importAppData,
  resetAllAppData,
  getStorageStats,
  safeGetItem,
} from '../storage'
import { repository } from '../repository'
import type { UserProfile } from '../../types'

// Simple in-memory localStorage mock for node environment
class MockLocalStorage {
  private store: Record<string, string> = {}

  getItem(key: string): string | null {
    return this.store[key] ?? null
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }
}

describe('Storage & Repository Service Tests', () => {
  beforeEach(() => {
    // Provide clean localStorage mock in global window context
    const mockStorage = new MockLocalStorage()
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: mockStorage,
        dispatchEvent: () => true,
      },
      writable: true,
    })
    resetAllAppData()
  })

  it('initializes default data and retrieves opportunities', async () => {
    const opps = await repository.getOpportunities()
    expect(opps.length).toBeGreaterThanOrEqual(10)
    expect(opps[0].title).toBeDefined()
    expect(opps[0].isDemo).toBe(true)
  })

  it('retrieves and updates user profile in repository', async () => {
    const profile = await repository.getProfile()
    expect(profile.educationLevel).toBe('Undergraduate')

    const updatedProfile: UserProfile = {
      ...profile,
      educationLevel: 'Postgraduate',
      skills: ['Python', 'Docker', 'Go'],
    }
    await repository.saveProfile(updatedProfile)

    const reloaded = await repository.getProfile()
    expect(reloaded.educationLevel).toBe('Postgraduate')
    expect(reloaded.skills).toContain('Go')
  })

  it('toggles save state cleanly and maintains saved shortlist', async () => {
    const testOppId = 'demo-opp-07'

    const res1 = await repository.toggleSave(testOppId)
    expect(res1.saved).toBe(true)
    expect(await repository.isSaved(testOppId)).toBe(true)

    const res2 = await repository.toggleSave(testOppId)
    expect(res2.saved).toBe(false)
    expect(await repository.isSaved(testOppId)).toBe(false)
  })

  it('creates, updates, and deletes application tracker items', async () => {
    const newApp = await repository.saveApplication({
      opportunityId: 'demo-opp-05',
      status: 'Interested',
      notes: 'Initial test note',
      nextAction: 'Register team',
      nextActionDate: '2026-11-01',
    })

    expect(newApp.id).toBeDefined()
    expect(newApp.status).toBe('Interested')

    // Update status to Applied
    const updated = await repository.saveApplication({
      id: newApp.id,
      opportunityId: 'demo-opp-05',
      status: 'Applied',
      notes: 'Submitted test application',
      nextAction: 'Awaiting interview feedback',
    })

    expect(updated.status).toBe('Applied')
    expect(updated.appliedAt).toBeDefined()

    // Delete application
    await repository.deleteApplication(newApp.id)
    const afterDelete = await repository.getApplicationByOpportunityId('demo-opp-05')
    expect(afterDelete).toBeNull()
  })

  it('safely handles JSON export and verified schema import', () => {
    const exportedJSON = exportAppData()
    expect(exportedJSON).toContain('"version": "v1"')
    expect(exportedJSON).toContain('demo-opp-01')

    // Test importing corrupted JSON
    const corruptedRes = importAppData('{ not valid json')
    expect(corruptedRes.success).toBe(false)

    // Test importing invalid schema
    const invalidSchemaRes = importAppData('{"randomKey": 123}')
    expect(invalidSchemaRes.success).toBe(false)

    // Test importing valid backup
    const validRes = importAppData(exportedJSON)
    expect(validRes.success).toBe(true)
  })

  it('returns valid storage footprint metrics without crashing', () => {
    const stats = getStorageStats()
    expect(stats.isAvailable).toBe(true)
    expect(stats.usedBytes).toBeGreaterThan(0)
    expect(stats.opportunitiesCount).toBeGreaterThan(0)
  })

  it('survives corrupted storage data with fallback', () => {
    window.localStorage.setItem('corrupted_key', 'invalid json string {{{')
    const fallback = { fallback: true }
    const result = safeGetItem('corrupted_key', fallback)
    expect(result).toEqual(fallback)
  })
})
