import { supabase } from './client';

type GameResult = {
  address: string;
  mode: string;
  difficulty: string;
  timeSeconds: number;
  won: boolean;
  coinsEarned?: number;
};

export async function saveGameResult(result: GameResult) {
  const { data, error } = await supabase
    .from('game_results')
    .insert({
      address: result.address.toLowerCase(),
      mode: result.mode,
      difficulty: result.difficulty,
      time_seconds: result.timeSeconds,
      won: result.won,
      coins_earned: result.coinsEarned || 0,
    })
    .select()
    .single();

  if (error) throw error;

  // Update streak if applicable
  if (result.mode === 'streak' || result.mode === 'casual') {
    await updateStreak(result.address, result.won);
  }

  return data;
}

async function updateStreak(address: string, won: boolean) {
  const { data: currentStreak } = await supabase
    .from('player_streaks')
    .select('*')
    .eq('address', address.toLowerCase())
    .single();

  if (!currentStreak) {
    await supabase.from('player_streaks').insert({
      address: address.toLowerCase(),
      current_streak: won ? 1 : 0,
      best_streak: won ? 1 : 0,
      last_game_won: won,
    });
    return;
  }

  let newCurrentStreak = won
    ? currentStreak.last_game_won
      ? currentStreak.current_streak + 1
      : 1
    : 0;

  let newBestStreak = Math.max(currentStreak.best_streak, newCurrentStreak);

  await supabase
    .from('player_streaks')
    .update({
      current_streak: newCurrentStreak,
      best_streak: newBestStreak,
      last_game_won: won,
    })
    .eq('address', address.toLowerCase());
}
