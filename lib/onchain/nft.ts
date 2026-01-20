import { readContract } from 'wagmi/actions';

const SKINS_NFT_ADDRESS = process.env.NEXT_PUBLIC_SKINS_NFT_ADDRESS as `0x${string}`;

const SKINS_NFT_ABI = [
  {
    name: 'tokensOfOwner',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getSkin',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'category', type: 'string' },
          { name: 'tier', type: 'uint8' },
          { name: 'name', type: 'string' },
        ],
      },
    ],
  },
] as const;

export async function getOwnedSkins(address: string): Promise<number[]> {
  try {
    const tokenIds = await readContract({
      address: SKINS_NFT_ADDRESS,
      abi: SKINS_NFT_ABI,
      functionName: 'tokensOfOwner',
      args: [address as `0x${string}`],
    });

    return tokenIds.map((id) => Number(id));
  } catch (error) {
    console.error('Failed to get owned skins:', error);
    return [];
  }
}

export async function getSkinMetadata(tokenId: number) {
  try {
    const metadata = await readContract({
      address: SKINS_NFT_ADDRESS,
      abi: SKINS_NFT_ABI,
      functionName: 'getSkin',
      args: [BigInt(tokenId)],
    });

    return {
      category: metadata.category,
      tier: metadata.tier,
      name: metadata.name,
    };
  } catch (error) {
    console.error('Failed to get skin metadata:', error);
    return null;
  }
}
