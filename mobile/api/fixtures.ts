import { client, USE_MOCKS } from './client';
import type { Fixture } from './types';

const mockFixtures: Fixture[] = [
  {
    id: 'mock-1', home: 'Arsenal', homeShort: 'ARS', homeLogoUrl: '',
    away: 'Chelsea', awayShort: 'CHE', awayLogoUrl: '',
    date: '2026-05-18', time: '15:00', venue: 'Emirates Stadium', week: 'GW38',
    locked: false, finalHomeScore: null, finalAwayScore: null,
  },
  {
    id: 'mock-2', home: 'Manchester City', homeShort: 'MCI', homeLogoUrl: '',
    away: 'Liverpool', awayShort: 'LIV', awayLogoUrl: '',
    date: '2026-05-18', time: '17:30', venue: 'Etihad Stadium', week: 'GW38',
    locked: false, finalHomeScore: null, finalAwayScore: null,
  },
];

export async function getFixtures(): Promise<Fixture[]> {
  if (USE_MOCKS) return mockFixtures;
  const { data } = await client.get<Fixture[]>('/fixtures/upcoming');
  return data;
}

export async function getFixture(id: string): Promise<Fixture | undefined> {
  if (USE_MOCKS) return mockFixtures.find((f) => f.id === id);
  const { data } = await client.get<Fixture>(`/fixtures/${id}`);
  return data;
}
