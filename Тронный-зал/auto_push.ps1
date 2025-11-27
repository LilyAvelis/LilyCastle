# Скрипт для автоматического коммита и пуша изменений
# Запускайте этот скрипт вручную или по расписанию

# Путь к репозиторию
$repoPath = "C:\Users\lilya\OneDrive\Desktop\ЗамокЛилии"
$lockFile = "$repoPath\.git\index.lock"

# Убираем зависший lock-файл если есть
if (Test-Path $lockFile) {
    Write-Host "Removing stale lock file..." -ForegroundColor Yellow
    Remove-Item $lockFile -Force
}

# Добавляем все изменения
git add .

# Коммитим с текущей датой и временем
$commitMessage = "Auto commit on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$commitResult = git commit -m $commitMessage 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Commit successful!" -ForegroundColor Green
}
else {
    Write-Host "Nothing to commit or error occurred" -ForegroundColor Yellow
}

# Пушим на удалённый репозиторий
Write-Host "Pushing to origin/master..." -ForegroundColor Cyan
git push origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host "Push successful!" -ForegroundColor Green
}
else {
    Write-Host "Push failed! Check your connection or credentials" -ForegroundColor Red
}

Write-Host "Done!" -ForegroundColor Green