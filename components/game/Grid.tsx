'use client';

import { useEffect, useRef, useState } from 'react';
import { Cell as CellType, GridConfig } from '@/lib/minesweeper/grid';
import Cell from './Cell';

type GridProps = {
  grid: CellType[][];
  config: GridConfig;
  onCellClick: (row: number, col: number) => void;
  onToggleFlag: (row: number, col: number) => void;
  inputMode: 'tap' | 'flag';
  mask?: boolean[][];
};

export default function Grid({
  grid,
  config,
  onCellClick,
  onToggleFlag,
  inputMode,
  mask,
}: GridProps) {
  if (grid.length === 0) return null;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cellSize, setCellSize] = useState(28);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const size = Math.floor(
        Math.min(clientWidth / config.cols, clientHeight / config.rows)
      );
      setCellSize(Math.max(18, Math.min(size, 36)));
    };

    updateSize();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateSize);
      }
    };
  }, [config.cols, config.rows]);

  return (
    <div ref={containerRef} className="panel flex h-full w-full items-center justify-center p-2">
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${config.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${config.rows}, ${cellSize}px)`,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isMasked = mask ? mask[r]?.[c] === false : false;
            if (isMasked) {
              return (
                <div
                  key={`${r}-${c}`}
                  style={{ width: cellSize, height: cellSize }}
                />
              );
            }
            return (
              <Cell
                key={`${r}-${c}`}
                cell={cell}
                size={cellSize}
                onClick={() => {
                  if (inputMode === 'flag') {
                    onToggleFlag(r, c);
                  } else {
                    onCellClick(r, c);
                  }
                }}
                onFlag={() => onToggleFlag(r, c)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
