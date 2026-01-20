import { supabase } from './client';

export async function logEvent(
  eventType: string,
  address: string | null,
  metadata?: any
) {
  await supabase.from('event_logs').insert({
    event_type: eventType,
    address: address?.toLowerCase() || null,
    metadata: metadata || {},
  });
}
