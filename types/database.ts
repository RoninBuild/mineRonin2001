export type ProfileRow = {
  id?: string;
  address: string;
  coins: number;
  created_at?: string;
};

export type GameResultRow = {
  id?: string;
  address: string;
  mode: string;
  difficulty: string;
  time_seconds: number;
  won: boolean;
  coins_earned: number;
  created_at?: string;
};

export type PlayerStreakRow = {
  id?: string;
  address: string;
  current_streak: number;
  best_streak: number;
  last_game_won: boolean;
  updated_at?: string;
};

export type WeeklyChallengeEntryRow = {
  id?: string;
  address: string;
  week_start: string;
  entry_tx_hash: string;
  best_time?: number | null;
  created_at?: string;
};

export type EventLogRow = {
  id?: string;
  event_type: string;
  address?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

export type NftSkinRow = {
  id?: string;
  address: string;
  token_id: number;
  category: string;
  purchase_tx_hash: string;
  created_at?: string;
};
