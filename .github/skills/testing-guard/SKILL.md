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
