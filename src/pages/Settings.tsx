import React, { useState, useEffect } from 'react'
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
  Info,
  Database,
  Link2,
  RefreshCw,
  Copy,
} from 'lucide-react'
import { useRadar } from '../context/RadarContext'
import {
  getStorageStats,
  exportAppData,
  importAppData,
} from '../services/storage'
import {
  getSupabaseUrl,
  getSupabaseAnonKey,
  isSupabaseConfigured,
  testSupabaseConnection,
  SUPABASE_STORAGE_KEY_URL,
  SUPABASE_STORAGE_KEY_ANON,
} from '../services/supabaseClient'
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

  // Supabase connection state
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<{
    tested: boolean
    success: boolean
    message: string
    latencyMs?: number
  } | null>(null)
  const [copiedSchema, setCopiedSchema] = useState(false)

  useEffect(() => {
    setSupabaseUrl(getSupabaseUrl())
    setSupabaseAnonKey(getSupabaseAnonKey())
  }, [])

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

  // Save Supabase credentials
  const handleSaveSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setConnectionResult({
        tested: true,
        success: false,
        message: 'Please provide both a Supabase Project URL and an Anon Public Key.',
      })
      return
    }

    window.localStorage.setItem(SUPABASE_STORAGE_KEY_URL, supabaseUrl.trim())
    window.localStorage.setItem(SUPABASE_STORAGE_KEY_ANON, supabaseAnonKey.trim())

    setIsTestingConnection(true)
    const res = await testSupabaseConnection()
    setIsTestingConnection(false)

    setConnectionResult({
      tested: true,
      success: res.success,
      message: res.message,
      latencyMs: res.latencyMs,
    })

    if (res.success) {
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }

  // Disconnect Supabase and revert to local storage
  const handleDisconnectSupabase = () => {
    window.localStorage.removeItem(SUPABASE_STORAGE_KEY_URL)
    window.localStorage.removeItem(SUPABASE_STORAGE_KEY_ANON)
    setSupabaseUrl('')
    setSupabaseAnonKey('')
    setConnectionResult({
      tested: true,
      success: true,
      message: 'Disconnected from Supabase. Reverted to offline browser LocalStorage.',
    })
    setTimeout(() => {
      window.location.reload()
    }, 1200)
  }

  const handleTestSupabaseOnly = async () => {
    setIsTestingConnection(true)
    const res = await testSupabaseConnection()
    setIsTestingConnection(false)
    setConnectionResult({
      tested: true,
      success: res.success,
      message: res.message,
      latencyMs: res.latencyMs,
    })
  }

  const handleCopySchemaPath = () => {
    navigator.clipboard.writeText('supabase/schema.sql')
    setCopiedSchema(true)
    setTimeout(() => setCopiedSchema(false), 2000)
  }

  const isConfigured = isSupabaseConfigured()

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-violet-400" />
          <span>Settings & Data Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Inspect storage, configure Supabase database integration, and manage local state.
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

      {/* SUPABASE CLOUD INTEGRATION CARD */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Supabase PostgreSQL Integration</span>
              </h2>
              <p className="text-xs text-slate-400">
                Connect your free Supabase project to sync opportunities and applications in the cloud.
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5 ${
              isConfigured
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}
            />
            {isConfigured ? 'Connected to Supabase' : 'Offline Local Storage'}
          </span>
        </div>

        {/* Credentials Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="supabase-url"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1"
              >
                Project URL
              </label>
              <input
                id="supabase-url"
                type="text"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="supabase-key"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1"
              >
                Anon / Public API Key
              </label>
              <input
                id="supabase-key"
                type="password"
                value={supabaseAnonKey}
                onChange={e => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Connection Test Feedback */}
          {connectionResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                connectionResult.success
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}
            >
              {connectionResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">
                <span>{connectionResult.message}</span>
                {connectionResult.latencyMs !== undefined && (
                  <span className="block text-[11px] text-slate-400 mt-0.5">
                    Round-trip latency: {connectionResult.latencyMs}ms
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveSupabase}
                disabled={isTestingConnection}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Link2 className="w-4 h-4" />
                <span>{isTestingConnection ? 'Connecting...' : 'Save & Connect Supabase'}</span>
              </button>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleTestSupabaseOnly}
                  disabled={isTestingConnection}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-violet-400 ${isTestingConnection ? 'animate-spin' : ''}`}
                  />
                  <span>Test Ping</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySchemaPath}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-xl border border-slate-800 transition flex items-center gap-1.5"
                title="SQL schema is located in supabase/schema.sql"
              >
                <Copy className="w-3.5 h-3.5 text-violet-400" />
                <span>{copiedSchema ? 'Path Copied!' : 'SQL Schema (schema.sql)'}</span>
              </button>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleDisconnectSupabase}
                  className="px-3 py-2 text-rose-400 hover:text-rose-300 text-xs font-semibold rounded-xl hover:bg-rose-950/40 transition"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
            <strong className="text-slate-300">Storage Limitations Notice:</strong> In offline mode,
            all records are stored in your local browser sandbox (₹0 recurring cost, zero external
            dependencies). Clearing browser cache or private browsing will reset local state. To
            preserve your applications across devices or browsers, use the{' '}
            <strong className="text-slate-200">Export JSON</strong> tool below or connect Supabase
            above.
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
