import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Address } from 'viem';
import { noopStorage } from '@/lib/utils/noopStorage';

export type RaceEntry = {
  address: Address;
  timeSeconds: number;
  moves: number;
  date: number;
};

type RaceStore = {
  entries: RaceEntry[];
  addEntry: (entry: RaceEntry) => void;
};

export const useRaceStore = create<RaceStore>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [...state.entries, entry]
            .sort((a, b) => a.timeSeconds - b.timeSeconds)
            .slice(0, 50),
        })),
    }),
    {
      name: 'mine-ronin-race',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : noopStorage,
      ),
    },
  ),
);
