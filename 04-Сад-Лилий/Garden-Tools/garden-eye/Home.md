# 👁️ Garden Eye — Умные глаза для LLM

> _"Сначала скелет, потом мясо. Никогда наоборот."_

---

## 0. Проблема

LLM читает файлы как слепой — получает 500 строк текста и "ощущает" что понимает. Это ложь.

**Текущий процесс:**

```
read_file → 500 строк в лицо → "я типа понял" → редактирую → ломаю
```

**Боль при редактировании:**

```
replace_string_in_file:
  - найди oldString (должен быть уникальным!)
  - добавь 3 строки контекста сверху и снизу
  - перепиши ВЕСЬ кусок даже если меняешь 1 слово
  - молись что отступы совпали
```

---

## 1. Решение: Garden Eye

Два режима чтения:

### 1.1 `skeleton` — Рентген

Показывает только структуру файла:

- Классы и их имена
- Методы с сигнатурами (без тела)
- Функции с сигнатурами
- Импорты (опционально)
- Типы/интерфейсы (опционально)

```typescript
// Запрос:
skeleton("chatViewProvider.ts");

// Ответ:
class ChatViewProvider implements WebviewViewProvider {
  // Fields
  private view?: WebviewView;
  private ledger: LedgerService;

  // Constructor
  constructor(context: ExtensionContext, ledger: LedgerService);

  // Methods
  resolveWebviewView(view: WebviewView): void;
  private async createSession(title: string, modelId: string): Promise<Session>;
  private async updateSession(
    sessionId: string,
    title: string,
    who: string
  ): Promise<void>;
  private async deleteSession(sessionId: string): Promise<void>;
  private handleMessage(message: WebviewMessage): void;
  private postToWebview(data: any): void;
  private getHtml(): string;
}
```

### 1.2 `focus` — Лупа

Читает конкретный элемент по адресу:

```typescript
// Запрос:
focus("ChatViewProvider.deleteSession")

// Ответ:
private async deleteSession(sessionId: string): Promise<void> {
  const confirm = await vscode.window.showWarningMessage(
    'Удалить сессию?',
    { modal: true },
    'Да'
  );
  if (confirm === 'Да') {
    await this.ledger.deleteSession(sessionId);
    this.postToWebview({ type: 'sessionDeleted' });
  }
}
```

---

## 2. Адресация (как ссылаться на код)

```
file.ts                         → весь файл
ClassName                       → весь класс
ClassName.methodName            → метод класса
ClassName.fieldName             → поле класса
functionName                    → top-level функция
InterfaceName                   → интерфейс
TypeName                        → тип
```

**Примеры:**

```
chatViewProvider.ts::ChatViewProvider.deleteSession
extension.ts::activate
types.ts::Page
types.ts::SessionStatus
```

---

## 3. Будущее: `patch` — Атомарная замена

_(Не в первой версии, но держим в голове)_

```typescript
// Вместо replace_string_in_file с танцами вокруг oldString:
patch("ChatViewProvider.deleteSession", newMethodCode);

// Garden Eye находит метод по AST и заменяет целиком
```

---

## 4. Технический план

### 4.1 Ключевое открытие: VS Code уже знает структуру!

**Нам не нужен свой парсер!** VS Code API даёт:

```typescript
// Получить структуру любого файла (TS, Python, Rust, Go — всё!)
const symbols = await vscode.commands.executeCommand<DocumentSymbol[]>(
  "vscode.executeDocumentSymbolProvider",
  documentUri
);
```

Это то же самое что **Outline view** (Ctrl+Shift+O) или **Structure** в JetBrains!

Language Server для каждого языка уже знает:

- Где классы, методы, функции
- Какого они типа (SymbolKind.Class, SymbolKind.Method, etc.)
- Их точные позиции (range.start.line → range.end.line)

### 4.2 SymbolKind — универсальный словарь

```typescript
enum SymbolKind {
  File = 0,
  Module = 1,
  Namespace = 2,
  Package = 3,
  Class = 4,
  Method = 5,
  Property = 6,
  Field = 7,
  Constructor = 8,
  Enum = 9,
  Interface = 10,
  Function = 11,
  Variable = 12,
  Constant = 13,
  // ... и другие
}
```

Это работает для ВСЕХ языков одинаково:

- TypeScript: Class → Method → Property
- Python: Class → Function → Variable
- Rust: Struct → Function → Field
- Vue: Component → Method → Data

### 4.3 Стек (радикально упрощённый!)

- **VS Code Extension** — не MCP, а прямой доступ к API
- **DocumentSymbolProvider** — уже встроен для всех языков
- **Наша задача** — только красиво форматировать вывод

### 4.4 Структура проекта

```
garden-eye/
├── Home.md              # этот файл
├── package.json
├── tsconfig.json
├── src/
│   ├── extension.ts     # регистрация команд
│   ├── tools/
│   │   ├── skeleton.ts  # tool: показать структуру через DocumentSymbol
│   │   └── focus.ts     # tool: прочитать элемент по адресу + range
│   ├── formatter/
│   │   └── symbolFormatter.ts  # превращение symbols в читаемый skeleton
│   └── utils/
│       └── addressing.ts       # парсинг "Class.method" → find in symbols tree
└── test/
    └── fixtures/
```

### 4.5 MCP Tools (интерфейс для Copilot)

```typescript
// Tool 1: skeleton
{
  name: "garden_eye_skeleton",
  description: "Показать структуру файла (классы, методы, функции) без реализации",
  parameters: {
    filePath: string,           // путь к файлу
    includeImports?: boolean,   // показывать импорты? (default: false)
    includeTypes?: boolean      // показывать типы/интерфейсы? (default: true)
  }
}

// Tool 2: focus
{
  name: "garden_eye_focus",
  description: "Прочитать конкретный элемент кода по адресу",
  parameters: {
    filePath: string,           // путь к файлу
    target: string              // адрес: "ClassName.methodName" или "functionName"
  }
}
```

### 4.6 MCP Server (garden-eye-mcp v0.2)

Для автономного MCP сервера нам больше нельзя полагаться на VS Code API, поэтому появилась отдельная кодовая база `garden-eye-mcp` с собственными парсерами.

- **Один сервер — много языков.** В `src/parser.ts` теперь живут лёгкие парсеры для JSON, YAML, Python, HTML, CSS, Rust, Go, C/C++, Java, C#, PHP, Ruby, Swift, Kotlin + базовый TypeScript/Markdown.
- **Общий движок для языков со скобками.** Вынесен helper `parseBraceLanguage`, который понимает вложенность `{}` и автоматически считает диапазоны строк.
- **JSON умеет в focus.** Путь вида `scripts.build` или `dependencies.react` возвращает конкретное значение. Поддерживаются индексы (`items[0].name`).
- **Единый роутер инструментов.** `src/index.ts` автоматически подбирает нужный парсер по расширению и сообщает пользователю полный список поддерживаемых суффиксов.
- **Сборка:** `npm run build` в `04-Сад-Лилий/Garden-Tools/garden-eye-mcp`, затем (при необходимости) копирование `dist` в `c:\Users\Garden\garden-eye-mcp`.

---

## 5. Ожидаемый workflow

### До (слепое чтение):

```
1. read_file("chatViewProvider.ts") → 500 строк
2. "Вроде понял..."
3. Редактирую наугад
4. Ломаю
```

### После (умное чтение):

```
1. skeleton("chatViewProvider.ts") → вижу 8 методов
2. "Мне нужен deleteSession"
3. focus("ChatViewProvider.deleteSession") → вижу 10 строк
4. Понимаю контекст, делаю точечное изменение
```

---

## 6. Открытые вопросы

1. **Поддержка языков** — начинаем только с TypeScript или сразу делаем абстракцию?
2. **Вложенность** — как адресовать метод внутри анонимного класса или callback?
3. **JSDoc** — включать комментарии в skeleton или нет?
4. **Относительные пути** — как резолвить путь от workspace root?

---

## 7. Критерии успеха

- [ ] `skeleton` работает на реальных TS файлах Garden
- [ ] `focus` точно находит методы по адресу
- [ ] MCP server запускается и Copilot видит tools
- [ ] Я (Claude) могу использовать это вместо read_file для навигации

---

## 8. Поддерживаемые форматы (MCP сервер)

| Категория       | Расширения / сущности                                                       |
| --------------- | --------------------------------------------------------------------------- |
| Frontend/JS     | `.ts`, `.tsx`, `.js`, `.jsx`, `.md`                                         |
| Данные/конфиги  | `.json` (включая focus по ключам), `.yaml`, `.yml`                          |
| Backend скрипты | `.py`, `.php`, `.rb`                                                        |
| Web/UI          | `.html`, `.htm`, `.css`                                                     |
| Systems         | Rust (`.rs`), Go (`.go`), C/C++ (`.c`, `.h`, `.cpp`, `.hpp`, `.cc`, `.cxx`) |
| Enterprise      | `.java`, `.cs`, `.kt`, `.kts`, `.swift`                                     |

> Полный гайд «как читать глазами» лежит в `Garden-Tools/garden-eye-mcp/garden-eyes.md` и теперь также подключён как обязательная инструкция (файл `AppData/Roaming/Code/User/prompts/garden-eyes.md.instructions.md`).

---

_Garden Eye v0.1 — Первые глаза. Учимся видеть структуру._ 👁️
