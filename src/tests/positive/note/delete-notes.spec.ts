/**
 * Positive: Delete note returns 200.
 */

import { test, expect } from '../../../fixtures/api-context';
import type { LoginData, NoteData } from '../../../api/notes-api';
import { randomString, randomPassword } from '../../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../../helpers/report';

test.describe('Delete note (positive)', () => {
  test('Delete note returns 200', async ({ api }, testInfo) => {
    const email = `${randomString('dnote')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const createRes = await api.createNote(
      { title: 'To Delete', description: 'Will be deleted', category: 'Home' },
      token
    );
    const createJson = await parseJson<NoteData>(createRes);
    const noteId = createJson.data!.id;

    const res = await api.deleteNote(noteId, token);
    await attachResponseToReport(testInfo, res, 'delete-note');
    expect(res.status()).toBe(200);

    const json = await parseJson(res);
    expect(json.success).toBe(true);
  });
});
