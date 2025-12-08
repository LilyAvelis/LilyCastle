# PATCH MANAGER — РАЗВЕРТЫВАНИЕ НА AZURE + MONGODB ATLAS

## ОБЩАЯ АРХИТЕКТУРА ПРОЕКТА

Цель: Развернуть Node.js приложение (Patch Manager) в облаке Azure
с базой данных MongoDB Atlas.

Стек:

- Backend: Node.js 20 LTS, Express.js
- База данных: MongoDB Atlas (облачная MongoDB)
- Hosting: Azure App Service (регион West Europe)
- CI/CD: GitHub Actions (автоматический деплой при push)
- Репозиторий: GitHub (LilyAvelis/LilyCastle)

# ЭТАПЫ РАБОТЫ (УЖЕ ВЫПОЛНЕННЫЕ)

1. СОЗДАНИЕ MONGODB ATLAS КЛАСТЕРА ✅
   Кластер: mango-from-garden (free tier)
   Connection String:
   mongodb+srv://lilyavelis:NcNnQ2UF8ImmAvtl@mango-from-garden.9cehdvq.mongodb.net/?appName=Mango-From-Garden

   База данных: garden-patches
   Коллекции:

   - patches (14 документов)
   - projects (2 документа)
   - versions (12 документов)

   Статус: ✅ Данные успешно мигрированы с локального MongoDB

2. СОЗДАНИЕ EXPRESS СЕРВЕРА ✅
   Файл: Тронный-зал/patch-manager/server.mjs
   Язык: JavaScript (ES modules)

   Зависимости:

   - express — REST API framework
   - mongodb — драйвер БД
   - cors — cross-origin запросы
   - dotenv — переменные окружения

   Endpoints:
   GET  /              → API info
   GET  /health        → Health check ({status: 'ok', database: 'connected'})
   GET  /api/patches   → List all patches (JSON array)
   GET  /api/patches/:id → Get specific patch by ID
   GET  /api/projects  → List all projects

   Статус: ✅ Тестировано локально на Windows — работает, возвращает реальные данные с Atlas

3. СОЗДАНИЕ AZURE APP SERVICE ✅
   Имя: Mango-From-Garden
   Runtime: Node.js 20 LTS
   Region: West Europe
   URL: https://mango-from-garden-hkh0arfvcnakhyf3.westeurope-01.azurewebsites.net

   Статус: ✅ Создан, но пока служит дефолтную Azure страницу

4. НАСТРОЙКА GITHUB ACTIONS ✅
   Файл: .github/workflows/azure-deploy.yml
   Trigger: Push на branch master

   Шаги:

   1. Checkout кода из GitHub
   2. Setup Node.js 20
   3. npm install в директории Тронный-зал/patch-manager
   4. Deploy на Azure используя publish profile

   Статус: ✅ Workflow создан, AZURE_WEBAPP_PUBLISH_PROFILE добавлен в GitHub Secrets

5. GIT HISTORY CLEANUP ✅
   Проблема: В репо был файл 14-Музыкальная/colatz-conundrum-n^x/1graph_convergence_degree_3.npy
   размером 241 MB

   GitHub ограничение: Файлы > 100 MB не могут быть pushed

   Решение: Выполнен полный git filter-branch для удаления всех
   .npy, .npz, .pkl, .h5 файлов из истории

   Результат: ✅ Push на master успешен (коммит 8bd1bf9)

6. ПОСЛЕДНЕЕ ИСПРАВЛЕНИЕ ✅
   Проблема: package.json указывал "start": "node server/index.ts",
   но файл server.mjs в корне

   Исправление: Обновлен package.json:
   "scripts": {
   "start": "node server.mjs",
   "dev": "node server.mjs"
   }

   Push: ✅ Успешно отправлено на GitHub (коммит 8bd1bf9)

# ТЕКУЩАЯ ПРОБЛЕМА

Симптомы:

1. ✅ GitHub Actions workflow должна была автоматически запуститься после последнего push
2. ❌ Azure App Service все еще показывает дефолтную страницу (не наш код)
3. ❌ /api/patches возвращает 404 Not Found вместо JSON с патчами
4. ⚠️ Проверка Azure root endpoint вернула 503 Service Unavailable

# ВОЗМОЖНЫЕ ПРИЧИНЫ

A. GitHub Actions не запустилась

- Workflow может быть в очереди, отключена, или не видит триггер

B. GitHub Actions запустилась но ошибка при деплое

- Ошибка при npm install (зависимости не установились)
- Publish profile неправильный или истек
- Ошибка при передаче файлов на Azure

C. Код развернут, но приложение не стартует

- Ошибка в server.mjs при запуске
- Переменные окружения MONGO_URI и MONGO_DB не установлены на Azure
- Порт конфликт

D. Конфликт с другим workflow

- На Azure может быть другой workflow (master_mango-from-garden.yml),
   который подменяет наш код

# ЧТО НУЖНО ПРОВЕРИТЬ

1. GitHub Actions:

   - Перейти на GitHub → Actions
   - Убедиться что последний workflow запустился
   - Если нет — проверить triggeры и логи

2. Azure логи:

   - Посмотреть что происходит при старте приложения
   - Убедиться что npm start выполняется корректно

3. Переменные окружения на Azure:

   - MONGO_URI должна быть установлена
   - MONGO_DB должна быть garden-patches
   - Если нет — добавить их

4. node_modules:

   - Убедиться что Express, MongoDB драйвер установились

5. Локальный дебаг:

   - Запустить npm install в Тронный-зал/patch-manager
   - Запустить node server.mjs с корректным .env
   - Проверить что локально работает /api/patches

6. Если ничего не помогает:

   - Удалить Azure App Service и создать новую
   - Переделать GitHub Actions workflow более простой версией

# ФАЙЛЫ ПРОЕКТА

Тронный-зал/patch-manager/
├── server.mjs                 # Основной Express сервер
├── package.json               # Зависимости (с исправленным "start")
├── migrate-to-atlas.mjs       # Скрипт миграции (уже выполнен)
├── .env                       # Переменные окружения
├── .gitignore                 # Исключает большие файлы
└── cli/                       # CLI инструменты

.github/workflows/
├── azure-deploy.yml           # GitHub Actions для Azure деплоя
├── auto-push.yml              # Auto-commit workflow
└── master_mango-from-garden.yml # Может быть конфликт!

# CREDENTIALS

MongoDB Atlas:

- User: lilyavelis
- Password: NcNnQ2UF8ImmAvtl
- Cluster: mango-from-garden.9cehdvq.mongodb.net

Azure:

- Resource Group: DefaultResourceGroup-WEU
- App Service: mango-from-garden
- Publish Profile: GitHub Secret AZURE_WEBAPP_PUBLISH_PROFILE

# ЗАМЕЧАНИЯ О GIT ИСТОРИИ

Важно: В процессе разработки была переписана вся git история
для удаления больших файлов. Это означает:

- Все commit SHA изменились
- Любой, кто имел локальный clone, должен пересоздать его
- История потеряна, но код и данные в порядке

Рекомендация для будущего:

- Всегда использовать .gitignore перед первым коммитом
- Хранить большие данные в облаке (S3, Azure Blob Storage) или в MongoDB
- Использовать Git LFS для бинарных файлов если необходимо
- Регулярно бэкапить MongoDB в облако (не в git!)
