import { client } from './client';
import type { UserProfile, UserStats } from './types';

export async function getProfile(): Promise<UserProfile> {
  const { data } = await client.get<UserProfile>('/user/profile');
  return data;
}

export async function getStats(): Promise<UserStats> {
  const { data } = await client.get<UserStats>('/user/stats');
  return data;
}
