/**
 * Python (.py) parser
 * Extracts classes, functions, methods
 */

import * as fs from 'fs/promises';
import { IFileTypeParser, FileStructure, FileElement } from './parser.interface.js';

export class PythonParser implements IFileTypeParser {
  readonly name = 'Python Parser';

  supports(extension: string): boolean {
    return extension.toLowerCase() === '.py';
  }

  async parse(filePath: string): Promise<FileStructure> {
    const content = await fs.readFile(filePath, 'utf-8');
    // Normalize line endings
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    const elements: FileElement[] = [];

    let currentLine = 1;
    for (const line of lines) {
      const trimmed = line.trim();
      const indentation = line.search(/\S/);

      // Skip comments and empty lines
      if (trimmed.startsWith('#') || trimmed === '') {
        currentLine++;
        continue;
      }

      // Classes (at module level, indentation = 0)
      if (indentation === 0 && /^class\s+\w+/.test(trimmed)) {
        const match = trimmed.match(/class\s+(\w+)/);
        if (match) {
          elements.push({
            name: match[1],
            type: 'class',
            startLine: currentLine,
          });
        }
      }

      // Functions at module level
      if (indentation === 0 && /^(async\s+)?def\s+\w+/.test(trimmed)) {
        const match = trimmed.match(/def\s+(\w+)/);
        if (match) {
          elements.push({
            name: match[1],
            type: 'function',
            startLine: currentLine,
          });
        }
      }

      // Methods (inside classes, indentation = 4)
      if (indentation > 0 && /^(async\s+)?def\s+\w+/.test(trimmed)) {
        const match = trimmed.match(/def\s+(\w+)/);
        if (match) {
          elements.push({
            name: match[1],
            type: 'method',
            startLine: currentLine,
          });
        }
      }

      currentLine++;
    }

    return {
      filePath,
      fileType: 'Python',
      language: 'python',
      totalLines: lines.length,
      elements,
    };
  }
}
