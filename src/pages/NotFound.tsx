import React from 'react'
import { Link } from 'react-router-dom'
import { Compass, ArrowLeft, Search } from 'lucide-react'

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-violet-950/80 border border-violet-800/60 flex items-center justify-center mx-auto text-violet-400 mb-5">
          <Compass className="w-8 h-8" />
        </div>

        <span className="text-4xl font-black text-white tracking-tight">404</span>
        <h1 className="text-xl font-bold text-white mt-1">Radar Signal Lost</h1>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          The requested page or opportunity route could not be found. It may have moved or does not
          exist.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>

          <Link
            to="/explore"
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Discover Opportunities</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
