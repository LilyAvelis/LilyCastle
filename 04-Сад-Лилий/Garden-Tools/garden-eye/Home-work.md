# 📋 Задание для Милены (GPT) — Расширение Garden Eye

> **От:** Клода & Лилия  
> **Дата:** 29 ноября 2025  
> **Приоритет:** Средний

---

## 🎯 Цель

Добавить поддержку новых типов файлов в Garden Eye. Сейчас поддерживаются только:

- TypeScript/JavaScript (`.ts`, `.tsx`, `.js`, `.jsx`)
- Markdown (`.md`)

---

## 🏗️ Структура проекта Garden Eye

Garden Eye разделён на **две части**:

### 1. VS Code Extension (garden-eye)

```
04-Сад-Лилий/Garden-Tools/garden-eye/
├── Home.md              # Документация
├── package.json         # VS Code extension manifest
├── tsconfig.json
├── src/
│   ├── extension.ts     # Регистрация VS Code команд
│   └── tools/
│       ├── skeleton.ts  # Skeleton через VS Code DocumentSymbolProvider
│       └── focus.ts     # Focus через VS Code API
└── out/                 # Скомпилированный код
```

**Назначение:** Использует встроенный VS Code API (`DocumentSymbolProvider`) для получения структуры файлов. Работает только внутри VS Code, зависит от установленных Language Servers.

**Команды:**

- `Garden Eye: Skeleton` — показать структуру в Output
- `Garden Eye: Focus` — выбрать элемент через QuickPick

---

### 2. MCP Server (garden-eye-mcp) ← ТУТ РАБОТАЕШЬ ТЫ!

```
04-Сад-Лилий/Garden-Tools/garden-eye-mcp/
├── Home.md              # (опционально)
├── TODO-for-Milena.md   # ЭТО ЗАДАНИЕ
├── Guide-for-AI.md      # Гайд для ИИ как пользоваться
├── package.json         # MCP server dependencies
├── tsconfig.json
├── src/
│   ├── index.ts         # MCP server entry point + tools registration
│   └── parser.ts        # ПАРСЕРЫ ДЛЯ ЯЗЫКОВ ← РЕДАКТИРУЙ ТУТ!
└── dist/                # Скомпилированный код
```

**Назначение:** Автономный MCP сервер, который парсит файлы **своими силами** (без VS Code API). Может работать с любым LLM через MCP протокол.

**Tools:**

- `skeleton` — парсит файл и возвращает структуру
- `focus` — находит элемент по адресу и возвращает код

---

### Ключевое различие:

| Аспект       | garden-eye (Extension)   | garden-eye-mcp (Server)  |
| ------------ | ------------------------ | ------------------------ |
| Где работает | Только в VS Code         | Везде (MCP протокол)     |
| Как парсит   | VS Code Language Servers | Свои парсеры (regex)     |
| Зависимости  | VS Code API              | Node.js + MCP SDK        |
| Языки        | Все что знает VS Code    | Только те что мы напишем |

---

### Рабочая копия MCP сервера:

```
c:\Users\Garden\garden-eye-mcp\
```

Это копия без кириллицы в пути (VS Code/Copilot не любит кириллицу). После сборки нужно копировать `dist/*` сюда!

---

## 📝 Что нужно сделать

### 1. Добавить поддержку JSON (`.json`)

**Что показывать в skeleton:**

- Ключи первого уровня
- Для объектов: `{ ... }` без содержимого
- Для массивов: `[ ... N items ]`

**Пример для `package.json`:**

```
📄 package.json
──────────────────────────────────────────────────
🔑 name: "garden-eye-mcp"
🔑 version: "0.0.1"
🔑 description: "..."
🔑 main: "dist/index.js"
🔑 scripts: { ... 3 keys }
🔑 dependencies: { ... 2 keys }
🔑 devDependencies: { ... 2 keys }
```

**Focus:** по имени ключа вернуть его содержимое

---

### 2. Добавить поддержку Python (`.py`)

**Что показывать в skeleton:**

- `class ClassName:`
- `def function_name(args):`
- `async def async_function(args):`
- Декораторы: `@decorator`

**Пример:**

```
📄 main.py
──────────────────────────────────────────────────
🏛️ class MyService [5–45]
  🔨 __init__(self, config) [6–10]
  ⚙️ process(self, data) [12–25]
  ⚙️ async fetch(self, url) [27–45]
⚡ def helper_function(x, y) [47–52]
```

---

### 3. Добавить поддержку HTML (`.html`)

**Что показывать в skeleton:**

- Основные теги: `<head>`, `<body>`, `<main>`, `<nav>`, `<section>`, `<article>`
- Элементы с `id`: `<div id="app">`
- Элементы с `class` (основные)

---

### 4. Добавить поддержку CSS (`.css`)

**Что показывать в skeleton:**

- Селекторы классов: `.className`
- Селекторы ID: `#idName`
- Media queries: `@media (...)`

---

### 5. Добавить поддержку YAML (`.yaml`, `.yml`)

**Что показывать в skeleton:**

- Ключи первого уровня
- Вложенность через отступы

---

### 6. Добавить поддержку Rust (`.rs`)

**Что показывать в skeleton:**

- `struct StructName`
- `enum EnumName`
- `impl StructName` — блоки имплементации
- `fn function_name(args) -> ReturnType`
- `pub fn` — публичные функции
- `trait TraitName`
- `mod module_name`

**Пример:**

```
📄 main.rs
──────────────────────────────────────────────────
📦 mod utils [1–1]
🏗️ struct Config [3–7]
🏗️ enum Status [9–13]
🔷 trait Handler [15–20]
🏛️ impl Config [22–45]
  🔨 new() -> Self [23–28]
  ⚙️ pub fn load(&self) -> Result<()> [30–44]
⚡ fn main() [47–55]
⚡ async fn process(data: &str) -> Result<()> [57–70]
```

---

### 7. Добавить поддержку Go (`.go`)

**Что показывать в skeleton:**

- `package name`
- `type StructName struct`
- `type InterfaceName interface`
- `func functionName(args) returnType`
- `func (receiver) methodName(args) returnType` — методы

**Пример:**

```
📄 main.go
──────────────────────────────────────────────────
📦 package main [1–1]
🏗️ type Config struct [5–10]
🔷 type Handler interface [12–16]
⚙️ func (c *Config) Load() error [18–25]
⚡ func main() [27–35]
⚡ func processData(input string) (string, error) [37–50]
```

---

### 8. Добавить поддержку C/C++ (`.c`, `.cpp`, `.h`, `.hpp`)

**Что показывать в skeleton:**

- `struct StructName`
- `class ClassName` (C++)
- `enum EnumName`
- `void functionName(args)` — функции
- `#include` — можно опционально
- `namespace` (C++)

**Пример:**

```
📄 main.cpp
──────────────────────────────────────────────────
📦 namespace utils [3–50]
🏗️ struct Config [5–10]
🏛️ class Handler [12–35]
  🔨 Handler() [14–16]
  ⚙️ void process(const std::string& data) [18–25]
  ⚙️ virtual ~Handler() [27–29]
⚡ int main(int argc, char** argv) [52–60]
```

---

### 9. Добавить поддержку Java (`.java`)

**Что показывать в skeleton:**

- `package name`
- `class ClassName`
- `interface InterfaceName`
- `enum EnumName`
- `public/private/protected` методы
- `@annotations`

**Пример:**

```
📄 Main.java
──────────────────────────────────────────────────
📦 package com.example [1–1]
🏛️ class Main [5–50]
  🔨 Main() [7–10]
  ⚙️ public void process(String data) [12–20]
  ⚙️ private static int calculate(int x) [22–30]
🔷 interface Handler [52–58]
```

---

### 10. Добавить поддержку C# (`.cs`)

**Что показывать в skeleton:**

- `namespace Name`
- `class ClassName`
- `interface IInterfaceName`
- `struct StructName`
- `enum EnumName`
- `public/private/protected` методы
- `async Task` методы

**Пример:**

```
📄 Program.cs
──────────────────────────────────────────────────
📦 namespace MyApp [1–1]
🏛️ class Program [3–45]
  🔨 Program() [5–8]
  ⚙️ public static void Main(string[] args) [10–15]
  ⚙️ private async Task<string> FetchData() [17–30]
🔷 interface IHandler [47–52]
🏗️ struct Config [54–60]
```

---

### 11. Добавить поддержку PHP (`.php`)

**Что показывать в skeleton:**

- `class ClassName`
- `interface InterfaceName`
- `trait TraitName`
- `function functionName()`
- `public/private/protected` методы
- `namespace`

---

### 12. Добавить поддержку Ruby (`.rb`)

**Что показывать в skeleton:**

- `class ClassName`
- `module ModuleName`
- `def method_name`
- `attr_accessor`, `attr_reader`

---

### 13. Добавить поддержку Swift (`.swift`)

**Что показывать в skeleton:**

- `class ClassName`
- `struct StructName`
- `enum EnumName`
- `protocol ProtocolName`
- `func functionName()`
- `extension TypeName`

---

### 14. Добавить поддержку Kotlin (`.kt`)

**Что показывать в skeleton:**

- `class ClassName`
- `data class DataClassName`
- `object ObjectName`
- `interface InterfaceName`
- `fun functionName()`
- `suspend fun` — корутины

---

## 📁 Где редактировать

Основной файл парсеров:

```
c:\Users\Garden\Desktop\LilyCastle\04-Сад-Лилий\Garden-Tools\garden-eye-mcp\src\parser.ts
```

Регистрация типов в `index.ts`:

```
c:\Users\Garden\Desktop\LilyCastle\04-Сад-Лилий\Garden-Tools\garden-eye-mcp\src\index.ts
```

---

## 🔧 Как собрать после изменений

```powershell
cd "c:\Users\Garden\Desktop\LilyCastle\04-Сад-Лилий\Garden-Tools\garden-eye-mcp"
npm run build
```

Потом скопировать в рабочую папку:

```powershell
Copy-Item -Path ".\dist\*" -Destination "c:\Users\Garden\garden-eye-mcp\dist\" -Force
```

И перезагрузить VS Code.

---

## ✅ Критерии готовности

### Приоритет 1 (Основные):

- [ ] JSON: skeleton показывает ключи, focus возвращает значение ключа
- [ ] Python: skeleton показывает классы и функции с номерами строк
- [ ] HTML: skeleton показывает структуру документа
- [ ] CSS: skeleton показывает селекторы
- [ ] YAML: skeleton показывает структуру

### Приоритет 2 (Системные языки):

- [ ] Rust: struct, enum, impl, fn, trait, mod
- [ ] Go: package, type struct/interface, func
- [ ] C/C++: struct, class, enum, функции, namespace

### Приоритет 3 (Enterprise языки):

- [ ] Java: package, class, interface, методы
- [ ] C#: namespace, class, interface, struct, методы
- [ ] Kotlin: class, data class, object, fun

### Приоритет 4 (Скриптовые) (Можно забить, это написано просто по приколу, на этом никто не пишет)

- [ ] PHP: class, interface, trait, function
- [ ] Ruby: class, module, def
- [ ] Swift: class, struct, protocol, func

---

## 💡 Подсказки

### Общие:

1. Для JSON используй `JSON.parse()` и рекурсивный обход
2. Для Python — регулярки на `class`, `def`, `async def`
3. Для HTML — можно использовать простой regex или `htmlparser2`
4. Не забудь добавить новые расширения в `index.ts` в секцию `if/else`

### Для системных языков (Rust, Go, C/C++):

5. Rust: ищи `fn `, `pub fn `, `struct `, `enum `, `impl `, `trait `, `mod `
6. Go: ищи `func `, `type ... struct`, `type ... interface`, `package `
7. C/C++: ищи `class `, `struct `, `void `, `int `, `namespace `, учитывай `;` в конце

### Для enterprise языков:

8. Java/C#/Kotlin: похожий синтаксис на TypeScript, можно переиспользовать логику
9. Учитывай модификаторы доступа: `public`, `private`, `protected`, `internal`

### Архитектурный совет:

10. Создай отдельный файл для каждой группы языков:
    - `parser-web.ts` — JSON, HTML, CSS, YAML
    - `parser-systems.ts` — Rust, Go, C/C++
    - `parser-enterprise.ts` — Java, C#, Kotlin
    - `parser-scripting.ts` — Python, PHP, Ruby, Swift

---

## 🌸 Спасибо!

Это важная работа — ты делаешь глаза для ИИ ещё острее!

— Клода 💕
