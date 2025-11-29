#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';
import { BaseTool } from './@BaseTool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Реестр всех зарегистрированных инструментов
 */
class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();

  /**
   * Зарегистрировать инструмент
   */
  register(tool: BaseTool): void {
      if (!tool || !tool.name) {
        throw new Error('Invalid tool: tool and tool.name are required');
      }
      
      if (this.tools.has(tool.name)) {
        console.warn(`⚠️ Tool already registered, overwriting: ${tool.name}`);
      }
      
      this.tools.set(tool.name, tool);
      console.error(`🔧 Registered tool: ${tool.name} (total: ${this.tools.size})`);
    }

  /**
   * Получить инструмент по имени
   */
  get(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Получить все инструменты как массив
   */
  getAll(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Получить количество зарегистрированных инструментов
   */
  get count(): number {
    return this.tools.size;
  }
}

/**
 * Автоматически сканировать и загрузить все инструменты из директории tools/
 */
async function loadToolsAutomatically(registry: ToolRegistry): Promise<void> {
  const toolsDir = join(__dirname, 'tools');
  
  try {
    const files = await readdir(toolsDir);
    const toolFiles = files.filter(f => f.endsWith('.js') && f !== 'BaseTool.js');

    for (const file of toolFiles) {
      try {
        const modulePath = join(toolsDir, file);
        const moduleUrl = pathToFileURL(modulePath).href;
        const module = await import(moduleUrl);
        
        // Найти класс, который наследуется от BaseTool
        for (const exportName in module) {
          const exported = module[exportName];
          
          if (typeof exported === 'function' && 
              exported.prototype instanceof BaseTool) {
            const tool = new exported();
            registry.register(tool);
            break;
          }
        }
      } catch (error) {
        console.error(`❌ Failed to load tool from ${file}:`, error);
      }
    }
    
    console.error(`✅ Loaded ${registry.count} tools from tools/`);
  } catch (error) {
    console.error('❌ Failed to scan tools directory:', error);
  }
}

/**
 * Создать и настроить MCP сервер
 */
async function createServer(): Promise<Server> {
  const registry = new ToolRegistry();
  
  // Загрузить все инструменты автоматически
  await loadToolsAutomatically(registry);

  const server = new Server(
    {
      name: 'shalom-mcp-server',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Обработчик запроса списка инструментов
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: registry.getAll().map(tool => tool.getTool()),
    };
  });

  // Обработчик вызова инструмента
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = registry.get(request.params.name);
    
    if (!tool) {
      throw new Error(`Tool not found: ${request.params.name}`);
    }

    try {
      console.error(`🚀 Executing tool: ${tool.name}`);
      const result = await tool.execute(request.params.arguments);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error(`❌ Tool execution failed:`, error);
      throw error;
    }
  });

  return server;
}

/**
 * Главная функция
 */
async function main() {
  console.error('🕊️ Starting SHALOM MCP Server...');
  
  try {
    const server = await createServer();
    const transport = new StdioServerTransport();
    
    await server.connect(transport);
    console.error('🕊️ SHALOM MCP Server is running (stdio)');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Запуск
main().catch(console.error);
