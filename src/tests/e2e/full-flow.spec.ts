/**
 * E2E spec: full user journey — Register → Login → Change password → Create note → Update note → Delete note.
 * Uses random data per run and attaches all API response bodies to the HTML report.
 */

import { test, expect } from '../../fixtures/api-context';
import type { APIResponse } from '@playwright/test';
import type { ApiResponse, UserData, LoginData, NoteData } from '../../api/notes-api';

const CATEGORIES = ['Home', 'Work', 'Personal'];

/** Unique string for dynamic test data (avoids collisions across runs). */
function randomString(prefix: string): string {
  return prefix + Date.now() + Math.floor(Math.random() * 10000);
}

/** Random alphanumeric password of given length. */
function randomPassword(len: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

/** Attach response body to the test report for debugging (shown in HTML report). */
async function attachResponseToReport(
  testInfo: { attach: (name: string, options: { body: string; contentType: string }) => Promise<void> },
  response: APIResponse,
  label: string
): Promise<void> {
  const body = await response.text();
  const status = response.status();
  await testInfo.attach('response-' + label + ' (' + status + ')', { body, contentType: 'application/json' });
}

test.describe('Full E2E flow', () => {
  test('Register -> Login -> Change password -> Create note -> Update note -> Delete note', async (
    { api },
    testInfo
  ) => {
    const userName = randomString('TestUser');
    const userEmail = randomString('testuser') + '@gmail.com';
    const userPassword = randomPassword(10);
    const newPassword = randomPassword(12);

    const registerRes = await api.register({ name: userName, email: userEmail, password: userPassword });
    await attachResponseToReport(testInfo, registerRes, 'register');
    expect(registerRes.status()).toBe(201);

    const registerJson = (await registerRes.json()) as ApiResponse<UserData>;
    expect(registerJson.success).toBe(true);
    expect(registerJson.status).toBe(201);
    expect(registerJson.message).toMatch(/created/i);
    expect(registerJson.data?.id).toBeDefined();
    expect(registerJson.data?.email).toBe(userEmail);

    const loginRes = await api.login({ email: userEmail, password: userPassword });
    await attachResponseToReport(testInfo, loginRes, 'login');
    expect(loginRes.status()).toBe(200);

    const loginJson = (await loginRes.json()) as ApiResponse<LoginData>;
    expect(loginJson.success).toBe(true);
    expect(loginJson.data?.token).toBeDefined();
    const token = loginJson.data!.token;

    const changePwdRes = await api.changePassword(
      { currentPassword: userPassword, newPassword },
      token
    );
    await attachResponseToReport(testInfo, changePwdRes, 'change-password');
    expect(changePwdRes.status()).toBe(200);

    const changePwdJson = (await changePwdRes.json()) as ApiResponse;
    expect(changePwdJson.success).toBe(true);
    expect(changePwdJson.message).toBeDefined();

    const loginAfterPwdRes = await api.login({ email: userEmail, password: newPassword });
    await attachResponseToReport(testInfo, loginAfterPwdRes, 'login-after-password-change');
    expect(loginAfterPwdRes.status()).toBe(200);
    const loginAfterPwdJson = (await loginAfterPwdRes.json()) as ApiResponse<LoginData>;
    expect(loginAfterPwdJson.success).toBe(true);
    const tokenAfterPwd = loginAfterPwdJson.data!.token;

    const noteTitle = randomString('Note Title ');
    const noteDescription = randomString('Description ');
    const noteCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    const createNoteRes = await api.createNote(
      { title: noteTitle, description: noteDescription, category: noteCategory },
      tokenAfterPwd
    );
    await attachResponseToReport(testInfo, createNoteRes, 'create-note');
    expect(createNoteRes.status()).toBe(200);

    const createNoteJson = (await createNoteRes.json()) as ApiResponse<NoteData>;
    expect(createNoteJson.success).toBe(true);
    expect(createNoteJson.data?.id).toBeDefined();
    const noteId = createNoteJson.data!.id;

    const updateTitle = randomString('Updated Title ');
    const updateDescription = randomString('Updated Description ');
    const updateCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const completed = 'true';

    const updateNoteRes = await api.updateNote(
      noteId,
      { title: updateTitle, description: updateDescription, category: updateCategory, completed },
      tokenAfterPwd
    );
    await attachResponseToReport(testInfo, updateNoteRes, 'update-note');
    expect(updateNoteRes.status()).toBe(200);

    const updateNoteJson = (await updateNoteRes.json()) as ApiResponse<NoteData>;
    expect(updateNoteJson.success).toBe(true);
    expect(updateNoteJson.data?.title).toBe(updateTitle);
    expect(updateNoteJson.data?.description).toBe(updateDescription);
    expect(updateNoteJson.data?.category).toBe(updateCategory);
    expect(String(updateNoteJson.data?.completed)).toBe(completed);

    const deleteNoteRes = await api.deleteNote(noteId, tokenAfterPwd);
    await attachResponseToReport(testInfo, deleteNoteRes, 'delete-note');
    expect(deleteNoteRes.status()).toBe(200);

    const deleteNoteJson = (await deleteNoteRes.json()) as ApiResponse;
    expect(deleteNoteJson.success).toBe(true);
    expect(deleteNoteJson.message).toBeDefined();
  });
});
