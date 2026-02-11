/**
 * Shared API request/response types for Notes API.
 */

export const ACCEPT_JSON = { Accept: 'application/json' as const };

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
