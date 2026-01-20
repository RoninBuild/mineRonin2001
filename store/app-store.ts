import { create } from 'zustand';

type Screen =
  | 'connect'
  | 'menu'
  | 'difficulty'
  | 'custom'
  | 'playing'
  | 'ended'
  | 'shop'
  | 'stats'
  | 'challenge';

type AppStore = {
  currentScreen: Screen;
  coins: number;
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
  addOwnedSkin: (category: 'fields' | 'flags', id: number) => void;
  selectSkin: (category: 'field' | 'flag', id: number) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  currentScreen: 'connect',
  coins: 0,
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
  addOwnedSkin: (category, id) =>
    set((state) => ({
      ownedSkins: {
        ...state.ownedSkins,
        [category]: [...state.ownedSkins[category], id],
      },
    })),
  selectSkin: (category, id) =>
    set((state) => ({
      selectedSkins: {
        ...state.selectedSkins,
        [category]: id,
      },
    })),
}));
