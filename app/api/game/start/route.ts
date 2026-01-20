import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/db/analytics';

export async function POST(req: NextRequest) {
  try {
    const { address, mode, difficulty } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    await logEvent('start_game', address, { mode, difficulty });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Game start log error:', error);
    return NextResponse.json({ error: 'Failed to log game start' }, { status: 500 });
  }
}
