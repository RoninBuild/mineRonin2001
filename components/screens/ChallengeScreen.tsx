'use client';

import { useState } from 'react';
import { useChainId } from 'wagmi';
import { base } from 'viem/chains';
import { useAppStore } from '@/store/app-store';
import { useGameStore } from '@/store/game-store';
import { CHALLENGE_LEVELS } from '@/lib/challenge/levels';
import Button from '@/components/ui/Button';

export default function ChallengeScreen() {
  const { setScreen } = useAppStore();
  const { setMode, startGame, setChallengeLevelId } = useGameStore();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const chainId = useChainId();
  const isOnBase = chainId === base.id;

  const handleStart = () => {
    setMode('challenge');
    setChallengeLevelId(selectedLevel);
    startGame();
    setScreen('playing');
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
        <Button onClick={handleStart} variant="primary" disabled={!isOnBase}>
          START LEVEL
        </Button>
        <Button onClick={() => setScreen('menu')} variant="secondary">
          BACK
        </Button>
      </div>
    </div>
  );
}
