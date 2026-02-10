import type { APIRequestContext } from '@playwright/test';
import { BASE_URL } from '../config/env';

const ACCEPT_JSON = { Accept: 'application/json' };

/** Request/response body types */

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface CreateNoteBody {
  title: string;
  description: string;
  category: string;
}

export interface UpdateNoteBody {
  title: string;
  description: string;
  category: string;
  completed: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  status?: number;
  data?: T;
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
}

export interface LoginData {
  id: string;
  name: string;
  email: string;
  token: string;
}

export interface NoteData {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
}

export class NotesApi {
  constructor(private request: APIRequestContext) {}

  /** POST /users/register */
  async register(body: RegisterBody) {
    return this.request.post(`${BASE_URL}/users/register`, {
      headers: ACCEPT_JSON,
      form: body as unknown as Record<string, string>,
    });
  }

  /** POST /users/login */
  async login(body: LoginBody) {
    return this.request.post(`${BASE_URL}/users/login`, {
      headers: ACCEPT_JSON,
      form: body as unknown as Record<string, string>,
    });
  }

  /** POST /users/change-password (requires x-auth-token) */
  async changePassword(body: ChangePasswordBody, token: string) {
    return this.request.post(`${BASE_URL}/users/change-password`, {
      headers: { ...ACCEPT_JSON, 'x-auth-token': token },
      form: body as unknown as Record<string, string>,
    });
  }

  /** POST /notes (requires x-auth-token) */
  async createNote(body: CreateNoteBody, token: string) {
    return this.request.post(`${BASE_URL}/notes`, {
      headers: { ...ACCEPT_JSON, 'x-auth-token': token },
      form: body as unknown as Record<string, string>,
    });
  }

  /** PUT /notes/:id (requires x-auth-token) */
  async updateNote(noteId: string, body: UpdateNoteBody, token: string) {
    return this.request.put(`${BASE_URL}/notes/${noteId}`, {
      headers: { ...ACCEPT_JSON, 'x-auth-token': token },
      form: body as unknown as Record<string, string>,
    });
  }

  /** DELETE /notes/:id (requires x-auth-token) */
  async deleteNote(noteId: string, token: string) {
    return this.request.delete(`${BASE_URL}/notes/${noteId}`, {
      headers: {
        Accept: 'application/json',
        'x-auth-token': token,
      },
    });
  }
}
