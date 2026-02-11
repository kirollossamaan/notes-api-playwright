/**
 * Helpers for attaching API responses to the report and parsing JSON responses.
 */

import type { APIResponse } from '@playwright/test';
import type { ApiResponse } from '../api/types';

/** Test info with attach (minimal type for report helpers). */
export interface TestInfoAttach {
  attach: (name: string, options: { body: string; contentType: string }) => Promise<void>;
}

/** Attach response body to the test report for debugging (shown in HTML report). */
export async function attachResponseToReport(
  testInfo: TestInfoAttach,
  response: APIResponse,
  label: string
): Promise<void> {
  const body = await response.text();
  const status = response.status();
  await testInfo.attach(`response-${label} (${status})`, { body, contentType: 'application/json' });
}

/** Parse JSON body of an API response as ApiResponse<T>. */
export async function parseJson<T>(response: APIResponse): Promise<ApiResponse<T>> {
  return (await response.json()) as ApiResponse<T>;
}
