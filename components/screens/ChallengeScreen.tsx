'use client';

import { useState } from 'react';
import { useChainId } from 'wagmi';
import { base } from 'viem/chains';
import { useAppStore } from '@/store/app-store';
import { useGameStore } from '@/store/game-store';
import { CHALLENGE_LEVELS } from '@/lib/challenge/levels';
import Button from '@/components/ui/Button';
import { startOnchainGame } from '@/lib/onchain/game';

export default function ChallengeScreen() {
  const { setScreen } = useAppStore();
  const { setMode, startGame, setChallengeLevelId, setCurrentGameId } = useGameStore();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const chainId = useChainId();
  const isOnBase = chainId === base.id;
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
      const { gameId } = await startOnchainGame(3);
      if (gameId === null) {
        setError('Unable to read game ID from chain.');
        setIsStarting(false);
        return;
      }

      setCurrentGameId(gameId);
      setMode('challenge');
      setChallengeLevelId(selectedLevel);
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
    <div className="flex flex-col items-center h-full gap-4 py-2 overflow-y-auto">
      <h2 className="text-2xl font-bold text-purple-500">CHALLENGE</h2>
      <div className="text-xs text-gray-400">Level {selectedLevel}/30</div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
        {CHALLENGE_LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            onClick={() => setSelectedLevel(level.id)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              selectedLevel === level.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'
            }`}
          >
            {level.id}
          </button>
        ))}
      </div>

      <div className="panel w-full max-w-sm text-xs text-gray-400">
        {CHALLENGE_LEVELS[selectedLevel - 1]?.name ?? 'Level'} • Mines:{' '}
        {CHALLENGE_LEVELS[selectedLevel - 1]?.mines ?? 0}
      </div>

      <div className="flex gap-3">
        <Button onClick={handleStart} variant="primary" disabled={!isOnBase || isStarting}>
          {isStarting ? 'STARTING…' : 'START LEVEL'}
        </Button>
        <Button onClick={() => setScreen('menu')} variant="secondary">
          BACK
        </Button>
      </div>
      {error && <div className="text-xs text-red-400">{error}</div>}
    </div>
  );
}
