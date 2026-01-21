import type { Address } from 'viem';

export const GAME_ADDRESS = (process.env.NEXT_PUBLIC_GAME_ADDRESS ??
  '0xfBf81207ccE322681c700ac5fBF494c03d23D297') as Address;
