$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$project = Resolve-Path (Join-Path $root '..')
Set-Location $project

Write-Host "[Sushi Next] starting dev server..."
npm run dev
