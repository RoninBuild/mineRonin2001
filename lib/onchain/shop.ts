import { writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { parseUnits } from 'viem';
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

    const approveHash = await writeContract({
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
      args: [SHOP_ADDRESS, usdcAmount],
    });

    await waitForTransactionReceipt({ hash: approveHash });

    // 2. Purchase skin
    const purchaseHash = await writeContract({
      address: SHOP_ADDRESS,
      abi: SHOP_ABI,
      functionName: 'purchaseSkin',
      args: [category, tier, skinIndex],
    });

    await waitForTransactionReceipt({ hash: purchaseHash });

    return purchaseHash;
  } catch (error) {
    console.error('Purchase error:', error);
    return null;
  }
}
