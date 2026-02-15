/**
 * Negative: Create note validation (401, 400).
 */

import { test, expect } from '../../../fixtures/api-context';
import type { LoginData } from '../../../api/notes-api';
import { randomString, randomPassword } from '../../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../../helpers/report';

test.describe('Create note (negative)', () => {
  test('Create note without token returns 401', async ({ api }, testInfo) => {
    const res = await api.createNote({
      title: 'Valid Title',
      description: 'Valid description here',
      category: 'Home',
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
});
