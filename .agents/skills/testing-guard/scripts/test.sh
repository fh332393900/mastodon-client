
---

# `scripts/test.sh`

Linux/macOS 用。

```bash id="3ee8ot"
#!/usr/bin/env bash

set -e

echo "Detecting package manager..."

if [ -f "pnpm-lock.yaml" ]; then
  PM="pnpm"
elif [ -f "yarn.lock" ]; then
  PM="yarn"
else
  PM="npm"
fi

echo "Using package manager: $PM"

echo "Running type check..."
$PM run typecheck

echo "Running lint..."
$PM run lint

echo "Running unit tests..."
$PM test

if grep -q "\"test:e2e\"" package.json; then
  echo "Running E2E tests..."
  $PM run test:e2e
fi

echo "All tests completed successfully."