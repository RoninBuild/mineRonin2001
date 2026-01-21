'use client';

import { useAppStore } from '@/store/app-store';
import { useResultsStore } from '@/store/results-store';
import Button from '@/components/ui/Button';
import Panel from '@/components/ui/Panel';

export default function StatsScreen() {
  const { setScreen } = useAppStore();
  const { results, bestTimes, recentGames } = useResultsStore();

  const gamesPlayed = results.length;
  const gamesWon = results.filter((result) => result.won).length;
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const chartResults = results.slice(0, 20).reverse();
  const maxTime = Math.max(1, ...chartResults.map((result) => result.timeSeconds));
  const chartWidth = 260;
  const chartHeight = 80;
  const chartPoints = chartResults
    .map((result, index) => {
      const x =
        chartResults.length > 1
          ? (index / (chartResults.length - 1)) * chartWidth
          : chartWidth / 2;
      const y = chartHeight - (result.timeSeconds / maxTime) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center h-full gap-4 py-2 overflow-y-auto">
      <h2 className="text-2xl font-bold text-blue-500">STATISTICS</h2>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Panel>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Games Played</span>
            <span className="text-white font-bold text-lg">{gamesPlayed}</span>
          </div>
        </Panel>

        <Panel>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Games Won</span>
            <span className="text-green-400 font-bold text-lg">{gamesWon}</span>
          </div>
        </Panel>

        <Panel>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Win Rate</span>
            <span className="text-blue-400 font-bold text-lg">{winRate}%</span>
          </div>
        </Panel>

        <Panel>
          <div className="text-purple-400 font-medium mb-3">Best Times</div>
          <div className="space-y-2 text-sm">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <div key={diff} className="flex justify-between">
                <span className="text-gray-500 capitalize">{diff}:</span>
                <span className="text-white font-medium">
                  {bestTimes[diff] ? `${bestTimes[diff]}s` : '-'}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="text-purple-400 font-medium mb-3">Recent Games</div>
          {recentGames.length === 0 ? (
            <div className="text-sm text-gray-500">No games yet.</div>
          ) : (
            <div className="space-y-2 text-xs">
              {recentGames.map((result) => (
                <div key={result.id} className="flex justify-between text-gray-300">
                  <span className="text-gray-500">
                    {new Date(result.date).toLocaleDateString()}
                  </span>
                  <span className="capitalize">{result.difficulty}</span>
                  <span>{result.timeSeconds}s</span>
                  <span className={result.won ? 'text-green-400' : 'text-red-400'}>
                    {result.won ? 'Win' : 'Loss'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <div className="text-purple-400 font-medium mb-3">Recent Times</div>
          {chartResults.length === 0 ? (
            <div className="text-sm text-gray-500">No data yet.</div>
          ) : (
            <svg
              width={chartWidth}
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            >
              <polyline
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                points={chartPoints}
              />
              {chartResults.map((result, index) => {
                const x =
                  chartResults.length > 1
                    ? (index / (chartResults.length - 1)) * chartWidth
                    : chartWidth / 2;
                const y = chartHeight - (result.timeSeconds / maxTime) * chartHeight;
                return (
                  <circle
                    key={result.id}
                    cx={x}
                    cy={y}
                    r="2"
                    fill={result.won ? '#34d399' : '#f87171'}
                  />
                );
              })}
            </svg>
          )}
        </Panel>
      </div>

      <Button onClick={() => setScreen('menu')} variant="secondary">
        BACK
      </Button>
    </div>
  );
}
