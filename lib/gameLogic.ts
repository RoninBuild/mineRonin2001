

export function countAdjacentMines(board: Cell[][], x: number, y: number): number { /* ... */ }
export function shouldFloodFill(cell: Cell): boolean { return !cell.isMine && cell.adjacentMines === 0 }

