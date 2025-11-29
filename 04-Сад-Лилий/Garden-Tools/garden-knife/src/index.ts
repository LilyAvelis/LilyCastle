import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

const server = new Server(
  {
    name: "garden-knife",
    version: "0.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============ ПОИСК ЭЛЕМЕНТА ПО АДРЕСУ ============

interface FoundElement {
  startLine: number;  // 0-indexed
  endLine: number;    // 0-indexed, exclusive
  content: string;
}

/**
 * Найти элемент в TypeScript/JavaScript файле по адресу
 * Поддерживает: ClassName.methodName, functionName, ClassName
 */
function findElementTS(lines: string[], target: string): FoundElement | null {
  const parts = target.split(".");
  const searchName = parts[parts.length - 1];
  
  let startLine = -1;
  let braceCount = 0;
  let endLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Ищем определение
    if (startLine === -1) {
      // Метод или функция: name(
      const isMethodOrFunc = 
        new RegExp(`\\b${searchName}\\s*\\(`).test(line) ||
        new RegExp(`\\b${searchName}\\s*<[^>]*>\\s*\\(`).test(line);
      
      // Класс или интерфейс
      const isClassOrInterface = 
        new RegExp(`\\b(class|interface|type)\\s+${searchName}\\b`).test(line);
      
      if (isMethodOrFunc || isClassOrInterface) {
        startLine = i;
        braceCount = 0;
        
        // Считаем скобки в текущей строке
        for (const char of line) {
          if (char === "{") braceCount++;
          if (char === "}") braceCount--;
        }
        
        // Если уже закрылось (однострочник)
        if (braceCount === 0 && line.includes("{") && line.includes("}")) {
          endLine = i + 1;
          break;
        }
        
        // Если нет { — это декларация типа или интерфейс без тела
        if (!line.includes("{") && (trimmed.endsWith(";") || trimmed.endsWith(","))) {
          endLine = i + 1;
          break;
        }
        
        continue;
      }
    }
    
    // Считаем скобки после начала
    if (startLine !== -1) {
      for (const char of line) {
        if (char === "{") braceCount++;
        if (char === "}") braceCount--;
      }
      
      // Когда все скобки закрылись — это конец
      if (braceCount <= 0 && line.includes("}")) {
        endLine = i + 1;
        break;
      }
    }
  }
  
  if (startLine === -1) return null;
  if (endLine === -1) endLine = Math.min(startLine + 100, lines.length);
  
  return {
    startLine,
    endLine,
    content: lines.slice(startLine, endLine).join("\n"),
  };
}

/**
 * Найти элемент в Markdown по заголовку
 */
function findElementMD(lines: string[], target: string): FoundElement | null {
  const targetText = target.replace(/^#+\s*/, "").toLowerCase();
  
  let startLine = -1;
  let startLevel = 0;
  let endLine = lines.length;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#+)\s+(.+)/);
    
    if (match) {
      const level = match[1].length;
      const text = match[2].toLowerCase();
      
      if (startLine === -1 && text.includes(targetText)) {
        startLine = i;
        startLevel = level;
      } else if (startLine !== -1 && level <= startLevel) {
        endLine = i;
        break;
      }
    }
  }
  
  if (startLine === -1) return null;
  
  return {
    startLine,
    endLine,
    content: lines.slice(startLine, endLine).join("\n"),
  };
}

/**
 * Найти элемент в Rust
 */
function findElementRust(lines: string[], target: string): FoundElement | null {
  const parts = target.split("::");
  const searchName = parts[parts.length - 1];
  
  let startLine = -1;
  let braceCount = 0;
  let endLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (startLine === -1) {
      // fn name, struct Name, impl Name, trait Name, enum Name
      const isElement = 
        new RegExp(`\\b(fn|struct|impl|trait|enum|mod)\\s+${searchName}\\b`).test(line) ||
        new RegExp(`\\bimpl\\s+\\w+\\s+for\\s+${searchName}\\b`).test(line);
      
      if (isElement) {
        startLine = i;
        braceCount = 0;
        
        for (const char of line) {
          if (char === "{") braceCount++;
          if (char === "}") braceCount--;
        }
        
        if (braceCount === 0 && line.includes("{") && line.includes("}")) {
          endLine = i + 1;
          break;
        }
        
        // Для struct без тела
        if (!line.includes("{") && line.includes(";")) {
          endLine = i + 1;
          break;
        }
        
        continue;
      }
    }
    
    if (startLine !== -1) {
      for (const char of line) {
        if (char === "{") braceCount++;
        if (char === "}") braceCount--;
      }
      
      if (braceCount <= 0 && line.includes("}")) {
        endLine = i + 1;
        break;
      }
    }
  }
  
  if (startLine === -1) return null;
  if (endLine === -1) endLine = Math.min(startLine + 100, lines.length);
  
  return {
    startLine,
    endLine,
    content: lines.slice(startLine, endLine).join("\n"),
  };
}

/**
 * Универсальный поиск элемента
 */
function findElement(filePath: string, target: string): FoundElement | null {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const ext = filePath.split(".").pop()?.toLowerCase();
  
  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return findElementTS(lines, target);
    
    case "md":
    case "markdown":
      return findElementMD(lines, target);
    
    case "rs":
      return findElementRust(lines, target);
    
    // TODO: добавить другие языки по мере необходимости
    default:
      // Fallback на TS-подобный поиск для С-подобных языков
      return findElementTS(lines, target);
  }
}

// ============ ЗАМЕНА ЭЛЕМЕНТА ============

interface KnifeResult {
  success: boolean;
  message: string;
  oldCode?: string;
  newCode?: string;
  startLine?: number;
  endLine?: number;
}

function knifeReplace(filePath: string, target: string, newCode: string): KnifeResult {
  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    
    const element = findElement(filePath, target);
    
    if (!element) {
      return {
        success: false,
        message: `❌ Не найдено: ${target}`,
      };
    }
    
    // Определяем отступ оригинального кода
    const originalFirstLine = lines[element.startLine];
    const indent = originalFirstLine.match(/^(\s*)/)?.[1] || "";
    
    // Применяем отступ к новому коду
    const newCodeLines = newCode.split("\n").map((line, i) => {
      if (i === 0) return indent + line.trimStart();
      // Сохраняем относительный отступ
      const lineIndent = line.match(/^(\s*)/)?.[1] || "";
      const relativeIndent = lineIndent.length > 0 ? lineIndent : "";
      return indent + relativeIndent + line.trimStart();
    });
    
    // Заменяем строки
    const newLines = [
      ...lines.slice(0, element.startLine),
      ...newCodeLines,
      ...lines.slice(element.endLine),
    ];
    
    // Записываем файл
    writeFileSync(filePath, newLines.join("\n"), "utf-8");
    
    return {
      success: true,
      message: `✅ Заменено: ${target} (строки ${element.startLine + 1}–${element.endLine})`,
      oldCode: element.content,
      newCode: newCodeLines.join("\n"),
      startLine: element.startLine + 1,
      endLine: element.endLine,
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Ошибка: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// ============ MCP TOOLS ============

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "knife",
        description:
          "🔪 Заменить элемент кода по адресу (функцию, метод, класс). Используй после focus() чтобы заменить то что увидел.",
        inputSchema: {
          type: "object" as const,
          properties: {
            filePath: {
              type: "string",
              description: "Абсолютный путь к файлу",
            },
            target: {
              type: "string", 
              description: "Адрес элемента: 'ClassName.methodName' или 'functionName' или '## Заголовок'",
            },
            newCode: {
              type: "string",
              description: "Новый код элемента (полностью, включая сигнатуру)",
            },
          },
          required: ["filePath", "target", "newCode"],
        },
      },
      {
        name: "knife_preview",
        description:
          "👀 Показать что будет заменено БЕЗ фактической замены. Для проверки перед knife.",
        inputSchema: {
          type: "object" as const,
          properties: {
            filePath: {
              type: "string",
              description: "Абсолютный путь к файлу",
            },
            target: {
              type: "string",
              description: "Адрес элемента",
            },
          },
          required: ["filePath", "target"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "knife") {
      const { filePath, target, newCode } = args as {
        filePath: string;
        target: string;
        newCode: string;
      };

      const result = knifeReplace(filePath, target, newCode);

      if (result.success) {
        return {
          content: [
            {
              type: "text" as const,
              text: `🔪 ${result.message}\n${"─".repeat(50)}\n\n📍 Было (строки ${result.startLine}–${result.endLine}):\n\`\`\`\n${result.oldCode}\n\`\`\`\n\n📍 Стало:\n\`\`\`\n${result.newCode}\n\`\`\``,
            },
          ],
        };
      } else {
        return {
          content: [{ type: "text" as const, text: result.message }],
          isError: true,
        };
      }
    }

    if (name === "knife_preview") {
      const { filePath, target } = args as {
        filePath: string;
        target: string;
      };

      const element = findElement(filePath, target);

      if (!element) {
        return {
          content: [
            { type: "text" as const, text: `❌ Не найдено: ${target}` },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `👀 Preview: ${target}\n📍 Строки ${element.startLine + 1}–${element.endLine}\n${"─".repeat(50)}\n\n\`\`\`\n${element.content}\n\`\`\`\n\n💡 Используй knife() с newCode чтобы заменить этот код.`,
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

// ============ ЗАПУСК ============

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🔪 Garden Knife MCP Server running on stdio");
}

export {
  findElementTS,
  findElementMD,
  findElementRust,
  findElement,
  knifeReplace,
};

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  main().catch(console.error);
}
