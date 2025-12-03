#!/usr/bin/env node
// src/index.ts - MCP-Factory v2 Entry Point
// GardenScript: Главный модуль, собирает все части

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { Bloom_LoadConfig, Bloom_LoadApiKey } from "./oak_core.js";
import { 
  IVY_FACTORY_TOOLS,
  Ivy_HandleGenerate, 
  Ivy_HandleBatch, 
  Ivy_HandleGenerateWithFiles, 
  Ivy_HandleListModels, 
  Ivy_HandleKeyStatus, 
  Ivy_HandleGrokSearch 
} from "./ivy_protocol.js";

function Bloom_CreateServer(): Server {
  return new Server(
    {
      name: "mcp-factory",
      version: "2.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );
}

async function main() {
  // Bloom: инициализация
  const server = Bloom_CreateServer();
  const config = Bloom_LoadConfig();
  const apiKey = Bloom_LoadApiKey();

  if (!apiKey) {
    console.error("OPENROUTER_API_KEY not set");
    process.exit(1);
  }

  // Ivy: регистрация tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: IVY_FACTORY_TOOLS,
  }));

  // Ivy: обработка вызовов
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "generate_artifact":
          return await Ivy_HandleGenerate(apiKey, config, args as any);

        case "batch_generate":
          return await Ivy_HandleBatch(apiKey, args as any);

        case "generate_with_files":
          return await Ivy_HandleGenerateWithFiles(apiKey, config, args as any);

        case "list_models":
          return await Ivy_HandleListModels(apiKey, args as any);

        case "get_key_status":
          return await Ivy_HandleKeyStatus(apiKey);

        case "grok_search":
          return await Ivy_HandleGrokSearch(apiKey, args as any);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message || String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Запуск
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP-Factory v2 started");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
