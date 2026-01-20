import { SiweMessage } from 'siwe';

export async function createSiweMessage(
  address: string,
  statement: string = 'Sign in to Mine Ronin'
): Promise<string> {
  const domain = window.location.host;
  const origin = window.location.origin;
  const siweMessage = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: '1',
    chainId: 8453, // Base mainnet
  });

  return siweMessage.prepareMessage();
}

export async function verifySiweMessage(
  message: string,
  signature: string
): Promise<{ success: boolean; address?: string; error?: string }> {
  try {
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    if (!fields.data.address) {
      return { success: false, error: 'Invalid signature' };
    }

    return { success: true, address: fields.data.address };
  } catch (error) {
    console.error('SIWE verification error:', error);
    return { success: false, error: 'Verification failed' };
  }
}
