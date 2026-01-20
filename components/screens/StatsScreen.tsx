'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useAppStore } from '@/store/app-store';
import { supabase } from '@/lib/db/client';
import Button from '@/components/ui/Button';
import Panel from '@/components/ui/Panel';

type Stats = {
  gamesPlayed: number;
  gamesWon: number;
  bestTimes: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
  currentStreak: number;
  bestStreak: number;
};

export default function StatsScreen() {
  const { address } = useAccount();
  const { setScreen } = useAppStore();
  const [stats, setStats] = useState<Stats>({
    gamesPlayed: 0,
    gamesWon: 0,
    bestTimes: { easy: null, medium: null, hard: null },
    currentStreak: 0,
    bestStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadStats();
    }
  }, [address]);

  const loadStats = async () => {
    if (!address) return;

    try {
      // Get game counts
      const { data: games } = await supabase
        .from('game_results')
        .select('won, difficulty, time_seconds')
        .eq('address', address.toLowerCase())
        .eq('mode', 'casual');

      const gamesPlayed = games?.length || 0;
      const gamesWon = games?.filter((g) => g.won).length || 0;

      // Get best times per difficulty
      const bestTimes: Stats['bestTimes'] = { easy: null, medium: null, hard: null };

      for (const diff of ['easy', 'medium', 'hard'] as const) {
        const wonGames = games?.filter((g) => g.won && g.difficulty === diff) || [];
        if (wonGames.length > 0) {
          bestTimes[diff] = Math.min(...wonGames.map((g) => g.time_seconds));
        }
      }

      // Get streak info
      const { data: streak } = await supabase
        .from('player_streaks')
        .select('*')
        .eq('address', address.toLowerCase())
        .single();

      setStats({
        gamesPlayed,
        gamesWon,
        bestTimes,
        currentStreak: streak?.current_streak || 0,
        bestStreak: streak?.best_streak || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading stats...</div>
      </div>
    );
  }

  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="flex flex-col items-center h-full gap-4 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold text-blue-500">STATISTICS</h2>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Panel>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Games Played</span>
            <span className="text-white font-bold text-lg">{stats.gamesPlayed}</span>
          </div>
        </Panel>

        <Panel>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Games Won</span>
            <span className="text-green-400 font-bold text-lg">{stats.gamesWon}</span>
          </div>
        </Panel>

        <Panel>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Win Rate</span>
            <span className="text-blue-400 font-bold text-lg">{winRate}%</span>
          </div>
        </Panel>

        <Panel>
          <div className="text-purple-400 font-medium mb-3">Best Times</div>
          <div className="space-y-2 text-sm">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <div key={diff} className="flex justify-between">
                <span className="text-gray-500 capitalize">{diff}:</span>
                <span className="text-white font-medium">
                  {stats.bestTimes[diff] ? `${stats.bestTimes[diff]}s` : '-'}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Current Streak</span>
            <span className="text-orange-400 font-bold text-lg">
              {stats.currentStreak} 🔥
            </span>
          </div>
        </Panel>

        <Panel>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Best Streak</span>
            <span className="text-yellow-400 font-bold text-lg">
              {stats.bestStreak} 🏆
            </span>
          </div>
        </Panel>
      </div>

      <Button onClick={() => setScreen('menu')} variant="secondary">
        BACK
      </Button>
    </div>
  );
}
