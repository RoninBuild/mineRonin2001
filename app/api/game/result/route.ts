import { NextRequest, NextResponse } from 'next/server';
import { saveGameResult } from '@/lib/db/games';
import { addCoins } from '@/lib/db/profiles';
import { calculateCoinReward } from '@/lib/coins';

export async function POST(req: NextRequest) {
  try {
    const { address, mode, difficulty, timeSeconds, won } = await req.json();

    if (!address || !mode || !difficulty || timeSeconds === undefined || won === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate coins if won and not custom
    let coinsEarned = 0;
    if (won && difficulty !== 'custom') {
      coinsEarned = calculateCoinReward(difficulty, timeSeconds);
      await addCoins(address, coinsEarned);
    }

    // Save game result
    const result = await saveGameResult({
      address,
      mode,
      difficulty,
      timeSeconds,
      won,
      coinsEarned,
    });

    return NextResponse.json({
      success: true,
      result,
      coinsEarned,
    });
  } catch (error) {
    console.error('Save result error:', error);
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 });
  }
}
