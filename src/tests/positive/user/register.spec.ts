/**
 * Positive: Register user returns 201 and user data.
 */

import { test, expect } from '../../../fixtures/api-context';
import type { UserData } from '../../../api/notes-api';
import { randomString, randomPassword } from '../../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../../helpers/report';

test.describe('Register (positive)', () => {
  test('Register with valid data returns 201', async ({ api }, testInfo) => {
    const name = randomString('User');
    const email = `${randomString('reg')}@gmail.com`;
    const password = randomPassword(10);

    const res = await api.register({ name, email, password });
    await attachResponseToReport(testInfo, res, 'register');
    expect(res.status()).toBe(201);

    const json = await parseJson<UserData>(res);
    expect(json.success).toBe(true);
    expect(json.data?.id).toBeDefined();
    expect(json.data?.email).toBe(email);
  });
});
