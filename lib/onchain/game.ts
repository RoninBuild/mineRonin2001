import { parseEventLogs } from 'viem';
import { waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import { wagmiConfig } from '@/lib/wagmi/config';
import { GAME_ADDRESS } from '@/lib/onchain/addresses';
import { RONIN_MINES_GAME_ABI } from '@/lib/onchain/abi/roninMinesGame';

const GAME_ADDRESS_TYPED = GAME_ADDRESS;

const getGameStartedIdFromReceipt = (logs: Parameters<typeof parseEventLogs>[0]['logs']) => {
  const parsedLogs = parseEventLogs({
    abi: RONIN_MINES_GAME_ABI,
    logs,
    eventName: 'GameStarted',
  });

  const event = parsedLogs.find((log) => log.eventName === 'GameStarted');
  if (!event) {
    return null;
  }

  return Number(event.args.gameId);
};

export async function startOnchainGame(difficulty: number) {
  const hash = await writeContract(wagmiConfig, {
    address: GAME_ADDRESS_TYPED,
    abi: RONIN_MINES_GAME_ABI,
    functionName: 'startGame',
    args: [difficulty] as const,
  });

  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
  const gameId = getGameStartedIdFromReceipt(receipt.logs) ?? null;

  return { hash, gameId };
}

export async function finishOnchainGame(
  gameId: number,
  won: boolean,
  timeMs: number,
  moves: number,
) {
  const hash = await writeContract(wagmiConfig, {
    address: GAME_ADDRESS_TYPED,
    abi: RONIN_MINES_GAME_ABI,
    functionName: 'finishGame',
    args: [BigInt(gameId), won, timeMs, moves] as const,
  });

  await waitForTransactionReceipt(wagmiConfig, { hash });
  return { hash };
}
