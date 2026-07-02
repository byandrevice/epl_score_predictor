import { client, USE_MOCKS } from './client';
import type { AuthResponse, LoginPayload, RegisterPayload, VerifyPayload } from './types';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (USE_MOCKS) return { success: true, token: 'mock-jwt-token', message: 'Mock login' };
  const { data } = await client.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  if (USE_MOCKS) return { success: true, message: 'Mock account created — check email to verify' };
  const { data } = await client.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function verifyEmail(payload: VerifyPayload): Promise<AuthResponse> {
  if (USE_MOCKS) return { success: true, message: 'Mock email verified' };
  const { data } = await client.post<AuthResponse>('/auth/verify-email', payload);
  return data;
}

export async function resendCode(email: string): Promise<AuthResponse> {
  if (USE_MOCKS) return { success: true, message: 'Mock code resent' };
  const { data } = await client.post<AuthResponse>('/auth/resend-code', { email });
  return data;
}
