'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAppStore } from '@/store/app-store';
import { useGameStore } from '@/store/game-store';
import { enterWeeklyChallenge, checkChallengeEntry } from '@/lib/onchain/challenge';
import { getDailyLeaderboard, getStreakLeaderboard, getWeeklyLeaderboard } from '@/lib/db/leaderboards';
import { logEvent } from '@/lib/db/analytics';
import Button from '@/components/ui/Button';

type ChallengeMode = 'daily' | 'streak' | 'weekly';
type LeaderboardEntry = {
  address: string;
  time?: number;
  streak?: number;
};

export default function ChallengeScreen() {
  const { address } = useAccount();
  const { setScreen } = useAppStore();
  const { setMode, startGame } = useGameStore();

  const [selectedMode, setSelectedMode] = useState<ChallengeMode>('daily');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [hasEnteredWeekly, setHasEnteredWeekly] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedMode]);

  useEffect(() => {
    if (address && selectedMode === 'weekly') {
      checkWeeklyEntry();
    }
  }, [address, selectedMode]);

  const loadLeaderboard = async () => {
    try {
      let data: LeaderboardEntry[] = [];
      if (selectedMode === 'daily') {
        data = await getDailyLeaderboard();
      } else if (selectedMode === 'streak') {
        data = await getStreakLeaderboard();
      } else if (selectedMode === 'weekly') {
        data = await getWeeklyLeaderboard();
      }
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const checkWeeklyEntry = async () => {
    if (!address) return;
    const entered = await checkChallengeEntry(address);
    setHasEnteredWeekly(entered);
  };

  const handleEnterWeekly = async () => {
    if (!address) return;

    setLoading(true);
    try {
      logEvent('challenge_enter', address, { mode: 'weekly' });

      const txHash = await enterWeeklyChallenge(address);

      if (txHash) {
        setHasEnteredWeekly(true);
        alert('Entered weekly challenge! 1 USDC paid ✓');
      }
    } catch (error) {
      console.error('Challenge entry failed:', error);
      alert('Failed to enter challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = () => {
    setMode(selectedMode);
    startGame();
    setScreen('playing');
  };

  return (
    <div className="flex flex-col items-center h-full gap-4 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold text-purple-500">CHALLENGE</h2>

      {/* Mode selector */}
      <div className="flex flex-col gap-2 w-full max-w-sm">
        <button
          onClick={() => setSelectedMode('daily')}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            selectedMode === 'daily'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          <div className="font-bold">DAILY RUN</div>
          <div className="text-xs opacity-80">Same board for everyone</div>
        </button>

        <button
          onClick={() => setSelectedMode('streak')}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            selectedMode === 'streak'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          <div className="font-bold">STREAK RUSH</div>
          <div className="text-xs opacity-80">Win streak leaderboard</div>
        </button>

        <button
          onClick={() => setSelectedMode('weekly')}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            selectedMode === 'weekly'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          <div className="font-bold">WEEKLY POOL</div>
          <div className="text-xs opacity-80">1 USDC entry • Prize pool</div>
        </button>
      </div>

      {/* Weekly entry button */}
      {selectedMode === 'weekly' && !hasEnteredWeekly && (
        <button
          onClick={handleEnterWeekly}
          disabled={loading}
          className="w-full max-w-sm btn-primary disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'ENTER WEEKLY (1 USDC)'}
        </button>
      )}

      {/* Start button */}
      <Button
        onClick={handleStartChallenge}
        variant="primary"
        disabled={selectedMode === 'weekly' && !hasEnteredWeekly}
      >
        {selectedMode === 'weekly' && !hasEnteredWeekly
          ? 'ENTER CHALLENGE FIRST'
          : 'START CHALLENGE'}
      </Button>

      {/* Leaderboard */}
      <div className="w-full max-w-sm panel p-4">
        <h3 className="text-sm font-bold text-gray-400 mb-3">LEADERBOARD</h3>
        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((entry, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500">#{idx + 1}</span>
                <span className="text-blue-300">
                  {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                </span>
              </div>
              <span className="text-yellow-400 font-bold">
                {selectedMode === 'streak'
                  ? `${entry.streak ?? 0} 🔥`
                  : `${entry.time ?? 0}s`}
              </span>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="text-gray-500 text-center text-xs">
              No entries yet
            </div>
          )}
        </div>
      </div>

      <Button onClick={() => setScreen('menu')} variant="secondary">
        BACK
      </Button>
    </div>
  );
}
