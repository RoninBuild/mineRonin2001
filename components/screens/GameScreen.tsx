'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId, useReadContract } from 'wagmi';
import { useGameStore, DIFFICULTY_CONFIGS } from '@/store/game-store';
import { useAppStore } from '@/store/app-store';
import { useResultsStore } from '@/store/results-store';
import { createEmptyGrid, calculateNeighborMines } from '@/lib/minesweeper/grid';
import { placeMines } from '@/lib/minesweeper/mines';
import { revealCell, toggleFlag as toggleCellFlag } from '@/lib/minesweeper/reveal';
import Grid from '@/components/game/Grid';
import ResultModal from '@/components/game/ResultModal';
import FlagModeToggle from '@/components/game/FlagModeToggle';
import { calculateCoinReward } from '@/lib/coins';
import { logEvent } from '@/lib/db/analytics';
import { base } from 'viem/chains';
import { shareResult } from '@/lib/share';
import { finishOnchainGame } from '@/lib/onchain/game';
import { GAME_ADDRESS } from '@/lib/onchain/addresses';
import { RONIN_MINES_GAME_ABI } from '@/lib/onchain/abi/roninMinesGame';

export default function GameScreen() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { coins, setScreen, setCoins } = useAppStore();
  const { addResult } = useResultsStore();
  const {
    difficulty,
    mode,
    customConfig,
    grid,
    setGrid,
    firstClickTime,
    gameEndTime,
    gameWon,
    isPlaying,
    flagMode,
    hasFirstClick,
    recordFirstClick,
    endGame,
    resetGame,
    incrementMoves,
    moves,
    currentGameId,
    setCurrentGameId,
  } = useGameStore();

  const [timer, setTimer] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const config = difficulty === 'custom' ? customConfig : DIFFICULTY_CONFIGS[difficulty];
  const isOnBase = chainId === base.id;
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '—';

  const networkLabel = useMemo(() => {
    if (!address) return 'Disconnected';
    return isOnBase ? 'Base' : 'Wrong Network';
  }, [address, isOnBase]);

  const { data: totalStarts } = useReadContract({
    address: GAME_ADDRESS as `0x${string}`,
    abi: RONIN_MINES_GAME_ABI,
    functionName: 'totalStarts',
  });

  const { data: totalFinishes } = useReadContract({
    address: GAME_ADDRESS as `0x${string}`,
    abi: RONIN_MINES_GAME_ABI,
    functionName: 'totalFinishes',
  });

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
    if (!isPlaying && gameEndTime > 0 && hasFirstClick) {
      setShowEndModal(true);
      setSaveError(null);
    }
  }, [isPlaying, gameEndTime, hasFirstClick]);

  useEffect(() => {
    if (isPlaying) {
      setShowEndModal(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!showEndModal) return;

    if (currentGameId === null) {
      setSaveError('Missing game ID. Result not saved on-chain.');
      return;
    }

    if (!isOnBase) {
      setSaveError('Connect to Base to save results.');
      return;
    }

    const timeMs = Math.max(0, Date.now() - firstClickTime);
    const clampedMoves = Math.min(moves, 65535);

    const submitFinish = async () => {
      setIsSaving(true);
      try {
        await finishOnchainGame(currentGameId, gameWon, timeMs, clampedMoves);
      } catch (err) {
        console.error('finishGame failed', err);
        setSaveError('Failed to save on-chain.');
      } finally {
        setIsSaving(false);
      }
    };

    void submitFinish();
  }, [showEndModal, currentGameId, isOnBase, firstClickTime, gameWon, moves, setCurrentGameId]);

  const handleCellClick = (row: number, col: number) => {
    if (!isPlaying || grid[row][col].isFlagged) return;
    incrementMoves();

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
      const reward =
        result.won && difficulty !== 'custom'
          ? calculateCoinReward(difficulty, timeSeconds)
          : 0;

      addResult({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        date: new Date().toISOString(),
        difficulty,
        timeSeconds,
        moves,
        won: result.won,
        reward,
      });

      if (reward > 0) {
        setCoins(coins + reward);
      }
      
      if (address) {
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
    incrementMoves();
    const newGrid = toggleCellFlag(grid, row, col);
    setGrid(newGrid);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl border border-base-border bg-base-panel px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm text-blue-300">MINE RONIN</span>
          <span className="text-xs text-gray-400">{shortAddress}</span>
          <span className="text-[10px] text-gray-500">
            Starts: {totalStarts ? totalStarts.toString() : '—'} · Finishes:{' '}
            {totalFinishes ? totalFinishes.toString() : '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isOnBase ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-black'
            }`}
          >
            {networkLabel}
          </span>
          <span className="rounded-full bg-black/40 px-3 py-1 text-xs text-yellow-300">
            💰 {coins}
          </span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <Grid
          grid={grid}
          config={config}
          onCellClick={handleCellClick}
          onToggleFlag={handleToggleFlag}
          flagMode={flagMode}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => {
            resetGame();
            setScreen('difficulty');
          }}
          className="btn-secondary flex-1 text-sm"
        >
          RESTART
        </button>
        <button onClick={() => setScreen('shop')} className="btn-secondary flex-1 text-sm">
          SHOP
        </button>
        <button onClick={() => setScreen('stats')} className="btn-secondary flex-1 text-sm">
          STATS
        </button>
        <button
          onClick={() => {
            if (!hasFirstClick) return;
            const timeSeconds = Math.floor((Date.now() - firstClickTime) / 1000);
            shareResult(gameWon, difficulty, timeSeconds);
            logEvent('share_result', address || null, {
              difficulty,
              time: timeSeconds,
            });
          }}
          className="btn-secondary flex-1 text-sm"
        >
          SHARE
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="panel px-3 py-2 text-xs text-blue-200">
          ⏱ {timer}s · {difficulty.toUpperCase()} · {moves} moves
        </div>
        <FlagModeToggle />
        <button
          onClick={() => {
            resetGame();
            setScreen('menu');
          }}
          className="btn-secondary text-sm"
        >
          QUIT
        </button>
      </div>

      {showEndModal && (
        <ResultModal
          won={gameWon}
          difficulty={difficulty}
          timeSeconds={Math.floor((Date.now() - firstClickTime) / 1000)}
          moves={moves}
          reward={
            gameWon && difficulty !== 'custom'
              ? calculateCoinReward(difficulty, Math.floor((Date.now() - firstClickTime) / 1000))
              : 0
          }
          isSaving={isSaving}
          errorMessage={saveError}
          onPlayAgain={() => {
            setShowEndModal(false);
            resetGame();
            setScreen('difficulty');
          }}
          onGoToStats={() => {
            setShowEndModal(false);
            setScreen('stats');
          }}
          onClose={() => {
            setShowEndModal(false);
            resetGame();
            setScreen('menu');
          }}
        />
      )}
    </div>
  );
}
