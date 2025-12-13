$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$project = Resolve-Path (Join-Path $root '..')
Set-Location $project

Write-Host "[Sushi Next] Setting DATABASE_URL for local dev (writes .env.local)"
Write-Host "Paste Neon connection string (starts with postgresql:// or postgres://)"

$dbUrl = Read-Host "DATABASE_URL"
if (-not $dbUrl -or $dbUrl.Trim() -eq '') {
  throw "DATABASE_URL is empty"
}

$dbUrl = $dbUrl.Trim()
# If user pasted the URL wrapped in quotes, remove only the outer quotes.
if (($dbUrl.StartsWith('"') -and $dbUrl.EndsWith('"')) -or ($dbUrl.StartsWith("'") -and $dbUrl.EndsWith("'"))) {
  $dbUrl = $dbUrl.Substring(1, $dbUrl.Length - 2)
}

if (-not ($dbUrl -match '^(postgresql|postgres)://')) {
  Write-Host "[Sushi Next] Warning: DATABASE_URL does not look like a postgres connection string." -ForegroundColor Yellow
}

$envLocalPath = Join-Path $project '.env.local'

$content = @(
  "# Local overrides (not committed)",
  # Quote the value for dotenv compatibility; PowerShell uses backtick for escaping quotes.
  "DATABASE_URL=`"$dbUrl`"",
  ""
)

Set-Content -Path $envLocalPath -Value $content -Encoding UTF8
Write-Host "[Sushi Next] Wrote .env.local"
