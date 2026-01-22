"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function FarcasterReady() {
  useEffect(() => {
    // Важно: Farcaster ждёт этот сигнал, иначе висит splash
    (async () => {
      try {
        await sdk.actions.ready();
      } catch (e) {
        // если открыто не внутри Farcaster — просто молчим
      }
    })();
  }, []);

  return null;
}
