import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Compass,
  Search,
  Heart,
  Kanban,
  Clock,
  User,
  Shield,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { useRadar } from '../../context/RadarContext'

interface SidebarProps {
  onItemClick?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const { saved, stats } = useRadar()

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Compass, count: null },
    { name: 'Explore', path: '/explore', icon: Search, count: stats.totalOpportunities },
    { name: 'Saved', path: '/saved', icon: Heart, count: saved.length },
    { name: 'Application Tracker', path: '/tracker', icon: Kanban, count: stats.totalApplications },
    {
      name: 'Deadline Center',
      path: '/deadlines',
      icon: Clock,
      count: stats.upcomingDeadlinesCount,
      isUrgent: stats.upcomingDeadlinesCount > 0,
    },
    { name: 'Profile & Interests', path: '/profile', icon: User, count: null },
  ]

  return (
    <aside className="w-64 flex flex-col justify-between bg-slate-900/95 border-r border-slate-800 p-4 text-slate-100 h-full">
      {/* Brand Logo & Radar Signal */}
      <div>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-violet-950 border border-violet-700/60 shadow-lg shadow-violet-950/50">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
            </span>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
              Opportunity<span className="text-violet-400">Radar</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-medium tracking-wide">
              Find opportunities. Beat deadlines.
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-1" aria-label="Main Navigation">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onItemClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-violet-400'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.count !== null && item.count > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-violet-800 text-white'
                            : item.isUrgent
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Bottom Disclaimer & Version info */}
      <div className="pt-4 border-t border-slate-800 px-2">
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-300">MVP Mode:</strong> Data is saved in browser
            localStorage. No paid API required.
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span>OpportunityRadar v1.0</span>
          <NavLink
            to="/admin"
            onClick={onItemClick}
            className="flex items-center gap-1 text-slate-500 hover:text-violet-400 transition"
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </NavLink>
        </div>
      </div>
    </aside>
  )
}
