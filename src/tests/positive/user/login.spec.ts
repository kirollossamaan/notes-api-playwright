/**
 * Positive: Login returns 200 and token.
 */

import { test, expect } from '../../../fixtures/api-context';
import type { LoginData } from '../../../api/notes-api';
import { randomString, randomPassword } from '../../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../../helpers/report';

test.describe('Login (positive)', () => {
  test('Login with valid credentials returns 200 and token', async ({ api }, testInfo) => {
    const email = `${randomString('login')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });

    const res = await api.login({ email, password });
    await attachResponseToReport(testInfo, res, 'login');
    expect(res.status()).toBe(200);

    const json = await parseJson<LoginData>(res);
    expect(json.success).toBe(true);
    expect(json.data?.token).toBeDefined();
  });
});
