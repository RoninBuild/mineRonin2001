import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/db/client';

export async function POST(req: NextRequest) {
  try {
    const { address, tokenId, category, txHash } = await req.json();

    if (!address || !tokenId || !category || !txHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Record NFT ownership
    const { data, error } = await supabase
      .from('nft_skins')
      .insert({
        address: address.toLowerCase(),
        token_id: tokenId,
        category,
        purchase_tx_hash: txHash,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Purchase record error:', error);
    return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
  }
}
