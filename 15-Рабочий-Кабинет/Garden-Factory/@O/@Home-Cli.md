# @Home-Cli — Будущее CLI архитектуры

## Проблема

Сейчас `cli.js` содержит жёстко закодированную логику для каждой команды:

- `buffer` → switch-case с 6 действиями
- `memo` → switch-case с 5 действиями
- `patch` → параметры парсятся вручную через цикл
- `skeleton` → отдельная обработка

**Каждая новая команда = 20-50 строк кода в одном файле.**

На дистанции это приводит к:

- Feature bloat (файл разрастается до 1000+ строк)
- Невозможность навигации
- Дублирование логики парсинга аргументов
- Сложность поддержки

## Решение: CLI через Database

### Концепция

Вместо кода пишем **декларативную схему команд в базе**:

```json
{
  "command": "buffer",
  "actions": [
    {
      "name": "push",
      "params": [
        { "name": "content", "type": "string", "required": true },
        { "name": "type", "type": "string", "default": "text" },
        { "name": "source", "type": "string", "default": "cli" }
      ],
      "tool": "buffer_action",
      "tool_mapping": ["action=push", "content", "type", "source"]
    },
    {
      "name": "peek",
      "params": [],
      "tool": "buffer_action",
      "tool_mapping": ["action=peek"]
    }
  ]
}
```

### Как это работает

1. **База данных команд** (SQLite/Mongo)

   - Хранит все команды, их параметры, валидацию
   - CLI читает схему при запуске
   - Нет кода — только данные

2. **Универсальный движок**

   ```javascript
   async function executeCommand(command, action, params) {
     const schema = await db.getCommandSchema(command, action);
     const validated = validateParams(params, schema.params);
     const toolArgs = mapToTool(validated, schema.tool_mapping);
     return await server.runTool(schema.tool, ...toolArgs);
   }
   ```

3. **Добавление новой команды**

   ```bash
   node cli.js register-command --schema=./commands/new-feature.json
   ```

   Никакого редактирования `cli.js` — просто JSON в базу.

### Преимущества

✅ **Масштабируемость** — 10 команд или 1000, код не растёт
✅ **Динамичность** — команды можно добавлять/удалять без пересборки
✅ **Консистентность** — одна система парсинга для всех
✅ **Переиспользование** — команды можно экспортировать/импортировать между проектами
✅ **Документация** — автоматическая генерация help из схемы

### Структура таблиц

#### `commands`

```sql
CREATE TABLE commands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `actions`

```sql
CREATE TABLE actions (
  id TEXT PRIMARY KEY,
  command_id TEXT REFERENCES commands(id),
  name TEXT NOT NULL,
  description TEXT,
  tool_name TEXT NOT NULL,
  created_at TIMESTAMP
);
```

#### `parameters`

```sql
CREATE TABLE parameters (
  id TEXT PRIMARY KEY,
  action_id TEXT REFERENCES actions(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  required BOOLEAN DEFAULT FALSE,
  default_value TEXT,
  description TEXT,
  position INTEGER,
  validation_rule TEXT
);
```

#### `tool_mappings`

```sql
CREATE TABLE tool_mappings (
  id TEXT PRIMARY KEY,
  action_id TEXT REFERENCES actions(id),
  param_name TEXT NOT NULL,
  tool_arg_position INTEGER NOT NULL,
  transform_fn TEXT  -- optional JS function name
);
```

### Пример использования

#### Регистрация команды

```bash
node cli.js register buffer push \
  --tool=buffer_action \
  --param content:string:required \
  --param type:string:default=text \
  --param source:string:default=cli
```

#### Выполнение

```bash
node cli.js buffer push "Hello"
# CLI читает схему из DB
# Валидирует аргументы
# Маппит на tool_args
# Вызывает server.runTool('buffer_action', 'push', 'Hello', 'text', 'cli')
```

#### Автогенерация help

```bash
node cli.js buffer --help
# Читает описания из DB
# Генерирует красивую документацию автоматически
```

### Миграция существующих команд

**Фаза 1:** Гибридный режим

- Оставляем старый switch-case
- Добавляем DB-движок параллельно
- Постепенно мигрируем команды

**Фаза 2:** DB-first

- Все новые команды только через DB
- Старые команды работают до миграции

**Фаза 3:** Полная миграция

- Удаляем весь switch-case
- Остаётся только движок (~100 строк)

### Технологии

- **SQLite** для простоты (один файл, zero-config)
- **sql.js** уже есть в зависимостях
- **Или Mongo** если хотим consistency с patch-manager

### Дальнейшее развитие

1. **Web UI для управления командами**

   - CRUD интерфейс для команд
   - Визуальный редактор схем
   - Тестирование команд из браузера

2. **Plugin система**

   - Сторонние разработчики могут публиковать команды
   - CLI загружает плагины из registry
   - `npm install garden-plugin-ai` → команды появляются автоматически

3. **Cross-project команды**

   - Один раз описали команду
   - Можем использовать в любом проекте Замка
   - Синхронизация через центральную DB

4. **Автодокументация**
   - Генерация README.md из схем
   - Swagger-like UI для CLI
   - Examples генерируются автоматически

## Почему не сейчас?

Это **крайне нетривиальная задача**:

1. Нужен надёжный валидатор параметров
2. Система маппинга между CLI args и tool args
3. Error handling на уровне движка
4. Миграция существующих команд без поломки

**Но это решает fundamental проблему:**

> Любая система рано или поздно упирается в feature bloat. DB-driven CLI решает это элегантно — код не растёт, растёт только data.

## Roadmap

- [ ] Спроектировать схему БД
- [ ] Реализовать движок чтения команд из DB
- [ ] Миграция одной команды (buffer) как proof-of-concept
- [ ] Автогенерация help из схемы
- [ ] Полная миграция всех команд
- [ ] Web UI для управления (опционально)

---

_Написано после рефакторинга patch-manager. Следующий логический шаг в эволюции Garden-Factory._
