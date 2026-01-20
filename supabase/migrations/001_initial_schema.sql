-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  address VARCHAR(42) PRIMARY KEY,
  coins INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game results table
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR(42) NOT NULL REFERENCES profiles(address),
  mode VARCHAR(20) NOT NULL, -- 'casual', 'daily', 'streak', 'weekly'
  difficulty VARCHAR(10) NOT NULL,
  time_seconds INTEGER NOT NULL,
  won BOOLEAN NOT NULL,
  coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for leaderboards
CREATE INDEX idx_game_results_address ON game_results(address);
CREATE INDEX idx_game_results_mode ON game_results(mode);
CREATE INDEX idx_game_results_difficulty ON game_results(difficulty);
CREATE INDEX idx_game_results_created_at ON game_results(created_at DESC);

-- Best times leaderboard view
CREATE VIEW leaderboard_best_times AS
SELECT 
  address,
  difficulty,
  MIN(time_seconds) as best_time,
  COUNT(*) FILTER (WHERE won = true) as wins
FROM game_results
WHERE won = true AND mode = 'casual'
GROUP BY address, difficulty;

-- Win streak calculation (simplified - store current streak)
CREATE TABLE player_streaks (
  address VARCHAR(42) PRIMARY KEY REFERENCES profiles(address),
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_game_won BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly challenge entries
CREATE TABLE weekly_challenge_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR(42) NOT NULL REFERENCES profiles(address),
  week_start DATE NOT NULL,
  entry_tx_hash VARCHAR(66) NOT NULL,
  best_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(address, week_start)
);

CREATE INDEX idx_weekly_entries_week ON weekly_challenge_entries(week_start);

-- Event logs for analytics
CREATE TABLE event_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR(42),
  event_type VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_event_logs_type ON event_logs(event_type);
CREATE INDEX idx_event_logs_created_at ON event_logs(created_at DESC);

-- NFT ownership tracking (for quick queries)
CREATE TABLE nft_skins (
  address VARCHAR(42) NOT NULL REFERENCES profiles(address),
  token_id INTEGER NOT NULL,
  category VARCHAR(10) NOT NULL, -- 'field' or 'flag'
  purchase_tx_hash VARCHAR(66) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (address, token_id)
);

-- Function to update profile timestamp
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profile_timestamp();
