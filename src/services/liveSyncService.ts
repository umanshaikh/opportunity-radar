import type { Opportunity } from '../types'
import { SAMPLE_OPPORTUNITIES } from '../data/sampleOpportunities'
import { LIVE_UPCOMING_HACKATHONS } from '../data/liveUpcomingHackathons'
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient'
import { safeSetItem, KEYS } from './storage'

/**
 * Combines curated sample dataset with real-world live hackathons
 */
export function getAllMergedOpportunities(): Opportunity[] {
  const mergedMap = new Map<string, Opportunity>()

  // Add sample opportunities
  SAMPLE_OPPORTUNITIES.forEach(opp => mergedMap.set(opp.id, opp))

  // Add live upcoming real hackathons
  LIVE_UPCOMING_HACKATHONS.forEach(opp => mergedMap.set(opp.id, opp))

  return Array.from(mergedMap.values())
}

/**
 * Automatically syncs and populates opportunities into Supabase without manual SQL entry
 */
export async function autoSyncToSupabase(): Promise<{
  syncedCount: number
  success: boolean
  message: string
}> {
  const allOpps = getAllMergedOpportunities()

  // Always update local storage as reliable base
  safeSetItem(KEYS.OPPORTUNITIES, allOpps)

  if (!isSupabaseConfigured()) {
    return {
      syncedCount: allOpps.length,
      success: true,
      message: 'Local storage automatically synced with live upcoming hackathons.',
    }
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      syncedCount: 0,
      success: false,
      message: 'Supabase client is not initialized.',
    }
  }

  try {
    // 1. Format opportunities for Postgres
    const rows = allOpps.map(opp => ({
      id: opp.id,
      title: opp.title,
      organization: opp.organization,
      category: opp.category,
      description: opp.description,
      tags: opp.tags,
      eligibility: opp.eligibility,
      required_skills: opp.requiredSkills,
      education_levels: opp.educationLevels,
      format: opp.format,
      location: opp.location,
      deadline: opp.deadline,
      deadline_timezone: opp.deadlineTimezone || 'UTC',
      official_url: opp.officialUrl,
      source_url: opp.sourceUrl,
      published_at: opp.publishedAt,
      last_verified_at: opp.lastVerifiedAt,
      verification_status: opp.verificationStatus,
      is_demo: opp.isDemo,
      participation_cost: opp.participationCost,
      stipend_or_prize: opp.stipendOrPrize || null,
      application_steps: opp.applicationSteps || [],
      benefits: opp.benefits || [],
      required_documents: opp.requiredDocuments || [],
    }))

    // 2. Batch upsert into Supabase public.opportunities
    const { error: oppError } = await supabase.from('opportunities').upsert(rows, { onConflict: 'id' })

    if (oppError) {
      console.warn('Auto-sync notice: opportunities table upsert:', oppError.message)
      return {
        syncedCount: 0,
        success: false,
        message: `Supabase table not ready: ${oppError.message}`,
      }
    }

    // 3. Ensure baseline user profile exists
    await supabase.from('user_profiles').upsert(
      {
        id: 'default-user',
        interests: ['AI/ML', 'Python', 'Web Development', 'Hackathons'],
        skills: ['Python', 'React', 'Git', 'TypeScript'],
        education_level: 'Undergraduate',
        preferred_categories: ['Hackathon', 'Internship', 'Fellowship', 'Free Learning'],
        preferred_format: 'Any',
        preferred_location: 'Global / Remote',
        prefers_free_opportunities: true,
        onboarding_completed: true,
      },
      { onConflict: 'id' }
    )

    // 4. Ensure initial applications exist
    await supabase.from('applications').upsert(
      [
        {
          id: 'app-auto-01',
          user_id: 'default-user',
          opportunity_id: 'live-opp-02',
          status: 'Preparing',
          created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
          notes: 'Drafting Imagine Cup AI solution architecture on Azure.',
          next_action: 'Finalize 3-minute prototype video pitch',
          next_action_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        },
        {
          id: 'app-auto-02',
          user_id: 'default-user',
          opportunity_id: 'live-opp-03',
          status: 'Interested',
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          notes: 'Selecting challenge from NASA Open Data challenge list.',
          next_action: 'Form team of 4 classmates',
          next_action_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
        },
      ],
      { onConflict: 'id' }
    )

    return {
      syncedCount: rows.length,
      success: true,
      message: `Successfully auto-synced ${rows.length} opportunities into Supabase!`,
    }
  } catch (err) {
    return {
      syncedCount: 0,
      success: false,
      message: `Auto-sync failed: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}
