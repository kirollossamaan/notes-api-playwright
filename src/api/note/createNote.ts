import type { APIRequestContext } from '@playwright/test';
import { BASE_URL } from '../../config/env';
import { ACCEPT_JSON } from '../types';

export interface CreateNoteBody {
  title: string;
  description: string;
  category: string;
}

/** POST /notes (requires x-auth-token) */
export async function createNote(
  request: APIRequestContext,
  body: CreateNoteBody,
  token?: string
) {
  const headers = token ? { ...ACCEPT_JSON, 'x-auth-token': token } : ACCEPT_JSON;
  return request.post(`${BASE_URL}/notes`, {
    headers,
    form: body as unknown as Record<string, string>,
  });
}
