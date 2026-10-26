import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  AlertTriangle,
  Flame,
  Calendar,
  Bell,
} from 'lucide-react'
import { useRadar } from '../context/RadarContext'
import { getDeadlineInfo, getRelativeDeadlineLabel, getDeadlineBadgeStyle } from '../utils/dateUtils'
import type { DeadlineUrgency, Opportunity } from '../types'

interface DeadlineSectionConfig {
  urgency: DeadlineUrgency
  title: string
  subtitle: string
  icon: React.ElementType
  colorClasses: {
    border: string
    badgeBg: string
    badgeText: string
    headerBg: string
  }
}

const SECTIONS: DeadlineSectionConfig[] = [
  {
    urgency: 'overdue',
    title: 'Overdue / Expired',
    subtitle: 'Deadlines that have already passed. Submissions are likely closed.',
    icon: AlertTriangle,
    colorClasses: {
      border: 'border-rose-900/60',
      badgeBg: 'bg-rose-950/80',
      badgeText: 'text-rose-400',
      headerBg: 'bg-rose-950/20',
    },
  },
  {
    urgency: 'within_24h',
    title: 'Due Within 24 Hours',
    subtitle: 'Urgent action required! Finalize submissions and upload materials.',
    icon: Flame,
    colorClasses: {
      border: 'border-red-700/60',
      badgeBg: 'bg-red-950/80',
      badgeText: 'text-red-300',
      headerBg: 'bg-red-950/30',
    },
  },
  {
    urgency: 'within_3d',
    title: 'Due Within 3 Days',
    subtitle: 'Approaching fast. Polish essays, check letters, and review code.',
    icon: Clock,
    colorClasses: {
      border: 'border-amber-700/60',
      badgeBg: 'bg-amber-950/80',
      badgeText: 'text-amber-300',
      headerBg: 'bg-amber-950/20',
    },
  },
  {
    urgency: 'within_7d',
    title: 'Due This Week (≤ 7 Days)',
    subtitle: 'Upcoming targets for the current calendar cycle.',
    icon: Calendar,
    colorClasses: {
      border: 'border-yellow-700/50',
      badgeBg: 'bg-yellow-950/60',
      badgeText: 'text-yellow-300',
      headerBg: 'bg-yellow-950/10',
    },
  },
  {
    urgency: 'later',
    title: 'Later / Future Opportunities',
    subtitle: 'Plenty of runway to prepare prerequisites, teams, and materials.',
    icon: Calendar,
    colorClasses: {
      border: 'border-slate-800',
      badgeBg: 'bg-slate-800',
      badgeText: 'text-slate-300',
      headerBg: 'bg-slate-900/40',
    },
  },
]

export const Deadlines: React.FC = () => {
  const { opportunities, applications } = useRadar()

  // In-app test browser notification state
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null)

  // Group opportunities by deadline urgency
  const groupedOpportunities = useMemo(() => {
    const groups: Record<DeadlineUrgency, { opp: Opportunity; dInfo: ReturnType<typeof getDeadlineInfo> }[]> = {
      overdue: [],
      within_24h: [],
      within_3d: [],
      within_7d: [],
      later: [],
      invalid: [],
    }

    for (const opp of opportunities) {
      const dInfo = getDeadlineInfo(opp.deadline)
      groups[dInfo.urgency].push({ opp, dInfo })
    }

    // Sort items within each group chronologically
    for (const key of Object.keys(groups) as DeadlineUrgency[]) {
      groups[key].sort((a, b) => a.dInfo.daysRemaining - b.dInfo.daysRemaining)
    }

    return groups
  }, [opportunities])

  const requestBrowserNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('Browser notifications are not supported on this device/browser.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        new Notification('OpportunityRadar Alert', {
          body: 'Simulated Notification: Apex Quantum Hackathon deadline is in 28 hours!',
          icon: '/radar.svg',
        })
        setNotificationStatus('Permission granted! Test notification dispatched.')
      } else {
        setNotificationStatus('Notification permission was denied or dismissed.')
      }
    } catch {
      setNotificationStatus('Notification permission request was blocked.')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-amber-400" />
            <span>Deadline Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chronological urgency categories to guarantee you never miss a submission window.
          </p>
        </div>

        {/* Browser Notification Tester */}
        <div className="flex items-center gap-2">
          <button
            onClick={requestBrowserNotifications}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-violet-600 text-slate-300 hover:text-white transition flex items-center gap-2"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Browser Alerts</span>
          </button>
        </div>
      </div>

      {/* Notification Toast Alert */}
      {notificationStatus && (
        <div className="p-3 rounded-xl bg-violet-950/60 border border-violet-800 text-xs text-violet-300 flex items-center justify-between">
          <span>{notificationStatus}</span>
          <button
            onClick={() => setNotificationStatus(null)}
            className="text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Urgency Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {SECTIONS.map(sec => {
          const count = groupedOpportunities[sec.urgency].length
          return (
            <div
              key={sec.urgency}
              className={`p-3 rounded-xl border ${sec.colorClasses.border} ${sec.colorClasses.headerBg} flex items-center justify-between`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                  {sec.urgency.replace('_', ' ')}
                </span>
                <span className="text-xl font-extrabold text-white">{count}</span>
              </div>
              <sec.icon className={`w-5 h-5 ${sec.colorClasses.badgeText}`} />
            </div>
          )
        })}
      </div>

      {/* Deadline Sections */}
      <div className="space-y-8">
        {SECTIONS.map(section => {
          const items = groupedOpportunities[section.urgency]
          if (items.length === 0) return null

          const Icon = section.icon

          return (
            <div
              key={section.urgency}
              className={`rounded-2xl border ${section.colorClasses.border} bg-slate-900 overflow-hidden shadow-lg`}
            >
              {/* Section Header */}
              <div
                className={`p-4 border-b ${section.colorClasses.border} ${section.colorClasses.headerBg} flex items-center justify-between`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${section.colorClasses.badgeBg}`}>
                    <Icon className={`w-4 h-4 ${section.colorClasses.badgeText}`} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{section.title}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${section.colorClasses.badgeBg} ${section.colorClasses.badgeText} ${section.colorClasses.border}`}
                      >
                        {items.length}
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">{section.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-800/80">
                {items.map(({ opp, dInfo }) => {
                  const app = applications.find(a => a.opportunityId === opp.id)
                  const bStyle = getDeadlineBadgeStyle(dInfo.urgency)

                  return (
                    <div
                      key={opp.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold text-violet-300 bg-violet-950 px-2 py-0.5 rounded border border-violet-800/40">
                            {opp.category}
                          </span>
                          <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                            {opp.format}
                          </span>
                          {app && (
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                              Tracking: {app.status}
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/opportunity/${opp.id}`}
                          className="text-sm font-bold text-white hover:text-violet-400 block line-clamp-1"
                        >
                          {opp.title}
                        </Link>
                        <span className="text-xs text-slate-400 block truncate">
                          {opp.organization} • {opp.location}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span
                            className={`inline-block px-2.5 py-1 rounded text-xs font-bold border ${bStyle.bg} ${bStyle.text} ${bStyle.border}`}
                          >
                            {getRelativeDeadlineLabel(dInfo)}
                          </span>
                          <span className="block text-[11px] text-slate-400 mt-1">
                            {dInfo.formattedDeadline}
                            {opp.deadlineTimezone ? ` (${opp.deadlineTimezone})` : ''}
                          </span>
                        </div>

                        <Link
                          to={`/opportunity/${opp.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
