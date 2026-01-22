'use client';

import { useAppStore } from '@/store/app-store';
import { shareResult } from '@/lib/share';
import { logEvent } from '@/lib/db/analytics';
import { useAccount } from 'wagmi';

type ResultModalProps = {
  won: boolean;
  difficulty: string;
  timeSeconds: number;
  moves: number;
  reward: number;
  isSaving?: boolean;
  errorMessage?: string | null;
  nextLevelLabel?: string | null;
  onPlayAgain: () => void;
  onNextLevel?: () => void;
  onGoToStats: () => void;
  onClose: () => void;
};

export default function ResultModal({
  won,
  difficulty,
  timeSeconds,
  moves,
  reward,
  isSaving = false,
  errorMessage = null,
  nextLevelLabel = null,
  onPlayAgain,
  onNextLevel,
  onGoToStats,
  onClose,
}: ResultModalProps) {
  const { address } = useAccount();
  const { coins } = useAppStore();

  const handleShare = () => {
    shareResult(won, difficulty, timeSeconds);
    if (address) {
      logEvent('share_result', address, { difficulty, time: timeSeconds });
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 p-4">
      <div className="panel p-6 w-full max-w-sm">
        <h2
          className={`text-3xl font-bold mb-4 text-center ${
            won ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {won ? 'VICTORY!' : 'GAME OVER'}
        </h2>

        <div className="space-y-3 mb-6 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Difficulty:</span>
            <span className="font-bold">{difficulty.toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Time:</span>
            <span className="font-bold">{timeSeconds}s</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Moves:</span>
            <span className="font-bold">{moves}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Result:</span>
            <span className={`font-bold ${won ? 'text-green-400' : 'text-red-400'}`}>
              {won ? 'Win' : 'Loss'}
            </span>
          </div>
          {reward > 0 && (
            <div className="flex justify-between text-yellow-400">
              <span>Reward:</span>
              <span className="font-bold">💰 {reward}</span>
            </div>
          )}
          <div className="flex justify-between text-blue-300">
            <span>Total Coins:</span>
            <span className="font-bold">💰 {coins}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={handleShare} className="btn-secondary text-sm" disabled={isSaving}>
            SHARE RESULT
          </button>

          {onNextLevel && nextLevelLabel && (
            <button onClick={onNextLevel} className="btn-primary text-sm" disabled={isSaving}>
              {nextLevelLabel}
            </button>
          )}

          <button onClick={onPlayAgain} className="btn-secondary text-sm" disabled={isSaving}>
            PLAY AGAIN
          </button>

          <button onClick={onGoToStats} className="btn-secondary text-sm" disabled={isSaving}>
            GO TO STATS
          </button>

          <button onClick={onClose} className="btn-secondary text-sm" disabled={isSaving}>
            CLOSE
          </button>

          {isSaving && <div className="text-xs text-blue-300">Saving on-chain…</div>}
          {errorMessage && <div className="text-xs text-red-400">{errorMessage}</div>}
        </div>
      </div>
    </div>
  );
}
