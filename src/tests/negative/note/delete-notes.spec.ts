/**
 * Negative: Delete note validation (401, 400, 404).
 */

import { test, expect } from '../../../fixtures/api-context';
import type { LoginData } from '../../../api/notes-api';
import { BASE_URL } from '../../../config/env';
import { randomString, randomPassword } from '../../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../../helpers/report';

test.describe('Delete note (negative)', () => {
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
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const res = await api.deleteNote('invalid-note-id-12345', token);
    await attachResponseToReport(testInfo, res, 'delete-note-invalid-id');
    expect(res.status()).toBe(400);
    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/note id must be a valid id|valid id/i);
  });

  test('Delete note with non-existent or already deleted id returns 404', async (
    { api },
    testInfo
  ) => {
    const email = `${randomString('del404')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const createRes = await api.createNote(
      { title: 'Valid Title', description: 'Valid description', category: 'Home' },
      token
    );
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
