

import { useWriteContract } from 'wagmi'
export function NewGame() {
    const { writeContract } = useWriteContract()
    return <button onClick={() => writeContract({ abi, functionName: 'newGame', args: [difficulty] })}>New Game</button>
}

