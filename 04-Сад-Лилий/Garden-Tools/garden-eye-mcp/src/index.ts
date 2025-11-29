import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import {
  parseTypeScript,
  parseMarkdown,
  parseJson,
  parseYaml,
  parsePython,
  parseHtml,
  parseCss,
  parseRust,
  parseGo,
  parseCpp,
  parseJava,
  parseCSharp,
  parsePhp,
  parseRuby,
  parseSwift,
  parseKotlin,
  focusJson,
} from "./parser.js";

const server = new Server(
  {
    name: "garden-eye",
    version: "0.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const skeletonParsers: Record<string, (content: string) => string> = {
  md: parseMarkdown,
  markdown: parseMarkdown,
  ts: parseTypeScript,
  tsx: parseTypeScript,
  js: parseTypeScript,
  jsx: parseTypeScript,
  json: parseJson,
  yaml: parseYaml,
  yml: parseYaml,
  py: parsePython,
  html: parseHtml,
  htm: parseHtml,
  css: parseCss,
  rs: parseRust,
  go: parseGo,
  c: parseCpp,
  h: parseCpp,
  cpp: parseCpp,
  hpp: parseCpp,
  cc: parseCpp,
  cxx: parseCpp,
  java: parseJava,
  cs: parseCSharp,
  php: parsePhp,
  rb: parseRuby,
  swift: parseSwift,
  kt: parseKotlin,
  kts: parseKotlin,
};

const supportedExtensions = Array.from(new Set(Object.keys(skeletonParsers))).sort();

// Список доступных tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "skeleton",
        description:
          "👁️ Показать структуру файла (классы, методы, функции, заголовки) БЕЗ реализации. Используй ПЕРЕД чтением файла чтобы понять его структуру.",
        inputSchema: {
          type: "object" as const,
          properties: {
            filePath: {
              type: "string",
              description: "Абсолютный путь к файлу",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "focus",
        description:
          "🔍 Прочитать конкретный элемент по адресу (например Class.method или ## Заголовок). Используй ПОСЛЕ skeleton чтобы прочитать нужную часть.",
        inputSchema: {
          type: "object" as const,
          properties: {
            filePath: {
              type: "string",
              description: "Абсолютный путь к файлу",
            },
            target: {
              type: "string",
              description:
                "Адрес элемента: 'ClassName.methodName' или 'functionName' или '## Заголовок'",
            },
          },
          required: ["filePath", "target"],
        },
      },
    ],
  };
});

// Обработка вызовов tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "skeleton") {
      const filePath = (args as { filePath: string }).filePath;
      const content = readFileSync(filePath, "utf-8");
      const ext = filePath.split(".").pop()?.toLowerCase();

      const parser = ext ? skeletonParsers[ext] : undefined;
      const skeleton = parser
        ? parser(content)
        : `⚠️ Неподдерживаемый тип файла: .${ext}\nПоддерживаются: ${supportedExtensions
            .map((extension) => `.${extension}`)
            .join(", ")}`;

      return {
        content: [
          {
            type: "text" as const,
            text: `📄 ${filePath}\n${"─".repeat(50)}\n${skeleton}`,
          },
        ],
      };
    }

    if (name === "focus") {
      const { filePath, target } = args as { filePath: string; target: string };
      const content = readFileSync(filePath, "utf-8");
      const ext = filePath.split(".").pop()?.toLowerCase();
      const fileName = filePath.split(/[/\\]/).pop() || filePath;

      let result: string;

      if (ext === "md" || ext === "markdown") {
        result = focusMarkdown(content, target);
      } else if (ext === "json") {
        result = focusJson(content, target);
      } else if (["ts", "tsx", "js", "jsx"].includes(ext || "")) {
        result = focusTypeScript(content, target);
      } else {
        result = `⚠️ Неподдерживаемый тип файла: .${ext}`;
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `🔍 Focus: ${fileName} → ${target}\n📂 ${filePath}\n${"─".repeat(50)}\n${result}`,
          },
        ],
      };
    }

    return {
      content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Focus для Markdown — найти секцию по заголовку
function focusMarkdown(content: string, target: string): string {
  const lines = content.split("\n");
  const targetLevel = (target.match(/^#+/) || [""])[0].length;
  const targetText = target.replace(/^#+\s*/, "").toLowerCase();

  let startLine = -1;
  let endLine = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#+)\s+(.+)/);

    if (match) {
      const level = match[1].length;
      const text = match[2].toLowerCase();

      if (startLine === -1 && text.includes(targetText)) {
        startLine = i;
      } else if (startLine !== -1 && level <= targetLevel) {
        endLine = i;
        break;
      }
    }
  }

  if (startLine === -1) {
    return `❌ Не найдено: ${target}`;
  }

  return lines.slice(startLine, endLine).join("\n");
}

// Focus для TypeScript — найти метод/функцию/класс
function focusTypeScript(content: string, target: string): string {
  const parts = target.split(".");
  const lines = content.split("\n");

  // Простой поиск по имени (для MVP)
  const searchName = parts[parts.length - 1];

  // Ищем начало определения
  let startLine = -1;
  let braceCount = 0;
  let endLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Ищем определение метода/функции/класса
    if (
      startLine === -1 &&
      (line.includes(`${searchName}(`) ||
        line.includes(`${searchName} (`) ||
        line.includes(`class ${searchName}`) ||
        line.includes(`interface ${searchName}`) ||
        line.includes(`type ${searchName}`))
    ) {
      startLine = i;
      braceCount = 0;
    }

    if (startLine !== -1) {
      // Считаем скобки
      for (const char of line) {
        if (char === "{") braceCount++;
        if (char === "}") braceCount--;
      }

      // Когда скобки закрылись — это конец
      if (braceCount === 0 && line.includes("}")) {
        endLine = i + 1;
        break;
      }
    }
  }

  if (startLine === -1) {
    return `❌ Не найдено: ${target}`;
  }

  if (endLine === -1) endLine = Math.min(startLine + 50, lines.length);

  const result = lines.slice(startLine, endLine).join("\n");
  return `📍 Lines ${startLine + 1}–${endLine}\n\n${result}`;
}

// Запуск сервера
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("👁️ Garden Eye MCP Server running on stdio");
}

main().catch(console.error);
