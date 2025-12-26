
import { createClient } from '@supabase/supabase-js';

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

const localUrl = typeof window !== 'undefined' ? window.localStorage.getItem('sb_url') : '';
const localKey = typeof window !== 'undefined' ? window.localStorage.getItem('sb_key') : '';

const envUrl = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL', 'REACT_APP_SUPABASE_URL');
const envKey = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', 'REACT_APP_SUPABASE_ANON_KEY');

const DEFAULT_URL = 'https://aixpvqjhedmusqocvstt.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpeHB2cWpoZWRtdXNxb2N2c3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTM1NDQsImV4cCI6MjA4MTIyOTU0NH0.5PpJCF_78LilVrQF5vv0372o5UKYThbFK8qC1XwQLXM';

const isValidUrl = (url: string) => {
  try {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  } catch {
    return false;
  }
};

const supabaseUrl = isValidUrl(localUrl || '') ? localUrl! : (isValidUrl(envUrl) ? envUrl : DEFAULT_URL);
const supabaseKey = localKey || envKey || DEFAULT_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
export const isUsingDefaultProject = supabaseUrl === DEFAULT_URL;

let client;
try {
  client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: { 'x-application-name': 'levrix' }
    }
  });
} catch (e) {
  console.error("Critical: Supabase client initialization failed. Falling back to demo project.", e);
  client = createClient(DEFAULT_URL, DEFAULT_KEY);
}

export const supabase = client;
