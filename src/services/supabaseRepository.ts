import type {
  Opportunity,
  UserProfile,
  SavedOpportunity,
  Application,
  InAppReminder,
} from '../types'
import type { DataRepository } from './repository'
import { getSupabaseClient } from './supabaseClient'
import { SAMPLE_OPPORTUNITIES } from '../data/sampleOpportunities'
import { DEFAULT_PROFILE } from './storage'

export class SupabaseRepository implements DataRepository {
  async getOpportunities(): Promise<Opportunity[]> {
    const supabase = getSupabaseClient()
    if (!supabase) return SAMPLE_OPPORTUNITIES

    try {
      const { data, error } = await supabase.from('opportunities').select('*')
      if (error || !data || data.length === 0) {
        // Fallback to sample if table is empty or error
        return SAMPLE_OPPORTUNITIES
      }

      return data.map(row => ({
        id: row.id,
        title: row.title,
        organization: row.organization,
        category: row.category,
        description: row.description,
        tags: row.tags || [],
        eligibility: row.eligibility || { summary: '', educationLevels: [] },
        requiredSkills: row.required_skills || [],
        educationLevels: row.education_levels || [],
        format: row.format,
        location: row.location,
        deadline: row.deadline,
        deadlineTimezone: row.deadline_timezone,
        officialUrl: row.official_url,
        sourceUrl: row.source_url,
        publishedAt: row.published_at,
        lastVerifiedAt: row.last_verified_at,
        verificationStatus: row.verification_status,
        isDemo: row.is_demo,
        participationCost: row.participation_cost,
        stipendOrPrize: row.stipend_or_prize,
        applicationSteps: row.application_steps || [],
        benefits: row.benefits || [],
        requiredDocuments: row.required_documents || [],
      }))
    } catch {
      return SAMPLE_OPPORTUNITIES
    }
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    const list = await this.getOpportunities()
    return list.find(o => o.id === id) || null
  }

  async getProfile(): Promise<UserProfile> {
    const supabase = getSupabaseClient()
    if (!supabase) return DEFAULT_PROFILE

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', 'default-user')
        .single()

      if (error || !data) return DEFAULT_PROFILE

      return {
        interests: data.interests || DEFAULT_PROFILE.interests,
        skills: data.skills || DEFAULT_PROFILE.skills,
        educationLevel: data.education_level || DEFAULT_PROFILE.educationLevel,
        preferredCategories: data.preferred_categories || DEFAULT_PROFILE.preferredCategories,
        preferredFormat: data.preferred_format || DEFAULT_PROFILE.preferredFormat,
        preferredLocation: data.preferred_location || DEFAULT_PROFILE.preferredLocation,
        prefersFreeOpportunities: data.prefers_free_opportunities ?? true,
        onboardingCompleted: data.onboarding_completed ?? true,
      }
    } catch {
      return DEFAULT_PROFILE
    }
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const supabase = getSupabaseClient()
    if (!supabase) return profile

    try {
      await supabase.from('user_profiles').upsert({
        id: 'default-user',
        interests: profile.interests,
        skills: profile.skills,
        education_level: profile.educationLevel,
        preferred_categories: profile.preferredCategories,
        preferred_format: profile.preferredFormat,
        preferred_location: profile.preferredLocation,
        prefers_free_opportunities: profile.prefersFreeOpportunities,
        onboarding_completed: profile.onboardingCompleted,
        updated_at: new Date().toISOString(),
      })
      window.dispatchEvent(new Event('opradar_profile_updated'))
    } catch (err) {
      console.warn('Failed to save profile to Supabase:', err)
    }
    return profile
  }

  async getSaved(): Promise<SavedOpportunity[]> {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    try {
      const { data, error } = await supabase
        .from('saved_opportunities')
        .select('opportunity_id, saved_at')
        .eq('user_id', 'default-user')

      if (error || !data) return []

      return data.map(row => ({
        opportunityId: row.opportunity_id,
        savedAt: row.saved_at,
      }))
    } catch {
      return []
    }
  }

  async isSaved(opportunityId: string): Promise<boolean> {
    const list = await this.getSaved()
    return list.some(s => s.opportunityId === opportunityId)
  }

  async toggleSave(opportunityId: string): Promise<{ saved: boolean }> {
    const supabase = getSupabaseClient()
    if (!supabase) return { saved: false }

    const isCurrentlySaved = await this.isSaved(opportunityId)

    try {
      if (isCurrentlySaved) {
        await supabase
          .from('saved_opportunities')
          .delete()
          .eq('user_id', 'default-user')
          .eq('opportunity_id', opportunityId)
      } else {
        await supabase.from('saved_opportunities').insert({
          user_id: 'default-user',
          opportunity_id: opportunityId,
          saved_at: new Date().toISOString(),
        })
      }

      window.dispatchEvent(new Event('opradar_saved_updated'))
      return { saved: !isCurrentlySaved }
    } catch {
      return { saved: isCurrentlySaved }
    }
  }

  async getApplications(): Promise<Application[]> {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', 'default-user')

      if (error || !data) return []

      return data.map(row => ({
        id: row.id,
        opportunityId: row.opportunity_id,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        appliedAt: row.applied_at || undefined,
        notes: row.notes || '',
        nextAction: row.next_action || '',
        nextActionDate: row.next_action_date || undefined,
      }))
    } catch {
      return []
    }
  }

  async getApplicationByOpportunityId(opportunityId: string): Promise<Application | null> {
    const list = await this.getApplications()
    return list.find(a => a.opportunityId === opportunityId) || null
  }

  async saveApplication(
    appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<Application> {
    const supabase = getSupabaseClient()
    const now = new Date().toISOString()
    const id = appData.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    const app: Application = {
      id,
      opportunityId: appData.opportunityId,
      status: appData.status,
      createdAt: now,
      updatedAt: now,
      appliedAt: appData.status === 'Applied' ? now : undefined,
      notes: appData.notes || '',
      nextAction: appData.nextAction || '',
      nextActionDate: appData.nextActionDate,
    }

    if (!supabase) return app

    try {
      await supabase.from('applications').upsert({
        id: app.id,
        user_id: 'default-user',
        opportunity_id: app.opportunityId,
        status: app.status,
        created_at: app.createdAt,
        updated_at: app.updatedAt,
        applied_at: app.appliedAt || null,
        notes: app.notes,
        next_action: app.nextAction,
        next_action_date: app.nextActionDate || null,
      })

      window.dispatchEvent(new Event('opradar_applications_updated'))
    } catch (err) {
      console.warn('Failed to save application to Supabase:', err)
    }

    return app
  }

  async deleteApplication(id: string): Promise<boolean> {
    const supabase = getSupabaseClient()
    if (!supabase) return false

    try {
      await supabase.from('applications').delete().eq('id', id).eq('user_id', 'default-user')
      window.dispatchEvent(new Event('opradar_applications_updated'))
      return true
    } catch {
      return false
    }
  }

  async getReminders(): Promise<InAppReminder[]> {
    return []
  }

  async dismissReminder(_id: string): Promise<void> {}
}
