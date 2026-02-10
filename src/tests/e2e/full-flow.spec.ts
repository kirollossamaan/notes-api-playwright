/**
 * E2E spec: full user journey — Register → Login → Change password → Create note → Update note → Delete note.
 * Uses random data per run and attaches all API response bodies to the HTML report.
 */

import { test, expect } from '../../fixtures/api-context';
import type { UserData, LoginData, NoteData } from '../../api/notes-api';
import { randomString, randomPassword } from '../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../helpers/report';

const CATEGORIES = ['Home', 'Work', 'Personal'];

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

    const registerJson = await parseJson<UserData>(registerRes);
    expect(registerJson.success).toBe(true);
    expect(registerJson.status).toBe(201);
    expect(registerJson.message).toMatch(/created/i);
    expect(registerJson.data?.id).toBeDefined();
    expect(registerJson.data?.email).toBe(userEmail);

    const loginRes = await api.login({ email: userEmail, password: userPassword });
    await attachResponseToReport(testInfo, loginRes, 'login');
    expect(loginRes.status()).toBe(200);

    const loginJson = await parseJson<LoginData>(loginRes);
    expect(loginJson.success).toBe(true);
    expect(loginJson.data?.token).toBeDefined();
    const token = loginJson.data!.token;

    const changePwdRes = await api.changePassword(
      { currentPassword: userPassword, newPassword },
      token
    );
    await attachResponseToReport(testInfo, changePwdRes, 'change-password');
    expect(changePwdRes.status()).toBe(200);

    const changePwdJson = await parseJson(changePwdRes);
    expect(changePwdJson.success).toBe(true);
    expect(changePwdJson.message).toBeDefined();

    const loginAfterPwdRes = await api.login({ email: userEmail, password: newPassword });
    await attachResponseToReport(testInfo, loginAfterPwdRes, 'login-after-password-change');
    expect(loginAfterPwdRes.status()).toBe(200);
    const loginAfterPwdJson = await parseJson<LoginData>(loginAfterPwdRes);
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

    const createNoteJson = await parseJson<NoteData>(createNoteRes);
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

    const updateNoteJson = await parseJson<NoteData>(updateNoteRes);
    expect(updateNoteJson.success).toBe(true);
    expect(updateNoteJson.data?.title).toBe(updateTitle);
    expect(updateNoteJson.data?.description).toBe(updateDescription);
    expect(updateNoteJson.data?.category).toBe(updateCategory);
    expect(String(updateNoteJson.data?.completed)).toBe(completed);

    const deleteNoteRes = await api.deleteNote(noteId, tokenAfterPwd);
    await attachResponseToReport(testInfo, deleteNoteRes, 'delete-note');
    expect(deleteNoteRes.status()).toBe(200);

    const deleteNoteJson = await parseJson(deleteNoteRes);
    expect(deleteNoteJson.success).toBe(true);
    expect(deleteNoteJson.message).toBeDefined();
  });
});
