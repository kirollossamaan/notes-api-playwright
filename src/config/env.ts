/**
 * Environment and config for Notes API tests.
 * BASE_URL is read from process.env (e.g. from .env) or falls back to the Expand Testing practice API.
 */
export const BASE_URL =
  process.env.BASE_URL || 'https://practice.expandtesting.com/notes/api';
