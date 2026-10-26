import React from 'react'
import { X, CheckCircle2, AlertCircle, Sparkles, BookOpen, Layers, GraduationCap, MapPin } from 'lucide-react'
import type { Opportunity, MatchScoreBreakdown } from '../../types'
import { getScoreBadgeStyle } from '../../utils/matching'

interface MatchBreakdownModalProps {
  isOpen: boolean
  opportunity: Opportunity | null
  breakdown: MatchScoreBreakdown | null
  onClose: () => void
}

export const MatchBreakdownModal: React.FC<MatchBreakdownModalProps> = ({
  isOpen,
  opportunity,
  breakdown,
  onClose,
}) => {
  if (!isOpen || !opportunity || !breakdown) return null

  const badgeStyle = getScoreBadgeStyle(breakdown.overallScore)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-950/80 text-violet-400 border border-violet-800/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 id="match-modal-title" className="text-lg font-bold text-white">
                Match Score Breakdown
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-sm">{opportunity.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Hero */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Deterministic Relevance Score
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold text-white">{breakdown.overallScore}</span>
              <span className="text-sm text-slate-400">/ 100 pts</span>
            </div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${badgeStyle.bg} ${badgeStyle.color} ${badgeStyle.border}`}
          >
            {badgeStyle.label}
          </span>
        </div>

        {/* Weighted Component Bars */}
        <div className="mt-5 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Weighted Score Components
          </div>

          {/* 40% Interests */}
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Layers className="w-3.5 h-3.5 text-violet-400" />
                Interests & Category Alignment (40%)
              </span>
              <span className="text-violet-300 font-bold">{breakdown.interestScore} / 40 pts</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-violet-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(breakdown.interestScore / 40) * 100}%` }}
              />
            </div>
          </div>

          {/* 30% Skills */}
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-200">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Skills & Technical Tags (30%)
              </span>
              <span className="text-indigo-300 font-bold">{breakdown.skillScore} / 30 pts</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(breakdown.skillScore / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* 20% Education */}
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-200">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                Education Level Compatibility (20%)
              </span>
              <span className="text-emerald-300 font-bold">{breakdown.educationScore} / 20 pts</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(breakdown.educationScore / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* 10% Format & Location */}
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Format, Location & Free Access (10%)
              </span>
              <span className="text-amber-300 font-bold">{breakdown.formatScore} / 10 pts</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(breakdown.formatScore / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Skills Matched vs Missing */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Matched Skills ({breakdown.matchedSkills.length})
            </div>
            {breakdown.matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {breakdown.matchedSkills.map(s => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/50"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">None matched from your profile yet.</p>
            )}
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Skills to Prepare ({breakdown.missingSkills.length})
            </div>
            {breakdown.missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {breakdown.missingSkills.map(s => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded text-xs bg-amber-950/60 text-amber-300 border border-amber-800/50"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">All required skills present in your profile!</p>
            )}
          </div>
        </div>

        {/* Match Reasons */}
        <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 mb-1.5">Why this matches you:</div>
          <ul className="text-xs text-slate-300 space-y-1">
            {breakdown.reasons.map((r, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-violet-400">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strict Legal / Quality Disclaimer */}
        <div className="mt-4 p-3 rounded-lg bg-violet-950/30 border border-violet-800/30 text-xs text-violet-300 leading-relaxed">
          <strong>Relevance Disclaimer:</strong> The Match Score is an algorithmic relevance estimate
          based on your saved profile preferences. It is not an assessment of admission probability,
          selection guarantee, or official endorsement by the hosting organization.
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  )
}
