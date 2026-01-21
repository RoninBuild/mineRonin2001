import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/db/analytics';
import { isSupabaseConfigured } from '@/lib/db/client';

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ ok: false, disabled: true }, { status: 200 });
    }

    const { eventType, address, metadata } = await req.json();

    if (!eventType) {
      return NextResponse.json({ error: 'Event type required' }, { status: 400 });
    }

    await logEvent(eventType, address || null, metadata || {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
  }
}
