import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Kanban,
  List,
  Search,
  Trash2,
  Edit3,
  ArrowRight,
} from 'lucide-react'
import type { Application, ApplicationStatus, Opportunity } from '../types'
import { useRadar } from '../context/RadarContext'
import { getDeadlineInfo, getRelativeDeadlineLabel, getDeadlineBadgeStyle } from '../utils/dateUtils'
import { ApplicationModal } from '../components/common/ApplicationModal'
import { ConfirmationModal } from '../components/common/ConfirmationModal'

const STATUS_COLUMNS: ApplicationStatus[] = [
  'Interested',
  'Preparing',
  'Applied',
  'Shortlisted',
  'Rejected',
  'Completed',
  'Withdrawn',
]

const STATUS_COLORS: Record<ApplicationStatus, { header: string; badge: string }> = {
  Interested: {
    header: 'border-slate-700 bg-slate-900',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  Preparing: {
    header: 'border-amber-700/60 bg-amber-950/20',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
  },
  Applied: {
    header: 'border-indigo-700/60 bg-indigo-950/20',
    badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
  },
  Shortlisted: {
    header: 'border-emerald-700/60 bg-emerald-950/20',
    badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
  },
  Rejected: {
    header: 'border-rose-900/60 bg-rose-950/20',
    badge: 'bg-rose-950/80 text-rose-300 border-rose-900/60',
  },
  Completed: {
    header: 'border-violet-700/60 bg-violet-950/20',
    badge: 'bg-violet-950/80 text-violet-300 border-violet-800/60',
  },
  Withdrawn: {
    header: 'border-slate-800 bg-slate-950/40',
    badge: 'bg-slate-900 text-slate-500 border-slate-800',
  },
}

export const Tracker: React.FC = () => {
  const { applications, opportunities, deleteApplication, saveApplication } = useRadar()

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [filterQuery, setFilterQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('All')

  // Edit / Add Modal state
  const [editingApp, setEditingApp] = useState<{
    app: Application | null
    opportunity: Opportunity | null
  } | null>(null)

  // Delete confirmation state
  const [appToDelete, setAppToDelete] = useState<string | null>(null)

  // Join applications with their opportunity metadata
  const joinedApplications = useMemo(() => {
    return applications
      .map(app => {
        const opp = opportunities.find(o => o.id === app.opportunityId) || null
        const dInfo = opp ? getDeadlineInfo(opp.deadline) : null
        return { app, opp, dInfo }
      })
      .filter(({ app, opp }) => {
        if (!opp) return false

        if (filterQuery) {
          const q = filterQuery.toLowerCase()
          const matchTitle = opp.title.toLowerCase().includes(q)
          const matchOrg = opp.organization.toLowerCase().includes(q)
          const matchNote = app.notes.toLowerCase().includes(q)
          const matchAction = app.nextAction.toLowerCase().includes(q)
          if (!matchTitle && !matchOrg && !matchNote && !matchAction) return false
        }

        if (filterStatus !== 'All' && app.status !== filterStatus) {
          return false
        }

        return true
      })
  }, [applications, opportunities, filterQuery, filterStatus])

  const handleDeleteConfirm = async () => {
    if (appToDelete) {
      await deleteApplication(appToDelete)
      setAppToDelete(null)
    }
  }

  const handleQuickStatusChange = async (app: Application, newStatus: ApplicationStatus) => {
    await saveApplication({
      ...app,
      status: newStatus,
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and View Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Kanban className="w-6 h-6 text-violet-400" />
            <span>Application Pipeline</span>
            <span className="text-xs font-bold text-violet-400 bg-violet-950/80 border border-violet-800/60 px-2.5 py-1 rounded-full">
              {applications.length} Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track submissions, draft notes, manage milestones, and beat deadlines.
          </p>
        </div>

        {/* View Toggle & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="Search tracker..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:border-violet-500 focus:outline-none"
          >
            <option value="All">All Pipeline Stages</option>
            {STATUS_COLUMNS.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Kanban / Table Toggle */}
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              aria-label="Kanban board view"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'kanban'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              aria-label="List table view"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'table'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {applications.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 max-w-md mx-auto my-12">
          <div className="w-14 h-14 rounded-2xl bg-violet-950/40 border border-violet-800/40 flex items-center justify-center mx-auto text-violet-400 mb-4">
            <Kanban className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Your pipeline is empty</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Track applications by opening any opportunity card and clicking{' '}
            <strong className="text-slate-300">Track Application</strong>.
          </p>
          <Link
            to="/explore"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
          {STATUS_COLUMNS.map(columnStatus => {
            const columnItems = joinedApplications.filter(
              item => item.app.status === columnStatus
            )
            const style = STATUS_COLORS[columnStatus]

            return (
              <div
                key={columnStatus}
                className={`w-72 shrink-0 rounded-2xl border p-3 flex flex-col ${style.header}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/80">
                  <span className="text-xs font-bold text-white">{columnStatus}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${style.badge}`}
                  >
                    {columnItems.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 min-h-[300px]">
                  {columnItems.length === 0 ? (
                    <div className="h-28 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-[11px] text-slate-500">
                      No items
                    </div>
                  ) : (
                    columnItems.map(({ app, opp, dInfo }) => {
                      if (!opp) return null
                      const deadlineBadge = dInfo ? getDeadlineBadgeStyle(dInfo.urgency) : null

                      return (
                        <div
                          key={app.id}
                          className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/90 hover:border-violet-600/50 transition-shadow shadow-xs text-xs space-y-2.5"
                        >
                          {/* Title & Org */}
                          <div>
                            <Link
                              to={`/opportunity/${opp.id}`}
                              className="font-bold text-white hover:text-violet-400 line-clamp-2 block leading-snug"
                            >
                              {opp.title}
                            </Link>
                            <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
                              {opp.organization}
                            </span>
                          </div>

                          {/* Deadline Tag */}
                          {dInfo && deadlineBadge && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">Deadline</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${deadlineBadge.bg} ${deadlineBadge.text} ${deadlineBadge.border}`}
                              >
                                {getRelativeDeadlineLabel(dInfo)}
                              </span>
                            </div>
                          )}

                          {/* Next Action Milestone */}
                          {app.nextAction && (
                            <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px]">
                              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                Next Action:
                              </span>
                              <span className="text-slate-200 line-clamp-2">{app.nextAction}</span>
                              {app.nextActionDate && (
                                <span className="text-amber-400 text-[10px] block mt-1">
                                  Due: {app.nextActionDate}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Card Footer Actions */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            {/* Quick status dropdown */}
                            <select
                              value={app.status}
                              onChange={e =>
                                handleQuickStatusChange(app, e.target.value as ApplicationStatus)
                              }
                              className="text-[10px] bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
                            >
                              {STATUS_COLUMNS.map(s => (
                                <option key={s} value={s}>
                                  → {s}
                                </option>
                              ))}
                            </select>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingApp({ app, opportunity: opp })}
                                aria-label="Edit notes and milestone"
                                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setAppToDelete(app.id)}
                                aria-label="Remove from tracker"
                                className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Next Action</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {joinedApplications.map(({ app, opp, dInfo }) => {
                if (!opp) return null
                const deadlineBadge = dInfo ? getDeadlineBadgeStyle(dInfo.urgency) : null

                return (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      <Link to={`/opportunity/${opp.id}`} className="hover:text-violet-400">
                        {opp.title}
                      </Link>
                      <div className="text-[11px] text-slate-500">{opp.organization}</div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={app.status}
                        onChange={e =>
                          handleQuickStatusChange(app, e.target.value as ApplicationStatus)
                        }
                        className="text-xs bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                      >
                        {STATUS_COLUMNS.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      {dInfo && deadlineBadge && (
                        <div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${deadlineBadge.bg} ${deadlineBadge.text} ${deadlineBadge.border}`}
                          >
                            {getRelativeDeadlineLabel(dInfo)}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {dInfo.formattedDeadline}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-200">{app.nextAction || '—'}</span>
                      {app.nextActionDate && (
                        <span className="text-[10px] text-amber-400 block">
                          Due: {app.nextActionDate}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-400">
                      {app.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingApp({ app, opportunity: opp })}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setAppToDelete(app.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Application Modal */}
      {editingApp && (
        <ApplicationModal
          isOpen={!!editingApp}
          opportunity={editingApp.opportunity}
          existingApplication={editingApp.app}
          onClose={() => setEditingApp(null)}
        />
      )}

      {/* Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!appToDelete}
        title="Remove Application from Tracker?"
        message="This will delete your tracking notes and action milestones for this opportunity. The opportunity itself remains available in Explore."
        confirmText="Remove from Pipeline"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setAppToDelete(null)}
      />
    </div>
  )
}
