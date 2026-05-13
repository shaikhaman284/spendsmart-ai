import { createClient } from '@supabase/supabase-js';

// Lazy-load Supabase clients to avoid build-time initialization errors
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(supabaseUrl, supabaseAnonKey);
}

export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'placeholder-service-key';
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Legacy exports for backward compatibility (but these may cause build issues)
export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdminClient();

