
import { createClient } from '@supabase/supabase-js';

// Helper to check various environment variable patterns
const getEnv = (key: string, viteKey: string, reactKey: string) => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) return process.env[key];
    if (process.env[reactKey]) return process.env[reactKey];
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    if (import.meta.env[key]) return import.meta.env[key];
    // @ts-ignore
    if (import.meta.env[viteKey]) return import.meta.env[viteKey];
  }
  return '';
};

// 1. Get custom credentials from local storage (set in Login.tsx Config)
const localUrl = typeof window !== 'undefined' ? window.localStorage.getItem('sb_url') : '';
const localKey = typeof window !== 'undefined' ? window.localStorage.getItem('sb_key') : '';

// 2. Get credentials from environment variables
const envUrl = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL', 'REACT_APP_SUPABASE_URL');
const envKey = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', 'REACT_APP_SUPABASE_ANON_KEY');

// 3. Absolute Defaults (Public Demo Project - Note: Social Auth won't work on this default project as it requires unique app credentials)
const DEFAULT_URL = 'https://aixpvqjhedmusqocvstt.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpeHB2cWpoZWRtdXNxb2N2c3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTM1NDQsImV4cCI6MjA4MTIyOTU0NH0.5PpJCF_78LilVrQF5vv0372o5UKYThbFK8qC1XwQLXM';

// Priority: Local (User Settings) > Env (Build Settings) > Default (Demo)
const supabaseUrl = localUrl || envUrl || DEFAULT_URL;
const supabaseKey = localKey || envKey || DEFAULT_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
export const isUsingDefaultProject = supabaseUrl === DEFAULT_URL;

export const supabase = createClient(supabaseUrl, supabaseKey);
