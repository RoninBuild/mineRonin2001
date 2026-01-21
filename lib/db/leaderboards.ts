import { supabase } from './client';

export async function getDailyLeaderboard() {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('game_results')
    .select('address, time_seconds')
    .eq('mode', 'daily')
    .gte('created_at', today)
    .eq('won', true)
    .order('time_seconds', { ascending: true })
    .limit(50);

  if (error) throw error;

  const rows = (data as { address: string; time_seconds: number }[] | null) ?? [];
  return rows.map((d) => ({ address: d.address, time: d.time_seconds }));
}

export async function getStreakLeaderboard() {
  const { data, error } = await supabase
    .from('player_streaks')
    .select('address, best_streak')
    .order('best_streak', { ascending: false })
    .limit(50);

  if (error) throw error;

  const rows = (data as { address: string; best_streak: number }[] | null) ?? [];
  return rows.map((d) => ({ address: d.address, streak: d.best_streak }));
}

export async function getWeeklyLeaderboard() {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday

  const { data, error } = await supabase
    .from('weekly_challenge_entries')
    .select('address, best_time')
    .gte('week_start', weekStart.toISOString().split('T')[0])
    .not('best_time', 'is', null)
    .order('best_time', { ascending: true })
    .limit(50);

  if (error) throw error;

  const rows = (data as { address: string; best_time: number }[] | null) ?? [];
  return rows.map((d) => ({ address: d.address, time: d.best_time }));
}
