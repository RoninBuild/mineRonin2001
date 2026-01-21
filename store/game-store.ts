import { create } from 'zustand';
import { Cell, GridConfig } from '@/lib/minesweeper/grid';

type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';
type GameMode = 'casual' | 'daily' | 'streak' | 'weekly' | 'challenge' | 'race';

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
  hasFirstClick: boolean;
  moves: number;
  currentGameId: number | null;
  challengeLevelId: number | null;
  raceActive: boolean;
  raceLevelIndex: number;
  raceStartTime: number;
  raceMoves: number;
  
  // Actions
  setDifficulty: (diff: Difficulty) => void;
  setMode: (mode: GameMode) => void;
  setCustomConfig: (config: Partial<GridConfig>) => void;
  setGrid: (grid: Cell[][]) => void;
  startGame: () => void;
  recordFirstClick: () => void;
  incrementMoves: () => void;
  setCurrentGameId: (gameId: number | null) => void;
  setChallengeLevelId: (levelId: number | null) => void;
  startRace: () => void;
  advanceRaceLevel: () => void;
  addRaceMoves: (moves: number) => void;
  finishRace: () => void;
  endGame: (won: boolean) => void;
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
  hasFirstClick: false,
  moves: 0,
  currentGameId: null,
  challengeLevelId: null,
  raceActive: false,
  raceLevelIndex: 0,
  raceStartTime: 0,
  raceMoves: 0,
  
  setDifficulty: (diff) => set({ difficulty: diff }),
  setMode: (mode) => set({ mode }),
  setCustomConfig: (config) =>
    set((state) => ({
      customConfig: { ...state.customConfig, ...config },
    })),
  setGrid: (grid) => set({ grid }),
  startGame: () =>
    set({
      grid: [],
      gameStartTime: Date.now(),
      firstClickTime: 0,
      gameEndTime: 0,
      gameWon: false,
      isPlaying: true,
      hasFirstClick: false,
      moves: 0,
    }),
  recordFirstClick: () =>
    set((state) => ({
      firstClickTime: state.firstClickTime === 0 ? Date.now() : state.firstClickTime,
      hasFirstClick: true,
    })),
  incrementMoves: () => set((state) => ({ moves: state.moves + 1 })),
  setCurrentGameId: (gameId) => set({ currentGameId: gameId }),
  setChallengeLevelId: (levelId) => set({ challengeLevelId: levelId }),
  startRace: () =>
    set({
      raceActive: true,
      raceLevelIndex: 0,
      raceStartTime: Date.now(),
      raceMoves: 0,
    }),
  advanceRaceLevel: () =>
    set((state) => ({
      raceLevelIndex: state.raceLevelIndex + 1,
    })),
  addRaceMoves: (moves) =>
    set((state) => ({
      raceMoves: state.raceMoves + moves,
    })),
  finishRace: () =>
    set({
      raceActive: false,
    }),
  endGame: (won) =>
    set({
      gameEndTime: Date.now(),
      gameWon: won,
      isPlaying: false,
    }),
  resetGame: () =>
    set({
      grid: [],
      gameStartTime: 0,
      firstClickTime: 0,
      gameEndTime: 0,
      gameWon: false,
      isPlaying: false,
      hasFirstClick: false,
      moves: 0,
      currentGameId: null,
      challengeLevelId: null,
    }),
}));
