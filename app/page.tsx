'use client';

import { useEffect, useState } from 'react';
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
import RaceScreen from '@/components/screens/RaceScreen';
import GameScreen from '@/components/screens/GameScreen';

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { currentScreen, setScreen, setCoins } = useAppStore();
  const [switchError, setSwitchError] = useState(false);

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
    if (!isConnected || !address || chainId === base.id || !switchChainAsync) {
      setSwitchError(false);
      return;
    }

    const attemptSwitch = async () => {
      try {
        await switchChainAsync({ chainId: base.id });
        setSwitchError(false);
      } catch (error) {
        console.warn('switchChain failed', error);
        setSwitchError(true);
      }
    };

    void attemptSwitch();
  }, [isConnected, address, chainId, switchChainAsync]);

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
    <div className="min-h-[100dvh] w-full bg-base-bg text-white pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]">
      <div className="flex min-h-[100dvh] w-full flex-col px-4 py-4">
        {isConnected && chainId !== base.id && (
          <div className="mb-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-200">
            <div className="flex items-center justify-between gap-3">
              <span>Base mainnet only.</span>
              <button
                type="button"
                onClick={async () => {
                  if (!switchChainAsync) return;
                  try {
                    await switchChainAsync({ chainId: base.id });
                    setSwitchError(false);
                  } catch (error) {
                    console.warn('switchChain failed', error);
                    setSwitchError(true);
                  }
                }}
                className="btn-secondary px-3 py-2 text-xs"
              >
                Retry switch
              </button>
            </div>
            {switchError && (
              <div className="mt-2 text-xs text-yellow-300">
                Switch rejected. Please confirm in your wallet.
              </div>
            )}
          </div>
        )}
        {/* Screen router */}
        <div className="w-full flex-1">
          {currentScreen === 'connect' && <ConnectScreen />}
          {currentScreen === 'menu' && <MenuScreen />}
          {currentScreen === 'difficulty' && <DifficultyScreen />}
          {currentScreen === 'custom' && <CustomScreen />}
          {currentScreen === 'shop' && <ShopScreen />}
          {currentScreen === 'stats' && <StatsScreen />}
          {currentScreen === 'challenge' && <ChallengeScreen />}
          {currentScreen === 'race' && <RaceScreen />}
          {currentScreen === 'playing' && <GameScreen />}
          {currentScreen === 'ended' && <GameScreen />}
        </div>
      </div>
    </div>
  );
}
