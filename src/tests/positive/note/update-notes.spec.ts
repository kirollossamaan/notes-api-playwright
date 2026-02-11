/**
 * Positive: Update note returns 200.
 */

import { test, expect } from '../../../fixtures/api-context';
import type { LoginData, NoteData } from '../../../api/notes-api';
import { randomString, randomPassword } from '../../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../../helpers/report';

test.describe('Update note (positive)', () => {
  test('Update note with valid data returns 200', async ({ api }, testInfo) => {
    const email = `${randomString('unote')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const createRes = await api.createNote(
      { title: 'Original', description: 'Original desc', category: 'Home' },
      token
    );
    const createJson = await parseJson<NoteData>(createRes);
    const noteId = createJson.data!.id;

    const newTitle = randomString('Updated ');
    const newDesc = randomString('Updated desc ');
    const res = await api.updateNote(
      noteId,
      { title: newTitle, description: newDesc, category: 'Work', completed: 'true' },
      token
    );
    await attachResponseToReport(testInfo, res, 'update-note');
    expect(res.status()).toBe(200);

    const json = await parseJson<NoteData>(res);
    expect(json.success).toBe(true);
    expect(json.data?.title).toBe(newTitle);
    expect(json.data?.description).toBe(newDesc);
  });
});
