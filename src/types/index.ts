export type Category =
  | 'Hackathon'
  | 'Internship'
  | 'Scholarship'
  | 'Competition'
  | 'Fellowship'
  | 'College Event'
  | 'Free Learning'

export type EducationLevel =
  | 'High School'
  | 'Undergraduate'
  | 'Postgraduate'
  | 'Bootcamp / Self-Taught'
  | 'Any / All'

export type ParticipationFormat = 'Online' | 'In-Person' | 'Hybrid'

export type VerificationStatus = 'Verified' | 'Pending Review' | 'Community Reported' | 'Unverified'

export type ParticipationCost = 'Free' | 'Paid' | 'Stipend Provided' | 'Scholarship Available'

export interface OpportunityEligibility {
  summary: string
  educationLevels: EducationLevel[]
  minGpa?: number
  majors?: string[]
  criteriaNotes?: string[]
}

export interface Opportunity {
  id: string
  title: string
  organization: string
  category: Category
  description: string
  tags: string[]
  eligibility: OpportunityEligibility
  requiredSkills: string[]
  educationLevels: EducationLevel[]
  format: ParticipationFormat
  location: string
  deadline: string // ISO string or YYYY-MM-DDTHH:mm:ss
  deadlineTimezone?: string
  officialUrl: string
  sourceUrl: string
  publishedAt: string
  lastVerifiedAt: string
  verificationStatus: VerificationStatus
  isDemo: boolean
  participationCost: ParticipationCost
  stipendOrPrize?: string
  applicationSteps?: string[]
  benefits?: string[]
  requiredDocuments?: string[]
}

export interface UserProfile {
  interests: string[]
  skills: string[]
  educationLevel: EducationLevel
  preferredCategories: Category[]
  preferredFormat: ParticipationFormat | 'Any'
  preferredLocation: string
  prefersFreeOpportunities: boolean
  onboardingCompleted: boolean
}

export interface SavedOpportunity {
  opportunityId: string
  savedAt: string
}

export type ApplicationStatus =
  | 'Interested'
  | 'Preparing'
  | 'Applied'
  | 'Shortlisted'
  | 'Rejected'
  | 'Completed'
  | 'Withdrawn'

export interface Application {
  id: string
  opportunityId: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
  appliedAt?: string
  notes: string
  nextAction: string
  nextActionDate?: string
}

export interface MatchScoreBreakdown {
  overallScore: number // 0 - 100
  interestScore: number // max 40
  skillScore: number // max 30
  educationScore: number // max 20
  formatScore: number // max 10
  matchedInterests: string[]
  matchedSkills: string[]
  missingSkills: string[]
  reasons: string[]
  eligibilityStatus: 'satisfied' | 'possibly_satisfied' | 'needs_confirmation' | 'not_satisfied'
  eligibilityReason: string
  isProfileIncomplete: boolean
}

export type DeadlineUrgency =
  | 'overdue'
  | 'within_24h'
  | 'within_3d'
  | 'within_7d'
  | 'later'
  | 'invalid'

export interface DeadlineInfo {
  urgency: DeadlineUrgency
  daysRemaining: number
  hoursRemaining: number
  formattedDeadline: string
  isOverdue: boolean
  hasTime: boolean
}

export interface InAppReminder {
  id: string
  opportunityId: string
  title: string
  deadline: string
  urgency: DeadlineUrgency
  dismissed: boolean
  createdAt: string
}
