/**
 * Positive: Change password returns 200.
 */

import { test, expect } from '../../../fixtures/api-context';
import type { LoginData } from '../../../api/notes-api';
import { randomString, randomPassword } from '../../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../../helpers/report';

test.describe('Change password (positive)', () => {
  test('Change password with valid data returns 200', async ({ api }, testInfo) => {
    const email = `${randomString('chpwd')}@gmail.com`;
    const password = randomPassword(10);
    const newPassword = randomPassword(12);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    expect(loginRes.status()).toBe(200);
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const res = await api.changePassword(
      { currentPassword: password, newPassword },
      token
    );
    await attachResponseToReport(testInfo, res, 'change-password');
    expect(res.status()).toBe(200);

    const json = await parseJson(res);
    expect(json.success).toBe(true);
  });
});
