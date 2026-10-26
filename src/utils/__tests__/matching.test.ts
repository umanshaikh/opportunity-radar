import { describe, it, expect } from 'vitest'
import { calculateMatchScore, getScoreBadgeStyle } from '../matching'
import type { Opportunity, UserProfile } from '../../types'

const dummyOpportunity: Opportunity = {
  id: 'opp-test-1',
  title: 'AI Machine Learning Innovation Challenge',
  organization: 'Tech Org',
  category: 'Hackathon',
  description: 'Build predictive AI agents using Python and PyTorch.',
  tags: ['AI/ML', 'Python', 'Machine Learning'],
  eligibility: {
    summary: 'Undergraduate students only',
    educationLevels: ['Undergraduate'],
  },
  requiredSkills: ['Python', 'PyTorch', 'Git'],
  educationLevels: ['Undergraduate'],
  format: 'Online',
  location: 'Remote',
  deadline: '2026-11-20T23:59:59Z',
  officialUrl: 'https://example.com/test',
  sourceUrl: 'https://example.com/test',
  publishedAt: '2026-10-01T00:00:00Z',
  lastVerifiedAt: '2026-10-25T00:00:00Z',
  verificationStatus: 'Verified',
  isDemo: true,
  participationCost: 'Free',
}

describe('Matching Engine Tests', () => {
  it('handles empty or missing profile gracefully with neutral baseline', () => {
    const emptyProfile: Partial<UserProfile> = {}
    const result = calculateMatchScore(dummyOpportunity, emptyProfile)

    expect(result.overallScore).toBe(50)
    expect(result.isProfileIncomplete).toBe(true)
    expect(result.reasons.length).toBeGreaterThan(0)
    expect(result.eligibilityStatus).toBe('needs_confirmation')
  })

  it('produces a high match score for an aligned profile', () => {
    const alignedProfile: UserProfile = {
      interests: ['AI/ML', 'Python', 'Hackathons'],
      skills: ['Python', 'PyTorch', 'Git'],
      educationLevel: 'Undergraduate',
      preferredCategories: ['Hackathon'],
      preferredFormat: 'Online',
      preferredLocation: 'Remote',
      prefersFreeOpportunities: true,
      onboardingCompleted: true,
    }

    const result = calculateMatchScore(dummyOpportunity, alignedProfile)

    expect(result.overallScore).toBeGreaterThanOrEqual(80)
    expect(result.matchedSkills).toContain('Python')
    expect(result.matchedSkills).toContain('PyTorch')
    expect(result.matchedInterests.length).toBeGreaterThan(0)
    expect(result.eligibilityStatus).toBe('satisfied')
  })

  it('correctly detects missing skills needed to prepare', () => {
    const partialSkillProfile: UserProfile = {
      interests: ['AI/ML'],
      skills: ['Python'], // Missing PyTorch and Git
      educationLevel: 'Undergraduate',
      preferredCategories: ['Hackathon'],
      preferredFormat: 'Online',
      preferredLocation: 'Remote',
      prefersFreeOpportunities: true,
      onboardingCompleted: true,
    }

    const result = calculateMatchScore(dummyOpportunity, partialSkillProfile)

    expect(result.matchedSkills).toContain('Python')
    expect(result.missingSkills).toContain('PyTorch')
    expect(result.missingSkills).toContain('Git')
  })

  it('detects education level incompatibility when applicant is under-qualified', () => {
    const highSchoolProfile: UserProfile = {
      interests: ['AI/ML'],
      skills: ['Python'],
      educationLevel: 'High School', // Opportunity requires Undergraduate
      preferredCategories: ['Hackathon'],
      preferredFormat: 'Online',
      preferredLocation: 'Remote',
      prefersFreeOpportunities: true,
      onboardingCompleted: true,
    }

    const result = calculateMatchScore(dummyOpportunity, highSchoolProfile)

    expect(result.eligibilityStatus).toBe('not_satisfied')
    expect(result.educationScore).toBeLessThan(10)
  })

  it('calculates deterministic scores reliably without drifting', () => {
    const profile: UserProfile = {
      interests: ['AI/ML', 'Data Science'],
      skills: ['Python', 'SQL'],
      educationLevel: 'Undergraduate',
      preferredCategories: ['Hackathon'],
      preferredFormat: 'Any',
      preferredLocation: 'Remote',
      prefersFreeOpportunities: true,
      onboardingCompleted: true,
    }

    const score1 = calculateMatchScore(dummyOpportunity, profile)
    const score2 = calculateMatchScore(dummyOpportunity, profile)

    expect(score1.overallScore).toBe(score2.overallScore)
    expect(score1.skillScore).toBe(score2.skillScore)
    expect(score1.interestScore).toBe(score2.interestScore)
  })

  it('returns appropriate badge styling based on score thresholds', () => {
    expect(getScoreBadgeStyle(90).label).toBe('Strong Match')
    expect(getScoreBadgeStyle(70).label).toBe('Good Match')
    expect(getScoreBadgeStyle(50).label).toBe('Moderate Match')
    expect(getScoreBadgeStyle(20).label).toBe('Low Match')
  })
})
