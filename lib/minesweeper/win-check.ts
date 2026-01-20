import { Cell, GridConfig } from './grid';

export function checkWinCondition(grid: Cell[][], config: GridConfig): boolean {
  let revealedCount = 0;

  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.cols; c++) {
      if (grid[r][c].isRevealed && !grid[r][c].isMine) {
        revealedCount++;
      }
    }
  }

  return revealedCount === config.rows * config.cols - config.mines;
}
