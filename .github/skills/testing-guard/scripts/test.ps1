Write-Host "Detecting package manager..."

if (Test-Path "pnpm-lock.yaml") {
    $pm = "pnpm"
}
elseif (Test-Path "yarn.lock") {
    $pm = "yarn"
}
else {
    $pm = "npm"
}

Write-Host "Using package manager: $pm"

Write-Host "Running type check..."
& $pm run typecheck

Write-Host "Running lint..."
& $pm run lint

Write-Host "Running unit tests..."
& $pm test

$packageJson = Get-Content package.json -Raw

if ($packageJson -match '"test:e2e"') {
    Write-Host "Running E2E tests..."
    & $pm run test:e2e
}

Write-Host "All tests completed successfully."