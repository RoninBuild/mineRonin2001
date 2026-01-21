import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from 'wagmi/actions';
import { parseUnits } from 'viem';
import { wagmiConfig } from '@/lib/wagmi/config';
import { SHOP_ABI } from './contracts';
import { SHOP_ADDRESS, hasLiveShop } from './addresses';
import { USDC_BASE_ADDRESS } from './tokens';

const ERC20_ABI = [
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export async function purchaseSkinWithUSDC(
  userAddress: string,
  category: 'field' | 'flag',
  priceUSDC: number,
  skinId: number,
): Promise<string | null> {
  if (!hasLiveShop) {
    return null;
  }

  try {
    // 1. Approve USDC if needed
    const usdcAmount = parseUnits(priceUSDC.toString(), 6); // USDC has 6 decimals

    const allowance = await readContract(wagmiConfig, {
      address: USDC_BASE_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [userAddress, SHOP_ADDRESS],
    });

    if (allowance < usdcAmount) {
      const approveHash = await writeContract(wagmiConfig, {
        address: USDC_BASE_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        // TEMP: contracts/ABI not final — bypass strict wagmi arg typing for Vercel build
        args: [SHOP_ADDRESS, usdcAmount] as any,
      });

      await waitForTransactionReceipt(wagmiConfig, { hash: approveHash });
    }

    // 2. Purchase skin
    const purchaseHash = await writeContract(wagmiConfig, {
      address: SHOP_ADDRESS,
      // TEMP: contracts/ABI not final — bypass strict wagmi arg typing for Vercel build
      abi: SHOP_ABI as any,
      functionName: category === 'field' ? 'buyFieldSkin' : 'buyFlag',
      // TEMP: contracts/ABI not final — bypass strict wagmi arg typing for Vercel build
      args: [BigInt(Math.floor(skinId))] as any,
    });

    await waitForTransactionReceipt(wagmiConfig, { hash: purchaseHash });

    return purchaseHash;
  } catch (error) {
    console.error('Purchase error:', error);
    return null;
  }
}
