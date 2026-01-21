import { NextRequest, NextResponse } from 'next/server';
import { getDailyLeaderboard, getStreakLeaderboard, getWeeklyLeaderboard } from '@/lib/db/leaderboards';

type LeaderboardEntry =
  | { address: string; time: number }
  | { address: string; streak: number };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'daily';

    let leaderboard: LeaderboardEntry[] = [];

    if (mode === 'daily') {
      leaderboard = await getDailyLeaderboard();
    } else if (mode === 'streak') {
      leaderboard = await getStreakLeaderboard();
    } else if (mode === 'weekly') {
      leaderboard = await getWeeklyLeaderboard();
    }

    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
