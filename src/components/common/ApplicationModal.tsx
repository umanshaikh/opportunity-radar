import React, { useState, useEffect } from 'react'
import { X, BookmarkPlus, Calendar, FileText, CheckCircle2 } from 'lucide-react'
import type { Application, ApplicationStatus, Opportunity } from '../../types'
import { useRadar } from '../../context/RadarContext'

interface ApplicationModalProps {
  isOpen: boolean
  opportunity: Opportunity | null
  existingApplication?: Application | null
  onClose: () => void
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Interested',
  'Preparing',
  'Applied',
  'Shortlisted',
  'Rejected',
  'Completed',
  'Withdrawn',
]

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  opportunity,
  existingApplication,
  onClose,
}) => {
  const { saveApplication } = useRadar()

  const [status, setStatus] = useState<ApplicationStatus>('Interested')
  const [notes, setNotes] = useState<string>('')
  const [nextAction, setNextAction] = useState<string>('')
  const [nextActionDate, setNextActionDate] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (existingApplication) {
      setStatus(existingApplication.status)
      setNotes(existingApplication.notes || '')
      setNextAction(existingApplication.nextAction || '')
      setNextActionDate(existingApplication.nextActionDate || '')
    } else {
      setStatus('Interested')
      setNotes('')
      setNextAction('')
      setNextActionDate('')
    }
  }, [existingApplication, isOpen])

  if (!isOpen || !opportunity) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await saveApplication({
        id: existingApplication?.id,
        opportunityId: opportunity.id,
        status,
        notes,
        nextAction,
        nextActionDate: nextActionDate || undefined,
      })
      onClose()
    } catch (err) {
      console.error('Failed to save application tracker item:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-950/80 text-violet-400 border border-violet-800/40">
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 id="app-modal-title" className="text-lg font-bold text-white">
                {existingApplication ? 'Update Application Tracker' : 'Track Opportunity'}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{opportunity.title}</p>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Status Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Application Pipeline Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STATUS_OPTIONS.map(opt => {
                const isSelected = status === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setStatus(opt)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-900/30'
                        : 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Next Action */}
          <div>
            <label
              htmlFor="next-action"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1"
            >
              Next Milestone / Action Item
            </label>
            <input
              id="next-action"
              type="text"
              value={nextAction}
              onChange={e => setNextAction(e.target.value)}
              placeholder="e.g. Ask prof for recommendation letter, finalize pitch deck"
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Next Action Date */}
          <div>
            <label
              htmlFor="next-action-date"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1"
            >
              Target Date for Next Action
            </label>
            <div className="relative">
              <input
                id="next-action-date"
                type="date"
                value={nextActionDate}
                onChange={e => setNextActionDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:border-violet-500 focus:outline-none"
              />
              <Calendar className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Personal Notes */}
          <div>
            <label
              htmlFor="tracker-notes"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1"
            >
              Personal Notes & Application Checklist
            </label>
            <textarea
              id="tracker-notes"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Draft links, credentials checklist, teammates, questions..."
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none resize-none"
            />
          </div>

          {/* Submission Notice */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Application submissions are tracked manually by you. OpportunityRadar never submits or
              claims an application was submitted without your direct confirmation.
            </span>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg shadow-md shadow-violet-900/30 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : existingApplication ? 'Update Tracker' : 'Save to Tracker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
