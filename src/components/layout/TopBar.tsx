import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Clock,
  X,
  ExternalLink,
} from 'lucide-react'
import { useRadar } from '../../context/RadarContext'
import { getDeadlineInfo, getRelativeDeadlineLabel } from '../../utils/dateUtils'

interface TopBarProps {
  onToggleMobileMenu: () => void
  onOpenOnboarding: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu, onOpenOnboarding }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { searchQuery, setSearchQuery, opportunities, profile, stats } = useRadar()

  const [showNotifications, setShowNotifications] = useState(false)

  // Find urgent opportunities for notifications dropdown
  const urgentItems = opportunities
    .map(opp => ({ opp, dInfo: getDeadlineInfo(opp.deadline) }))
    .filter(item => item.dInfo.isOverdue || item.dInfo.daysRemaining <= 3)
    .slice(0, 5)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (location.pathname !== '/explore') {
      navigate('/explore')
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Mobile Menu & Brand for mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          aria-label="Toggle mobile menu"
          className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (location.pathname !== '/explore' && location.pathname !== '/') {
                // Keep query synced
              }
            }}
            placeholder="Search internships, hackathons..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Onboarding Assistant Trigger */}
        {!profile.onboardingCompleted ? (
          <button
            onClick={onOpenOnboarding}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-xs shadow-violet-900/40 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Setup Profile</span>
          </button>
        ) : (
          <button
            onClick={onOpenOnboarding}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Edit Profile</span>
          </button>
        )}

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Deadline Alerts"
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <Bell className="w-4 h-4" />
            {stats.upcomingDeadlinesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 text-slate-100 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Urgent Deadlines
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
                {urgentItems.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">
                    No urgent deadlines within 3 days. You're on track!
                  </p>
                ) : (
                  urgentItems.map(({ opp, dInfo }) => (
                    <div key={opp.id} className="py-2.5">
                      <Link
                        to={`/opportunity/${opp.id}`}
                        onClick={() => setShowNotifications(false)}
                        className="text-xs font-semibold text-slate-200 hover:text-violet-400 line-clamp-1"
                      >
                        {opp.title}
                      </Link>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">{opp.category}</span>
                        <span
                          className={`font-semibold ${
                            dInfo.isOverdue ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        >
                          {getRelativeDeadlineLabel(dInfo)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end">
                <Link
                  to="/deadlines"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  <span>Open Deadline Center</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <Link
          to="/profile"
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
            {profile.educationLevel.charAt(0)}
          </div>
          <span className="hidden md:inline text-xs font-semibold text-slate-300 truncate max-w-[100px]">
            {profile.educationLevel}
          </span>
        </Link>
      </div>
    </header>
  )
}
