/**
 * Negative: Update note validation (401, 400).
 */

import { test, expect } from '../../../fixtures/api-context';
import type { LoginData } from '../../../api/notes-api';
import { randomString, randomPassword } from '../../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../../helpers/report';

test.describe('Update note (negative)', () => {
  test('Update note without token returns 401', async ({ api }, testInfo) => {
    const res = await api.updateNote('507f1f77bcf86cd799439011', {
      title: 'Valid Title',
      description: 'Valid description here',
      category: 'Home',
      completed: 'false',
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
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const createRes = await api.createNote(
      { title: 'Valid Title Here', description: 'Valid description here', category: 'Home' },
      token
    );
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
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const createRes = await api.createNote(
      { title: 'Valid Title', description: 'Valid description', category: 'Home' },
      token
    );
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
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const createRes = await api.createNote(
      { title: 'Valid Title Here', description: 'Valid description here', category: 'Home' },
      token
    );
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
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const createRes = await api.createNote(
      { title: 'Valid Title', description: 'Valid description', category: 'Home' },
      token
    );
    const createJson = await parseJson<{ id: string }>(createRes);
    const noteId = createJson.data!.id;
    const longDescription = 'a'.repeat(1001);

    const res = await api.updateNote(
      noteId,
      {
        title: 'Valid Title',
        description: longDescription,
        category: 'Home',
        completed: 'false',
      },
      token
    );
    await attachResponseToReport(testInfo, res, 'update-note-description-too-long');
    expect(res.status()).toBe(400);
    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/description.*4.*1000/i);
  });
});
