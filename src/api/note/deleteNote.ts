import type { APIRequestContext } from '@playwright/test';
import { BASE_URL } from '../../config/env';

/** DELETE /notes/:id (requires x-auth-token) */
export async function deleteNote(request: APIRequestContext, noteId: string, token: string) {
  return request.delete(`${BASE_URL}/notes/${noteId}`, {
    headers: {
      Accept: 'application/json',
      'x-auth-token': token,
    },
  });
}
