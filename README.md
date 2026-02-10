# Notes API – Playwright API Tests (TypeScript)

Automated API tests for the [Swagger Notes API](https://practice.expandtesting.com/notes/api/api-docs/), built with **Microsoft Playwright** and **TypeScript**. Covers user registration, login, change password, and full CRUD on notes, including E2E and negative scenarios with response-body reporting.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project structure](#project-structure)
- [Test cases](#test-cases)
- [Installation](#installation)
- [Running tests](#running-tests)
- [Viewing the report](#viewing-the-report)
- [References](#references)

---

## Tech stack

- [Playwright](https://playwright.dev/) – API test runner
- **TypeScript**
- **Base URL:** `https://practice.expandtesting.com/notes/api` (overridable via env)

## Prerequisites

- **Node.js** 18 or later – [nodejs.org](https://nodejs.org)
- **npm**

## Project structure

```
notes-api-playwright/
├── package.json                # Dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler options
├── playwright.config.ts        # Playwright test runner config (imports BASE_URL from src/config/env)
├── .env.example                # Example env vars (e.g. BASE_URL)
├── src/
│   ├── config/
│   │   └── env.ts              # Single source for BASE_URL (used by API client and Playwright config)
│   ├── api/
│   │   └── notes-api.ts        # Reusable typed API client (users + notes)
│   ├── fixtures/
│   │   └── api-context.ts      # Playwright fixtures (injects NotesApi as `api`)
│   ├── helpers/
│   │   ├── test-data.ts        # randomString, randomPassword (shared test data)
│   │   └── report.ts           # attachResponseToReport, parseJson<T> (report + response parsing)
│   └── tests/
│       ├── e2e/
│       │   └── full-flow.spec.ts    # E2E: Register → Login → Change password → Create → Update → Delete
│       └── negative/
│           └── negative.spec.ts    # Negative and validation scenarios
└── README.md
```

## Test cases

**Total: 28 test cases** (1 E2E, 27 negative)

### E2E (`full-flow.spec.ts`)

| Test |
|------|
| Register → Login → Change password → Create note → Update note → Delete note |

### Negative (`negative.spec.ts`)

**Register**

| Test | Expected |
|------|----------|
| Register with duplicate email returns 409 | 409 |
| Register with name too short returns 400 | 400 |
| Register with name too long returns 400 | 400 |
| Register with password too short returns 400 | 400 |
| Register with password too long returns 400 | 400 |

**Login**

| Test | Expected |
|------|----------|
| Login with wrong password returns 401 | 401 |
| Login with non-existent email returns 401 | 401 |

**Change password**

| Test | Expected |
|------|----------|
| Change password without token returns 401 | 401 |
| Change password with current password too short returns 400 | 400 |
| Change password with wrong current password returns 400 | 400 |
| Change password with new password too short returns 400 | 400 |
| Change password with new password too long returns 400 | 400 |
| Change password with new password same as current returns 400 | 400 |

**Create note**

| Test | Expected |
|------|----------|
| Create note without token returns 401 | 401 |
| Create note with title too short returns 400 | 400 |
| Create note with title too long returns 400 | 400 |
| Create note with description too short returns 400 | 400 |
| Create note with description too long returns 400 | 400 |

**Update note**

| Test | Expected |
|------|----------|
| Update note without token returns 401 | 401 |
| Update note with invalid note id returns 400 | 400 |
| Update note with title too short returns 400 | 400 |
| Update note with title too long returns 400 | 400 |
| Update note with description too short returns 400 | 400 |
| Update note with description too long returns 400 | 400 |

**Delete note**

| Test | Expected |
|------|----------|
| Delete note without token returns 401 | 401 |
| Delete note with invalid note id returns 400 | 400 |
| Delete note with non-existent or already deleted id returns 404 | 404 |

Response bodies are attached to the HTML report for all requests (success and failure).

---

## Installation

From the project root (`notes-api-playwright/`):

```bash
npm install
```

## Running tests

Run all tests:

```bash
npm test
```

Run by folder (e2e only or negative only):

```bash
npx playwright test src/tests/e2e
npx playwright test src/tests/negative
```

## Viewing the report

After a run, open the HTML report:

```bash
npm run test:report
```

Or open `playwright-report/index.html` in a browser. Response bodies are included for every request in the report.

## References

- [Playwright](https://playwright.dev/)
- [Swagger Notes API](https://practice.expandtesting.com/notes/api/api-docs/)
