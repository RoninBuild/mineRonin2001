import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { noopStorage } from '@/lib/utils/noopStorage';

type Screen =
  | 'connect'
  | 'menu'
  | 'difficulty'
  | 'custom'
  | 'playing'
  | 'ended'
  | 'shop'
  | 'stats'
  | 'challenge'
  | 'race';

type AppStore = {
  currentScreen: Screen;
  coins: number;
  inputMode: 'tap' | 'flag';
  ownedSkins: {
    fields: number[];
    flags: number[];
  };
  selectedSkins: {
    field: number;
    flag: number;
  };

  setScreen: (screen: Screen) => void;
  setCoins: (coins: number) => void;
  setInputMode: (mode: 'tap' | 'flag') => void;
  addOwnedSkin: (category: 'fields' | 'flags', id: number) => void;
  selectSkin: (category: 'field' | 'flag', id: number) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentScreen: 'connect',
      coins: 0,
      inputMode: 'tap',
      ownedSkins: {
        fields: [1],
        flags: [1],
      },
      selectedSkins: {
        field: 1,
        flag: 1,
      },
      
      setScreen: (screen) => set({ currentScreen: screen }),
      setCoins: (coins) => set({ coins }),
      setInputMode: (mode) => set({ inputMode: mode }),
      addOwnedSkin: (category, id) =>
        set((state) => ({
          ownedSkins: {
            ...state.ownedSkins,
            [category]: Array.from(new Set([...state.ownedSkins[category], id])),
          },
        })),
      selectSkin: (category, id) =>
        set((state) => ({
          selectedSkins: {
            ...state.selectedSkins,
            [category]: id,
          },
        })),
    }),
    {
      name: 'mine-ronin-app',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : noopStorage,
      ),
      partialize: (state) => ({
        coins: state.coins,
        inputMode: state.inputMode,
        ownedSkins: state.ownedSkins,
        selectedSkins: state.selectedSkins,
      }),
    },
  ),
);
