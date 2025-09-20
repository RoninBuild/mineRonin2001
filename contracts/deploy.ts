

import { baseSepolia } from 'viem/chains'
export const chain = process.env.TESTNET ? baseSepolia : base



const deployTx = await walletClient.deployContract({
    abi, bytecode, args: [difficulty],
    gas: await publicClient.estimateGas({ data: bytecode }),
})

