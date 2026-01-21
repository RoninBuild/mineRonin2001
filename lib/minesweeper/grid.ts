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

export function createEmptyGrid(config: GridConfig): Cell[][] {
  return Array(config.rows)
    .fill(null)
    .map(() =>
      Array(config.cols)
        .fill(null)
        .map(() => ({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        }))
    );
}

export function calculateNeighborMines(
  grid: Cell[][],
  config: GridConfig,
  mask?: boolean[][]
): Cell[][] {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  
  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.cols; c++) {
      if (mask && mask[r]?.[c] === false) {
        continue;
      }
      if (!newGrid[r][c].isMine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < config.rows &&
              nc >= 0 &&
              nc < config.cols &&
              (!mask || mask[nr]?.[nc] !== false) &&
              newGrid[nr][nc].isMine
            ) {
              count++;
            }
          }
        }
        newGrid[r][c].neighborMines = count;
      }
    }
  }
  
  return newGrid;
}
