'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId, useReadContract } from 'wagmi';
import { useGameStore, DIFFICULTY_CONFIGS } from '@/store/game-store';
import { useAppStore } from '@/store/app-store';
import { useResultsStore } from '@/store/results-store';
import { useRaceStore } from '@/store/race-store';
import { createEmptyGrid, calculateNeighborMines, type Cell } from '@/lib/minesweeper/grid';
import { placeMines } from '@/lib/minesweeper/mines';
import { revealCell, toggleFlag as toggleCellFlag } from '@/lib/minesweeper/reveal';
import Grid from '@/components/game/Grid';
import ResultModal from '@/components/game/ResultModal';
import { calculateCoinReward } from '@/lib/coins';
import { logEvent } from '@/lib/db/analytics';
import { base } from 'viem/chains';
import { shareResult } from '@/lib/share';
import { finishOnchainGame, startOnchainGame } from '@/lib/onchain/game';
import { GAME_ADDRESS } from '@/lib/onchain/addresses';
import { RONIN_MINES_GAME_ABI } from '@/lib/onchain/abi/roninMinesGame';
import { CHALLENGE_LEVELS } from '@/lib/challenge/levels';

export default function GameScreen() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { coins, setScreen, setCoins, inputMode, setInputMode } = useAppStore();
  const { addResult } = useResultsStore();
  const { addEntry } = useRaceStore();
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
    hasFirstClick,
    recordFirstClick,
    endGame,
    resetGame,
    incrementMoves,
    moves,
    currentGameId,
    setCurrentGameId,
    challengeLevelId,
    raceActive,
    raceLevelIndex,
    raceStartTime,
    raceMoves,
    advanceRaceLevel,
    addRaceMoves,
    finishRace,
  } = useGameStore();

  const [timer, setTimer] = useState(0);
  const [raceTimer, setRaceTimer] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const challengeLevel =
    mode === 'challenge' || mode === 'race'
      ? CHALLENGE_LEVELS[(mode === 'race' ? raceLevelIndex : (challengeLevelId ?? 1) - 1)] ?? null
      : null;
  const config =
    challengeLevel !== null
      ? { rows: challengeLevel.height, cols: challengeLevel.width, mines: challengeLevel.mines }
      : difficulty === 'custom'
      ? customConfig
      : DIFFICULTY_CONFIGS[difficulty];
  const mask = challengeLevel?.mask;
  const levelLabel =
    challengeLevel !== null
      ? `${mode === 'race' ? 'RACE' : 'CHALLENGE'} ${challengeLevel.id}/30`
      : difficulty.toUpperCase();
  const isOnBase = chainId === base.id;
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '—';
  const onchainDifficulty =
    mode === 'challenge' || mode === 'race'
      ? 3
      : difficulty === 'easy'
      ? 0
      : difficulty === 'medium'
      ? 1
      : difficulty === 'hard'
      ? 2
      : 3;

  const networkLabel = useMemo(() => {
    if (!address) return 'Disconnected';
    return isOnBase ? 'Base' : 'Wrong Network';
  }, [address, isOnBase]);

  const { data: totalStarts } = useReadContract({
    address: GAME_ADDRESS,
    abi: RONIN_MINES_GAME_ABI,
    functionName: 'totalStarts',
  });

  const { data: totalFinishes } = useReadContract({
    address: GAME_ADDRESS,
    abi: RONIN_MINES_GAME_ABI,
    functionName: 'totalFinishes',
  });

  // Initialize grid on mount
  useEffect(() => {
    if (isPlaying && grid.length === 0) {
      const emptyGrid = createEmptyGrid(config);
      setGrid(emptyGrid);
    }
  }, [isPlaying, grid.length, config, setGrid]);

  // Timer effect (starts from first click)
  useEffect(() => {
    if (isPlaying && firstClickTime > 0) {
      const interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - firstClickTime) / 1000));
      }, 100);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isPlaying, firstClickTime]);

  useEffect(() => {
    if (mode === 'race' && raceActive && raceStartTime > 0) {
      const interval = setInterval(() => {
        setRaceTimer(Math.floor((Date.now() - raceStartTime) / 1000));
      }, 250);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [mode, raceActive, raceStartTime]);

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
  }, [
    showEndModal,
    mode,
    currentGameId,
    isOnBase,
    firstClickTime,
    gameWon,
    moves,
    setCurrentGameId,
  ]);

  const handleCellClick = (row: number, col: number) => {
    if (!isPlaying || grid[row][col].isFlagged) return;
    if (mask && mask[row]?.[col] === false) return;
    incrementMoves();
    if (mode === 'race' && raceActive) {
      addRaceMoves(1);
    }

    // First click - place mines avoiding this cell
    if (!hasFirstClick) {
      const gridWithMines = placeMines(grid, config, row, col, undefined, mask);
      const finalGrid = calculateNeighborMines(gridWithMines, config, mask);
      setGrid(finalGrid);
      recordFirstClick();
      logEvent('first_click', address || null, { difficulty, mode });
      
      // Now reveal the cell
      setTimeout(() => handleReveal(finalGrid, row, col), 50);
      return;
    }

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
  }, [showEndModal, mode, currentGameId, isOnBase, firstClickTime, gameWon, moves]);

  const handleReveal = (currentGrid: Cell[][], row: number, col: number) => {
    const result = revealCell(currentGrid, config, row, col, mask);
    setGrid(result.grid);

    if (result.gameOver) {
      endGame(result.won);

      const totalTimeSeconds =
        mode === 'race' && raceActive
          ? Math.floor((Date.now() - raceStartTime) / 1000)
          : Math.floor((Date.now() - firstClickTime) / 1000);

      const resultDifficulty =
        mode === 'challenge' ? 'challenge' : mode === 'race' ? 'race' : difficulty;

      const reward =
        result.won && difficulty !== 'custom' && mode === 'casual'
          ? calculateCoinReward(difficulty, totalTimeSeconds)
          : 0;

      addResult({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        date: new Date().toISOString(),
        difficulty: resultDifficulty,
        timeSeconds: totalTimeSeconds,
        moves: mode === 'race' ? raceMoves : moves,
        won: result.won,
        reward,
        levelId: mode === 'challenge' ? challengeLevelId ?? undefined : undefined,
      });

      if (reward > 0) {
        setCoins(coins + reward);
      }

      if (mode === 'race' && raceActive) {
        if (result.won && raceLevelIndex >= CHALLENGE_LEVELS.length - 1 && address) {
          addEntry({
            address,
            timeSeconds: totalTimeSeconds,
            moves: raceMoves,
            date: Date.now(),
          });
        }
        if (!result.won || raceLevelIndex >= CHALLENGE_LEVELS.length - 1) {
          finishRace();
        }
      }

      if (address) {
        logEvent(result.won ? 'win' : 'lose', address, {
          difficulty: resultDifficulty,
          mode,
          time: totalTimeSeconds,
        });
      }
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isPlaying || grid[row][col].isFlagged) return;
    if (mask && mask[row]?.[col] === false) return;

    incrementMoves();
    if (mode === 'race' && raceActive) addRaceMoves(1);

    // First click - place mines avoiding this cell
    if (!hasFirstClick) {
      const gridWithMines = placeMines(grid, config, row, col, undefined, mask);
      const finalGrid = calculateNeighborMines(gridWithMines, config, mask);
      setGrid(finalGrid);
      recordFirstClick();
      logEvent('first_click', address || null, { difficulty, mode });

      // Now reveal the cell
      setTimeout(() => handleReveal(finalGrid, row, col), 50);
      return;
    }

    handleReveal(grid, row, col);
  };

  const handleToggleFlag = (row: number, col: number) => {
    if (!isPlaying || !hasFirstClick) return;
    if (mask && mask[row]?.[col] === false) return;
    incrementMoves();
    if (mode === 'race' && raceActive) {
      addRaceMoves(1);
    }
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
          inputMode={inputMode}
          mask={mask}
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
          ⏱ {mode === 'race' && raceActive ? raceTimer : timer}s · {levelLabel} ·{' '}
          {moves} moves
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setInputMode('tap')}
            className={`px-3 py-2 text-xs rounded-lg ${
              inputMode === 'tap' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
            }`}
          >
            TAP MODE
          </button>
          <button
            type="button"
            onClick={() => setInputMode('flag')}
            className={`px-3 py-2 text-xs rounded-lg ${
              inputMode === 'flag' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
            }`}
          >
            FLAG MODE
          </button>
        </div>
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
          difficulty={levelLabel}
          timeSeconds={
            mode === 'race' && raceActive
              ? raceTimer
              : Math.floor((Date.now() - firstClickTime) / 1000)
          }
          moves={mode === 'race' ? raceMoves : moves}
          reward={
            gameWon && difficulty !== 'custom' && mode === 'casual'
              ? calculateCoinReward(difficulty, Math.floor((Date.now() - firstClickTime) / 1000))
              : 0
          }
          isSaving={isSaving}
          errorMessage={saveError}
          nextLevelLabel={
            mode === 'challenge' && gameWon && challengeLevelId !== null && challengeLevelId < 30
              ? `NEXT LEVEL (${challengeLevelId + 1}/30)`
              : mode === 'race' && gameWon && raceLevelIndex < CHALLENGE_LEVELS.length - 1
              ? `NEXT LEVEL (${raceLevelIndex + 2}/30)`
              : null
          }
          onNextLevel={
            mode === 'challenge' && gameWon && challengeLevelId !== null && challengeLevelId < 30
              ? async () => {
                  setSaveError(null);
                  if (!isOnBase) {
                    setSaveError('Connect to Base mainnet to start.');
                    return;
                  }
                  setIsSaving(true);
                  try {
                    const { gameId } = await startOnchainGame(onchainDifficulty);
                    if (gameId === null) {
                      setSaveError('Unable to read game ID from chain.');
                      return;
                    }
                    setCurrentGameId(gameId);
                    setShowEndModal(false);
                    resetGame();
                    useGameStore.getState().setChallengeLevelId(challengeLevelId + 1);
                    useGameStore.getState().startGame();
                  } catch (err) {
                    console.error('startGame failed', err);
                    setSaveError('Start failed. Please try again.');
                  } finally {
                    setIsSaving(false);
                  }
                }
              : mode === 'race' && gameWon && raceLevelIndex < CHALLENGE_LEVELS.length - 1
              ? async () => {
                  setSaveError(null);
                  if (!isOnBase) {
                    setSaveError('Connect to Base mainnet to start.');
                    return;
                  }
                  setIsSaving(true);
                  try {
                    const { gameId } = await startOnchainGame(onchainDifficulty);
                    if (gameId === null) {
                      setSaveError('Unable to read game ID from chain.');
                      return;
                    }
                    setCurrentGameId(gameId);
                    setShowEndModal(false);
                    advanceRaceLevel();
                    resetGame();
                    useGameStore.getState().startGame();
                  } catch (err) {
                    console.error('startGame failed', err);
                    setSaveError('Start failed. Please try again.');
                  } finally {
                    setIsSaving(false);
                  }
                }
              : undefined
          }
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
