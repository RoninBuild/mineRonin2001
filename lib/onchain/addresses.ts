export const SHOP_ADDRESS =
  (process.env.NEXT_PUBLIC_SHOP_ADDRESS as `0x${string}` | undefined) ??
  '0x0000000000000000000000000000000000000000';

export const GAME_ADDRESS =
  (process.env.NEXT_PUBLIC_GAME_ADDRESS as `0x${string}` | undefined) ??
  '0xfBf81207ccE322681c700ac5fBF494c03d23D297';

export const hasLiveShop = SHOP_ADDRESS !== '0x0000000000000000000000000000000000000000';
