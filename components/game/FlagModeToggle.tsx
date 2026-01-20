'use client';

import { useGameStore } from '@/store/game-store';

export default function FlagModeToggle() {
  const { flagMode, toggleFlagMode, isPlaying } = useGameStore();

  if (!isPlaying) return null;

  return (
    <button
      onClick={toggleFlagMode}
      className={`px-6 py-3 rounded-lg font-medium transition-all ${
        flagMode
          ? 'bg-blue-600 text-white border-2 border-blue-400'
          : 'bg-gray-800 text-gray-300 border border-gray-700'
      }`}
    >
      {flagMode ? '🚩 FLAG MODE ON' : 'TAP MODE'}
    </button>
  );
}
