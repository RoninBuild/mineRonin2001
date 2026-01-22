import { Cell, GridConfig } from './grid';

export type RevealResult = {
  grid: Cell[][];
  gameOver: boolean;
  won: boolean;
};

export function revealCell(
  grid: Cell[][],
  config: GridConfig,
  row: number,
  col: number,
  mask?: boolean[][]
): RevealResult {
  const newGrid = grid.map(r => r.map(c => ({ ...c })));
  
  function reveal(r: number, c: number) {
    if (r < 0 || r >= config.rows || c < 0 || c >= config.cols) return;
    if (mask && mask[r]?.[c] === false) return;
    if (newGrid[r][c].isRevealed || newGrid[r][c].isFlagged) return;
    
    newGrid[r][c].isRevealed = true;
    
    // Hit mine - reveal all mines
    if (newGrid[r][c].isMine) {
      for (let i = 0; i < config.rows; i++) {
        for (let j = 0; j < config.cols; j++) {
          if (newGrid[i][j].isMine) {
            newGrid[i][j].isRevealed = true;
          }
        }
      }
      return;
    }
    
    // Flood fill if no neighbor mines
    if (newGrid[r][c].neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          reveal(r + dr, c + dc);
        }
      }
    }
  }
  
  reveal(row, col);
  
  // Check game over
  if (newGrid[row][col].isMine) {
    return { grid: newGrid, gameOver: true, won: false };
  }
  
  // Check win
  let revealedCount = 0;
  let activeCells = 0;
  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.cols; c++) {
      if (mask && mask[r]?.[c] === false) {
        continue;
      }
      activeCells++;
      if (newGrid[r][c].isRevealed && !newGrid[r][c].isMine) {
        revealedCount++;
      }
    }
  }
  
  const won = revealedCount === activeCells - config.mines;
  
  return { grid: newGrid, gameOver: won, won };
}

export function toggleFlag(
  grid: Cell[][],
  row: number,
  col: number
): Cell[][] {
  if (grid[row][col].isRevealed) return grid;
  
  const newGrid = grid.map(r => r.map(c => ({ ...c })));
  newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged;
  return newGrid;
}
