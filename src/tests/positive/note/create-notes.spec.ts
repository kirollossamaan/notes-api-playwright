/**
 * Positive: Create note returns 200 and note data.
 */

import { test, expect } from '../../../fixtures/api-context';
import type { LoginData, NoteData } from '../../../api/notes-api';
import { randomString, randomPassword } from '../../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../../helpers/report';

test.describe('Create note (positive)', () => {
  test('Create note with valid data returns 200', async ({ api }, testInfo) => {
    const email = `${randomString('cnote')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const title = randomString('Note ');
    const description = randomString('Description ');
    const res = await api.createNote(
      { title, description, category: 'Home' },
      token
    );
    await attachResponseToReport(testInfo, res, 'create-note');
    expect(res.status()).toBe(200);

    const json = await parseJson<NoteData>(res);
    expect(json.success).toBe(true);
    expect(json.data?.id).toBeDefined();
    expect(json.data?.title).toBe(title);
  });
});
