import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { getOrCreateProfile } from '@/lib/db/profiles';

export async function POST(req: NextRequest) {
  try {
    const { message, signature } = await req.json();

    // Verify SIWE signature
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    if (!fields.data.address) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Get or create profile
    const profile = await getOrCreateProfile(fields.data.address);

    return NextResponse.json({
      success: true,
      address: fields.data.address,
      profile,
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
