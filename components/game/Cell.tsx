'use client';

import { Cell as CellType } from '@/lib/minesweeper/grid';

type CellProps = {
  cell: CellType;
  size: number;
  onClick: () => void;
  onFlag: () => void;
};

export default function Cell({ cell, size, onClick, onFlag }: CellProps) {
  const handleClick = () => {
    if (!cell.isRevealed) {
      onClick();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onFlag();
  };

  let className = 'cell ';
  let content = '';

  if (cell.isRevealed) {
    if (cell.isMine) {
      className += 'cell-mine';
      content = '💣';
    } else {
      className += 'cell-revealed';
      content = cell.neighborMines > 0 ? String(cell.neighborMines) : '';
    }
  } else if (cell.isFlagged) {
    className += 'cell-flagged';
    content = '🚩';
  } else {
    className += 'cell-hidden';
  }

  return (
    <button
      className={className}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.5),
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {content}
    </button>
  );
}
