$ErrorActionPreference = 'Stop'

Write-Host "[Sushi Next] setup starting..."

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$project = Resolve-Path (Join-Path $root '..')
Set-Location $project

if (-not (Test-Path (Join-Path $project '.env'))) {
    Write-Host "[Sushi Next] .env not found. Creating placeholder .env..."
    Copy-Item (Join-Path $project '.env.example') (Join-Path $project '.env')
}

Write-Host "[Sushi Next] Installing dependencies..."
npm install

Write-Host "[Sushi Next] Setup done. Run dev next."
