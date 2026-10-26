import type { Opportunity, UserProfile, MatchScoreBreakdown } from '../types'

/**
 * Normalizes text strings for comparison (lowercasing, trimming, removing hyphens/underscores).
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[-_/]/g, ' ').trim()
}

/**
 * Calculates a transparent, deterministic match score (0-100) between an Opportunity and UserProfile.
 * Weighting:
 * - 40% Interests & Category Match
 * - 30% Skills & Tags Match
 * - 20% Education Level Compatibility
 * - 10% Format & Location Match
 */
export function calculateMatchScore(
  opportunity: Opportunity,
  profile: Partial<UserProfile> | null | undefined
): MatchScoreBreakdown {
  const reasons: string[] = []
  const matchedInterests: string[] = []
  const matchedSkills: string[] = []
  const missingSkills: string[] = []

  // Default empty profile fallback
  const userInterests = (profile?.interests || []).map(normalize)
  const userSkills = (profile?.skills || []).map(normalize)
  const userEducation = profile?.educationLevel || 'Any / All'
  const userCategories = (profile?.preferredCategories || []).map(c => normalize(c))
  const userFormat = profile?.preferredFormat || 'Any'
  const userPrefersFree = profile?.prefersFreeOpportunities ?? true

  const isProfileEmpty =
    (!profile?.interests || profile.interests.length === 0) &&
    (!profile?.skills || profile.skills.length === 0) &&
    (!profile?.preferredCategories || profile.preferredCategories.length === 0) &&
    (!profile?.educationLevel || profile.educationLevel === 'Any / All')

  // If profile is completely blank, provide a neutral 50% baseline score with guidance
  if (isProfileEmpty) {
    return {
      overallScore: 50,
      interestScore: 20,
      skillScore: 15,
      educationScore: 10,
      formatScore: 5,
      matchedInterests: [],
      matchedSkills: [],
      missingSkills: opportunity.requiredSkills.slice(0, 3),
      reasons: [
        'Baseline relevance score. Complete your profile in Preferences to unlock personalized matching.',
        `Category: ${opportunity.category}`,
        `Format: ${opportunity.format}`,
      ],
      eligibilityStatus: 'needs_confirmation',
      eligibilityReason: 'Please confirm criteria against your academic program.',
      isProfileIncomplete: true,
    }
  }

  // --- 1. INTEREST & CATEGORY MATCH (Max 40 points) ---
  let interestScore = 0
  const oppCategoryNorm = normalize(opportunity.category)
  const oppTagsNorm = opportunity.tags.map(normalize)

  // Category preference check (up to 20 pts)
  const hasCategoryPreference = userCategories.length > 0
  if (!hasCategoryPreference) {
    // If user hasn't specified preferred categories, don't penalize harshly: neutral 14/20
    interestScore += 14
  } else if (userCategories.includes(oppCategoryNorm)) {
    interestScore += 20
    reasons.push(`Directly matches your interest in ${opportunity.category}s.`)
  } else {
    // Partial check: does category match user interests?
    const matchesUserInterest = userInterests.some(i => i.includes(oppCategoryNorm) || oppCategoryNorm.includes(i))
    if (matchesUserInterest) {
      interestScore += 12
      reasons.push(`Relates to your target fields (${opportunity.category}).`)
    }
  }

  // Interest tags check (up to 20 pts)
  if (userInterests.length === 0) {
    // Unset interests -> neutral 12/20
    interestScore += 12
  } else {
    let interestHits = 0
    for (const interest of userInterests) {
      const isHit =
        oppTagsNorm.some(t => t.includes(interest) || interest.includes(t)) ||
        normalize(opportunity.title).includes(interest) ||
        normalize(opportunity.description).includes(interest)

      if (isHit) {
        interestHits++
        const originalInterest = profile?.interests?.find(i => normalize(i) === interest) || interest
        if (!matchedInterests.includes(originalInterest)) {
          matchedInterests.push(originalInterest)
        }
      }
    }

    if (interestHits > 0) {
      const tagRatio = Math.min(1, interestHits / Math.min(3, userInterests.length))
      const tagPts = Math.round(tagRatio * 20)
      interestScore += tagPts
      reasons.push(`Aligns with your interests: ${matchedInterests.slice(0, 3).join(', ')}.`)
    } else {
      interestScore += 4 // minimal baseline
    }
  }

  // Cap interestScore at 40
  interestScore = Math.min(40, Math.max(0, interestScore))

  // --- 2. SKILLS MATCH (Max 30 points) ---
  let skillScore = 0
  const oppSkillsNorm = opportunity.requiredSkills.map(normalize)

  if (oppSkillsNorm.length === 0) {
    // No specific required skills -> full score or neutral
    skillScore = 25
    reasons.push('Open to all skill levels with no rigid technical prerequisites.')
  } else if (userSkills.length === 0) {
    // User hasn't listed skills yet -> neutral 15/30
    skillScore = 15
    missingSkills.push(...opportunity.requiredSkills.slice(0, 4))
  } else {
    let skillHits = 0
    for (const oppSkill of opportunity.requiredSkills) {
      const oppSkillNorm = normalize(oppSkill)
      const isMatched = userSkills.some(
        us => us.includes(oppSkillNorm) || oppSkillNorm.includes(us)
      )

      if (isMatched) {
        skillHits++
        matchedSkills.push(oppSkill)
      } else {
        missingSkills.push(oppSkill)
      }
    }

    const matchRatio = skillHits / oppSkillsNorm.length
    // Base skill score proportional to matches (up to 30 pts)
    skillScore = Math.round(matchRatio * 30)

    if (matchedSkills.length > 0) {
      reasons.push(`Leverages your skills: ${matchedSkills.slice(0, 3).join(', ')}.`)
    }
    if (missingSkills.length > 0) {
      reasons.push(`Skills to prepare: ${missingSkills.slice(0, 3).join(', ')}.`)
    }
  }

  skillScore = Math.min(30, Math.max(0, skillScore))

  // --- 3. EDUCATION COMPATIBILITY (Max 20 points) ---
  let educationScore = 0
  let eligibilityStatus: MatchScoreBreakdown['eligibilityStatus'] = 'needs_confirmation'
  let eligibilityReason = ''

  const oppLevels = opportunity.educationLevels
  const isOppUniversal = oppLevels.includes('Any / All')

  if (isOppUniversal || userEducation === 'Any / All') {
    educationScore = 20
    eligibilityStatus = 'satisfied'
    eligibilityReason = 'Open to all academic backgrounds and levels.'
    reasons.push('Open to all education levels.')
  } else if (oppLevels.includes(userEducation)) {
    educationScore = 20
    eligibilityStatus = 'satisfied'
    eligibilityReason = `Directly matches your current level (${userEducation}).`
    reasons.push(`Accepts ${userEducation} students.`)
  } else {
    // Check if education level is completely mismatched
    const levelHierarchy: Record<string, number> = {
      'High School': 1,
      'Bootcamp / Self-Taught': 2,
      'Undergraduate': 3,
      'Postgraduate': 4,
    }

    const userRank = levelHierarchy[userEducation] || 0
    const oppRanks = oppLevels.map(l => levelHierarchy[l] || 0).filter(r => r > 0)
    const minOppRank = Math.min(...oppRanks)

    if (userRank > 0 && userRank < minOppRank) {
      // User is below minimum requirement
      educationScore = 4
      eligibilityStatus = 'not_satisfied'
      eligibilityReason = `Requires ${oppLevels.join(' or ')} (you selected ${userEducation}).`
    } else {
      educationScore = 12
      eligibilityStatus = 'possibly_satisfied'
      eligibilityReason = `May require prerequisite validation for ${userEducation}.`
    }
  }

  // If opportunity has specific GPA or majors, note that confirmation is needed
  if (
    eligibilityStatus === 'satisfied' &&
    ((opportunity.eligibility.minGpa && opportunity.eligibility.minGpa > 0) ||
      (opportunity.eligibility.majors && opportunity.eligibility.majors.length > 0))
  ) {
    eligibilityStatus = 'needs_confirmation'
    eligibilityReason = `Meets degree level, but verify GPA (${opportunity.eligibility.minGpa || 'N/A'}) and major prerequisites.`
  }

  // --- 4. FORMAT & LOCATION PREFERENCE (Max 10 points) ---
  let formatScore = 0
  const oppFormat = opportunity.format

  if (userFormat === 'Any' || oppFormat === 'Online') {
    formatScore += 7
    reasons.push(`${oppFormat} participation supported.`)
  } else if (userFormat === oppFormat) {
    formatScore += 10
    reasons.push(`Matches preferred format (${oppFormat}).`)
  } else {
    formatScore += 3
  }

  // Participation cost preference check (+bonus or deduction)
  if (userPrefersFree && (opportunity.participationCost === 'Free' || opportunity.participationCost === 'Stipend Provided')) {
    formatScore = Math.min(10, formatScore + 2)
  }

  formatScore = Math.min(10, Math.max(0, formatScore))

  // --- COMPUTE OVERALL SCORE ---
  const overallScore = Math.min(100, Math.max(0, interestScore + skillScore + educationScore + formatScore))

  const isProfileIncomplete =
    (profile?.interests?.length || 0) < 2 || (profile?.skills?.length || 0) < 2

  return {
    overallScore,
    interestScore,
    skillScore,
    educationScore,
    formatScore,
    matchedInterests,
    matchedSkills,
    missingSkills,
    reasons: reasons.slice(0, 4),
    eligibilityStatus,
    eligibilityReason,
    isProfileIncomplete,
  }
}

/**
 * Returns human label and theme styling for a match score.
 */
export function getScoreBadgeStyle(score: number): {
  color: string
  bg: string
  border: string
  label: string
} {
  if (score >= 80) {
    return {
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/60',
      border: 'border-emerald-600/50',
      label: 'Strong Match',
    }
  } else if (score >= 60) {
    return {
      color: 'text-violet-400',
      bg: 'bg-violet-950/60',
      border: 'border-violet-600/50',
      label: 'Good Match',
    }
  } else if (score >= 40) {
    return {
      color: 'text-amber-400',
      bg: 'bg-amber-950/60',
      border: 'border-amber-600/50',
      label: 'Moderate Match',
    }
  } else {
    return {
      color: 'text-slate-400',
      bg: 'bg-slate-900',
      border: 'border-slate-800',
      label: 'Low Match',
    }
  }
}
