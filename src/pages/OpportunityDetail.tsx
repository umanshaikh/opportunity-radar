import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Heart,
  BookmarkPlus,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  Award,
  BookOpen,
  FileText,
  UserCheck,
  Download,
} from 'lucide-react'
import { useRadar } from '../context/RadarContext'
import { calculateMatchScore, getScoreBadgeStyle } from '../utils/matching'
import { getDeadlineInfo, getDeadlineBadgeStyle, getRelativeDeadlineLabel } from '../utils/dateUtils'
import { getGoogleCalendarUrl, downloadIcsCalendar } from '../utils/calendarUtils'
import { MatchBreakdownModal } from '../components/common/MatchBreakdownModal'
import { ApplicationModal } from '../components/common/ApplicationModal'
import { OpportunityCard } from '../components/common/OpportunityCard'

export const OpportunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { opportunities, profile, isSaved, toggleSave, applications } = useRadar()

  const [showMatchModal, setShowMatchModal] = useState(false)
  const [showTrackModal, setShowTrackModal] = useState(false)

  const opportunity = opportunities.find(o => o.id === id)

  if (!opportunity) {
    return (
      <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 max-w-md mx-auto my-12">
        <h2 className="text-lg font-bold text-white">Opportunity Not Found</h2>
        <p className="text-xs text-slate-400 mt-2">
          This listing might have been removed or has an invalid reference ID.
        </p>
        <button
          onClick={() => navigate('/explore')}
          className="mt-5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition"
        >
          Return to Explore
        </button>
      </div>
    )
  }

  const saved = isSaved(opportunity.id)
  const existingApp = applications.find(a => a.opportunityId === opportunity.id)
  const breakdown = calculateMatchScore(opportunity, profile)
  const scoreStyle = getScoreBadgeStyle(breakdown.overallScore)
  const deadlineInfo = getDeadlineInfo(opportunity.deadline)
  const deadlineStyle = getDeadlineBadgeStyle(deadlineInfo.urgency)

  // Related opportunities (same category or similar tags, excluding current)
  const related = opportunities
    .filter(o => o.id !== opportunity.id && (o.category === opportunity.category || o.tags.some(t => opportunity.tags.includes(t))))
    .slice(0, 2)

  const handleToggleSave = async () => {
    await toggleSave(opportunity.id)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition py-1 px-2 rounded-lg hover:bg-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              saved
                ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-400' : ''}`} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => setShowTrackModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-xs transition"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>{existingApp ? `Tracking: ${existingApp.status}` : 'Add to Tracker'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        {opportunity.isDemo && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
            DEMO DATA — NOT A REAL OPPORTUNITY
          </div>
        )}

        {/* Expired / Overdue Notice Banner */}
        {deadlineInfo.isOverdue && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/70 text-rose-300 text-xs flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              <strong>Application Deadline Passed:</strong> This opportunity deadline was{' '}
              {deadlineInfo.formattedDeadline}. New submissions are no longer active.
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-violet-950/90 text-violet-300 border border-violet-800/60">
                {opportunity.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {opportunity.format}
              </span>
              {opportunity.verificationStatus === 'Verified' ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Record
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {opportunity.verificationStatus}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {opportunity.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400 pt-1">
              <span className="font-semibold text-slate-200">{opportunity.organization}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {opportunity.location}
              </span>
              <span>•</span>
              <span className="text-slate-400">
                Last checked: {new Date(opportunity.lastVerifiedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Match Score Card Button */}
          <button
            onClick={() => setShowMatchModal(true)}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-violet-600/50 transition text-left flex lg:flex-col items-center lg:items-start justify-between gap-3 shrink-0"
          >
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Deterministic Match</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-white">{breakdown.overallScore}%</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${scoreStyle.bg} ${scoreStyle.color} ${scoreStyle.border}`}>
                  {scoreStyle.label}
                </span>
              </div>
            </div>
            <span className="text-xs text-violet-400 font-semibold underline underline-offset-2">
              Explain match →
            </span>
          </button>
        </div>

        {/* Quick Meta Row */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Deadline</span>
            <div className="flex items-center gap-1.5 mt-0.5 text-slate-200 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-violet-400" />
              <span>{deadlineInfo.formattedDeadline}</span>
            </div>
            <span className={`text-[11px] font-semibold mt-1 inline-block ${deadlineStyle.text}`}>
              {getRelativeDeadlineLabel(deadlineInfo)}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Cost / Financials</span>
            <span className="text-emerald-400 font-semibold block mt-0.5">
              {opportunity.stipendOrPrize || opportunity.participationCost}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Eligibility</span>
            <span className="text-slate-200 font-semibold block mt-0.5 truncate">
              {opportunity.educationLevels.join(', ')}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Official Link</span>
            <a
              href={opportunity.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold mt-0.5"
            >
              <span>Visit Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Grid: Main Details & Sidebar Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details & Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-400" />
              <span>Program Overview</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </p>
          </div>

          {/* Eligibility Matrix */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Eligibility & Academic Criteria</span>
              </h2>

              {/* Status Badge */}
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${
                  breakdown.eligibilityStatus === 'satisfied'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    : breakdown.eligibilityStatus === 'needs_confirmation'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                }`}
              >
                {breakdown.eligibilityStatus === 'satisfied' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {breakdown.eligibilityStatus === 'needs_confirmation' && (
                  <HelpCircle className="w-3.5 h-3.5" />
                )}
                {breakdown.eligibilityStatus === 'not_satisfied' && (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span className="capitalize">{breakdown.eligibilityStatus.replace('_', ' ')}</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {opportunity.eligibility.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-slate-500 block mb-1">Eligible Education Levels</span>
                <span className="font-semibold text-slate-200">
                  {opportunity.educationLevels.join(', ')}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-slate-500 block mb-1">Target Disciplines / Majors</span>
                <span className="font-semibold text-slate-200">
                  {opportunity.eligibility.majors?.join(', ') || 'Open to all academic disciplines'}
                </span>
              </div>
            </div>

            {opportunity.eligibility.criteriaNotes && (
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-semibold text-slate-400">Additional Criteria:</span>
                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc marker:text-violet-400">
                  {opportunity.eligibility.criteriaNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
              <strong>Verification Note:</strong> OpportunityRadar evaluates stated degree level
              compatibility. Always check the official provider rules for nationality, age, or GPA
              sub-requirements. We do not guarantee admission or selection.
            </div>
          </div>

          {/* Required Skills & Prep */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" />
              <span>Required Skills & Experience</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {opportunity.requiredSkills.map(skill => {
                const isMatched = breakdown.matchedSkills.includes(skill)
                return (
                  <span
                    key={skill}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${
                      isMatched
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    {isMatched ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                    {skill}
                    {isMatched && <span className="text-[10px] text-emerald-400 ml-1">(In profile)</span>}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Application Steps & Benefits */}
          {(opportunity.applicationSteps || opportunity.benefits) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunity.applicationSteps && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>Application Steps</span>
                  </h3>
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal pl-4 marker:text-indigo-400">
                    {opportunity.applicationSteps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {opportunity.benefits && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Key Benefits</span>
                  </h3>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 marker:text-emerald-400">
                    {opportunity.benefits.map((b, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Tracker & Actions */}
        <div className="space-y-6">
          {/* Tracker Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Application Status
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/50">
                {existingApp ? existingApp.status : 'Not Tracked'}
              </span>
            </div>

            {existingApp ? (
              <div className="space-y-3 text-xs">
                {existingApp.nextAction && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Next Action Milestone</span>
                    <span className="text-slate-200 font-semibold">{existingApp.nextAction}</span>
                    {existingApp.nextActionDate && (
                      <span className="block text-amber-400 mt-1">
                        Due: {existingApp.nextActionDate}
                      </span>
                    )}
                  </div>
                )}

                {existingApp.notes && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Personal Notes</span>
                    <p className="text-slate-300 italic whitespace-pre-line">{existingApp.notes}</p>
                  </div>
                )}

                <button
                  onClick={() => setShowTrackModal(true)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                >
                  Edit Tracker Notes & Status
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Add this opportunity to your personal pipeline to track deadlines, write notes, and
                  set next milestones.
                </p>
                <button
                  onClick={() => setShowTrackModal(true)}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-900/40 transition flex items-center justify-center gap-1.5"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Start Tracking Application</span>
                </button>
              </div>
            )}
          </div>

          {/* Calendar Sync Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              <span>Calendar Sync</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never miss this deadline. Sync directly to your calendar with an automatic 24-hour reminder alert.
            </p>
            <div className="space-y-2 pt-1">
              <a
                href={getGoogleCalendarUrl(opportunity)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-violet-400" />
                <span>Add to Google Calendar</span>
                <ExternalLink className="w-3 h-3 text-violet-400" />
              </a>
              <button
                onClick={() => downloadIcsCalendar(opportunity)}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Download .ics File</span>
              </button>
            </div>
          </div>

          {/* Official Provider Notice */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
              <span>Official Link Policy</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              In this MVP release, demo opportunities point to safe placeholder domains (
              <code className="text-violet-300">example.com</code>). OpportunityRadar never invents
              fictional links or impersonates external organizations.
            </p>
          </div>
        </div>
      </div>

      {/* Related Opportunities */}
      {related.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-800">
          <h2 className="text-lg font-bold text-white">Related Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {related.map(rel => (
              <OpportunityCard key={rel.id} opportunity={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
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
    </div>
  )
}
