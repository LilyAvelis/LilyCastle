// oak_core.ts - Бизнес-логика + HTTP-вызовы
// GardenScript: Oak = Бизнес-логика, Vine = HTTP, Fern = Утилиты

import * as fs from "fs";
import { 
  GenerateResult, 
  BatchResult, 
  OpenRouterModel, 
  SearchResult,
  OpenRouterResponse,
  GrokSearchResponse,
  FactoryConfig
} from "./types.js";

type GrokToolName = "web_search" | "x_search";

type GrokToolDefinition = {
  type: "function";
  function: {
    name: GrokToolName;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      additionalProperties: boolean;
    };
  };
};

const GROK_TOOL_DEFINITIONS: Record<GrokToolName, GrokToolDefinition> = {
  web_search: {
    type: "function",
    function: {
      name: "web_search",
      description:
        "Server-side web search with autonomous browsing. Supports optional domain filters and image understanding.",
      parameters: {
        type: "object",
        properties: {
          allowed_domains: {
            type: "array",
            description: "Restrict search/browsing to these domains (max 5).",
            items: { type: "string" },
          },
          excluded_domains: {
            type: "array",
            description: "Exclude these domains from results (max 5).",
            items: { type: "string" },
          },
          enable_image_understanding: {
            type: "boolean",
            description: "Allow Grok to inspect images it encounters while browsing.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  x_search: {
    type: "function",
    function: {
      name: "x_search",
      description:
        "Server-side X (Twitter) search with optional handle filters, date ranges, and media inspection.",
      parameters: {
        type: "object",
        properties: {
          allowed_x_handles: {
            type: "array",
            description: "Only include posts from these handles (max 10).",
            items: { type: "string" },
          },
          excluded_x_handles: {
            type: "array",
            description: "Exclude posts from these handles (max 10).",
            items: { type: "string" },
          },
          from_date: {
            type: "string",
            description: "ISO8601 date string marking the start of the window.",
          },
          to_date: {
            type: "string",
            description: "ISO8601 date string marking the end of the window.",
          },
          enable_image_understanding: {
            type: "boolean",
            description: "Allow Grok to analyze images attached to posts.",
          },
          enable_video_understanding: {
            type: "boolean",
            description: "Allow Grok to analyze videos attached to posts.",
          },
        },
        additionalProperties: false,
      },
    },
  },
};

// ============================================================================
// VINE: HTTP-вызовы к внешним API
// ============================================================================

/**
 * Выполняет запрос к API OpenRouter для генерации текста
 * @param apiKey - API ключ для доступа к OpenRouter
 * @param task - Текст запроса пользователя
 * @param model - Идентификатор модели для генерации
 * @param temperature - Параметр температуры для генерации (опционально)
 * @param maxTokens - Максимальное количество токенов в ответе (опционально)
 * @param system - Системное сообщение для настройки поведения модели (опционально)
 * @returns Promise с ответом от API OpenRouter
 */
export async function Vine_CallOpenRouter(
  apiKey: string,
  task: string,
  model: string,
  temperature?: number,
  maxTokens?: number,
  system?: string
): Promise<OpenRouterResponse> {
  const messages: Array<{ role: string; content: string }> = [];

  if (system) {
    messages.push({ role: "system", content: system });
  }
  messages.push({ role: "user", content: task });

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/LilyAvelis/LilyCastle",
      "X-Title": "MCP-Factory",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<OpenRouterResponse>;
}

/**
 * Извлекает сгенерированный текст из ответа OpenRouter
 * @param response - Ответ от API OpenRouter
 * @returns Строка с сгенерированным текстом
 */
export function Vine_ParseContent(response: OpenRouterResponse): string {
  if (!response.choices || !response.choices[0]) {
    throw new Error("Invalid response from OpenRouter: no choices");
  }
  return response.choices[0].message.content;
}

/**
 * Получает список доступных моделей с OpenRouter
 * @param apiKey - API ключ для доступа к OpenRouter
 * @returns Promise с массивом доступных моделей
 */
export async function Vine_FetchModels(apiKey: string): Promise<OpenRouterModel[]> {
  const response = await fetch("https://openrouter.ai/api/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }

  const data = (await response.json()) as { data?: OpenRouterModel[] };
  return data.data || [];
}

/**
 * Проверяет статус API ключа OpenRouter
 * @param apiKey - API ключ для проверки
 * @returns Promise с информацией о статусе ключа
 */
export async function Vine_FetchKeyStatus(apiKey: string): Promise<any> {
  const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch key status: ${response.status}`);
  }

  return response.json();
}

/**
 * Выполняет поиск через Grok API
 * @param apiKey - API ключ для доступа к OpenRouter
 * @param query - Поисковый запрос
 * @param searchType - Тип поиска: web, x или both (опционально)
 * @param maxTokens - Максимальное количество токенов в ответе (опционально)
 * @returns Promise с ответом от Grok API
 */
export async function Vine_CallGrokSearch(
  apiKey: string,
  query: string,
  searchType: "web" | "x" | "both" = "both",
  maxTokens: number = 1024
): Promise<GrokSearchResponse> {
  const tools: GrokToolDefinition[] = [];
  if (searchType === "web" || searchType === "both") {
    tools.push(GROK_TOOL_DEFINITIONS.web_search);
  }
  if (searchType === "x" || searchType === "both") {
    tools.push(GROK_TOOL_DEFINITIONS.x_search);
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/LilyAvelis/LilyCastle",
      "X-Title": "MCP-Factory",
    },
    body: JSON.stringify({
      model: "x-ai/grok-4.1-fast:free",
      messages: [
        {
          role: "system",
          content: "You are a search agent. Find real-time facts and always cite your sources. Be concise and factual.",
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.1,
      max_tokens: maxTokens,
      tool_choice: "auto",
      tools,
      reasoning: {
        enabled: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok search error ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<GrokSearchResponse>;
}

// ============================================================================
// FERN: Утилиты (мета, сохранение, фильтрация)
// ============================================================================

/**
 * Извлекает метаданные из ответа OpenRouter
 * @param response - Ответ от API OpenRouter
 * @param model - Использованная модель
 * @param latencyMs - Время выполнения запроса в миллисекундах
 * @returns Объект с метаданными запроса
 */
export function Fern_ExtractMeta(response: OpenRouterResponse, model: string, latencyMs: number) {
  return {
    model_used: model,
    latency_ms: latencyMs,
    tokens: {
      prompt: response.usage?.prompt_tokens || 0,
      completion: response.usage?.completion_tokens || 0,
      total: response.usage?.total_tokens || 0,
    },
    finish_reason: response.choices[0]?.finish_reason || "unknown",
  };
}

/**
 * Сохраняет текст в файл
 * @param content - Текст для сохранения
 * @param outputPath - Путь к файлу для сохранения
 */
export function Fern_SaveToFile(content: string, outputPath: string): void {
  fs.writeFileSync(outputPath, content, "utf-8");
}

/**
 * Фильтрует список моделей по цене и/или поисковому запросу
 * @param models - Массив моделей для фильтрации
 * @param filter - Тип фильтра: free, cheap или undefined (опционально)
 * @param search - Поисковый запрос для фильтрации по имени/ID (опционально)
 * @returns Отфильтрованный массив моделей
 */
export function Fern_FilterModels(
  models: OpenRouterModel[],
  filter?: string,
  search?: string
): OpenRouterModel[] {
  let filtered = models;

  // Фильтр по цене
  if (filter === "free") {
    filtered = filtered.filter(
      (m) =>
        parseFloat(m.pricing.prompt) === 0 &&
        parseFloat(m.pricing.completion) === 0
    );
  } else if (filter === "cheap") {
    filtered = filtered.filter(
      (m) =>
        parseFloat(m.pricing.prompt) < 0.001 &&
        parseFloat(m.pricing.completion) < 0.001
    );
  }

  // Поиск по имени/ID
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.id.toLowerCase().includes(searchLower) ||
        m.name.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

/**
 * Загружает конфигурацию фабрики
 * @returns Объект конфигурации
 */
export function Bloom_LoadConfig(): FactoryConfig {
  return {
    defaultModel: "qwen/qwen3-8b",
  };
}

/**
 * Загружает API ключ из переменных окружения
 * @returns API ключ или undefined, если не найден
 */
export function Bloom_LoadApiKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY;
}

// ============================================================================
// OAK: Основная бизнес-логика
// ============================================================================

// Кэш моделей
let modelsCache: OpenRouterModel[] | null = null;
let modelsCacheTime: number = 0;

/**
 * Генерирует текст с помощью указанной модели
 * @param apiKey - API ключ для доступа к OpenRouter
 * @param task - Текст запроса пользователя
 * @param model - Идентификатор модели для генерации
 * @param outputPath - Путь для сохранения результата в файл (опционально)
 * @param temperature - Параметр температуры для генерации (опционально)
 * @param maxTokens - Максимальное количество токенов в ответе (опционально)
 * @param system - Системное сообщение для настройки поведения модели (опционально)
 * @returns Promise с результатом генерации
 */
export async function Oak_Generate(
  apiKey: string,
  task: string,
  model: string,
  outputPath?: string,
  temperature?: number,
  maxTokens?: number,
  system?: string
): Promise<GenerateResult> {
  const startTime = Date.now();

  try {
    const response = await Vine_CallOpenRouter(
      apiKey,
      task,
      model,
      temperature,
      maxTokens,
      system
    );

    const content = Vine_ParseContent(response);
    const meta = Fern_ExtractMeta(response, model, Date.now() - startTime);

    if (outputPath) {
      Fern_SaveToFile(content, outputPath);
      return { status: "success", content, saved_to: outputPath, meta };
    }

    return { status: "success", content, meta };
  } catch (error: any) {
    return { status: "failed", error: error.message };
  }
}

/**
 * Выполняет пакетную генерацию текста с помощью нескольких моделей
 * @param apiKey - API ключ для доступа к OpenRouter
 * @param task - Текст запроса пользователя
 * @param models - Массив идентификаторов моделей для генерации
 * @param temperature - Параметр температуры для генерации (опционально)
 * @param maxTokens - Максимальное количество токенов в ответе (опционально)
 * @param system - Системное сообщение для настройки поведения модели (опционально)
 * @returns Promise с результатами пакетной генерации
 */
export async function Oak_BatchGenerate(
  apiKey: string,
  task: string,
  models: string[],
  temperature?: number,
  maxTokens?: number,
  system?: string
): Promise<BatchResult> {
  const startTime = Date.now();

  const promises = models.map(async (model) => {
    const modelStart = Date.now();
    try {
      const response = await Vine_CallOpenRouter(
        apiKey,
        task,
        model,
        temperature,
        maxTokens,
        system
      );
      const content = Vine_ParseContent(response);
      const meta = Fern_ExtractMeta(response, model, Date.now() - modelStart);
      return { model, status: "success" as const, content, meta };
    } catch (error: any) {
      return { model, status: "failed" as const, error: error.message };
    }
  });

  const results = await Promise.all(promises);

  const succeeded = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "failed").length;

  return {
    status: failed === 0 ? "success" : succeeded === 0 ? "failed" : "partial",
    results,
    summary: {
      total_models: models.length,
      succeeded,
      failed,
      total_latency_ms: Date.now() - startTime,
    },
  };
}

/**
 * Генерирует текст с учетом содержимого указанных файлов
 * @param apiKey - API ключ для доступа к OpenRouter
 * @param task - Текст запроса пользователя
 * @param files - Массив путей к файлам для включения в запрос
 * @param model - Идентификатор модели для генерации
 * @param outputPath - Путь для сохранения результата в файл (опционально)
 * @param temperature - Параметр температуры для генерации (опционально)
 * @param maxTokens - Максимальное количество токенов в ответе (опционально)
 * @param system - Системное сообщение для настройки поведения модели (опционально)
 * @returns Promise с результатом генерации
 */
export async function Oak_GenerateWithFiles(
  apiKey: string,
  task: string,
  files: string[],
  model: string,
  outputPath?: string,
  temperature?: number,
  maxTokens?: number,
  system?: string
): Promise<GenerateResult> {
  const fileContents = files.map((filePath) => {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return `<file path="${filePath}">\n${content}\n</file>`;
    } catch (error: any) {
      return `<file path="${filePath}" error="${error.message}" />`;
    }
  });

  const fullPrompt = `${fileContents.join("\n\n")}\n\n<task>\n${task}\n</task>`;

  return Oak_Generate(apiKey, fullPrompt, model, outputPath, temperature, maxTokens, system);
}

/**
 * Получает список моделей с возможностью фильтрации
 * @param apiKey - API ключ для доступа к OpenRouter
 * @param filter - Тип фильтра: free, cheap или undefined (опционально)
 * @param search - Поисковый запрос для фильтрации по имени/ID (опционально)
 * @returns Promise с отфильтрованным списком моделей
 */
export async function Oak_ListModels(
  apiKey: string,
  filter?: string,
  search?: string
): Promise<OpenRouterModel[]> {
  const now = Date.now();
  
  // Кэш на 5 минут
  if (modelsCache && now - modelsCacheTime < 5 * 60 * 1000) {
    return Fern_FilterModels(modelsCache, filter, search);
  }

  const models = await Vine_FetchModels(apiKey);
  modelsCache = models;
  modelsCacheTime = now;

  return Fern_FilterModels(models, filter, search);
}

/**
 * Получает статус API ключа
 * @param apiKey - API ключ для проверки
 * @returns Promise с информацией о статусе ключа
 */
export async function Oak_GetKeyStatus(apiKey: string): Promise<any> {
  return Vine_FetchKeyStatus(apiKey);
}

/**
 * Выполняет поиск через Grok API
 * @param apiKey - API ключ для доступа к OpenRouter
 * @param query - Поисковый запрос
 * @param searchType - Тип поиска: web, x или both (опционально)
 * @param maxTokens - Максимальное количество токенов в ответе (опционально)
 * @returns Promise с результатами поиска
 */
export async function Oak_GrokSearch(
  apiKey: string,
  query: string,
  searchType?: "web" | "x" | "both",
  maxTokens?: number
): Promise<SearchResult> {
  const startTime = Date.now();

  try {
    const response = await Vine_CallGrokSearch(
      apiKey,
      query,
      searchType || "both",
      maxTokens || 1024
    );

    const content = response.choices?.[0]?.message?.content || "";
    const citations = response.citations || [];

    return {
      status: "success",
      content,
      citations,
      meta: {
        model_used: response.model || "x-ai/grok-4.1-fast",
        latency_ms: Date.now() - startTime,
        tokens: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        },
        finish_reason: response.choices?.[0]?.finish_reason || "unknown",
      },
    };
  } catch (error: any) {
    return { status: "failed", error: error.message };
  }
}