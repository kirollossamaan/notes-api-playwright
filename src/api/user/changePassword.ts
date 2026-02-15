import type { APIRequestContext } from '@playwright/test';
import { BASE_URL } from '../../config/env';
import { ACCEPT_JSON } from '../types';

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

/** POST /users/change-password (requires x-auth-token) */
export async function changePassword(
  request: APIRequestContext,
  body: ChangePasswordBody,
  token?: string
) {
  const headers = token ? { ...ACCEPT_JSON, 'x-auth-token': token } : ACCEPT_JSON;
  return request.post(`${BASE_URL}/users/change-password`, {
    headers,
    form: body as unknown as Record<string, string>,
  });
}
