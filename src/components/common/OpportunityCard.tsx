import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  Calendar,
  MapPin,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  BookmarkPlus,
  Clock,
  CheckCircle,
} from 'lucide-react'
import type { Opportunity, MatchScoreBreakdown } from '../../types'
import { useRadar } from '../../context/RadarContext'
import { getDeadlineInfo, getDeadlineBadgeStyle, getRelativeDeadlineLabel } from '../../utils/dateUtils'
import { calculateMatchScore, getScoreBadgeStyle } from '../../utils/matching'
import { MatchBreakdownModal } from './MatchBreakdownModal'
import { ApplicationModal } from './ApplicationModal'

interface OpportunityCardProps {
  opportunity: Opportunity
  customBreakdown?: MatchScoreBreakdown
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  customBreakdown,
}) => {
  const { profile, toggleSave, isSaved, applications } = useRadar()
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [showTrackModal, setShowTrackModal] = useState(false)

  const saved = isSaved(opportunity.id)
  const existingApp = applications.find(a => a.opportunityId === opportunity.id)

  const breakdown = customBreakdown || calculateMatchScore(opportunity, profile)
  const scoreStyle = getScoreBadgeStyle(breakdown.overallScore)
  const deadlineInfo = getDeadlineInfo(opportunity.deadline)
  const deadlineStyle = getDeadlineBadgeStyle(deadlineInfo.urgency)
  const relativeDeadline = getRelativeDeadlineLabel(deadlineInfo)

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleSave(opportunity.id)
  }

  const handleOpenTrack = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowTrackModal(true)
  }

  return (
    <>
      <div className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-violet-600/40 rounded-2xl p-5 shadow-lg hover:shadow-violet-950/20 transition-all duration-200 flex flex-col justify-between">
        {/* Top Demarcation & Badges */}
        <div>
          {opportunity.isDemo && (
            <div className="mb-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
              DEMO DATA — NOT A REAL OPPORTUNITY
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-violet-950/80 text-violet-300 border border-violet-800/50">
                {opportunity.category}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {opportunity.format}
              </span>
              {opportunity.verificationStatus === 'Verified' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                  <ShieldAlert className="w-3 h-3" />
                  {opportunity.verificationStatus}
                </span>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleToggleSave}
              aria-label={saved ? 'Remove from saved' : 'Save opportunity'}
              className={`p-2 rounded-xl transition ${
                saved
                  ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60 hover:bg-rose-900/50'
                  : 'bg-slate-800/60 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-rose-400' : ''}`} />
            </button>
          </div>

          {/* Title & Organization */}
          <div className="mt-3">
            <Link
              to={`/opportunity/${opportunity.id}`}
              className="text-base font-bold text-white hover:text-violet-400 transition-colors line-clamp-2"
            >
              {opportunity.title}
            </Link>
            <p className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-1">
              <span>{opportunity.organization}</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3 h-3 text-slate-500" />
                {opportunity.location}
              </span>
            </p>
          </div>

          {/* Description */}
          <p className="mt-2.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {opportunity.description}
          </p>

          {/* Match Score Pill */}
          <div className="mt-3 flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <button
              type="button"
              onClick={() => setShowMatchModal(true)}
              className="flex items-center gap-2 group/btn hover:opacity-90 transition text-left"
              title="Click to view transparent match calculation"
            >
              <div className="p-1 rounded bg-violet-950 text-violet-400 border border-violet-800/40">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">
                    {breakdown.overallScore}% Match
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${scoreStyle.bg} ${scoreStyle.color} ${scoreStyle.border}`}>
                    {scoreStyle.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block group-hover/btn:text-violet-300 underline underline-offset-2">
                  View calculation breakdown →
                </span>
              </div>
            </button>

            {opportunity.stipendOrPrize && (
              <span className="text-[11px] font-semibold text-emerald-400 text-right truncate max-w-[140px]">
                {opportunity.stipendOrPrize}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {opportunity.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[11px] bg-slate-800/70 text-slate-300 border border-slate-700/50"
              >
                #{tag}
              </span>
            ))}
            {opportunity.tags.length > 3 && (
              <span className="px-1.5 py-0.5 rounded text-[11px] text-slate-500">
                +{opportunity.tags.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Footer info & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
          {/* Deadline Pill */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{deadlineInfo.formattedDeadline}</span>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${deadlineStyle.bg} ${deadlineStyle.text} ${deadlineStyle.border}`}
            >
              <Clock className="w-3 h-3" />
              {relativeDeadline}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleOpenTrack}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                existingApp
                  ? 'bg-violet-950/70 text-violet-300 border-violet-700/60 hover:bg-violet-900/60'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {existingApp ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-violet-400" />
                  <span>Tracking: {existingApp.status}</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5 text-slate-400" />
                  <span>Track Application</span>
                </>
              )}
            </button>

            <Link
              to={`/opportunity/${opportunity.id}`}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition flex items-center gap-1 shadow-xs shadow-violet-900/30"
            >
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <MatchBreakdownModal
        isOpen={showMatchModal}
        opportunity={opportunity}
        breakdown={breakdown}
        onClose={() => setShowMatchModal(false)}
      />

      <ApplicationModal
        isOpen={showTrackModal}
        opportunity={opportunity}
        existingApplication={existingApp}
        onClose={() => setShowTrackModal(false)}
      />
    </>
  )
}
