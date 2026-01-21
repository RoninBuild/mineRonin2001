import { Cell, GridConfig } from './grid';

/**
 * Place mines randomly, but NOT on firstClickRow/firstClickCol
 * Implements "first click safe" guarantee
 */
export function placeMines(
  grid: Cell[][],
  config: GridConfig,
  firstClickRow?: number,
  firstClickCol?: number,
  seed?: number,
  mask?: boolean[][]
): Cell[][] {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  
  // Use seeded random if provided (for daily challenge)
  const rng = seed !== undefined ? seededRandom(seed) : Math.random;
  
  const excludedCells = new Set<string>();
  if (firstClickRow !== undefined && firstClickCol !== undefined) {
    // Exclude first click cell and neighbors
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = firstClickRow + dr;
        const c = firstClickCol + dc;
        if (r >= 0 && r < config.rows && c >= 0 && c < config.cols) {
          excludedCells.add(`${r},${c}`);
        }
      }
    }
  }
  
  let minesPlaced = 0;
  const maxAttempts = config.rows * config.cols * 10;
  let attempts = 0;
  
  while (minesPlaced < config.mines && attempts < maxAttempts) {
    const row = Math.floor(rng() * config.rows);
    const col = Math.floor(rng() * config.cols);
    const key = `${row},${col}`;
    
    const isAllowed = mask ? mask[row]?.[col] !== false : true;
    if (isAllowed && !newGrid[row][col].isMine && !excludedCells.has(key)) {
      newGrid[row][col].isMine = true;
      minesPlaced++;
    }
    attempts++;
  }
  
  return newGrid;
}

// Simple seeded random generator for daily challenge
function seededRandom(seed: number) {
  let state = seed;
  return function() {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}
