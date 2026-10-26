import React, { useState } from 'react'
import {
  Compass,
  Check,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import type { EducationLevel, Category, ParticipationFormat, UserProfile } from '../../types'
import { useRadar } from '../../context/RadarContext'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

const EDUCATION_OPTIONS: EducationLevel[] = [
  'High School',
  'Undergraduate',
  'Postgraduate',
  'Bootcamp / Self-Taught',
  'Any / All',
]

const CATEGORY_OPTIONS: Category[] = [
  'Hackathon',
  'Internship',
  'Scholarship',
  'Competition',
  'Fellowship',
  'College Event',
  'Free Learning',
]

const FORMAT_OPTIONS: (ParticipationFormat | 'Any')[] = ['Online', 'In-Person', 'Hybrid', 'Any']

const POPULAR_INTERESTS = [
  'AI/ML',
  'Python',
  'Web Development',
  'Data Science',
  'Cybersecurity',
  'Cloud/DevOps',
  'Mobile Apps',
  'Robotics',
  'Quantum Computing',
  'Algorithms',
  'Design & UI',
  'Research',
]

const POPULAR_SKILLS = [
  'Python',
  'React',
  'TypeScript',
  'Node.js',
  'PyTorch',
  'Git',
  'Docker',
  'SQL',
  'C++',
  'Java',
  'Go',
  'Linux',
  'Figma',
]

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useRadar()
  const [step, setStep] = useState(1)

  // Local state initialized with current profile
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(
    profile.educationLevel || 'Undergraduate'
  )
  const [preferredFormat, setPreferredFormat] = useState<ParticipationFormat | 'Any'>(
    profile.preferredFormat || 'Any'
  )
  const [preferredCategories, setPreferredCategories] = useState<Category[]>(
    profile.preferredCategories || ['Hackathon', 'Internship']
  )
  const [interests, setInterests] = useState<string[]>(
    profile.interests || ['AI/ML', 'Web Development']
  )
  const [skills, setSkills] = useState<string[]>(profile.skills || ['Python', 'Git'])
  const [customSkill, setCustomSkill] = useState('')

  if (!isOpen) return null

  const toggleCategory = (cat: Category) => {
    if (preferredCategories.includes(cat)) {
      setPreferredCategories(preferredCategories.filter(c => c !== cat))
    } else {
      setPreferredCategories([...preferredCategories, cat])
    }
  }

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest))
    } else {
      setInterests([...interests, interest])
    }
  }

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill))
    } else {
      setSkills([...skills, skill])
    }
  }

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSkill.trim()) {
      e.preventDefault()
      if (!skills.includes(customSkill.trim())) {
        setSkills([...skills, customSkill.trim()])
      }
      setCustomSkill('')
    }
  }

  const handleSaveAndFinish = async () => {
    const updated: UserProfile = {
      ...profile,
      educationLevel,
      preferredFormat,
      preferredCategories,
      interests,
      skills,
      onboardingCompleted: true,
    }
    await updateProfile(updated)
    onClose()
  }

  const handleSkip = async () => {
    await updateProfile({ ...profile, onboardingCompleted: true })
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 my-8">
        {/* Top Stepper Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-950 border border-violet-800 text-violet-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 id="onboarding-modal-title" className="text-lg font-bold text-white">
                Customize OpportunityRadar
              </h3>
              <p className="text-xs text-slate-400">Step {step} of 3</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            Skip for now
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-4 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-violet-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* STEP 1: Academic & Participation Format */}
        {step === 1 && (
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-violet-400" />
                Current Education Level
              </label>
              <p className="text-xs text-slate-400 mb-3">
                Used to filter opportunity eligibility requirements accurately.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EDUCATION_OPTIONS.map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEducationLevel(lvl)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                      educationLevel === lvl
                        ? 'bg-violet-950/80 border-violet-500 text-white shadow-xs'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{lvl}</span>
                    {educationLevel === lvl && <Check className="w-4 h-4 text-violet-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">
                Preferred Participation Format
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FORMAT_OPTIONS.map(fmt => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setPreferredFormat(fmt)}
                    className={`py-2.5 px-3 rounded-xl border text-center text-xs font-semibold transition ${
                      preferredFormat === fmt
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Interests & Opportunity Categories */}
        {step === 2 && (
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Opportunity Categories You Seek
              </label>
              <p className="text-xs text-slate-400 mb-3">
                Select types of programs you want highlighted on your radar.
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map(cat => {
                  const selected = preferredCategories.includes(cat)
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                        selected
                          ? 'bg-violet-600 border-violet-500 text-white shadow-xs'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">
                Target Technology Fields & Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_INTERESTS.map(int => {
                  const selected = interests.includes(int)
                  return (
                    <button
                      key={int}
                      type="button"
                      onClick={() => toggleInterest(int)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                        selected
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {int}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Technical Skills */}
        {step === 3 && (
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-400" />
                Your Technical Skills & Tools
              </label>
              <p className="text-xs text-slate-400 mb-3">
                Used to compute the 30% Skill Match and surface missing prerequisites.
              </p>

              {/* Tag selector */}
              <div className="flex flex-wrap gap-2">
                {POPULAR_SKILLS.map(sk => {
                  const selected = skills.includes(sk)
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkill(sk)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                        selected
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {sk}
                    </button>
                  )
                })}
              </div>

              {/* Custom skill input */}
              <div className="mt-4">
                <input
                  type="text"
                  value={customSkill}
                  onChange={e => setCustomSkill(e.target.value)}
                  onKeyDown={handleAddCustomSkill}
                  placeholder="Type any custom skill and hit Enter..."
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                />
              </div>

              {/* Current chosen skills preview */}
              <div className="mt-3">
                <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">
                  Active Selected Skills ({skills.length}):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(s => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className="hover:text-rose-400 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Skip setup
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-md shadow-violet-900/30 transition flex items-center gap-1.5"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveAndFinish}
              className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-900/30 transition flex items-center gap-1.5"
            >
              Finish & Calculate Matches
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
