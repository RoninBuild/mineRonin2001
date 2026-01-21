import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type GameResult = {
  id: string;
  date: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'custom';
  timeSeconds: number;
  moves: number;
  won: boolean;
  reward: number;
};

type ResultsState = {
  results: GameResult[];
  bestTimes: Record<'easy' | 'medium' | 'hard', number | null>;
  recentGames: GameResult[];
  addResult: (result: GameResult) => void;
  clearResults: () => void;
};

export const useResultsStore = create<ResultsState>()(
  persist(
    (set) => ({
      results: [],
      bestTimes: { easy: null, medium: null, hard: null },
      recentGames: [],
      addResult: (result) =>
        set((state) => {
          const results = [result, ...state.results].slice(0, 50);
          const bestTimes = { ...state.bestTimes };

          if (result.won && result.difficulty !== 'custom') {
            const currentBest = bestTimes[result.difficulty];
            if (currentBest === null || result.timeSeconds < currentBest) {
              bestTimes[result.difficulty] = result.timeSeconds;
            }
          }

          return {
            results,
            bestTimes,
            recentGames: results.slice(0, 8),
          };
        }),
      clearResults: () =>
        set({
          results: [],
          bestTimes: { easy: null, medium: null, hard: null },
          recentGames: [],
        }),
    }),
    {
      name: 'mine-ronin-results',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : undefined,
      ),
    },
  ),
);
