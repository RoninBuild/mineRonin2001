'use client';

import { useAppStore } from '@/store/app-store';
import { useGameStore } from '@/store/game-store';
import Button from '@/components/ui/Button';
import Panel from '@/components/ui/Panel';

export default function CustomScreen() {
  const { setScreen } = useAppStore();
  const { customConfig, setCustomConfig, setDifficulty, startGame } = useGameStore();

  const handleStart = () => {
    setDifficulty('custom');
    startGame();
    setScreen('playing');
  };

  const maxMines = Math.floor(customConfig.rows * customConfig.cols * 0.3);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
      <h2 className="text-2xl font-bold text-purple-500">CUSTOM GAME</h2>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Panel>
          <label className="block text-sm text-gray-400 mb-2">
            Rows (5-30)
          </label>
          <input
            type="number"
            min="5"
            max="30"
            value={customConfig.rows}
            onChange={(e) =>
              setCustomConfig({ rows: Math.max(5, Math.min(30, parseInt(e.target.value) || 10)) })
            }
            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </Panel>

        <Panel>
          <label className="block text-sm text-gray-400 mb-2">
            Columns (5-30)
          </label>
          <input
            type="number"
            min="5"
            max="30"
            value={customConfig.cols}
            onChange={(e) =>
              setCustomConfig({ cols: Math.max(5, Math.min(30, parseInt(e.target.value) || 10)) })
            }
            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </Panel>

        <Panel>
          <label className="block text-sm text-gray-400 mb-2">
            Mines (1-{maxMines})
          </label>
          <input
            type="number"
            min="1"
            max={maxMines}
            value={customConfig.mines}
            onChange={(e) =>
              setCustomConfig({
                mines: Math.max(1, Math.min(maxMines, parseInt(e.target.value) || 15)),
              })
            }
            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </Panel>

        <div className="text-xs text-gray-500 text-center">
          Grid: {customConfig.rows * customConfig.cols} cells • {customConfig.mines} mines (
          {Math.round((customConfig.mines / (customConfig.rows * customConfig.cols)) * 100)}%)
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleStart} variant="primary">
          START GAME
        </Button>
        <Button onClick={() => setScreen('difficulty')} variant="secondary">
          BACK
        </Button>
      </div>
    </div>
  );
}
