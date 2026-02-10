/**
 * Playwright fixtures that inject a typed NotesApi client into tests.
 * Use the `api` fixture to call register, login, changePassword, createNote, updateNote, deleteNote.
 */

import { test as base } from '@playwright/test';
import { NotesApi } from '../api/notes-api';

type ApiFixtures = {
  api: NotesApi;
};

export const test = base.extend<ApiFixtures>({
  api: async ({ request }, use) => {
    await use(new NotesApi(request));
  },
});

export { expect } from '@playwright/test';
