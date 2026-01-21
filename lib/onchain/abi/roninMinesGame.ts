export const RONIN_MINES_GAME_ABI = [
  {
    name: 'startGame',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'difficulty', type: 'uint8' }],
    outputs: [{ name: 'gameId', type: 'uint256' }],
  },
  {
    name: 'finishGame',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'gameId', type: 'uint256' },
      { name: 'won', type: 'bool' },
      { name: 'timeMs', type: 'uint32' },
      { name: 'moves', type: 'uint16' },
    ],
    outputs: [],
  },
  {
    name: 'totalStarts',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalFinishes',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'GameStarted',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'gameId', type: 'uint256', indexed: true },
      { name: 'difficulty', type: 'uint8', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'GameFinished',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'gameId', type: 'uint256', indexed: true },
      { name: 'won', type: 'bool', indexed: false },
      { name: 'timeMs', type: 'uint32', indexed: false },
      { name: 'moves', type: 'uint16', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
] as const;
