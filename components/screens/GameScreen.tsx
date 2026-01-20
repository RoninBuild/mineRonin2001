'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useGameStore, DIFFICULTY_CONFIGS } from '@/store/game-store';
import { useAppStore } from '@/store/app-store';
import { createEmptyGrid, calculateNeighborMines } from '@/lib/minesweeper/grid';
import { placeMines } from '@/lib/minesweeper/mines';
import { revealCell, toggleFlag as toggleCellFlag } from '@/lib/minesweeper/reveal';
import Grid from '@/components/game/Grid';
import GameHUD from '@/components/game/GameHUD';
import EndModal from '@/components/game/EndModal';
import FlagModeToggle from '@/components/game/FlagModeToggle';
import { saveGameResult } from '@/lib/db/games';
import { calculateCoinReward } from '@/lib/coins';
import { addCoins } from '@/lib/db/profiles';
import { logEvent } from '@/lib/db/analytics';

export default function GameScreen() {
  const { address } = useAccount();
  const { currentScreen } = useAppStore();
  const {
    difficulty,
    mode,
    customConfig,
    grid,
    setGrid,
    gameStartTime,
    firstClickTime,
    gameWon,
    isPlaying,
    flagMode,
    hasFirstClick,
    recordFirstClick,
    endGame,
    resetGame,
  } = useGameStore();

  const [timer, setTimer] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);

  const config = difficulty === 'custom' ? customConfig : DIFFICULTY_CONFIGS[difficulty];

  // Initialize grid on mount
  useEffect(() => {
    if (isPlaying && grid.length === 0) {
      const emptyGrid = createEmptyGrid(config);
      setGrid(emptyGrid);
    }
  }, [isPlaying, grid.length]);

  // Timer effect (starts from first click)
  useEffect(() => {
    if (isPlaying && firstClickTime > 0) {
      const interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - firstClickTime) / 1000));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, firstClickTime]);

  // Show end modal when game ends
  useEffect(() => {
    if (currentScreen === 'ended') {
      setShowEndModal(true);
    }
  }, [currentScreen]);

  const handleCellClick = (row: number, col: number) => {
    if (!isPlaying || grid[row][col].isFlagged) return;

    // First click - place mines avoiding this cell
    if (!hasFirstClick) {
      const gridWithMines = placeMines(grid, config, row, col);
      const finalGrid = calculateNeighborMines(gridWithMines, config);
      setGrid(finalGrid);
      recordFirstClick();
      logEvent('first_click', address || null, { difficulty, mode });
      
      // Now reveal the cell
      setTimeout(() => handleReveal(finalGrid, row, col), 50);
      return;
    }

    handleReveal(grid, row, col);
  };

  const handleReveal = (currentGrid: any[][], row: number, col: number) => {
    const result = revealCell(currentGrid, config, row, col);
    setGrid(result.grid);

    if (result.gameOver) {
      endGame(result.won);
      
      const timeSeconds = Math.floor((Date.now() - firstClickTime) / 1000);
      
      // Save game result
      if (address) {
        saveGameResult({
          address,
          mode,
          difficulty,
          timeSeconds,
          won: result.won,
        }).then((savedResult) => {
          if (result.won && difficulty !== 'custom') {
            const coinsEarned = calculateCoinReward(difficulty, timeSeconds);
            addCoins(address, coinsEarned);
          }
        });

        logEvent(result.won ? 'win' : 'lose', address, {
          difficulty,
          mode,
          time: timeSeconds,
        });
      }
    }
  };

  const handleToggleFlag = (row: number, col: number) => {
    if (!isPlaying || !hasFirstClick) return;
    const newGrid = toggleCellFlag(grid, row, col);
    setGrid(newGrid);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
      <GameHUD
        timer={timer}
        difficulty={difficulty}
        onQuit={() => {
          resetGame();
          useAppStore.getState().setScreen('menu');
        }}
      />

      <Grid
        grid={grid}
        config={config}
        onCellClick={handleCellClick}
        onToggleFlag={handleToggleFlag}
        flagMode={flagMode}
      />

      <FlagModeToggle />

      {showEndModal && (
        <EndModal
          won={gameWon}
          difficulty={difficulty}
          timeSeconds={Math.floor((Date.now() - firstClickTime) / 1000)}
          onClose={() => {
            setShowEndModal(false);
            resetGame();
            useAppStore.getState().setScreen('menu');
          }}
        />
      )}
    </div>
  );
}
