# Скрипт для автоматического коммита и пуша изменений
# Запускайте этот скрипт вручную или по расписанию

# Добавляем все изменения
git add .

# Коммитим с текущей датой и временем
$commitMessage = "Auto commit on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMessage

# Пушим на удалённый репозиторий (убедитесь, что remote настроен)
git push origin master