export async function purchaseSkinWithUSDC(
  userAddress: string,
  category: 'field' | 'flag',
  priceUSDC: number,
  skinId: number,
): Promise<string | null> {
  void userAddress;
  void category;
  void priceUSDC;
  void skinId;
  throw new Error('Shop disabled');
}
