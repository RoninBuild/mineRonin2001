export const SHOP_ABI = [
  {
    name: 'purchaseSkin',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'category', type: 'string' },
      { name: 'tier', type: 'uint8' },
      { name: 'skinIndex', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getCatalogSkins',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tier', type: 'uint8' },
      { name: 'category', type: 'string' },
    ],
    outputs: [{ name: '', type: 'string[]' }],
  },
] as const;

export const CHALLENGE_POOL_ABI = [
  {
    name: 'enterChallenge',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'hasEntered',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'player', type: 'address' },
      { name: 'week', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'getPoolInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'week', type: 'uint256' }],
    outputs: [
      { name: 'totalEntries', type: 'uint256' },
      { name: 'prizePool', type: 'uint256' },
      { name: 'distributed', type: 'bool' },
    ],
  },
] as const;
