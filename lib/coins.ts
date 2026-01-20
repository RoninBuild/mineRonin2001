/**
 * Calculate coin reward based on difficulty and time
 * Formula: base_reward + time_bonus
 * Faster times = more bonus coins
 */
export function calculateCoinReward(
  difficulty: 'easy' | 'medium' | 'hard',
  timeSeconds: number
): number {
  const baseRewards = {
    easy: 5,
    medium: 10,
    hard: 20,
  };
  
  const timeThresholds = {
    easy: 30,    // Under 30s = max bonus
    medium: 60,
    hard: 120,
  };
  
  const base = baseRewards[difficulty];
  const threshold = timeThresholds[difficulty];
  
  // Bonus: up to 2x base if very fast
  const timeFactor = Math.max(0, 1 - (timeSeconds / threshold));
  const bonus = Math.floor(base * timeFactor);
  
  return base + bonus;
}
