

import { create } from 'zustand'
export const useGameStore = create(set => ({
    board: [], gameState: 'idle', startTime: 0,
    newGame: () => set({ gameState: 'playing', startTime: Date.now() }),
    gameOver: (won: boolean) => set({ gameState: won ? 'won' : 'lost' }),
}))

