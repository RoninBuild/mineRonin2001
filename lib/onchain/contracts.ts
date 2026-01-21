export const SHOP_ABI = [
  {
    name: 'buyFieldSkin',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'id', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'buyFlag',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'id', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

export const CHALLENGE_POOL_ABI = [
  {
    name: 'getCurrentWeek',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
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
