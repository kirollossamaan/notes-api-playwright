import type { APIRequestContext } from '@playwright/test';
import { BASE_URL } from '../../config/env';
import { ACCEPT_JSON } from '../types';

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

/** POST /users/register */
export async function register(request: APIRequestContext, body: RegisterBody) {
  return request.post(`${BASE_URL}/users/register`, {
    headers: ACCEPT_JSON,
    form: body as unknown as Record<string, string>,
  });
}
