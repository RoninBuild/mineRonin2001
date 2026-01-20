import { create } from 'zustand';
import { Cell, GridConfig } from '@/lib/minesweeper/grid';

type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';
type GameMode = 'casual' | 'daily' | 'streak' | 'weekly';

export const DIFFICULTY_CONFIGS: Record<Difficulty, GridConfig> = {
  easy: { rows: 8, cols: 10, mines: 10 },
  medium: { rows: 14, cols: 18, mines: 40 },
  hard: { rows: 20, cols: 24, mines: 99 },
  custom: { rows: 10, cols: 10, mines: 15 },
};

type GameStore = {
  // Game state
  difficulty: Difficulty;
  mode: GameMode;
  customConfig: GridConfig;
  grid: Cell[][];
  gameStartTime: number;
  firstClickTime: number;
  gameEndTime: number;
  gameWon: boolean;
  isPlaying: boolean;
  flagMode: boolean;
  hasFirstClick: boolean;
  
  // Actions
  setDifficulty: (diff: Difficulty) => void;
  setMode: (mode: GameMode) => void;
  setCustomConfig: (config: Partial<GridConfig>) => void;
  setGrid: (grid: Cell[][]) => void;
  startGame: () => void;
  recordFirstClick: () => void;
  endGame: (won: boolean) => void;
  toggleFlagMode: () => void;
  resetGame: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  difficulty: 'easy',
  mode: 'casual',
  customConfig: DIFFICULTY_CONFIGS.custom,
  grid: [],
  gameStartTime: 0,
  firstClickTime: 0,
  gameEndTime: 0,
  gameWon: false,
  isPlaying: false,
  flagMode: false,
  hasFirstClick: false,
  
  setDifficulty: (diff) => set({ difficulty: diff }),
  setMode: (mode) => set({ mode }),
  setCustomConfig: (config) =>
    set((state) => ({
      customConfig: { ...state.customConfig, ...config },
    })),
  setGrid: (grid) => set({ grid }),
  startGame: () =>
    set({
      gameStartTime: Date.now(),
      firstClickTime: 0,
      gameEndTime: 0,
      gameWon: false,
      isPlaying: true,
      hasFirstClick: false,
      flagMode: false,
    }),
  recordFirstClick: () =>
    set((state) => ({
      firstClickTime: state.firstClickTime === 0 ? Date.now() : state.firstClickTime,
      hasFirstClick: true,
    })),
  endGame: (won) =>
    set({
      gameEndTime: Date.now(),
      gameWon: won,
      isPlaying: false,
    }),
  toggleFlagMode: () => set((state) => ({ flagMode: !state.flagMode })),
  resetGame: () =>
    set({
      grid: [],
      gameStartTime: 0,
      firstClickTime: 0,
      gameEndTime: 0,
      gameWon: false,
      isPlaying: false,
      flagMode: false,
      hasFirstClick: false,
    }),
}));
