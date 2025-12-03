// ivy_protocol.ts - MCP tools + handlers
// GardenScript: Ivy = MCP-протокол

import { FactoryConfig } from "./types.js";
import {
  Oak_Generate,
  Oak_BatchGenerate,
  Oak_GenerateWithFiles,
  Oak_ListModels,
  Oak_GetKeyStatus,
  Oak_GrokSearch,
} from "./oak_core.js";
import { Rose_FormatResult, Rose_FormatBatch, Rose_FormatModels, Rose_FormatSearch } from "./rose_format.js";

// ============================================================================
// IVY TOOLS: Определение MCP tools
// ============================================================================

export const IVY_FACTORY_TOOLS = [
  {
    name: "generate_artifact",
    description:
      "Generate code or text using cheap LLM via OpenRouter. Returns full response with metadata. Optionally saves to file.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "What to generate (prompt for LLM)" },
        model: { type: "string", description: "OpenRouter model ID (default: qwen/qwen3-8b)" },
        output_path: { type: "string", description: "Full file path to save result. If not specified, just returns content." },
        temperature: { type: "number", description: "Temperature 0.0-2.0 (default: 0.7)" },
        max_tokens: { type: "number", description: "Max tokens in response (default: 4096)" },
        system: { type: "string", description: "System prompt for LLM" },
      },
      required: ["task"],
    },
  },
  {
    name: "batch_generate",
    description:
      "Mini-MoE: Send one prompt to multiple models in parallel. Returns all responses for comparison.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "One prompt for all models" },
        models: {
          type: "array",
          items: { type: "string" },
          description: "Array of OpenRouter model IDs",
        },
        temperature: { type: "number", description: "Temperature 0.0-2.0 (default: 0.7)" },
        max_tokens: { type: "number", description: "Max tokens in response (default: 4096)" },
        system: { type: "string", description: "System prompt for all models" },
      },
      required: ["task", "models"],
    },
  },
  {
    name: "generate_with_files",
    description:
      "Generate with file attachments. Server reads files and includes their content in the prompt.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "What to generate (prompt for LLM)" },
        files: {
          type: "array",
          items: { type: "string" },
          description: "Array of file paths to attach",
        },
        model: { type: "string", description: "OpenRouter model ID (default: qwen/qwen3-8b)" },
        output_path: { type: "string", description: "Full file path to save result" },
        temperature: { type: "number", description: "Temperature 0.0-2.0 (default: 0.7)" },
        max_tokens: { type: "number", description: "Max tokens in response (default: 4096)" },
        system: { type: "string", description: "System prompt for LLM" },
      },
      required: ["task", "files"],
    },
  },
  {
    name: "list_models",
    description: "Get list of available models from OpenRouter API with pricing info.",
    inputSchema: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          enum: ["free", "cheap", "all"],
          description: "Filter models: 'free' (cost=0), 'cheap' (< $0.001/1K tokens), 'all'",
        },
        search: { type: "string", description: "Search by model name/id" },
      },
    },
  },
  {
    name: "get_key_status",
    description: "Check OpenRouter API key status and usage limits.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "grok_search",
    description:
      "Search the web using Grok's built-in RAG (web_search + x_search). Returns factual summary with citations. Best for: current events, documentation, specs, real-time data.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query. Be specific: 'DeepSeek V3.2 API pricing and specs' not just 'DeepSeek'",
        },
        search_type: {
          type: "string",
          enum: ["web", "x", "both"],
          description: "'web' for docs/articles, 'x' for social/news, 'both' for comprehensive (default: both)",
        },
        max_tokens: {
          type: "number",
          description: "Max tokens in response (default: 1024)",
        },
      },
      required: ["query"],
    },
  },
];

// ============================================================================
// IVY HANDLERS: Обработчики MCP запросов
// ============================================================================

export async function Ivy_HandleGenerate(
  apiKey: string,
  config: FactoryConfig,
  args: {
    task: string;
    model?: string;
    output_path?: string;
    temperature?: number;
    max_tokens?: number;
    system?: string;
  }
) {
  const result = await Oak_Generate(
    apiKey,
    args.task,
    args.model || config.defaultModel,
    args.output_path,
    args.temperature,
    args.max_tokens,
    args.system
  );
  return { content: [{ type: "text", text: Rose_FormatResult(result) }] };
}

export async function Ivy_HandleBatch(
  apiKey: string,
  args: {
    task: string;
    models: string[];
    temperature?: number;
    max_tokens?: number;
    system?: string;
  }
) {
  const result = await Oak_BatchGenerate(
    apiKey,
    args.task,
    args.models,
    args.temperature,
    args.max_tokens,
    args.system
  );
  return { content: [{ type: "text", text: Rose_FormatBatch(result) }] };
}

export async function Ivy_HandleGenerateWithFiles(
  apiKey: string,
  config: FactoryConfig,
  args: {
    task: string;
    files: string[];
    model?: string;
    output_path?: string;
    temperature?: number;
    max_tokens?: number;
    system?: string;
  }
) {
  const result = await Oak_GenerateWithFiles(
    apiKey,
    args.task,
    args.files,
    args.model || config.defaultModel,
    args.output_path,
    args.temperature,
    args.max_tokens,
    args.system
  );
  return { content: [{ type: "text", text: Rose_FormatResult(result) }] };
}

export async function Ivy_HandleListModels(
  apiKey: string,
  args: { filter?: string; search?: string }
) {
  const models = await Oak_ListModels(apiKey, args.filter, args.search);
  return { content: [{ type: "text", text: Rose_FormatModels(models) }] };
}

export async function Ivy_HandleKeyStatus(apiKey: string) {
  const status = await Oak_GetKeyStatus(apiKey);
  return { content: [{ type: "text", text: JSON.stringify(status, null, 2) }] };
}

export async function Ivy_HandleGrokSearch(
  apiKey: string,
  args: {
    query: string;
    search_type?: "web" | "x" | "both";
    max_tokens?: number;
  }
) {
  const result = await Oak_GrokSearch(
    apiKey,
    args.query,
    args.search_type,
    args.max_tokens
  );
  return { content: [{ type: "text", text: Rose_FormatSearch(result) }] };
}
