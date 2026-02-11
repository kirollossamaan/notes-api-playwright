/**
 * Negative: Register validation (409, 400).
 */

import { test, expect } from '../../../fixtures/api-context';
import { randomString, randomPassword } from '../../../helpers/test-data';
import { attachResponseToReport, parseJson } from '../../../helpers/report';

test.describe('Register (negative)', () => {
  test('Register with duplicate email returns 409', async ({ api }, testInfo) => {
    const email = `${randomString('dup')}@gmail.com`;
    const password = randomPassword(10);

    await api.register({ name: randomString('User'), email, password });
    const second = await api.register({
      name: randomString('User2'),
      email,
      password: randomPassword(10),
    });
    await attachResponseToReport(testInfo, second, 'register-duplicate');
    expect(second.status()).toBe(409);

    const json = await parseJson(second);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/already exists|same email/i);
  });

  test('Register with name too short returns 400', async ({ api }, testInfo) => {
    const res = await api.register({
      name: 'Ab',
      email: `${randomString('shortname')}@gmail.com`,
      password: randomPassword(10),
    });
    await attachResponseToReport(testInfo, res, 'register-name-too-short');
    expect(res.status()).toBe(400);
    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/name.*4.*30|user name/i);
  });

  test('Register with name too long returns 400', async ({ api }, testInfo) => {
    const longName = 'A'.repeat(31);
    const res = await api.register({
      name: longName,
      email: `${randomString('longname')}@gmail.com`,
      password: randomPassword(10),
    });
    await attachResponseToReport(testInfo, res, 'register-name-too-long');
    expect(res.status()).toBe(400);
    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/name.*4.*30|user name/i);
  });

  test('Register with password too short returns 400', async ({ api }, testInfo) => {
    const res = await api.register({
      name: 'ValidName',
      email: `${randomString('shortpwd')}@gmail.com`,
      password: '12345',
    });
    await attachResponseToReport(testInfo, res, 'register-password-too-short');
    expect(res.status()).toBe(400);
    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/password.*6.*30|password must/i);
  });

  test('Register with password too long returns 400', async ({ api }, testInfo) => {
    const longPassword = 'a'.repeat(31);
    const res = await api.register({
      name: 'ValidName',
      email: `${randomString('longpwd')}@gmail.com`,
      password: longPassword,
    });
    await attachResponseToReport(testInfo, res, 'register-password-too-long');
    expect(res.status()).toBe(400);
    const json = await parseJson(res);
    expect(json.success).toBe(false);
    expect(json.message?.toLowerCase()).toMatch(/password.*6.*30|password must/i);
  });
});
