# GardenScript — Реализованный MVP

GardenScript — это архитектурный линтер и форматтер поверх TypeScript, превращающий устные договорённости в строгий закон, проверяемый программно. Реализован как CLI-утилита `garden-keeper` с поддержкой таксономии из YAML-конфига.

## Что реализовано

- **CLI-утилита** `garden-keeper` с командами:
  - `validate <file>` — проверка методов в .gs/.ts файлах на соответствие таксономии.
  - `print-tree <file>` — вывод дерева таксономии для файла.
  - `reorder <file>` — переупорядочивание методов в файле согласно таксономии (сортировка по категориям).
- **Таксономия** — строгая иерархия категорий из `garden.config.yaml` (Bloom, Rose, Oak и т.д.).
- **Валидация** — парсинг AST через ts-morph, проверка имён методов по пути в таксономии.
- **Строгий режим** — ошибки с кодом выхода 1 для CI/CD.
- **Пример конфига** и **sample.gs** для тестирования.

## Структура проекта

```
Garden-Script/
├── @Garden-Base.md          # Концепция Garden Language
├── @Home,md                 # Этот файл (документация)
├── garden.config.yaml       # Пример конфига таксономии
├── package.json             # NPM-зависимости и скрипты
├── tsconfig.json            # TypeScript конфиг
├── .gitignore               # Игнорируемые файлы
├── src/                     # Исходный код
│   ├── cli/
│   │   └── cli.ts           # Входная точка CLI
│   ├── core/
│   │   ├── configLoader.ts  # Загрузка YAML-конфига
│   │   └── gardenTaxonomy.ts # Парсер, валидатор, дерево
│   └── types/
│       └── garden.ts        # TypeScript типы
├── dist/                    # Скомпилированный JS (после build)
├── examples/
│   └── sample.gs            # Пример GardenScript файла
└── node_modules/            # Зависимости (после install)
```

## Практический гайд для ИИ-агентов

1. **Рабочая директория** — `04-Сад-Лилий/Garden-Script`.
2. **Установка зависимостей** (один раз на воркспейс):
   ```bash
   npm install
   ```
3. **Сборка TypeScript → dist/**:
   ```bash
   npm run build
   ```
4. **Базовый тест** на примере `examples/sample.gs`:
   ```bash
   node dist/cli/cli.js validate examples/sample.gs
   ```
   Ожидаемый вывод: `✅ … passed GardenScript validation.`
5. **Проверка своих файлов** — передай путь к `.gs`/`.ts` файлу и, при необходимости, свой конфиг:
   ```bash
   node dist/cli/cli.js validate path/to/file.gs --config path/to/garden.config.yaml
   ```
6. **Просмотр дерева таксономии** для файла:
   ```bash
   node dist/cli/cli.js print-tree path/to/file.gs
   ```
7. **Переупорядочивание методов** в файле по таксономии:
   ```bash
   node dist/cli/cli.js reorder path/to/file.gs
   ```
   Ожидаемый результат: методы в классе отсортированы по категориям (Bloom → Fern → Oak → Orchid → Rose → Vine) с подкатегориями внутри.
8. **Где править:** исходники CLI в `src/cli/`, ядро в `src/core/`, типы в `src/types/`, конфиг по умолчанию — `garden.config.yaml`.

Так любой агент может быстро установить зависимости, собрать CLI и проверить свои GardenScript-файлы, не вникая в детали реализации.

### Практический гайд для ИИ-агентов

1. **Рабочая директория** — `04-Сад-Лилий/Garden-Script`.
2. **Установка зависимостей** (один раз на воркспейс):
    ```bash
    npm install
    ```
3. **Сборка TypeScript → dist/**:
    ```bash
    npm run build
    ```
4. **Базовый тест** на примере `examples/sample.gs`:
    ```bash
    node dist/cli/cli.js validate examples/sample.gs
    ```
    Ожидаемый вывод: `✅ … passed GardenScript validation.`
5. **Проверка своих файлов** — передай путь к `.gs`/`.ts` файлу и, при необходимости, свой конфиг:
    ```bash
    node dist/cli/cli.js validate path/to/file.gs --config path/to/garden.config.yaml
    ```
6. **Просмотр дерева таксономии** для файла:
    ```bash
    node dist/cli/cli.js print-tree path/to/file.gs
    ```
8. **Строгий режим именования** уже встроен: если метод не соответствует таксономии или пропущено `Bloom_Seed_*`, команда вернёт ошибку и код выхода `1` — используйте в CI.
8. **Где править:** исходники CLI в `src/cli/`, ядро в `src/core/`, типы в `src/types/`, конфиг по умолчанию — `garden.config.yaml`.

Так любой агент может быстро установить зависимости, собрать CLI и проверить свои GardenScript-файлы, не вникая в детали реализации.