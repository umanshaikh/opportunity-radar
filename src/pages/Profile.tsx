import React, { useState } from 'react'
import {
  User,
  Sparkles,
  Save,
  Check,
  BookOpen,
  GraduationCap,
  Layers,
  TrendingUp,
} from 'lucide-react'
import type {
  EducationLevel,
  Category,
  ParticipationFormat,
  UserProfile,
} from '../types'
import { useRadar } from '../context/RadarContext'
import { calculateMatchScore } from '../utils/matching'

const ALL_EDUCATION_LEVELS: EducationLevel[] = [
  'High School',
  'Undergraduate',
  'Postgraduate',
  'Bootcamp / Self-Taught',
  'Any / All',
]

const ALL_CATEGORIES: Category[] = [
  'Hackathon',
  'Internship',
  'Scholarship',
  'Competition',
  'Fellowship',
  'College Event',
  'Free Learning',
]

const ALL_FORMATS: (ParticipationFormat | 'Any')[] = ['Online', 'In-Person', 'Hybrid', 'Any']

const SUGGESTED_INTERESTS = [
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
  'Entrepreneurship',
]

const SUGGESTED_SKILLS = [
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
  'Kubernetes',
]

export const Profile: React.FC = () => {
  const { profile, updateProfile, opportunities } = useRadar()

  // Form local state
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(profile.educationLevel)
  const [preferredFormat, setPreferredFormat] = useState<ParticipationFormat | 'Any'>(
    profile.preferredFormat
  )
  const [preferredLocation, setPreferredLocation] = useState<string>(
    profile.preferredLocation || 'Global / Remote'
  )
  const [prefersFree, setPrefersFree] = useState<boolean>(profile.prefersFreeOpportunities)
  const [preferredCategories, setPreferredCategories] = useState<Category[]>(
    profile.preferredCategories || []
  )
  const [interests, setInterests] = useState<string[]>(profile.interests || [])
  const [skills, setSkills] = useState<string[]>(profile.skills || [])
  const [customInterest, setCustomInterest] = useState('')
  const [customSkill, setCustomSkill] = useState('')
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Toggle Handlers
  const toggleCategory = (cat: Category) => {
    setPreferredCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const toggleInterest = (int: string) => {
    setInterests(prev => (prev.includes(int) ? prev.filter(i => i !== int) : [...prev, int]))
  }

  const toggleSkill = (sk: string) => {
    setSkills(prev => (prev.includes(sk) ? prev.filter(s => s !== sk) : [...prev, sk]))
  }

  const handleAddCustomInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customInterest.trim()) {
      e.preventDefault()
      if (!interests.includes(customInterest.trim())) {
        setInterests([...interests, customInterest.trim()])
      }
      setCustomInterest('')
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const updated: UserProfile = {
      ...profile,
      educationLevel,
      preferredFormat,
      preferredLocation,
      prefersFreeOpportunities: prefersFree,
      preferredCategories,
      interests,
      skills,
      onboardingCompleted: true,
    }
    await updateProfile(updated)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  // Live match score preview for top 3 opportunities based on current form inputs
  const livePreviewProfile: UserProfile = {
    interests,
    skills,
    educationLevel,
    preferredCategories,
    preferredFormat,
    preferredLocation,
    prefersFreeOpportunities: prefersFree,
    onboardingCompleted: true,
  }

  const topMatchesPreview = opportunities
    .map(opp => ({
      opp,
      score: calculateMatchScore(opp, livePreviewProfile).overallScore,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <User className="w-6 h-6 text-violet-400" />
            <span>Profile & Matching Preferences</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalize your background, interests, and skills to train the deterministic match
            engine.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 font-semibold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Preferences saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls: 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Level */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-violet-400" />
                <span>Education Background (20% Weight)</span>
              </label>
              <p className="text-xs text-slate-400">
                Matches program eligibility requirements to avoid disqualified submissions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {ALL_EDUCATION_LEVELS.map(lvl => (
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

            {/* Target Fields & Interests */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Field Interests & Disciplines (Part of 40% Weight)</span>
              </label>
              <p className="text-xs text-slate-400">
                Opportunities tagging these domains will be prioritized in your radar feed.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTED_INTERESTS.map(int => {
                  const selected = interests.includes(int)
                  return (
                    <button
                      key={int}
                      type="button"
                      onClick={() => toggleInterest(int)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                        selected
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {int}
                    </button>
                  )
                })}
              </div>

              {/* Custom interest add */}
              <div className="pt-2">
                <input
                  type="text"
                  value={customInterest}
                  onChange={e => setCustomInterest(e.target.value)}
                  onKeyDown={handleAddCustomInterest}
                  placeholder="Type other interest and press Enter..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Technical Skills & Tools (30% Weight)</span>
              </label>
              <p className="text-xs text-slate-400">
                Skills you actively know. Helps pinpoint matched qualifications vs missing prep
                items.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTED_SKILLS.map(sk => {
                  const selected = skills.includes(sk)
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkill(sk)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                        selected
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {sk}
                    </button>
                  )
                })}
              </div>

              {/* Custom skill add */}
              <div className="pt-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={e => setCustomSkill(e.target.value)}
                  onKeyDown={handleAddCustomSkill}
                  placeholder="Type additional skill and press Enter..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                />
              </div>

              {/* Active Skills tags */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Active Selected Skills ({skills.length}):
                </span>
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
                        className="hover:text-rose-400 ml-1 text-slate-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Opportunity Categories & Format */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div>
                <label className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-violet-400" />
                  <span>Target Categories</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map(cat => {
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Participation Format
                  </label>
                  <select
                    value={preferredFormat}
                    onChange={e =>
                      setPreferredFormat(e.target.value as ParticipationFormat | 'Any')
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-violet-500 focus:outline-none"
                  >
                    {ALL_FORMATS.map(f => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Location Preference
                  </label>
                  <input
                    type="text"
                    value={preferredLocation}
                    onChange={e => setPreferredLocation(e.target.value)}
                    placeholder="e.g. Remote, San Francisco, India..."
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={prefersFree}
                    onChange={e => setPrefersFree(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-violet-600 focus:ring-violet-500"
                  />
                  <span>Prioritize free entry or stipend-awarded opportunities</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Live Match Preview & Save */}
          <div className="space-y-6">
            {/* Save Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Save & Update Profile
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Changes will recalculate deterministic match scores across all listings immediately.
              </p>
              <button
                type="submit"
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-950/50 transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Matching Preferences</span>
              </button>
            </div>

            {/* Live Match Preview */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Match Preview
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Previewing top matches based on your unsaved selections:
              </p>

              <div className="space-y-2.5 pt-2">
                {topMatchesPreview.map(({ opp, score }) => (
                  <div
                    key={opp.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-200 truncate max-w-[150px]">
                      {opp.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        score >= 80
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-violet-950 text-violet-300 border border-violet-800'
                      }`}
                    >
                      {score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Relevance Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong>Match Score Notice:</strong> The match score is a deterministic relevance
              estimate comparing your profile attributes to listing criteria. It is not an official
              admission evaluation or guarantee of awards.
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
