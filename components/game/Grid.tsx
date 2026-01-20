'use client';

import { Cell as CellType, GridConfig } from '@/lib/minesweeper/grid';
import Cell from './Cell';

type GridProps = {
  grid: CellType[][];
  config: GridConfig;
  onCellClick: (row: number, col: number) => void;
  onToggleFlag: (row: number, col: number) => void;
  flagMode: boolean;
};

export default function Grid({
  grid,
  config,
  onCellClick,
  onToggleFlag,
  flagMode,
}: GridProps) {
  if (grid.length === 0) return null;

  // Calculate cell size to fit screen
  const maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.9 : 350;
  const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.6 : 500;
  const cellSize = Math.min(
    32,
    Math.floor(Math.min(maxWidth / config.cols, maxHeight / config.rows))
  );

  return (
    <div className="panel p-2 overflow-auto">
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${config.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${config.rows}, ${cellSize}px)`,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              cell={cell}
              size={cellSize}
              onClick={() => {
                if (flagMode) {
                  onToggleFlag(r, c);
                } else {
                  onCellClick(r, c);
                }
              }}
              onFlag={() => onToggleFlag(r, c)}
            />
          ))
        )}
      </div>
    </div>
  );
}
