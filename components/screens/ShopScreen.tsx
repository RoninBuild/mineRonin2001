'use client';

import { useAppStore } from '@/store/app-store';
import Button from '@/components/ui/Button';

export default function ShopScreen() {
  const { setScreen } = useAppStore();
  return (
    <div className="flex flex-col items-center h-full gap-4 py-2 overflow-y-auto">
      <h2 className="text-2xl font-bold text-blue-500">SHOP</h2>
      <div className="panel w-full max-w-sm text-center text-sm text-gray-400">
        Shop is disabled in this build.
      </div>

      <Button onClick={() => setScreen('menu')} variant="secondary">
        BACK
      </Button>
    </div>
  );
}
