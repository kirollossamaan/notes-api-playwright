import type { APIRequestContext } from '@playwright/test';
import { BASE_URL } from '../../config/env';
import { ACCEPT_JSON } from '../types';

/** DELETE /notes/:id (requires x-auth-token) */
export async function deleteNote(request: APIRequestContext, noteId: string, token?: string) {
  const headers = token ? { ...ACCEPT_JSON, 'x-auth-token': token } : ACCEPT_JSON;
  return request.delete(`${BASE_URL}/notes/${noteId}`, { headers });
}
