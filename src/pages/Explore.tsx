import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  X,
  Check,
} from 'lucide-react'
import type {
  Category,
  EducationLevel,
  ParticipationFormat,
  VerificationStatus,
} from '../types'
import { useRadar } from '../context/RadarContext'
import { calculateMatchScore } from '../utils/matching'
import { getDeadlineInfo, parseDeadlineDate } from '../utils/dateUtils'
import { OpportunityCard } from '../components/common/OpportunityCard'

type SortOption = 'match' | 'deadline' | 'title' | 'published'

const CATEGORIES: Category[] = [
  'Hackathon',
  'Internship',
  'Scholarship',
  'Competition',
  'Fellowship',
  'College Event',
  'Free Learning',
]

const FORMATS: ParticipationFormat[] = ['Online', 'In-Person', 'Hybrid']

const EDUCATION_LEVELS: EducationLevel[] = [
  'High School',
  'Undergraduate',
  'Postgraduate',
  'Bootcamp / Self-Taught',
  'Any / All',
]

const VERIFICATIONS: VerificationStatus[] = [
  'Verified',
  'Pending Review',
  'Community Reported',
  'Unverified',
]

export const Explore: React.FC = () => {
  const { opportunities, profile, searchQuery, setSearchQuery } = useRadar()

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [selectedFormat, setSelectedFormat] = useState<string>('All')
  const [selectedEducation, setSelectedEducation] = useState<string>('All')
  const [selectedDeadlineRange, setSelectedDeadlineRange] = useState<string>('all')
  const [freeOnly, setFreeOnly] = useState<boolean>(false)
  const [selectedVerification, setSelectedVerification] = useState<string>('All')
  const [sortBy, setSortBy] = useState<SortOption>('match')

  // Pagination / Load More state
  const [visibleCount, setVisibleCount] = useState<number>(6)
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false)

  // Toggle Category Filter
  const toggleCategory = (cat: Category) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  // Clear all filters
  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedFormat('All')
    setSelectedEducation('All')
    setSelectedDeadlineRange('all')
    setFreeOnly(false)
    setSelectedVerification('All')
    setSortBy('match')
    setSearchQuery('')
    setVisibleCount(6)
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedCategories.length > 0) count += selectedCategories.length
    if (selectedFormat !== 'All') count++
    if (selectedEducation !== 'All') count++
    if (selectedDeadlineRange !== 'all') count++
    if (freeOnly) count++
    if (selectedVerification !== 'All') count++
    if (searchQuery.trim()) count++
    return count
  }, [
    selectedCategories,
    selectedFormat,
    selectedEducation,
    selectedDeadlineRange,
    freeOnly,
    selectedVerification,
    searchQuery,
  ])

  // Filter & Sort Logic
  const filteredAndSortedOpportunities = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    return opportunities
      .filter(opp => {
        // Search across title, organization, category, tags
        if (query) {
          const titleMatch = opp.title.toLowerCase().includes(query)
          const orgMatch = opp.organization.toLowerCase().includes(query)
          const catMatch = opp.category.toLowerCase().includes(query)
          const tagMatch = opp.tags.some(t => t.toLowerCase().includes(query))
          if (!titleMatch && !orgMatch && !catMatch && !tagMatch) {
            return false
          }
        }

        // Category filter
        if (selectedCategories.length > 0 && !selectedCategories.includes(opp.category)) {
          return false
        }

        // Format filter
        if (selectedFormat !== 'All' && opp.format !== selectedFormat) {
          return false
        }

        // Education Level filter
        if (selectedEducation !== 'All') {
          const matchesEdu =
            opp.educationLevels.includes(selectedEducation as EducationLevel) ||
            opp.educationLevels.includes('Any / All')
          if (!matchesEdu) return false
        }

        // Free Participation filter
        if (freeOnly && opp.participationCost !== 'Free' && opp.participationCost !== 'Stipend Provided') {
          return false
        }

        // Verification Status filter
        if (selectedVerification !== 'All' && opp.verificationStatus !== selectedVerification) {
          return false
        }

        // Deadline Range filter
        const dInfo = getDeadlineInfo(opp.deadline)
        if (selectedDeadlineRange === 'open_only' && dInfo.isOverdue) {
          return false
        } else if (selectedDeadlineRange === 'within_24h') {
          if (dInfo.urgency !== 'within_24h') return false
        } else if (selectedDeadlineRange === 'within_3d') {
          if (dInfo.urgency !== 'within_24h' && dInfo.urgency !== 'within_3d') return false
        } else if (selectedDeadlineRange === 'within_7d') {
          if (
            dInfo.urgency !== 'within_24h' &&
            dInfo.urgency !== 'within_3d' &&
            dInfo.urgency !== 'within_7d'
          )
            return false
        } else if (selectedDeadlineRange === 'overdue') {
          if (!dInfo.isOverdue) return false
        }

        return true
      })
      .map(opp => ({
        opp,
        breakdown: calculateMatchScore(opp, profile),
        deadlineInfo: getDeadlineInfo(opp.deadline),
      }))
      .sort((a, b) => {
        if (sortBy === 'match') {
          return b.breakdown.overallScore - a.breakdown.overallScore
        }
        if (sortBy === 'deadline') {
          const timeA = parseDeadlineDate(a.opp.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER
          const timeB = parseDeadlineDate(b.opp.deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER
          return timeA - timeB
        }
        if (sortBy === 'title') {
          return a.opp.title.localeCompare(b.opp.title)
        }
        if (sortBy === 'published') {
          const pubA = new Date(a.opp.publishedAt).getTime()
          const pubB = new Date(b.opp.publishedAt).getTime()
          return pubB - pubA
        }
        return 0
      })
  }, [
    opportunities,
    profile,
    searchQuery,
    selectedCategories,
    selectedFormat,
    selectedEducation,
    selectedDeadlineRange,
    freeOnly,
    selectedVerification,
    sortBy,
  ])

  const visibleList = filteredAndSortedOpportunities.slice(0, visibleCount)
  const hasMore = visibleCount < filteredAndSortedOpportunities.length

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Search Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Opportunity Discovery</span>
            <span className="text-xs font-bold text-violet-400 bg-violet-950/80 border border-violet-800/60 px-2.5 py-1 rounded-full">
              {filteredAndSortedOpportunities.length} Available
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse verified programs, filter by eligibility, and match against your profile.
          </p>
        </div>

        {/* Search & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search title, tech, sponsor..."
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1 text-xs font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4 text-violet-400" />
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Filter Bar & Controls */}
      <div className={`space-y-4 ${mobileFilterOpen ? 'block' : 'hidden md:block'}`}>
        {/* Category Pills Multi-select */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Filter by Category
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const selected = selectedCategories.includes(cat)
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                    selected
                      ? 'bg-violet-600 text-white border-violet-500 shadow-xs'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Secondary Filter Dropdowns & Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          {/* Format */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={e => setSelectedFormat(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-violet-500 focus:outline-none"
            >
              <option value="All">All Formats</option>
              {FORMATS.map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Academic Level
            </label>
            <select
              value={selectedEducation}
              onChange={e => setSelectedEducation(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-violet-500 focus:outline-none"
            >
              <option value="All">All Education Levels</option>
              {EDUCATION_LEVELS.map(lvl => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Deadline Window */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Deadline Range
            </label>
            <select
              value={selectedDeadlineRange}
              onChange={e => setSelectedDeadlineRange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-violet-500 focus:outline-none"
            >
              <option value="all">All Deadlines</option>
              <option value="open_only">Open (Exclude Overdue)</option>
              <option value="within_24h">&lt; 24 Hours Left</option>
              <option value="within_3d">Due in ≤ 3 Days</option>
              <option value="within_7d">Due in ≤ 7 Days</option>
              <option value="overdue">Overdue / Expired</option>
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Verification
            </label>
            <select
              value={selectedVerification}
              onChange={e => setSelectedVerification(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-violet-500 focus:outline-none"
            >
              <option value="All">Any Status</option>
              {VERIFICATIONS.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-violet-300 font-semibold focus:border-violet-500 focus:outline-none"
            >
              <option value="match">Match Score (Highest)</option>
              <option value="deadline">Nearest Deadline</option>
              <option value="published">Newest Published</option>
              <option value="title">Title (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Free Participation checkbox and Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={e => setFreeOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-violet-600 focus:ring-violet-500 focus:ring-offset-slate-900"
            />
            <span className="font-medium">Show Free or Stipend-Provided opportunities only</span>
          </label>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all active filters ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Opportunity Grid */}
      {filteredAndSortedOpportunities.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No opportunities match your filters</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Try loosening category constraints, broadening your deadline window, or clearing search
            keywords.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleList.map(({ opp, breakdown }) => (
              <OpportunityCard key={opp.id} opportunity={opp} customBreakdown={breakdown} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold rounded-xl transition shadow-sm"
              >
                Load More Opportunities ({filteredAndSortedOpportunities.length - visibleCount}{' '}
                remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
