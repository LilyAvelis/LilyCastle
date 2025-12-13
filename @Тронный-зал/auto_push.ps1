# Скрипт для автоматического коммита и пуша изменений
# Философия: один запуск = предсказуемый результат, без "магии".

param(
    [string]$Message = "Auto commit on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    [string[]]$Paths = @(
        '2-Аквариум/Sushi-Next',
        '.vscode/tasks.json',
        '@Тронный-зал/auto_push.ps1'
    )
)

$ErrorActionPreference = 'Stop'

# Репозиторий = корень текущего workspace (родитель папки @Тронный-зал).
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

$lockFile = Join-Path $repoRoot '.git\index.lock'
if (Test-Path $lockFile) {
    Write-Host "Removing stale git lock file..." -ForegroundColor Yellow
    Remove-Item $lockFile -Force
}

Write-Host "Staging paths:" -ForegroundColor Cyan
$Paths | ForEach-Object { Write-Host "  - $_" }

# Добавляем только указанные пути (не весь репозиторий), чтобы не коммитить случайный мусор.
git add -- $Paths

# Если нечего коммитить — выходим без ошибки.
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "Nothing to commit (no staged changes)." -ForegroundColor Yellow
    exit 0
}

git commit -m $Message | Out-Host

Write-Host "Pushing to origin/master..." -ForegroundColor Cyan
git push origin master | Out-Host

Write-Host "Done!" -ForegroundColor Green