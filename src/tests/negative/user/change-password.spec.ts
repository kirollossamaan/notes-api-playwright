/**
 * Negative: Change password validation (401, 400).
 */

import { test, expect } from '../../../fixtures/api-context';
import type { LoginData } from '../../../api/notes-api';
import { BASE_URL } from '../../../config/env';
import { randomString, randomPassword } from '../../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../../helpers/report';

test.describe('Change password (negative)', () => {
  test('Change password without token returns 401', async ({ request }, testInfo) => {
    const res = await request.post(`${BASE_URL}/users/change-password`, {
      headers: { Accept: 'application/json' },
      form: { currentPassword: 'somepass123', newPassword: 'newpass123' },
    });
    await attachResponseToReport(testInfo, res, 'change-password-no-token');
    expect(res.status()).toBe(401);
    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/no authentication token|x-auth-token/i);
  });

  test('Change password with current password too short returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('chgcurshort')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const res = await api.changePassword(
      { currentPassword: '12345', newPassword: randomPassword(10) },
      token
    );
    await attachResponseToReport(testInfo, res, 'change-password-current-too-short');
    expect(res.status()).toBe(400);
    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/current password.*6.*30/i);
  });

  test('Change password with wrong current password returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('chgpwd')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const changeRes = await api.changePassword(
      { currentPassword: 'wrongcurrent', newPassword: randomPassword(10) },
      token
    );
    await attachResponseToReport(testInfo, changeRes, 'change-password-wrong-current');
    expect(changeRes.status()).toBe(400);
    const json = await parseJson(changeRes);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/current password is incorrect/i);
  });

  test('Change password with new password too short returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('chgnewshort')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const res = await api.changePassword(
      { currentPassword: password, newPassword: '12345' },
      token
    );
    await attachResponseToReport(testInfo, res, 'change-password-new-too-short');
    expect(res.status()).toBe(400);
    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/new password.*6.*30/i);
  });

  test('Change password with new password too long returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('chgnewlong')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;
    const longNewPassword = 'a'.repeat(31);

    const res = await api.changePassword(
      { currentPassword: password, newPassword: longNewPassword },
      token
    );
    await attachResponseToReport(testInfo, res, 'change-password-new-too-long');
    expect(res.status()).toBe(400);
    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/new password.*6.*30/i);
  });

  test('Change password with new password same as current returns 400', async ({ api }, testInfo) => {
    const email = `${randomString('chgsame')}@gmail.com`;
    const password = randomPassword(10);
    await api.register({ name: randomString('User'), email, password });
    const loginRes = await api.login({ email, password });
    const loginJson = await parseJson<LoginData>(loginRes);
    const token = loginJson.data!.token;

    const res = await api.changePassword(
      { currentPassword: password, newPassword: password },
      token
    );
    await attachResponseToReport(testInfo, res, 'change-password-new-same-as-current');
    expect(res.status()).toBe(400);
    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/new password.*different|should be different/i);
  });
});
