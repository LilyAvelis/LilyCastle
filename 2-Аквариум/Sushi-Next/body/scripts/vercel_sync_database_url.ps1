$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$project = Resolve-Path (Join-Path $root '..')
Set-Location $project

$envLocal = Join-Path $project '.env.local'
if (-not (Test-Path $envLocal)) {
    Write-Host "[Sushi Next] .env.local not found. Falling back to .env (may contain placeholder)." -ForegroundColor Yellow
    $envLocal = Join-Path $project '.env'
}

if (-not (Test-Path $envLocal)) {
    throw "Missing .env.local and .env. Create .env.local via scripts/set_database_url.ps1."
}

# Extract DATABASE_URL without printing it.
$line = (Get-Content $envLocal | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1)
if (-not $line) { throw "DATABASE_URL not found in $envLocal" }
$dbUrl = $line.Split('=', 2)[1].Trim().Trim('"')
if (-not $dbUrl) { throw "DATABASE_URL value is empty" }

if ($dbUrl -match 'USER:PASSWORD@HOST' -or $dbUrl -match 'postgres://USER:PASSWORD@HOST') {
    throw "DATABASE_URL looks like a placeholder. Run scripts/set_database_url.ps1 and paste the real Neon connection string."
}

$env:VERCEL_TELEMETRY_DISABLED = '1'

Write-Host "[Sushi Next] Syncing DATABASE_URL to Vercel (Preview + Production)"

# Pipe value through stdin so it doesn't appear in the command.
$dbUrl | npx vercel env add DATABASE_URL preview --sensitive --force | Out-Host
$dbUrl | npx vercel env add DATABASE_URL production --sensitive --force | Out-Host

Write-Host "[Sushi Next] Done. Re-deploy to apply."
