import React, { useState } from 'react'
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  Shield,
  Info,
} from 'lucide-react'
import { useRadar } from '../context/RadarContext'
import {
  getStorageStats,
  exportAppData,
  importAppData,
} from '../services/storage'
import { ConfirmationModal } from '../components/common/ConfirmationModal'

export const Settings: React.FC = () => {
  const { resetDemo, resetAll } = useRadar()
  const stats = getStorageStats()

  const [importStatus, setImportStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [showDemoResetModal, setShowDemoResetModal] = useState(false)
  const [showAllResetModal, setShowAllResetModal] = useState(false)

  // Handle JSON export
  const handleExportJSON = () => {
    const jsonStr = exportAppData()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `opportunity-radar-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle JSON import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async event => {
      const content = event.target?.result as string
      if (!content) return

      const result = importAppData(content)
      setImportStatus(result)
      if (result.success) {
        setTimeout(() => {
          window.location.reload()
        }, 1200)
      }
    }
    reader.readAsText(file)
  }

  const handleConfirmResetDemo = async () => {
    await resetDemo()
    setShowDemoResetModal(false)
    setImportStatus({
      success: true,
      message: 'Demo listings reset successfully to the 12 default sample records.',
    })
  }

  const handleConfirmResetAll = async () => {
    await resetAll()
    setShowAllResetModal(false)
    setImportStatus({
      success: true,
      message: 'All application data, profile preferences, and saved lists wiped and re-initialized.',
    })
    setTimeout(() => {
      window.location.reload()
    }, 1200)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-violet-400" />
          <span>Settings & Data Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Inspect browser storage, export application data, and manage local state.
        </p>
      </div>

      {/* Import / Reset Status Toast */}
      {importStatus && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            importStatus.success
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {importStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-slate-400 hover:text-white text-xs underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Storage Metrics Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-violet-400" />
            <span>Browser LocalStorage Status</span>
          </h2>
          <span
            className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
              stats.isAvailable
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}
          >
            {stats.isAvailable ? 'Storage Operational' : 'Storage Disabled'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase font-bold block mb-1">
              Storage Footprint
            </span>
            <span className="text-xl font-extrabold text-white">
              {(stats.usedBytes / 1024).toFixed(1)} KB
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase font-bold block mb-1">
              Opportunity Records
            </span>
            <span className="text-xl font-extrabold text-white">{stats.opportunitiesCount}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase font-bold block mb-1">
              Saved Shortlist
            </span>
            <span className="text-xl font-extrabold text-white">{stats.savedCount}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase font-bold block mb-1">
              Tracked Pipeline
            </span>
            <span className="text-xl font-extrabold text-white">{stats.applicationsCount}</span>
          </div>
        </div>

        {/* Limitations Notice */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-300">Storage Limitations Notice:</strong> This MVP stores
            all records in your local browser sandbox (₹0 recurring cost, zero external API
            dependencies). Clearing browser cache or private browsing will reset local state. To
            preserve your applications across devices or browsers, use the{' '}
            <strong className="text-slate-200">Export JSON</strong> tool below.
          </div>
        </div>
      </div>

      {/* Data Backup & Portability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export JSON */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-violet-400" />
              <span>Export Application Data</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Download your complete OpportunityRadar archive (profile preferences, saved list,
              application notes, and custom reminders) as a structured JSON file.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-slate-700"
          >
            <FileJson className="w-4 h-4 text-violet-400" />
            <span>Download JSON Archive</span>
          </button>
        </div>

        {/* Import JSON */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import & Restore Data</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Upload a previously exported OpportunityRadar JSON file. The data will be verified
              for schema integrity before updating your local storage.
            </p>
          </div>

          <label className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Select JSON File to Restore</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Reset & Maintenance */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          <span>Reset & Maintenance</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Manage sample dataset and reset options. Both actions prompt for explicit confirmation
          before applying changes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          {/* Reset sample opportunities */}
          <button
            onClick={() => setShowDemoResetModal(true)}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset Demo Opportunities Only</span>
          </button>

          {/* Reset all data */}
          <button
            onClick={() => setShowAllResetModal(true)}
            className="flex-1 py-2.5 px-4 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-xl border border-rose-800/60 transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Reset All App & User Data</span>
          </button>
        </div>
      </div>

      {/* Hackathon Architecture / Roadmap Note */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-400" />
          <span>Architecture & Future Supabase Cloud Integration</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          OpportunityRadar was architected using a decoupled <code className="text-violet-300">DataRepository</code>{' '}
          abstraction. While this MVP persists locally via localStorage to satisfy the ₹0 budget and
          zero-auth requirements, the service layer is designed to plug directly into a Supabase
          PostgreSQL backend with Auth and Edge Functions when scaling beyond the hackathon.
        </p>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDemoResetModal}
        title="Reset Demo Opportunities?"
        message="This will restore the 12 default demo opportunities with current dates. Your personal applications, tracking notes, and profile settings will be preserved."
        confirmText="Reset Opportunities"
        onConfirm={handleConfirmResetDemo}
        onCancel={() => setShowDemoResetModal(false)}
      />

      <ConfirmationModal
        isOpen={showAllResetModal}
        title="Reset ALL Application Data?"
        message="WARNING: This will erase all local tracker entries, saved opportunities, and customized profile preferences, returning the app to its fresh install state. This cannot be undone."
        confirmText="Wipe & Reset Everything"
        isDestructive={true}
        onConfirm={handleConfirmResetAll}
        onCancel={() => setShowAllResetModal(false)}
      />
    </div>
  )
}
