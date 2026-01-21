'use client';

import { useGameStore } from '@/store/game-store';

export default function FlagModeToggle() {
  const { flagMode, toggleFlagMode, isPlaying } = useGameStore();

  if (!isPlaying) return null;

  return (
    <button
      onClick={toggleFlagMode}
      className={`text-sm ${
        flagMode ? 'btn-primary' : 'btn-secondary'
      }`}
    >
      {flagMode ? '🚩 FLAG MODE ON' : 'TAP MODE'}
    </button>
  );
}
