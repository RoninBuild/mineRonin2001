'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { useResultsStore } from '@/store/results-store';
import { useRaceStore } from '@/store/race-store';
import Button from '@/components/ui/Button';
import Panel from '@/components/ui/Panel';

export default function StatsScreen() {
  const { setScreen } = useAppStore();
  const { results } = useResultsStore();
  const { entries } = useRaceStore();
  const [activeTab, setActiveTab] = useState<
    'easy' | 'medium' | 'hard' | 'custom' | 'challenge' | 'race'
  >('easy');
  const [limitFilter, setLimitFilter] = useState<'20' | '50' | 'all'>('20');

  const filteredResults = useMemo(() => {
    const scoped = results.filter((result) => result.difficulty === activeTab);
    if (limitFilter === 'all') return scoped;
    const limit = limitFilter === '50' ? 50 : 20;
    return scoped.slice(0, limit);
  }, [results, activeTab, limitFilter]);

  const bestTime = useMemo(() => {
    if (filteredResults.length === 0) return null;
    return Math.min(...filteredResults.map((result) => result.timeSeconds));
  }, [filteredResults]);

  const raceTop = entries.slice(0, 10);

  const chartWidth = 260;
  const chartHeight = 80;
  const maxTime = Math.max(1, ...filteredResults.map((result) => result.timeSeconds));
  const chartPoints = filteredResults
    .slice()
    .reverse()
    .map((result, index) => {
      const x =
        filteredResults.length > 1
          ? (index / (filteredResults.length - 1)) * chartWidth
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
          <div className="flex flex-wrap gap-2">
            {(['easy', 'medium', 'hard', 'custom', 'challenge', 'race'] as const).map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-xs rounded-lg ${
                    activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ),
            )}
          </div>
        </Panel>

        <Panel>
          <div className="flex gap-2 text-xs">
            {(['20', '50', 'all'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setLimitFilter(filter)}
                className={`px-3 py-2 rounded-lg ${
                  limitFilter === filter ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
              >
                {filter === 'all' ? 'All' : `Last ${filter}`}
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Best Time</span>
            <span className="text-white font-bold text-lg">
              {bestTime ? `${bestTime}s` : '-'}
            </span>
          </div>
        </Panel>

        <Panel>
          <div className="text-purple-400 font-medium mb-3">Time Graph</div>
          {filteredResults.length === 0 ? (
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
              {filteredResults.map((result, index) => {
                const x =
                  filteredResults.length > 1
                    ? (index / (filteredResults.length - 1)) * chartWidth
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

        <Panel>
          <div className="text-purple-400 font-medium mb-3">Recent Games</div>
          {filteredResults.length === 0 ? (
            <div className="text-sm text-gray-500">No games yet.</div>
          ) : (
            <div className="space-y-2 text-xs">
              {filteredResults.map((result) => (
                <div key={result.id} className="flex justify-between text-gray-300">
                  <span className="text-gray-500">
                    {new Date(result.date).toLocaleDateString()}
                  </span>
                  <span>
                    {result.won ? 'W' : 'L'}
                    {result.levelId ? ` L${result.levelId}` : ''}
                  </span>
                  <span>{result.timeSeconds}s</span>
                  <span>{result.moves} moves</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {activeTab === 'race' && (
          <Panel>
            <div className="text-purple-400 font-medium mb-3">Race Top 10</div>
            {raceTop.length === 0 ? (
              <div className="text-sm text-gray-500">No race entries yet.</div>
            ) : (
              <div className="space-y-2 text-xs">
                {raceTop.map((entry, index) => (
                  <div key={`${entry.address}-${entry.date}`} className="flex justify-between text-gray-300">
                    <span className="text-gray-500">#{index + 1}</span>
                    <span>{entry.address.slice(0, 6)}...{entry.address.slice(-4)}</span>
                    <span>{entry.timeSeconds}s</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        )}
      </div>

      <Button onClick={() => setScreen('menu')} variant="secondary">
        BACK
      </Button>
    </div>
  );
}
