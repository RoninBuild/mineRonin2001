'use client';

import { useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useAppStore } from '@/store/app-store';
import { getOrCreateProfile } from '@/lib/db/profiles';
import { logEvent } from '@/lib/db/analytics';
import { base } from 'viem/chains';

// Import all screens
import ConnectScreen from '@/components/screens/ConnectScreen';
import MenuScreen from '@/components/screens/MenuScreen';
import DifficultyScreen from '@/components/screens/DifficultyScreen';
import CustomScreen from '@/components/screens/CustomScreen';
import ShopScreen from '@/components/screens/ShopScreen';
import StatsScreen from '@/components/screens/StatsScreen';
import ChallengeScreen from '@/components/screens/ChallengeScreen';
import GameScreen from '@/components/screens/GameScreen';

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { currentScreen, setScreen, setCoins } = useAppStore();

  useEffect(() => {
    // Log app open
    logEvent('app_open', null);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('wallet', { isConnected, address, chainId });
    }
  }, [isConnected, address, chainId]);

  useEffect(() => {
    if (!isConnected || !address || chainId === base.id || !switchChain) {
      return;
    }

    const attemptSwitch = async () => {
      try {
        await switchChain({ chainId: base.id });
      } catch (error) {
        console.warn('switchChain failed', error);
      }
    };

    void attemptSwitch();
  }, [isConnected, address, chainId, switchChain]);

  useEffect(() => {
    if (isConnected && address) {
      setScreen('menu');
      // Load profile
      getOrCreateProfile(address).then((profile: { coins: number }) => {
        setCoins(profile.coins);
      });
      
      logEvent('wallet_connect', address);
    } else {
      setScreen('connect');
    }
  }, [isConnected, address, setCoins, setScreen]);

  return (
    <div className="min-h-screen bg-base-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[900px] aspect-video rounded-2xl overflow-hidden bg-base-panel border border-base-border">
        <div className="relative h-full w-full p-4 sm:p-6">
          {/* Wallet indicator */}
          {isConnected && address && (
            <div className="absolute top-3 right-3 z-50 px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}

          {/* Screen router */}
          <div className="w-full h-full">
            {currentScreen === 'connect' && <ConnectScreen />}
            {currentScreen === 'menu' && <MenuScreen />}
            {currentScreen === 'difficulty' && <DifficultyScreen />}
            {currentScreen === 'custom' && <CustomScreen />}
            {currentScreen === 'shop' && <ShopScreen />}
            {currentScreen === 'stats' && <StatsScreen />}
            {currentScreen === 'challenge' && <ChallengeScreen />}
            {currentScreen === 'playing' && <GameScreen />}
            {currentScreen === 'ended' && <GameScreen />}
          </div>
        </div>
      </div>
    </div>
  );
}
