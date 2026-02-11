# Notes API – Playwright API Tests

Automated API test suite for the [Notes API](https://practice.expandtesting.com/notes/api/api-docs/) (Expand Testing), built with **Playwright** and **TypeScript**. The suite covers user flows (register, login, change password) and full CRUD on notes, with E2E, positive, and negative scenarios. All API responses are attached to the HTML report for debugging.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Test cases](#test-cases)
- [Running tests](#running-tests)
- [Reports](#reports)
- [CI](#ci)
- [References](#references)

## Features

- **E2E flow** – Full user journey: register → login → change password → create note → update note → delete note
- **Positive tests** – Happy-path coverage per endpoint (user and note)
- **Negative tests** – Validation and error handling (400, 401, 404, 409)
- **Typed API client** – Shared `NotesApi` with typed request/response interfaces
- **Response reporting** – Every request/response body attached to the HTML report
- **CI** – GitHub Actions workflow for runs on the `main` branch

## Tech stack

| Technology | Purpose |
|------------|--------|
| [Playwright](https://playwright.dev/) | API test runner |
| TypeScript | Typing and tooling |
| Node.js 18+ | Runtime |

## Prerequisites

- **Node.js** 18 or later — [nodejs.org](https://nodejs.org)
- **npm** (included with Node.js)

## Getting started

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd notes-api-playwright
npm install
```

Run the full test suite:

```bash
npm test
```

## Configuration

| Variable | Description | Default |
|----------|-------------|--------|
| `BASE_URL` | Notes API base URL | `https://practice.expandtesting.com/notes/api` |

Set `BASE_URL` in a `.env` file (see `.env.example`) or in the environment. The same value is used by the API client and Playwright config.

## Project structure

```
notes-api-playwright/
├── package.json
├── tsconfig.json
├── playwright.config.ts
├── .env.example
├── src/
│   ├── config/
│   │   └── env.ts              # BASE_URL (single source of truth)
│   ├── api/
│   │   ├── types.ts             # Shared types (ApiResponse, UserData, LoginData, NoteData)
│   │   ├── notes-api.ts         # NotesApi client (composes user + note endpoints)
│   │   ├── user/
│   │   │   ├── register.ts
│   │   │   ├── login.ts
│   │   │   └── changePassword.ts
│   │   └── note/
│   │       ├── createNote.ts
│   │       ├── updateNote.ts
│   │       └── deleteNote.ts
│   ├── fixtures/
│   │   └── api-context.ts       # Playwright fixture: injects NotesApi as `api`
│   ├── helpers/
│   │   ├── test-data.ts         # randomString, randomPassword
│   │   └── report.ts            # attachResponseToReport, parseJson<T>
│   └── tests/
│       ├── e2e/
│       │   └── full-flow.spec.ts
│       ├── positive/
│       │   ├── user/            # register, login, change-password
│       │   └── note/            # create, update, delete
│       └── negative/
│           ├── user/            # register, login, change-password
│           └── note/            # create, update, delete
└── README.md
```

## Test cases

**34 tests total** — 1 E2E, 6 positive, 27 negative.

| Category | Count | Description |
|----------|-------|-------------|
| E2E | 1 | Full user + notes flow |
| Positive | 6 | One happy-path test per user/note endpoint |
| Negative | 27 | Validation and error responses (400, 401, 404, 409) |

### E2E

| Test |
|------|
| Register → Login → Change password → Create note → Update note → Delete note |

### Positive (user & note)

| Area | Test |
|------|------|
| User · Register | Valid data → 201 |
| User · Login | Valid credentials → 200 + token |
| User · Change password | Valid data → 200 |
| Note · Create | Valid data → 200 |
| Note · Update | Valid data → 200 |
| Note · Delete | Valid id → 200 |

### Negative (validation & errors)

| Area | Scenarios |
|------|-----------|
| **Register** | Duplicate email (409); name/password length (400) |
| **Login** | Wrong password, non-existent email (401) |
| **Change password** | No token (401); invalid/too short/too long/same password (400) |
| **Create note** | No token (401); title/description length (400) |
| **Update note** | No token (401); invalid id, title/description length (400) |
| **Delete note** | No token (401); invalid id (400); missing/deleted id (404) |

Response bodies for all requests are attached to the HTML report (success and failure).

## Running tests

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npx playwright test src/tests/e2e` | E2E only |
| `npx playwright test src/tests/positive` | Positive only |
| `npx playwright test src/tests/negative` | Negative only |

## Reports

After a run, open the HTML report:

```bash
npm run test:report
```

Or open `playwright-report/index.html` in a browser. Each request’s response body is included in the report.

## CI

A GitHub Actions workflow runs the test suite on every push and pull request to the `main` branch. The Playwright HTML report is uploaded as an artifact (retention: 7 days).

## References

- [Playwright](https://playwright.dev/)
- [Notes API (Swagger)](https://practice.expandtesting.com/notes/api/api-docs/)
