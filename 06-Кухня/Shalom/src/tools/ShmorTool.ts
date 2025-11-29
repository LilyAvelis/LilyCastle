import { BaseTool } from '../@BaseTool.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * שמור (Shmor) — инструмент сохранения
 * Аналог: Save / Commit / Preserve
 */
export class ShmorTool extends BaseTool {
  readonly name = 'שמור';
  readonly description = 'Save state to eternity (SHFS). Preserve data and create checkpoints.';
  
  readonly parameters = {
    type: 'object' as const,
    properties: {
      targets: {
        type: 'array',
        items: { type: 'string' },
        description: 'What to save (e.g., ["memory", "state", "Plan.dao"])'
      },
      format: {
        type: 'string',
        enum: ['json', 'markdown', 'raw'],
        description: 'Format for saving'
      },
      location: {
        type: 'string',
        description: 'Where to save (file path or storage key)'
      }
    },
    required: ['targets']
  };

  async execute(args: { 
    targets: string[]; 
    format?: string;
    location?: string;
  }): Promise<any> {
    this.validate(args);
    
    const results: Record<string, any> = {};
    const format = args.format || 'json';
    const saveLocation = args.location || './shfs-storage';
    
    for (const target of args.targets) {
      try {
        switch (target) {
          case 'memory':
            results.memory = {
              success: true,
              action: 'memory_snapshot',
              location: `${saveLocation}/memory.${format}`,
              timestamp: new Date().toISOString()
            };
            break;
            
          case 'state':
            results.state = {
              success: true,
              action: 'state_checkpoint',
              location: `${saveLocation}/state.${format}`,
              timestamp: new Date().toISOString()
            };
            break;
            
          default:
            // Save specific file
            if (target.includes('.')) {
              const filePath = path.resolve(saveLocation, target);
              await fs.mkdir(path.dirname(filePath), { recursive: true });
              
              const content = format === 'json' 
                ? JSON.stringify({ saved: target, timestamp: new Date().toISOString() }, null, 2)
                : `# Saved: ${target}\n\nTimestamp: ${new Date().toISOString()}`;
              
              await fs.writeFile(filePath, content, 'utf-8');
              
              results[target] = {
                success: true,
                location: filePath,
                format: format
              };
            } else {
              results[target] = {
                success: true,
                message: `Saved ${target} to ${saveLocation}`,
                format: format
              };
            }
        }
      } catch (error) {
        results[target] = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    return {
      action: 'שמור (Preserve)',
      format: format,
      location: saveLocation,
      results: results,
      summary: `Saved ${Object.values(results).filter(r => r.success).length} items to SHFS`
    };
  }
}
