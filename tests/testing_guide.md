# Majadigi Backend API Testing Guide

This guide details the automated test suite implemented for the Majadigi Backend using Jest, Supertest, and Jest HTML Reporter.

---

## 1. Prerequisites and Installation

To set up the testing environment, the following packages are installed as `devDependencies`:
- `jest`: The test runner and mocking framework.
- `supertest`: An integration testing library for executing Express server endpoints without starting a real network interface.
- `jest-html-reporter`: Generates a professional HTML report file summarizing the test runs.

To install dependencies, run:
```bash
npm install
```

---

## 2. Running the Test Suite

The tests run with native ES Module support using Node's `--experimental-vm-modules` flag.

### Run All Tests
```bash
npm test
```

This command will:
1. Run all test suites matching `*.test.js`.
2. Generate an interactive HTML report at `./tests/test-report.html`.

---

## 3. Test Suites Structure

The test coverage spans across 100% of the backend features:

| Test Suite File | Feature Scope | Tested Actions / Endpoints | Mocking Strategy |
|:---|:---|:---|:---|
| `auth.test.js` | User Authentication | - Password hashing & verification<br>- JWT signing & decoding<br>- Register (`POST /auth/register`) and Login (`POST /auth/login`) routes | Mocked Prisma client databases |
| `transjatim.test.js` | Transjatim Public Transit | - Summary data aggregation<br>- Route listing<br>- Fare catalog<br>- Bus stops coordinates | Mocked Axios external API responses |
| `opendata.test.js` | Open Data Datasets | - Datasets querying<br>- HTML tag stripping and data mapping | Mocked Axios external API responses |
| `nomor-darurat.test.js` | Emergency Directory | - City lists lookup<br>- City-specific emergency numbers | Mocked Axios external API responses |
| `sapabansos.test.js` | Social Aid Eligibility | - DTKS Bansos verification<br>- Pickup date calculation (every 25th) | Mocked database + custom mock NIK profiles |
| `rumahsakit.test.js` | Integrated Hospitals | - Catalog & Bed availability (`GET /rooms`) across 5 hospitals<br>- OPD registrations (`POST /register`) & history lookup<br>- Ambulance reservation logic (`/soetomo`) | Mocked Axios + Mocked Prisma writes |
| `common_features.test.js` | Miscellaneous Services | - Activity logging (`POST /activity`) & retrieval<br>- Service catalogs (`GET /layanan/integrated`) | Mocked Prisma & Axios |

---

## 4. Mocking Pattern

### Global Database Mocking (Prisma)
To prevent tests from mutating or querying the production PostgreSQL/Supabase database, the Prisma Client is mocked globally:
```javascript
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        user: { findUnique: jest.fn(), create: jest.fn() },
        activity: { create: jest.fn() }
      };
    })
  };
});
```

### External API Mocking (Axios)
To guarantee high test speed and reliability without needing internet connectivity:
```javascript
import axios from 'axios';
jest.mock('axios');

test('should fetch data', async () => {
  axios.get.mockResolvedValueOnce({ data: { success: true } });
});
```

---

## 5. Test HTML Report

On completion, Jest produces an HTML test log at `tests/test-report.html`. You can open this file in any web browser to see:
- Execution status (Pass/Fail)
- Test execution times
- Stack traces for any failures
