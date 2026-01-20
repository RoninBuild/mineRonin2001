import { NextRequest, NextResponse } from 'next/server';

// Basic anti-cheat verification (MVP level)
export async function POST(req: NextRequest) {
  try {
    const { address, timeSeconds, difficulty, moves } = await req.json();

    // Simple time-based check
    const minTimes = {
      easy: 5,
      medium: 15,
      hard: 30,
    };

    const minTime = minTimes[difficulty as keyof typeof minTimes] || 5;

    if (timeSeconds < minTime) {
      return NextResponse.json({
        valid: false,
        reason: 'Time too fast',
      });
    }

    // Could add more checks here (moves count, patterns, etc.)
    void address;
    void moves;

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
