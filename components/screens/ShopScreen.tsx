'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useAppStore } from '@/store/app-store';
import { purchaseSkinWithUSDC } from '@/lib/onchain/shop';
import { logEvent } from '@/lib/db/analytics';
import Button from '@/components/ui/Button';

const SKIN_CATALOG = {
  fields: [
    { id: 1, name: 'Classic Dark', tier: 1, owned: true },
    { id: 2, name: 'Neon Grid', tier: 5, owned: false },
    { id: 3, name: 'Cyber Matrix', tier: 10, owned: false },
  ],
  flags: [
    { id: 1, name: 'Base Flag', tier: 1, owned: true },
    { id: 2, name: 'Ronin Mark', tier: 5, owned: false },
    { id: 3, name: 'Elite Emblem', tier: 10, owned: false },
  ],
};

export default function ShopScreen() {
  const { address } = useAccount();
  const { setScreen, ownedSkins, addOwnedSkin } = useAppStore();
  const [category, setCategory] = useState<'fields' | 'flags'>('fields');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (skinId: number, tier: number) => {
    if (!address) return;

    setLoading(true);

    try {
      logEvent('purchase_click', address, { category, skinId, tier });

      const txHash = await purchaseSkinWithUSDC(
        address,
        category === 'fields' ? 'field' : 'flag',
        tier,
        skinId - 1 // catalog index
      );

      if (txHash) {
        addOwnedSkin(category, skinId);
        logEvent('purchase_success', address, { category, skinId, tier, txHash });
        alert('Skin purchased! NFT minted 🎉');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center h-full gap-4 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold text-blue-500">SHOP</h2>

      {/* Category tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setCategory('fields')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            category === 'fields'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          FIELDS
        </button>
        <button
          onClick={() => setCategory('flags')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            category === 'flags'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          FLAGS
        </button>
      </div>

      {/* Skins list */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {SKIN_CATALOG[category].map((skin) => {
          const owned = ownedSkins[category].includes(skin.id);

          return (
            <div key={skin.id} className="panel p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-blue-300">{skin.name}</span>
                {owned && (
                  <span className="text-green-400 text-xs">✓ OWNED</span>
                )}
              </div>

              {!owned && (
                <button
                  onClick={() => handlePurchase(skin.id, skin.tier)}
                  disabled={loading}
                  className="w-full btn-primary text-sm disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `${skin.tier} USDC`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Button onClick={() => setScreen('menu')} variant="secondary">
        BACK
      </Button>
    </div>
  );
}
