'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { useGameStore, DIFFICULTY_CONFIGS } from '@/store/game-store';
import Button from '@/components/ui/Button';
import { startOnchainGame } from '@/lib/onchain/game';
import { base } from 'viem/chains';
import { useChainId } from 'wagmi';

export default function DifficultyScreen() {
  const { setScreen } = useAppStore();
  const { difficulty, setDifficulty, startGame, setCurrentGameId } = useGameStore();
  const chainId = useChainId();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);

    if (chainId !== base.id) {
      setError('Switch to Base mainnet to start.');
      return;
    }

    setIsStarting(true);

    try {
      const difficultyMap: Record<typeof difficulty, number> = {
        easy: 0,
        medium: 1,
        hard: 2,
        custom: 3,
      };

      const { gameId } = await startOnchainGame(difficultyMap[difficulty]);
      if (gameId === null) {
        setError('Unable to read game ID from chain.');
        setIsStarting(false);
        return;
      }

      setCurrentGameId(gameId);
      startGame();
      setScreen('playing');
    } catch (err) {
      console.error('startGame failed', err);
      setError('Start failed. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
      <h2 className="text-2xl font-bold text-blue-500">SELECT DIFFICULTY</h2>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {(['easy', 'medium', 'hard'] as const).map((diff) => {
          const config = DIFFICULTY_CONFIGS[diff];
          return (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-6 py-4 rounded-lg font-medium transition-all border-2 ${
                difficulty === diff
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300'
              }`}
            >
              <div className="font-bold uppercase">{diff}</div>
              <div className="text-xs opacity-80">
                {config.rows}×{config.cols} • {config.mines} mines
              </div>
            </button>
          );
        })}

        <button
          onClick={() => setScreen('custom')}
          className="px-6 py-4 rounded-lg font-medium bg-purple-900 border-2 border-purple-700 text-white hover:bg-purple-800"
        >
          <div className="font-bold">CUSTOM</div>
          <div className="text-xs opacity-80">Create your own</div>
        </button>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="flex gap-3">
        <Button onClick={handleStart} variant="primary" disabled={isStarting}>
          {isStarting ? 'STARTING…' : 'START GAME'}
        </Button>
        <Button onClick={() => setScreen('menu')} variant="secondary">
          BACK
        </Button>
      </div>
    </div>
  );
}
