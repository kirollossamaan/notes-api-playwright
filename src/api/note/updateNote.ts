import type { APIRequestContext } from '@playwright/test';
import { BASE_URL } from '../../config/env';
import { ACCEPT_JSON } from '../types';

export interface UpdateNoteBody {
  title: string;
  description: string;
  category: string;
  completed: string;
}

/** PUT /notes/:id (requires x-auth-token) */
export async function updateNote(
  request: APIRequestContext,
  noteId: string,
  body: UpdateNoteBody,
  token?: string
) {
  const headers = token ? { ...ACCEPT_JSON, 'x-auth-token': token } : ACCEPT_JSON;
  return request.put(`${BASE_URL}/notes/${noteId}`, {
    headers,
    form: body as unknown as Record<string, string>,
  });
}
