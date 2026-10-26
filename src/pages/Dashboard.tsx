import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Heart,
  Kanban,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BookmarkCheck,
  Calendar,
  Zap,
} from 'lucide-react'
import { useRadar } from '../context/RadarContext'
import { calculateMatchScore } from '../utils/matching'
import { getDeadlineInfo, getRelativeDeadlineLabel, getDeadlineBadgeStyle } from '../utils/dateUtils'
import { OpportunityCard } from '../components/common/OpportunityCard'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const {
    opportunities,
    profile,
    saved,
    applications,
    stats,
    searchQuery,
    setSearchQuery,
  } = useRadar()

  // Sorted opportunities by match score descending
  const recommendedOpportunities = useMemo(() => {
    return [...opportunities]
      .map(opp => ({ opp, breakdown: calculateMatchScore(opp, profile) }))
      .sort((a, b) => b.breakdown.overallScore - a.breakdown.overallScore)
      .slice(0, 4)
  }, [opportunities, profile])

  // Upcoming deadlines sorted chronologically (soonest first, excluding overdue or showing urgent)
  const urgentDeadlines = useMemo(() => {
    return [...opportunities]
      .map(opp => ({ opp, dInfo: getDeadlineInfo(opp.deadline) }))
      .filter(item => !item.dInfo.isOverdue && item.dInfo.urgency !== 'invalid')
      .sort((a, b) => a.dInfo.daysRemaining - b.dInfo.daysRemaining)
      .slice(0, 5)
  }, [opportunities])

  // Recently saved items
  const recentlySavedOpportunities = useMemo(() => {
    const savedIds = saved.slice(0, 3).map(s => s.opportunityId)
    return opportunities.filter(o => savedIds.includes(o.id))
  }, [opportunities, saved])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate('/explore')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome & Search Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-950/90 text-violet-300 border border-violet-800/60 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Algorithmic Match & Deadline Radar</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Discover your next breakthrough opportunity.
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Matching internships, hackathons, and scholarships to your skills with 100% deterministic
            scoring.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by role, skill, or organization (e.g. AI, Python, Fellowship)..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-950/50 transition flex items-center justify-center gap-2"
            >
              <span>Explore All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saved Count */}
        <Link
          to="/saved"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Saved Opportunities
            </span>
            <div className="p-2 rounded-xl bg-rose-950/60 text-rose-400 group-hover:scale-105 transition">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{stats.savedCount}</span>
            <span className="text-xs text-slate-400 group-hover:text-rose-300">View saved →</span>
          </div>
        </Link>

        {/* Tracker Pipeline */}
        <Link
          to="/tracker"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tracked Applications
            </span>
            <div className="p-2 rounded-xl bg-violet-950/60 text-violet-400 group-hover:scale-105 transition">
              <Kanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{stats.totalApplications}</span>
            <span className="text-xs text-slate-400 group-hover:text-violet-300">
              {stats.appliedCount} applied →
            </span>
          </div>
        </Link>

        {/* Upcoming Deadlines */}
        <Link
          to="/deadlines"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Deadlines (≤ 7 Days)
            </span>
            <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400 group-hover:scale-105 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{stats.upcomingDeadlinesCount}</span>
            <span className="text-xs text-amber-400 group-hover:underline">Manage deadlines →</span>
          </div>
        </Link>

        {/* Average Match Score */}
        <Link
          to="/profile"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg Profile Match
            </span>
            <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 group-hover:scale-105 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{stats.avgMatchScore}%</span>
            <span className="text-xs text-emerald-400 group-hover:underline">Tune profile →</span>
          </div>
        </Link>
      </div>

      {/* Recommended Opportunities Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-400" />
              <span>Recommended for You</span>
            </h2>
            <p className="text-xs text-slate-400">
              Ranked using your educational level ({profile.educationLevel}) and preferred tags.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <span>See all {opportunities.length} opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendedOpportunities.map(({ opp, breakdown }) => (
            <OpportunityCard key={opp.id} opportunity={opp} customBreakdown={breakdown} />
          ))}
        </div>
      </section>

      {/* Split Section: Upcoming Deadlines & Pipeline Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Approaching Deadlines */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Approaching Deadlines
              </h3>
            </div>
            <Link
              to="/deadlines"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300"
            >
              View all deadlines →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-800/80">
            {urgentDeadlines.map(({ opp, dInfo }) => {
              const bStyle = getDeadlineBadgeStyle(dInfo.urgency)
              return (
                <div
                  key={opp.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/40 px-2 rounded-lg transition"
                >
                  <div>
                    <Link
                      to={`/opportunity/${opp.id}`}
                      className="text-sm font-bold text-slate-100 hover:text-violet-400 line-clamp-1"
                    >
                      {opp.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{opp.organization}</span>
                      <span>•</span>
                      <span className="text-slate-500">{opp.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-semibold border ${bStyle.bg} ${bStyle.text} ${bStyle.border}`}
                    >
                      {getRelativeDeadlineLabel(dInfo)}
                    </span>
                    <Link
                      to={`/opportunity/${opp.id}`}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Application Tracker Pipeline Mini-Widget */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Tracker Pipeline
                </h3>
              </div>
              <Link
                to="/tracker"
                className="text-xs font-semibold text-violet-400 hover:text-violet-300"
              >
                Open →
              </Link>
            </div>

            <div className="mt-4 space-y-2.5">
              {[
                { label: 'Interested', color: 'bg-slate-700' },
                { label: 'Preparing', color: 'bg-amber-500' },
                { label: 'Applied', color: 'bg-indigo-500' },
                { label: 'Shortlisted', color: 'bg-emerald-500' },
                { label: 'Completed', color: 'bg-violet-500' },
              ].map(st => {
                const count = applications.filter(a => a.status === st.label).length
                return (
                  <div
                    key={st.label}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800 text-xs"
                  >
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className={`w-2 h-2 rounded-full ${st.color}`} />
                      {st.label}
                    </span>
                    <span className="font-bold text-white">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <Link
              to="/tracker"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              <Kanban className="w-4 h-4 text-violet-400" />
              <span>Manage Application Pipeline</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recently Saved Quick Glance */}
      {recentlySavedOpportunities.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span>Recently Saved</span>
            </h2>
            <Link
              to="/saved"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300"
            >
              View all {saved.length} saved →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentlySavedOpportunities.map(opp => (
              <div
                key={opp.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-semibold text-violet-300 px-2 py-0.5 rounded bg-violet-950 border border-violet-800/40">
                    {opp.category}
                  </span>
                  <Link
                    to={`/opportunity/${opp.id}`}
                    className="mt-2 text-sm font-bold text-white hover:text-violet-400 line-clamp-1 block"
                  >
                    {opp.title}
                  </Link>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{opp.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{getDeadlineInfo(opp.deadline).formattedDeadline}</span>
                  <Link
                    to={`/opportunity/${opp.id}`}
                    className="text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
