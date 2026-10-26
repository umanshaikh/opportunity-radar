import { createClient, SupabaseClient } from '@supabase/supabase-js'

const ENV_URL = import.meta.env.VITE_SUPABASE_URL || ''
const ENV_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const SUPABASE_STORAGE_KEY_URL = 'opradar_supabase_url'
export const SUPABASE_STORAGE_KEY_ANON = 'opradar_supabase_anon_key'

/**
 * Gets configured Supabase URL (from env or local settings)
 */
export function getSupabaseUrl(): string {
  if (ENV_URL && ENV_URL !== 'https://your-project.supabase.co') {
    return ENV_URL
  }
  try {
    return window.localStorage.getItem(SUPABASE_STORAGE_KEY_URL) || ''
  } catch {
    return ''
  }
}

/**
 * Gets configured Supabase Anon Key (from env or local settings)
 */
export function getSupabaseAnonKey(): string {
  if (ENV_ANON_KEY && ENV_ANON_KEY !== 'your-anon-public-key-here') {
    return ENV_ANON_KEY
  }
  try {
    return window.localStorage.getItem(SUPABASE_STORAGE_KEY_ANON) || ''
  } catch {
    return ''
  }
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  return Boolean(url && key && url.startsWith('http') && key.length > 20)
}

let cachedClient: SupabaseClient | null = null
let cachedUrl = ''
let cachedKey = ''

/**
 * Returns singleton Supabase client or null if not configured
 */
export function getSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()

  if (!url || !key || !url.startsWith('http') || key.length < 20) {
    return null
  }

  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
    cachedUrl = url
    cachedKey = key
    return cachedClient
  } catch (err) {
    console.error('Failed to create Supabase client:', err)
    return null
  }
}

/**
 * Tests connection to configured Supabase project
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean
  message: string
  latencyMs?: number
}> {
  const client = getSupabaseClient()
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL or Anon Public Key is missing or invalid.',
    }
  }

  const startTime = Date.now()
  try {
    // Attempt a light query to opportunities or metadata
    const { error } = await client.from('opportunities').select('id').limit(1)
    const latencyMs = Date.now() - startTime

    if (error) {
      // If table doesn't exist yet, but authentication reached Supabase:
      if (error.code === '42P01') {
        return {
          success: true,
          latencyMs,
          message:
            'Connected to Supabase project! Note: The "opportunities" table is not created yet. Run the provided schema.sql script in the Supabase SQL Editor.',
        }
      }
      return {
        success: false,
        latencyMs,
        message: `Supabase responded with error: ${error.message} (code ${error.code})`,
      }
    }

    return {
      success: true,
      latencyMs,
      message: `Successfully connected to Supabase in ${latencyMs}ms!`,
    }
  } catch (err) {
    return {
      success: false,
      message: `Network error connecting to Supabase: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}
