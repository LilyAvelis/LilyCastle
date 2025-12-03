// rose_format.ts - Форматирование вывода
// GardenScript: Rose = Форматирование вывода

import { GenerateResult, BatchResult, OpenRouterModel, SearchResult } from "./types.js";

export function Rose_FormatResult(result: GenerateResult): string {
  return JSON.stringify(result, null, 2);
}

export function Rose_FormatBatch(result: BatchResult): string {
  return JSON.stringify(result, null, 2);
}

export function Rose_FormatModels(models: OpenRouterModel[]): string {
  const formatted = models.map((m) => ({
    id: m.id,
    name: m.name,
    context_length: m.context_length,
    pricing: {
      prompt_per_1m: `$${(parseFloat(m.pricing.prompt) * 1_000_000).toFixed(4)}`,
      completion_per_1m: `$${(parseFloat(m.pricing.completion) * 1_000_000).toFixed(4)}`,
    },
    is_free:
      parseFloat(m.pricing.prompt) === 0 &&
      parseFloat(m.pricing.completion) === 0,
  }));

  return JSON.stringify(
    {
      count: models.length,
      models: formatted,
    },
    null,
    2
  );
}

export function Rose_FormatSearch(result: SearchResult): string {
  if (result.status === "failed") {
    return JSON.stringify(result, null, 2);
  }

  // Форматируем более читаемо для search результатов
  const output: any = {
    status: result.status,
    content: result.content,
  };

  if (result.citations && result.citations.length > 0) {
    output.citations = result.citations.map((c, i) => ({
      index: i + 1,
      url: c.url,
      title: c.title || "(no title)",
    }));
    output.citations_count = result.citations.length;
  }

  if (result.meta) {
    output.meta = result.meta;
  }

  return JSON.stringify(output, null, 2);
}
