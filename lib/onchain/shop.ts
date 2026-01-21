import { writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { parseUnits } from 'viem';
import { wagmiConfig } from '@/lib/wagmi/config';
import { SHOP_ABI } from './contracts';

const SHOP_ADDRESS = process.env.NEXT_PUBLIC_SHOP_ADDRESS as `0x${string}`;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

export async function purchaseSkinWithUSDC(
  userAddress: string,
  category: 'field' | 'flag',
  tier: number,
  skinIndex: number
): Promise<string | null> {
  try {
    // 1. Approve USDC
    const usdcAmount = parseUnits(tier.toString(), 6); // USDC has 6 decimals

    const approveHash = await writeContract(wagmiConfig, {
      address: USDC_ADDRESS,
      abi: [
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
      ],
      functionName: 'approve',
      // TEMP: contracts/ABI not final — bypass strict wagmi arg typing for Vercel build
      args: [SHOP_ADDRESS, usdcAmount] as any,
    });

    await waitForTransactionReceipt(wagmiConfig, { hash: approveHash });

    // 2. Purchase skin
    const tierBI = BigInt(Math.floor(tier));
    const skinIndexBI = BigInt(Math.floor(skinIndex));

    const purchaseHash = await writeContract(wagmiConfig, {
      address: SHOP_ADDRESS,
      // TEMP: contracts/ABI not final — bypass strict wagmi arg typing for Vercel build
      abi: SHOP_ABI as any,
      functionName: 'purchaseSkin',
      // TEMP: contracts/ABI not final — bypass strict wagmi arg typing for Vercel build
      args: [category, tierBI, skinIndexBI] as any,
    });

    await waitForTransactionReceipt(wagmiConfig, { hash: purchaseHash });

    return purchaseHash;
  } catch (error) {
    console.error('Purchase error:', error);
    return null;
  }
}
