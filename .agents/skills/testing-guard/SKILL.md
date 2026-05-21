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

## Test File Structure

Test files must mirror the source file structure under the `tests/` directory.

### Mapping Rules

| Source path | Test path |
|---|---|
| `lib/mastodon/account.ts` | `tests/lib/account.test.ts` |
| `lib/mastodon/groupThreads.ts` | `tests/lib/groupThreads.test.ts` |
| `lib/mastodon/contentToReactNode.tsx` | `tests/lib/contentToReactNode.test.tsx` |
| `components/ui/button.tsx` | `tests/components/ui/button.test.tsx` |
| `components/ui/card.tsx` | `tests/components/ui/card.test.tsx` |
| `components/ui/avatar.tsx` | `tests/components/ui/avatar.test.tsx` |
| `components/ui/input.tsx` | `tests/components/ui/input.test.tsx` |
| `components/ui/label.tsx` | `tests/components/ui/label.test.tsx` |
| `components/ui/switch.tsx` | `tests/components/ui/switch.test.tsx` |
| `components/ui/slider.tsx` | `tests/components/ui/slider.test.tsx` |
| `components/ui/select.tsx` | `tests/components/ui/select.test.tsx` |
| `components/mastodon/Foo.tsx` | `tests/components/mastodon/Foo.test.tsx` |
| `hooks/mastodon/useBar.ts` | `tests/hooks/mastodon/useBar.test.ts` |

### Rules

- **One source file → one test file.** Never merge multiple components into a single test file.
- **Directory depth must match.** `components/ui/` → `tests/components/ui/`, not `tests/components/`.
- **File extension must match** the source: `.ts` source → `.test.ts`, `.tsx` source → `.test.tsx`.
- **`describe` block name** must match the exported symbol name (function, component, or hook).
- Shared test utilities (helpers, factories) go in `tests/__helpers__/` and are never test files themselves.

### jsdom Limitations

Some Radix UI components require browser APIs not present in jsdom. Apply these patterns:

- **`ResizeObserver` missing** (e.g. Slider): polyfill in `tests/setup.ts`.
- **`hasPointerCapture` missing** (e.g. Select): polyfill in `tests/setup.ts`.
- **Portal + pointer interaction** (e.g. Select open/close): test static aria attributes instead of interaction.

Polyfills already added to `tests/setup.ts` — do not duplicate them.

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
