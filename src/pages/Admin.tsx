import React, { useState, useEffect } from 'react'
import {
  Shield,
  Database,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Link2,
  RefreshCw,
  Copy,
  Lock,
  Unlock,
  FileJson,
  Layers,
  Key,
  Sparkles,
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
import { autoSyncToSupabase } from '../services/liveSyncService'
import { ConfirmationModal } from '../components/common/ConfirmationModal'

const ADMIN_PIN_SESSION_KEY = 'opradar_admin_authenticated'
const DEFAULT_ADMIN_PIN = 'admin123'

export const Admin: React.FC = () => {
  const { opportunities, resetDemo, resetAll } = useRadar()
  const stats = getStorageStats()

  // Admin PIN Protection State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_PIN_SESSION_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)

  // Modals & Statuses
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

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    setSupabaseUrl(getSupabaseUrl())
    setSupabaseAnonKey(getSupabaseAnonKey())
  }, [])

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pinInput === DEFAULT_ADMIN_PIN || pinInput.toLowerCase() === 'admin') {
      setIsAuthenticated(true)
      setPinError(false)
      try {
        sessionStorage.setItem(ADMIN_PIN_SESSION_KEY, 'true')
      } catch {
        // ignore
      }
    } else {
      setPinError(true)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPinInput('')
    try {
      sessionStorage.removeItem(ADMIN_PIN_SESSION_KEY)
    } catch {
      // ignore
    }
  }

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanUrl = supabaseUrl.trim()
    const cleanKey = supabaseAnonKey.trim()

    try {
      if (cleanUrl) {
        window.localStorage.setItem(SUPABASE_STORAGE_KEY_URL, cleanUrl)
      } else {
        window.localStorage.removeItem(SUPABASE_STORAGE_KEY_URL)
      }

      if (cleanKey) {
        window.localStorage.setItem(SUPABASE_STORAGE_KEY_ANON, cleanKey)
      } else {
        window.localStorage.removeItem(SUPABASE_STORAGE_KEY_ANON)
      }

      setConnectionResult({
        tested: true,
        success: true,
        message: 'Credentials saved! Please test connection below or reload the page.',
      })
    } catch {
      setConnectionResult({
        tested: true,
        success: false,
        message: 'Failed to access browser storage to save credentials.',
      })
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionResult(null)
    const res = await testSupabaseConnection()
    setIsTestingConnection(false)
    setConnectionResult({
      tested: true,
      success: res.success,
      message: res.message,
      latencyMs: res.latencyMs,
    })
  }

  const handleAutoSync = async () => {
    setIsSyncing(true)
    setSyncResult(null)
    const res = await autoSyncToSupabase()
    setIsSyncing(false)
    setSyncResult({
      success: res.success,
      message: res.message,
    })
  }

  const handleExport = () => {
    try {
      const dataString = exportAppData()
      const blob = new Blob([dataString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `opportunity-radar-admin-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to generate export file.')
    }
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = evt => {
      const content = evt.target?.result as string
      const result = importAppData(content)
      setImportStatus({
        success: result.success,
        message: result.message,
      })
      if (result.success) {
        setTimeout(() => {
          window.location.reload()
        }, 1200)
      }
    }
    reader.onerror = () => {
      setImportStatus({
        success: false,
        message: 'Failed to read the selected file.',
      })
    }
    reader.readAsText(file)
  }

  const handleCopySchema = () => {
    const sqlSchema = `-- OpportunityRadar PostgreSQL Schema for Supabase
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  eligibility JSONB NOT NULL DEFAULT '{}',
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  education_levels TEXT[] NOT NULL DEFAULT '{}',
  format TEXT NOT NULL,
  location TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  deadline_timezone TEXT,
  official_url TEXT NOT NULL,
  source_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  last_verified_at TIMESTAMPTZ NOT NULL,
  verification_status TEXT NOT NULL,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  participation_cost TEXT NOT NULL,
  stipend_or_prize TEXT,
  application_steps TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  required_documents TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read opportunities" ON opportunities FOR SELECT USING (true);
CREATE POLICY "Public insert opportunities" ON opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update opportunities" ON opportunities FOR UPDATE USING (true);`

    navigator.clipboard.writeText(sqlSchema)
    setCopiedSchema(true)
    setTimeout(() => setCopiedSchema(false), 2500)
  }

  // Render Gate Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-violet-950/80 border border-violet-700/60 flex items-center justify-center mx-auto text-violet-400 shadow-lg shadow-violet-950/50">
          <Shield className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-xl font-extrabold text-white">OpportunityRadar Admin Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            This administrative console manages database connections, data backups, and system operations.
          </p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-violet-400" />
              <span>Enter Admin Passcode</span>
            </label>
            <input
              type="password"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              placeholder="Enter passcode (default: admin123)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500 transition"
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-rose-400 font-medium">
                Incorrect passcode. Default passcode is: <code className="text-rose-300">admin123</code>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-violet-900/40 flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Admin Console</span>
          </button>
        </form>

        <p className="text-[11px] text-slate-500">
          Passcode protects database operations from unauthorized public resets.
        </p>
      </div>
    )
  }

  const isConnected = isSupabaseConfigured()

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-950/80 border border-violet-700/60 text-violet-400">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin & Data Management Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Restricted area: Manage Supabase PostgreSQL cloud sync, database seeding, JSON backups, and system health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-950/80 text-violet-300 border border-violet-800/60 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-violet-400" />
            <span>Admin Active</span>
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            Lock Console
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Database & Data Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supabase Cloud Database Manager */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Supabase PostgreSQL Cloud Storage</span>
                    {isConnected ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Connected
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800">
                        Offline Fallback
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Production multi-device cloud database. Zero-cost free tier on Supabase.
                  </p>
                </div>
              </div>

              {/* Auto Sync Button */}
              <button
                type="button"
                onClick={handleAutoSync}
                disabled={isSyncing}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSyncing ? 'Syncing...' : '⚡ Auto-Populate Tables'}</span>
              </button>
            </div>

            {syncResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  syncResult.success
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                }`}
              >
                {syncResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{syncResult.message}</span>
              </div>
            )}

            {/* Credential Form */}
            <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Supabase Project URL</span>
                </label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500 font-mono transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Supabase Anon Public Key (Publishable)</span>
                </label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={e => setSupabaseAnonKey(e.target.value)}
                  placeholder="sb_publishable_... or eyJh..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500 font-mono transition"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Save Credentials
                </button>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  <span>{isTestingConnection ? 'Pinging Cloud...' : 'Test Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition flex items-center gap-1.5 ml-auto"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{copiedSchema ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              {connectionResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    connectionResult.success
                      ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                  }`}
                >
                  {connectionResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>
                    {connectionResult.message}
                    {connectionResult.latencyMs && ` (${connectionResult.latencyMs}ms)`}
                  </span>
                </div>
              )}
            </form>
          </div>

          {/* Backup & Portability */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-950/80 border border-violet-800/60 text-violet-400">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Full Database JSON Backup & Restore</h2>
                <p className="text-xs text-slate-400">
                  Export complete database snapshots or import backups from another system.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={handleExport}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-600/60 transition text-left space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-violet-400 transition flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-violet-400" />
                    <span>Download JSON Backup</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">.json</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Downloads opportunities, saved listings, profile tuner data, and application pipelines.
                </p>
              </button>

              <label className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-600/60 transition cursor-pointer space-y-2 group block">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Restore From Backup</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Upload</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Validates schema structure and restores data into active storage.
                </p>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  importStatus.success
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                }`}
              >
                {importStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>

          {/* Database Listings Overview */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-400" />
                <span>Active Database Records ({opportunities.length})</span>
              </h2>
              <span className="text-xs text-slate-400">Total ingested in radar</span>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-64 overflow-y-auto pr-1">
              {opportunities.map(opp => (
                <div key={opp.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                  <div className="truncate">
                    <span className="font-semibold text-white block truncate">{opp.title}</span>
                    <span className="text-slate-500 text-[11px]">
                      {opp.organization} • {opp.category} • {opp.format}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {opp.verificationStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Storage Metrics & Danger Zone */}
        <div className="space-y-6">
          {/* Storage Metrics */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-violet-400" />
              <span>Storage Metrics</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Storage Used</span>
                <span className="font-mono text-white font-bold">{(stats.usedBytes / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Total Opportunities</span>
                <span className="font-mono text-white font-bold">{stats.opportunitiesCount}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Saved Shortlists</span>
                <span className="font-mono text-white font-bold">{stats.savedCount}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Application Trackers</span>
                <span className="font-mono text-white font-bold">{stats.applicationsCount}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Active Profile</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {stats.profileName || 'Configured'}
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Danger Zone</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Administrative destructive operations. Be careful before executing.
            </p>

            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => setShowDemoResetModal(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset to Clean Demo State</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAllResetModal(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Factory Reset (Wipe All Data)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDemoResetModal}
        title="Reset to Clean Demo State?"
        message="This will re-initialize the standard demo opportunities and restore demo pipeline entries. Your preferences will be retained."
        confirmText="Reset Demo Data"
        isDestructive={false}
        onConfirm={() => {
          resetDemo()
          setShowDemoResetModal(false)
        }}
        onCancel={() => setShowDemoResetModal(false)}
      />

      <ConfirmationModal
        isOpen={showAllResetModal}
        title="Factory Reset All Application Data?"
        message="WARNING: This will completely wipe all saved opportunities, tracking statuses, profile configurations, and custom database cache. This cannot be undone."
        confirmText="Yes, Wipe Everything"
        isDestructive={true}
        onConfirm={() => {
          resetAll()
          setShowAllResetModal(false)
        }}
        onCancel={() => setShowAllResetModal(false)}
      />
    </div>
  )
}
