---
name: testing-guard
description: Ensure all code changes run tests, analyze failures, and provide structured test reports.
---

# Testing Guard Skill

This skill enforces mandatory test execution after code modifications.

Use this skill whenever:

- modifying source code
- refactoring logic
- updating dependencies
- fixing bugs
- generating features
- modifying APIs
- changing React components
- updating server logic

---

# Required Workflow

Follow these steps in order.

## Step 1 — Analyze Existing Tests

Before writing code:

- locate existing test files
- identify test framework
- identify test coverage
- identify snapshot tests
- identify E2E tests

Supported frameworks:

- Vitest
- Jest
- Playwright
- Cypress
- Testing Library

---

## Step 2 — Implement Changes

When implementing:

- avoid breaking existing APIs
- preserve testability
- avoid hidden side effects
- avoid hardcoded mocks

---

## Step 3 — Run Tests

After every code modification:

### Frontend

Run:

```bash
pnpm test
```

---

## Step 4 — Analyze Results

After running tests, always analyze the output:

- count total tests, passed, failed, skipped
- identify which test files failed
- for each failure: extract the test name, error message, and relevant line
- identify whether the failure is due to the code change or a pre-existing issue

---

## Step 5 — Generate Structured Report

After every test run, output a report using **exactly** this template:

---

## Test Report

| | |
|---|---|
| **Status** | ✅ All passed / ❌ Failures found |
| **Test Files** | X passed, Y failed (Z total) |
| **Tests** | X passed, Y failed (Z total) |
| **Duration** | Xs |

### Failed Tests

> Only include this section if there are failures.

| Test File | Test Name | Error |
|---|---|---|
| `path/to/file.test.tsx` | `describe > test name` | Brief error message |

### Root Cause

> Describe why each failure occurred (wrong assertion, broken code, missing mock, etc.)

### Fix Applied

> Describe what was changed to fix the failures, or state "No fix needed — pre-existing failure unrelated to this change."

---

## Reporting Rules

- Always output the report, even when all tests pass.
- Never skip the report silently.
- If tests could not run (e.g., compile error), report that clearly under **Status**.
- Use ✅ when all tests pass, ❌ when any test fails.
