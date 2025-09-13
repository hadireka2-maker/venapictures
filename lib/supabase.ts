import { createClient } from '@supabase/supabase-js';

// Expect VITE_ or NEXT_PUBLIC_ envs at build-time. Provide runtime fallback via window for dev.
const url = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL)
  || (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_SUPABASE_URL)
  || (typeof window !== 'undefined' && (window as any).SUPABASE_URL)
  || '';

const anonKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY)
  || (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  || (typeof window !== 'undefined' && (window as any).SUPABASE_ANON_KEY)
  || '';

// Create a singleton Supabase client
export const supabase = createClient(url, anonKey);
