/**
 * Negative: Login validation (401).
 */

import { test, expect } from '../../../fixtures/api-context';
import { randomString, randomPassword } from '../../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../../helpers/report';

test.describe('Login (negative)', () => {
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
});
