import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Search, ArrowRight } from 'lucide-react'
import { useRadar } from '../context/RadarContext'
import { OpportunityCard } from '../components/common/OpportunityCard'
import { ConfirmationModal } from '../components/common/ConfirmationModal'

export const Saved: React.FC = () => {
  const { saved, opportunities, toggleSave } = useRadar()
  const [filterSearch, setFilterSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [opportunityToRemove, setOpportunityToRemove] = useState<string | null>(null)

  // Map saved records to opportunities
  const savedList = useMemo(() => {
    const savedIds = saved.map(s => s.opportunityId)
    return opportunities.filter(o => savedIds.includes(o.id))
  }, [saved, opportunities])

  // Filter saved list
  const filteredList = useMemo(() => {
    return savedList.filter(opp => {
      if (filterSearch) {
        const query = filterSearch.toLowerCase()
        const matchTitle = opp.title.toLowerCase().includes(query)
        const matchOrg = opp.organization.toLowerCase().includes(query)
        const matchTag = opp.tags.some(t => t.toLowerCase().includes(query))
        if (!matchTitle && !matchOrg && !matchTag) return false
      }

      if (categoryFilter !== 'All' && opp.category !== categoryFilter) {
        return false
      }

      return true
    })
  }, [savedList, filterSearch, categoryFilter])

  const handleConfirmRemove = async () => {
    if (opportunityToRemove) {
      await toggleSave(opportunityToRemove)
      setOpportunityToRemove(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <span>Saved Opportunities</span>
            <span className="text-xs font-bold text-rose-400 bg-rose-950/80 border border-rose-800/60 px-2.5 py-1 rounded-full">
              {savedList.length} Saved
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Shortlist opportunities you want to revisit, compare, or track later.
          </p>
        </div>

        {/* Filter Controls */}
        {savedList.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                placeholder="Filter saved..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:border-violet-500 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Hackathon">Hackathons</option>
              <option value="Internship">Internships</option>
              <option value="Scholarship">Scholarships</option>
              <option value="Fellowship">Fellowships</option>
              <option value="Competition">Competitions</option>
              <option value="Free Learning">Free Learning</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {savedList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 max-w-md mx-auto my-12">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/40 border border-rose-900/40 flex items-center justify-center mx-auto text-rose-400 mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">No saved opportunities yet</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            While exploring fellowships, scholarships, and hackathons, click the heart icon to save
            listings here.
          </p>
          <Link
            to="/explore"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-950/50 transition"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
          No saved opportunities match your search filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!opportunityToRemove}
        title="Remove Saved Opportunity?"
        message="Are you sure you want to remove this item from your saved list? You can always find and save it again from Explore."
        confirmText="Remove"
        isDestructive={true}
        onConfirm={handleConfirmRemove}
        onCancel={() => setOpportunityToRemove(null)}
      />
    </div>
  )
}
