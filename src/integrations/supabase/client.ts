// Lovable Cloud / Supabase client for Market Rise Digital.
// This file intentionally pins the project endpoint/key so a stale Vercel
// environment variable cannot redirect production Auth calls to another host.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { brokeredPreviewStorage } from './previewAuthStorage';

const SUPABASE_URL = 'https://rzhthtltteaihxiunxlo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_c74_2ZhFJ689Mi1bKDn6jQ_lAEv7N3Y';

function createSupabaseClient() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: brokeredPreviewStorage(),
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy(
  {} as ReturnType<typeof createSupabaseClient>,
  {
    get(_, prop, receiver) {
      if (!_supabase) _supabase = createSupabaseClient();
      return Reflect.get(_supabase, prop, receiver);
    },
  },
);
