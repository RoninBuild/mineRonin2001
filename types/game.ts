export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';

export type GameMode = 'casual' | 'daily' | 'streak' | 'weekly';

export type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

export type GridConfig = {
  rows: number;
  cols: number;
  mines: number;
};

export type GameResult = {
  won: boolean;
  timeSeconds: number;
  difficulty: Difficulty;
  mode: GameMode;
  coinsEarned?: number;
};
