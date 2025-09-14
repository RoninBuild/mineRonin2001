

import { baseSepolia } from 'viem/chains'
export const chain = process.env.TESTNET ? baseSepolia : base

