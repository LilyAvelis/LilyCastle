// types.ts - Все типы MCP-Factory
// GardenScript: Централизованные типы

export interface FactoryConfig {
  defaultModel: string;
}

export interface GenerateMeta {
  model_used: string;
  latency_ms: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  finish_reason: string;
}

export interface GenerateResult {
  status: "success" | "failed";
  content?: string;
  saved_to?: string;
  meta?: GenerateMeta;
  error?: string;
}

export interface BatchResult {
  status: "success" | "partial" | "failed";
  results: Array<{
    model: string;
    status: "success" | "failed";
    content?: string;
    error?: string;
    meta?: GenerateMeta;
  }>;
  summary: {
    total_models: number;
    succeeded: number;
    failed: number;
    total_latency_ms: number;
  };
}

export interface SearchCitation {
  url: string;
  title?: string;
  snippet?: string;
}

export interface SearchResult {
  status: "success" | "failed";
  content?: string;
  citations?: SearchCitation[];
  meta?: GenerateMeta;
  error?: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  top_provider?: {
    is_moderated: boolean;
  };
}

export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  created: number;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
    index: number;
  }>;
  usage?: OpenRouterUsage;
}

export interface GrokSearchResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string;
  }>;
  citations?: Array<{
    url: string;
    title?: string;
    snippet?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
