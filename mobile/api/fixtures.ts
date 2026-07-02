import { mockFixtures } from '@/mocks/fixtures';
import { client, USE_MOCKS } from './client';
import type { Fixture } from './types';

export async function getFixtures(): Promise<Fixture[]> {
  if (USE_MOCKS) return mockFixtures;
  const { data } = await client.get<Fixture[]>('/fixtures/upcoming');
  return data;
}

export async function getFixture(id: number): Promise<Fixture | undefined> {
  if (USE_MOCKS) return mockFixtures.find((f) => f.id === id);
  const { data } = await client.get<Fixture>(`/fixtures/${id}`);
  return data;
}
