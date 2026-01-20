import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/db/client';

export async function POST(req: NextRequest) {
  try {
    const { address, txHash } = await req.json();

    if (!address || !txHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Get current week (Monday-based)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const weekStart = monday.toISOString().split('T')[0];

    // Record entry
    const { data, error } = await supabase
      .from('weekly_challenge_entries')
      .insert({
        address: address.toLowerCase(),
        week_start: weekStart,
        entry_tx_hash: txHash,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        return NextResponse.json({ error: 'Already entered this week' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Challenge entry error:', error);
    return NextResponse.json({ error: 'Failed to record entry' }, { status: 500 });
  }
}
