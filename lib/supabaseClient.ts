
import { createClient } from '@supabase/supabase-js';

/**
 * Robust environment variable retriever that checks multiple common prefixes
 * and runtime contexts (Node-like vs Browser-like).
 */
const getEnv = (key: string, viteKey: string, reactKey: string): string => {
  if (typeof window !== 'undefined' && (window as any).process?.env) {
    const env = (window as any).process.env;
    if (env[key]) return env[key];
    if (env[viteKey]) return env[viteKey];
    if (env[reactKey]) return env[reactKey];
  }
  
  // Try direct process.env (Vite/Bundler injection)
  try {
    if (process.env[key]) return process.env[key];
  } catch (e) {}

  return '';
};

// Local storage overrides for developer configuration
const localUrl = typeof window !== 'undefined' ? window.localStorage.getItem('sb_url') : '';
const localKey = typeof window !== 'undefined' ? window.localStorage.getItem('sb_key') : '';

const envUrl = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL', 'REACT_APP_SUPABASE_URL');
const envKey = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', 'REACT_APP_SUPABASE_ANON_KEY');

/**
 * Security: We only use the hardcoded "Demo" credentials as an absolute last resort 
 * if no environment variables are present and no local overrides exist.
 */
const DEFAULT_URL = 'https://aixpvqjhedmusqocvstt.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpeHB2cWpoZWRtdXNxb2N2c3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTM1NDQsImV4cCI6MjA4MTIyOTU0NH0.5PpJCF_78LilVrQF5vv0372o5UKYThbFK8qC1XwQLXM';

const isValidUrl = (url: string | null): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const supabaseUrl = isValidUrl(localUrl) ? localUrl! : (isValidUrl(envUrl) ? envUrl : DEFAULT_URL);
const supabaseKey = localKey || envKey || DEFAULT_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
export const isUsingDefaultProject = supabaseUrl === DEFAULT_URL;

/**
 * Initialize Client with security-conscious defaults:
 * 1. Persist session for user convenience.
 * 2. Auto-refresh to minimize logout friction.
 * 3. Custom header for platform identification.
 */
let client;
try {
  client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'levrix-auth-token'
    },
    global: {
      headers: { 'x-application-name': 'levrix-platform' }
    }
  });
} catch (e) {
  console.error("Critical: Supabase client initialization failed.", e);
  // Fallback to avoid breaking the UI entirely, though app will be in limited mode
  client = createClient(DEFAULT_URL, DEFAULT_KEY);
}

export const supabase = client;
