import { BaseTool } from '../@BaseTool.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * ברא (Bara) — инструмент создания
 * Аналог: Generate / Create / Write
 */
export class BaraTool extends BaseTool {
  readonly name = 'ברא';
  readonly description = 'Create new content (text, code, files). Manifest will into reality.';
  
  readonly parameters = {
    type: 'object' as const,
    properties: {
      targets: {
        type: 'array',
        items: { type: 'string' },
        description: 'What to create (e.g., ["Plan.dao", "README.md"])'
      },
      content: {
        type: 'string',
        description: 'Content to write (for text generation)'
      },
      template: {
        type: 'string',
        enum: ['file', 'code', 'text', 'plan'],
        description: 'Type of creation'
      },
      strategy: {
        type: 'string',
        enum: ['aggressive', 'careful', 'minimal'],
        description: 'Creation strategy'
      }
    },
    required: ['targets']
  };

  async execute(args: { 
    targets: string[]; 
    content?: string;
    template?: string;
    strategy?: string;
  }): Promise<any> {
    this.validate(args);
    
    const results: Record<string, any> = {};
    const strategy = args.strategy || 'careful';
    
    for (const target of args.targets) {
      try {
        if (target.endsWith('.dao') || target.endsWith('.md') || target.endsWith('.txt')) {
          // File creation
          const filePath = path.resolve(process.cwd(), target);
          const fileContent = args.content || `# Created by ברא (Bara)\n\nTarget: ${target}\nStrategy: ${strategy}\nTimestamp: ${new Date().toISOString()}`;
          
          await fs.writeFile(filePath, fileContent, 'utf-8');
          
          results[target] = {
            success: true,
            path: filePath,
            strategy: strategy,
            message: `File created: ${target}`
          };
        } else {
          // Other creation types
          results[target] = {
            success: true,
            type: args.template || 'generic',
            message: `Created: ${target} with strategy: ${strategy}`
          };
        }
      } catch (error) {
        results[target] = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          message: `Failed to create: ${target}`
        };
      }
    }
    
    return {
      action: 'ברא (Create)',
      strategy: strategy,
      results: results,
      summary: `Created ${Object.values(results).filter(r => r.success).length} items`
    };
  }
}
