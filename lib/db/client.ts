import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = (url?: string) =>
  typeof url === 'string' && /^https?:\/\//.test(url);

export const isSupabaseConfigured =
  isValidUrl(supabaseUrl) && Boolean(supabaseAnonKey);

const createStubClient = () =>
  ({
    from() {
      throw new Error('Supabase client is not configured.');
    },
  }) as ReturnType<typeof createClient>;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : createStubClient();

// Server-side client with service role
export function getServiceClient() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client is not configured.');
  }

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) {
    throw new Error('Supabase service role key is not configured.');
  }

  return createClient(supabaseUrl as string, supabaseServiceKey);
}
