import { supabase } from './client';

export async function getOrCreateProfile(address: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('address', address.toLowerCase())
    .single();
  
  if (error && error.code === 'PGRST116') {
    // Profile doesn't exist, create it
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({ address: address.toLowerCase(), coins: 15 })
      .select()
      .single();
    
    if (createError) throw createError;
    return newProfile;
  }
  
  if (error) throw error;
  return data;
}

export async function updateCoins(address: string, amount: number) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ coins: amount })
    .eq('address', address.toLowerCase())
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function addCoins(address: string, amount: number) {
  const profile = await getOrCreateProfile(address);
  return updateCoins(address, profile.coins + amount);
}

export async function deductCoins(address: string, amount: number) {
  const profile = await getOrCreateProfile(address);
  if (profile.coins < amount) {
    throw new Error('Insufficient coins');
  }
  return updateCoins(address, profile.coins - amount);
}
