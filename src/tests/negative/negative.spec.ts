/**
 * Negative and validation tests for the Notes API.
 * Covers: Register (409/400), Login (401), Change password (401/400), Create/Update/Delete note (401/400/404).
 * All response bodies are attached to the HTML report for debugging.
 */

import { test, expect } from '../../fixtures/api-context';
import type { LoginData } from '../../api/notes-api';
import { BASE_URL } from '../../config/env';
import { randomString, randomPassword } from '../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../helpers/report';

test.describe('Negative scenarios', () => {
  // --- Register ---
  test('Register with duplicate email returns 409', async ({ api }, testInfo) => {
    const email = `${randomString('dup')}@gmail.com`;
    const password = randomPassword(10);

    const first = await api.register({
      name: randomString('User'),
      email,
      password,
    });
    expect(first.status()).toBe(201);

    const second = await api.register({
      name: randomString('User2'),
      email,
      password: randomPassword(10),
    });
    await attachResponseToReport(testInfo, second, 'register-duplicate');
    expect(second.status()).toBe(409);

    const json = await parseJson(second);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/already exists|same email/i);
  });

  test('Register with name too short returns 400', async ({ api }, testInfo) => {
    const res = await api.register({
      name: 'Ab',
      email: `${randomString('shortname')}@gmail.com`,
      password: randomPassword(10),
    });
    await attachResponseToReport(testInfo, res, 'register-name-too-short');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/name.*4.*30|user name/i);
  });

  test('Register with name too long returns 400', async ({ api }, testInfo) => {
    const longName = 'A'.repeat(31);
    const res = await api.register({
      name: longName,
      email: `${randomString('longname')}@gmail.com`,
      password: randomPassword(10),
    });
    await attachResponseToReport(testInfo, res, 'register-name-too-long');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/name.*4.*30|user name/i);
  });

  test('Register with password too short returns 400', async ({ api }, testInfo) => {
    const res = await api.register({
      name: 'ValidName',
      email: `${randomString('shortpwd')}@gmail.com`,
      password: '12345',
    });
    await attachResponseToReport(testInfo, res, 'register-password-too-short');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/password.*6.*30|password must/i);
  });

  test('Register with password too long returns 400', async ({ api }, testInfo) => {
    const longPassword = 'a'.repeat(31);
    const res = await api.register({
      name: 'ValidName',
      email: `${randomString('longpwd')}@gmail.com`,
      password: longPassword,
    });
    await attachResponseToReport(testInfo, res, 'register-password-too-long');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/password.*6.*30|password must/i);
  });

  // --- Login ---
  test('Login with wrong password returns 401', async ({ api }, testInfo) => {
    const email = `${randomString('wrongpwd')}@gmail.com`;
    const password = randomPassword(10);

    await api.register({ name: randomString('User'), email, password });

    const loginRes = await api.login({ email, password: 'wrongpassword123' });
    await attachResponseToReport(testInfo, loginRes, 'login-wrong-password');
    expect(loginRes.status()).toBe(401);

    const json = await parseJson(loginRes);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/incorrect email address or password/i);
  });

  test('Login with non-existent email returns 401', async ({ api }, testInfo) => {
    const loginRes = await api.login({
      email: 'nonexistent@example.com',
      password: 'somepassword',
    });
    await attachResponseToReport(testInfo, loginRes, 'login-nonexistent');
    expect(loginRes.status()).toBe(401);

    const json = await parseJson(loginRes);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/incorrect email address or password/i);
  });

  // --- Change password ---
  test('Change password without token returns 401', async ({ request }, testInfo) => {
    const res = await request.post(`${BASE_URL}/users/change-password`, {
      headers: { Accept: 'application/json' },
      form: { currentPassword: 'somepass123', newPassword: 'newpass123' },
    });
    await attachResponseToReport(testInfo, res, 'change-password-no-token');
    expect(res.status()).toBe(401);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/no authentication token|x-auth-token/i);
  });

  test('Change password with current password too short returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('chgcurshort')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const res = await api.changePassword(
      { currentPassword: '12345', newPassword: randomPassword(10) },
      token
    );
    await attachResponseToReport(testInfo, res, 'change-password-current-too-short');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/current password.*6.*30/i);
  });

  test('Change password with wrong current password returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('chgpwd')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });

    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const changeRes = await api.changePassword(
      { currentPassword: 'wrongcurrent', newPassword: randomPassword(10) },
      token
    );
    await attachResponseToReport(testInfo, changeRes, 'change-password-wrong-current');
    expect(changeRes.status()).toBe(400);

    const json = await parseJson(changeRes);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/current password is incorrect/i);
  });

  test('Change password with new password too short returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('chgnewshort')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const res = await api.changePassword(
      { currentPassword: password, newPassword: '12345' },
      token
    );
    await attachResponseToReport(testInfo, res, 'change-password-new-too-short');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/new password.*6.*30/i);
  });

  test('Change password with new password too long returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('chgnewlong')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;
    const longNewPassword = 'a'.repeat(31);

    const res = await api.changePassword(
      { currentPassword: password, newPassword: longNewPassword },
      token
    );
    await attachResponseToReport(testInfo, res, 'change-password-new-too-long');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/new password.*6.*30/i);
  });

  test('Change password with new password same as current returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('chgsame')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const res = await api.changePassword(
      { currentPassword: password, newPassword: password },
      token
    );
    await attachResponseToReport(testInfo, res, 'change-password-new-same-as-current');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/new password.*different|should be different/i);
  });

  // --- Create note ---
  test('Create note without token returns 401', async ({ request }, testInfo) => {
    const res = await request.post(`${BASE_URL}/notes`, {
      headers: { Accept: 'application/json' },
      form: { title: 'Valid Title', description: 'Valid description here', category: 'Home' },
    });
    await attachResponseToReport(testInfo, res, 'create-note-no-token');
    expect(res.status()).toBe(401);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/no authentication token|x-auth-token/i);
  });

  test('Create note with title too short returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('notetitleshort')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const res = await api.createNote(
      { title: 'Ab', description: 'Valid description with enough chars', category: 'Home' },
      token
    );
    await attachResponseToReport(testInfo, res, 'create-note-title-too-short');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/title.*4.*100/i);
  });

  test('Create note with title too long returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('notetitlelong')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;
    const longTitle = 'A'.repeat(101);

    const res = await api.createNote(
      { title: longTitle, description: 'Valid description', category: 'Home' },
      token
    );
    await attachResponseToReport(testInfo, res, 'create-note-title-too-long');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/title.*4.*100/i);
  });

  test('Create note with description too short returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('notedescshort')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const res = await api.createNote(
      { title: 'Valid Title Here', description: 'Ab', category: 'Home' },
      token
    );
    await attachResponseToReport(testInfo, res, 'create-note-description-too-short');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/description.*4.*1000/i);
  });

  test('Create note with description too long returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('notedesclong')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;
    const longDescription = 'a'.repeat(1001);

    const res = await api.createNote(
      { title: 'Valid Title', description: longDescription, category: 'Home' },
      token
    );
    await attachResponseToReport(testInfo, res, 'create-note-description-too-long');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/description.*4.*1000/i);
  });

  // --- Update note ---
  test('Update note without token returns 401', async ({ request }, testInfo) => {
    const res = await request.put(`${BASE_URL}/notes/507f1f77bcf86cd799439011`, {
      headers: { Accept: 'application/json' },
      form: { title: 'Valid Title', description: 'Valid description here', category: 'Home', completed: 'false' },
    });
    await attachResponseToReport(testInfo, res, 'update-note-no-token');
    expect(res.status()).toBe(401);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/no authentication token|x-auth-token/i);
  });

  test('Update note with invalid note id returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('updinv')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const res = await api.updateNote(
      'invalid-note-id-12345',
      {
        title: 'Valid Title Here',
        description: 'Valid description here',
        category: 'Home',
        completed: 'false',
      },
      token
    );
    await attachResponseToReport(testInfo, res, 'update-note-invalid-id');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/note id must be a valid id|valid id/i);
  });

  test('Update note with title too short returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('updtitleshort')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const createRes = await api.createNote(
      { title: 'Valid Title Here', description: 'Valid description here', category: 'Home' },
      token
    );
    expect(createRes.status()).toBe(200);
    const createJson = await parseJson<{ id: string }>(createRes);
    const noteId = createJson.data!.id;

    const res = await api.updateNote(
      noteId,
      { title: 'Ab', description: 'Valid description here', category: 'Home', completed: 'false' },
      token
    );
    await attachResponseToReport(testInfo, res, 'update-note-title-too-short');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/title.*4.*100/i);
  });

  test('Update note with title too long returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('updtitlelong')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const createRes = await api.createNote(
      { title: 'Valid Title', description: 'Valid description', category: 'Home' },
      token
    );
    expect(createRes.status()).toBe(200);
    const createJson = await parseJson<{ id: string }>(createRes);
    const noteId = createJson.data!.id;
    const longTitle = 'A'.repeat(101);

    const res = await api.updateNote(
      noteId,
      { title: longTitle, description: 'Valid description', category: 'Home', completed: 'false' },
      token
    );
    await attachResponseToReport(testInfo, res, 'update-note-title-too-long');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/title.*4.*100/i);
  });

  test('Update note with description too short returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('upddescshort')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const createRes = await api.createNote(
      { title: 'Valid Title Here', description: 'Valid description here', category: 'Home' },
      token
    );
    expect(createRes.status()).toBe(200);
    const createJson = await parseJson<{ id: string }>(createRes);
    const noteId = createJson.data!.id;

    const res = await api.updateNote(
      noteId,
      { title: 'Valid Title', description: 'Ab', category: 'Home', completed: 'false' },
      token
    );
    await attachResponseToReport(testInfo, res, 'update-note-description-too-short');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/description.*4.*1000/i);
  });

  test('Update note with description too long returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('upddesclong')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const createRes = await api.createNote(
      { title: 'Valid Title', description: 'Valid description', category: 'Home' },
      token
    );
    expect(createRes.status()).toBe(200);
    const createJson = await parseJson<{ id: string }>(createRes);
    const noteId = createJson.data!.id;
    const longDescription = 'a'.repeat(1001);

    const res = await api.updateNote(
      noteId,
      { title: 'Valid Title', description: longDescription, category: 'Home', completed: 'false' },
      token
    );
    await attachResponseToReport(testInfo, res, 'update-note-description-too-long');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/description.*4.*1000/i);
  });

  // --- Delete note ---
  test('Delete note without token returns 401', async ({ request }, testInfo) => {
    const res = await request.delete(`${BASE_URL}/notes/507f1f77bcf86cd799439011`, {
      headers: { Accept: 'application/json' },
    });
    await attachResponseToReport(testInfo, res, 'delete-note-no-token');
    expect(res.status()).toBe(401);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/no authentication token|x-auth-token/i);
  });

  test('Delete note with invalid note id returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('delinv')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const res = await api.deleteNote('invalid-note-id-12345', token);
    await attachResponseToReport(testInfo, res, 'delete-note-invalid-id');
    expect(res.status()).toBe(400);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/note id must be a valid id|valid id/i);
  });

  test('Delete note with non-existent or already deleted id returns 404', async ({ api }, testInfo) => {
    const email = `${randomString('del404')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const createRes = await api.createNote(
      { title: 'Valid Title', description: 'Valid description', category: 'Home' },
      token
    );
    expect(createRes.status()).toBe(200);
    const createJson = await parseJson<{ id: string }>(createRes);
    const noteId = createJson.data!.id;

    const firstDelete = await api.deleteNote(noteId, token);
    expect(firstDelete.status()).toBe(200);

    const res = await api.deleteNote(noteId, token);
    await attachResponseToReport(testInfo, res, 'delete-note-already-deleted');
    expect(res.status()).toBe(404);

    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/no note was found|maybe it was deleted/i);
  });
});
