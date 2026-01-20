import { readContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { parseUnits } from 'viem';
import { CHALLENGE_POOL_ABI } from './contracts';

const POOL_ADDRESS = process.env.NEXT_PUBLIC_CHALLENGE_POOL_ADDRESS as `0x${string}`;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

export async function getCurrentWeek(): Promise<number> {
  const week = await readContract({
    address: POOL_ADDRESS,
    abi: CHALLENGE_POOL_ABI,
    functionName: 'getCurrentWeek',
  });
  return Number(week);
}

export async function checkChallengeEntry(userAddress: string): Promise<boolean> {
  const week = await getCurrentWeek();
  const hasEntered = await readContract({
    address: POOL_ADDRESS,
    abi: CHALLENGE_POOL_ABI,
    functionName: 'hasEntered',
    args: [userAddress as `0x${string}`, BigInt(week)],
  });
  return hasEntered;
}

export async function enterWeeklyChallenge(userAddress: string): Promise<string | null> {
  try {
    // 1. Approve 1 USDC
    const usdcAmount = parseUnits('1', 6);
    
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
      args: [POOL_ADDRESS, usdcAmount],
    });

    await waitForTransactionReceipt({ hash: approveHash });

    // 2. Enter challenge
    const enterHash = await writeContract({
      address: POOL_ADDRESS,
      abi: CHALLENGE_POOL_ABI,
      functionName: 'enterChallenge',
    });

    await waitForTransactionReceipt({ hash: enterHash });

    return enterHash;
  } catch (error) {
    console.error('Challenge entry error:', error);
    return null;
  }
}
