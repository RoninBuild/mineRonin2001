import { create } from 'zustand';

type WalletStore = {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;

  setWallet: (address: string | null, chainId: number | null) => void;
  disconnect: () => void;
};

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  isConnected: false,
  chainId: null,

  setWallet: (address, chainId) =>
    set({
      address,
      isConnected: !!address,
      chainId,
    }),

  disconnect: () =>
    set({
      address: null,
      isConnected: false,
      chainId: null,
    }),
}));
