import axios from 'axios';

/**
 * While the backend is not live we serve hardcoded data. Flip this ONE line to
 * false once EXPO_PUBLIC_API_URL points at the hosted API, and every screen switches
 * from mock data to real HTTP calls without any other change.
 */
export const USE_MOCKS = false;

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

/** Called by AuthContext whenever the JWT changes, so requests carry the token. */
export function setAuthToken(token: string | null) {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
}
