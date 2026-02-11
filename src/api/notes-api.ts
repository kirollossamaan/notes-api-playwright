/**
 * Reusable API client for the Notes API. Composes user and note endpoints.
 * Use via the `api` fixture in tests.
 */

import type { APIRequestContext } from '@playwright/test';
import * as registerModule from './user/register';
import * as loginModule from './user/login';
import * as changePasswordModule from './user/changePassword';
import * as createNoteModule from './note/createNote';
import * as updateNoteModule from './note/updateNote';
import * as deleteNoteModule from './note/deleteNote';

export type { RegisterBody } from './user/register';
export type { LoginBody } from './user/login';
export type { ChangePasswordBody } from './user/changePassword';
export type { CreateNoteBody } from './note/createNote';
export type { UpdateNoteBody } from './note/updateNote';
export type { ApiResponse, UserData, LoginData, NoteData } from './types';

export class NotesApi {
  constructor(private request: APIRequestContext) {}

  async register(body: registerModule.RegisterBody) {
    return registerModule.register(this.request, body);
  }

  async login(body: loginModule.LoginBody) {
    return loginModule.login(this.request, body);
  }

  async changePassword(body: changePasswordModule.ChangePasswordBody, token: string) {
    return changePasswordModule.changePassword(this.request, body, token);
  }

  async createNote(body: createNoteModule.CreateNoteBody, token: string) {
    return createNoteModule.createNote(this.request, body, token);
  }

  async updateNote(noteId: string, body: updateNoteModule.UpdateNoteBody, token: string) {
    return updateNoteModule.updateNote(this.request, noteId, body, token);
  }

  async deleteNote(noteId: string, token: string) {
    return deleteNoteModule.deleteNote(this.request, noteId, token);
  }
}
