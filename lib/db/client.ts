import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = (url?: string) =>
  typeof url === 'string' && /^https?:\/\//.test(url);

export const isSupabaseConfigured =
  isValidUrl(supabaseUrl) && Boolean(supabaseAnonKey);

type StubResult = Promise<{ data: null; error: null }>;

// TEMP: stub uses any to satisfy varying Supabase query builder shapes.
const createStubQueryBuilder = (): any => {
  const result: StubResult = Promise.resolve({ data: null, error: null });
  const builder: any = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => result,
    maybeSingle: () => result,
    insert: () => result,
    upsert: () => result,
    then: (onFulfilled: any, onRejected: any) => result.then(onFulfilled, onRejected),
  };

  return builder;
};

const createStubClient = () =>
  ({
    from() {
      return createStubQueryBuilder();
    },
  }) as any;

export const supabase: any = isSupabaseConfigured
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
