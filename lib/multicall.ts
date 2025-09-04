

import { multicall } from 'viem'
export async function readBoard(contractAddr: string, size: number) {
    const calls = []
    for (let x = 0; x < size; x++)
        for (let y = 0; y < size; y++)
            calls.push({ address: contractAddr, abi, functionName: 'getCell', args: [x, y] })
    return multicall(publicClient, { contracts: calls })
}

