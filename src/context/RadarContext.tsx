import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type {
  Opportunity,
  UserProfile,
  SavedOpportunity,
  Application,
  InAppReminder,
} from '../types'
import { repository } from '../services/repository'
import {
  DEFAULT_PROFILE,
  resetDemoOpportunities,
  resetAllAppData,
} from '../services/storage'
import { calculateMatchScore } from '../utils/matching'
import { getDeadlineInfo } from '../utils/dateUtils'

interface RadarContextType {
  opportunities: Opportunity[]
  profile: UserProfile
  saved: SavedOpportunity[]
  applications: Application[]
  reminders: InAppReminder[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  updateProfile: (profile: UserProfile) => Promise<void>
  toggleSave: (opportunityId: string) => Promise<boolean>
  isSaved: (opportunityId: string) => boolean
  saveApplication: (
    app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => Promise<Application>
  deleteApplication: (id: string) => Promise<boolean>
  dismissReminder: (id: string) => Promise<void>
  resetDemo: () => Promise<void>
  resetAll: () => Promise<void>
  reloadAll: () => Promise<void>
  stats: {
    totalOpportunities: number
    savedCount: number
    totalApplications: number
    appliedCount: number
    shortlistedCount: number
    upcomingDeadlinesCount: number
    overdueDeadlinesCount: number
    avgMatchScore: number
  }
}

const RadarContext = createContext<RadarContextType | null>(null)

export const RadarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [saved, setSaved] = useState<SavedOpportunity[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [reminders, setReminders] = useState<InAppReminder[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const loadData = useCallback(async () => {
    try {
      const [opps, prof, svd, apps, rems] = await Promise.all([
        repository.getOpportunities(),
        repository.getProfile(),
        repository.getSaved(),
        repository.getApplications(),
        repository.getReminders(),
      ])
      setOpportunities(opps)
      setProfile(prof)
      setSaved(svd)
      setApplications(apps)
      setReminders(rems)
    } catch (err) {
      console.error('Failed to load OpportunityRadar data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()

    const handleStorageSync = () => {
      loadData()
    }

    window.addEventListener('opradar_profile_updated', handleStorageSync)
    window.addEventListener('opradar_saved_updated', handleStorageSync)
    window.addEventListener('opradar_applications_updated', handleStorageSync)
    window.addEventListener('opradar_reminders_updated', handleStorageSync)

    return () => {
      window.removeEventListener('opradar_profile_updated', handleStorageSync)
      window.removeEventListener('opradar_saved_updated', handleStorageSync)
      window.removeEventListener('opradar_applications_updated', handleStorageSync)
      window.removeEventListener('opradar_reminders_updated', handleStorageSync)
    }
  }, [loadData])

  const updateProfile = async (newProfile: UserProfile) => {
    const updated = await repository.saveProfile(newProfile)
    setProfile(updated)
  }

  const toggleSave = async (opportunityId: string): Promise<boolean> => {
    const res = await repository.toggleSave(opportunityId)
    const svd = await repository.getSaved()
    setSaved(svd)
    return res.saved
  }

  const isSaved = useCallback(
    (opportunityId: string): boolean => {
      return saved.some(s => s.opportunityId === opportunityId)
    },
    [saved]
  )

  const saveApplication = async (
    appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<Application> => {
    const savedApp = await repository.saveApplication(appData)
    const updatedList = await repository.getApplications()
    setApplications(updatedList)
    return savedApp
  }

  const deleteApplication = async (id: string): Promise<boolean> => {
    const res = await repository.deleteApplication(id)
    const updatedList = await repository.getApplications()
    setApplications(updatedList)
    return res
  }

  const dismissReminder = async (id: string): Promise<void> => {
    await repository.dismissReminder(id)
    const rems = await repository.getReminders()
    setReminders(rems)
  }

  const resetDemo = async () => {
    resetDemoOpportunities()
    await loadData()
  }

  const resetAll = async () => {
    resetAllAppData()
    await loadData()
  }

  // Calculate real-time stats
  const stats = useMemo(() => {
    const totalOpportunities = opportunities.length
    const savedCount = saved.length
    const totalApplications = applications.length
    const appliedCount = applications.filter(a => a.status === 'Applied').length
    const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length

    let upcomingDeadlinesCount = 0
    let overdueDeadlinesCount = 0
    let totalScore = 0

    for (const opp of opportunities) {
      const dInfo = getDeadlineInfo(opp.deadline)
      if (dInfo.isOverdue) {
        overdueDeadlinesCount++
      } else if (dInfo.daysRemaining <= 7) {
        upcomingDeadlinesCount++
      }

      const match = calculateMatchScore(opp, profile)
      totalScore += match.overallScore
    }

    const avgMatchScore = opportunities.length > 0 ? Math.round(totalScore / opportunities.length) : 0

    return {
      totalOpportunities,
      savedCount,
      totalApplications,
      appliedCount,
      shortlistedCount,
      upcomingDeadlinesCount,
      overdueDeadlinesCount,
      avgMatchScore,
    }
  }, [opportunities, saved, applications, profile])

  return (
    <RadarContext.Provider
      value={{
        opportunities,
        profile,
        saved,
        applications,
        reminders,
        isLoading,
        searchQuery,
        setSearchQuery,
        updateProfile,
        toggleSave,
        isSaved,
        saveApplication,
        deleteApplication,
        dismissReminder,
        resetDemo,
        resetAll,
        reloadAll: loadData,
        stats,
      }}
    >
      {children}
    </RadarContext.Provider>
  )
}

export const useRadar = () => {
  const context = useContext(RadarContext)
  if (!context) {
    throw new Error('useRadar must be used within a RadarProvider')
  }
  return context
}
