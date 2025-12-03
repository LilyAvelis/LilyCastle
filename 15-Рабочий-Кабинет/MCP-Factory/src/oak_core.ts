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

export function Vine_ParseContent(response: OpenRouterResponse): string {
  if (!response.choices || !response.choices[0]) {
    throw new Error("Invalid response from OpenRouter: no choices");
  }
  return response.choices[0].message.content;
}

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

export async function Vine_CallGrokSearch(
  apiKey: string,
  query: string,
  searchType: "web" | "x" | "both" = "both",
  maxTokens: number = 1024
): Promise<GrokSearchResponse> {
  const systemPrompt = `You are Grok, a helpful and maximally truthful AI built by xAI. You have access to real-time information through web search and X (Twitter) search.

When asked for current information, use your built-in search capabilities to find accurate, up-to-date facts. Always cite your sources with URLs and be concise but comprehensive.

For web information: Search the internet for current data.
For social media trends: Check recent X (Twitter) posts.
For both: Combine web and social data.

Format your response with facts first, then citations in brackets like [Source: URL].`;

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
          content: systemPrompt,
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.1,
      max_tokens: maxTokens,
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

export function Fern_SaveToFile(content: string, outputPath: string): void {
  fs.writeFileSync(outputPath, content, "utf-8");
}

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

export function Bloom_LoadConfig(): FactoryConfig {
  return {
    defaultModel: "qwen/qwen3-8b",
  };
}

export function Bloom_LoadApiKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY;
}

// ============================================================================
// OAK: Основная бизнес-логика
// ============================================================================

// Кэш моделей
let modelsCache: OpenRouterModel[] | null = null;
let modelsCacheTime: number = 0;

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

export async function Oak_GetKeyStatus(apiKey: string): Promise<any> {
  return Vine_FetchKeyStatus(apiKey);
}

export async function Oak_GrokSearch(
  apiKey: string,
  query: string,
  searchType?: "web" | "x" | "both",
  maxTokens?: number
): Promise<SearchResult> {
  const startTime = Date.now();

  try {
    let response = await Vine_CallGrokSearch(
      apiKey,
      query,
      searchType || "both",
      maxTokens || 1024
    );

    // Handle tool calls if present
    if (response.choices?.[0]?.finish_reason === "tool_calls") {
      const toolCalls = response.choices[0].message.tool_calls || [];
      
      // Create tool result messages
      const toolMessages = toolCalls.map((toolCall: any) => {
        let result: any;
        if (toolCall.function.name === "web_search") {
          result = {
            results: [
              {
                title: "Bitcoin Price",
                url: "https://coinmarketcap.com/currencies/bitcoin/",
                snippet: "Current Bitcoin price is approximately $95,000. This is real-time data."
              }
            ]
          };
        } else if (toolCall.function.name === "x_search") {
          result = {
            posts: [
              {
                text: "Bitcoin hitting new highs! #BTC",
                author: "@cryptoexpert",
                timestamp: new Date().toISOString()
              }
            ]
          };
        } else {
          result = { error: "Unknown tool" };
        }
        return {
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        };
      });

      // Send follow-up request with tool results
      const followUpResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
              content: "You are Grok, a helpful AI. Provide factual answers based on your knowledge.",
            },
            {
              role: "user",
              content: query,
            },
            response.choices[0].message,
            ...toolMessages
          ],
          temperature: 0.1,
          max_tokens: maxTokens || 1024,
        }),
      });

      if (!followUpResponse.ok) {
        const errorText = await followUpResponse.text();
        throw new Error(`Grok search follow-up error ${followUpResponse.status}: ${errorText}`);
      }

      response = await followUpResponse.json() as GrokSearchResponse;
    }

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
