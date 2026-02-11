import type { APIRequestContext } from '@playwright/test';
import { BASE_URL } from '../../config/env';
import { ACCEPT_JSON } from '../types';

export interface LoginBody {
  email: string;
  password: string;
}

/** POST /users/login */
export async function login(request: APIRequestContext, body: LoginBody) {
  return request.post(`${BASE_URL}/users/login`, {
    headers: ACCEPT_JSON,
    form: body as unknown as Record<string, string>,
  });
}
