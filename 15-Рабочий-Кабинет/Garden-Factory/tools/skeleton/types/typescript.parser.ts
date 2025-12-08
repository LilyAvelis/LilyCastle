/**
 * TypeScript (.ts, .tsx) parser
 * Extracts classes, methods, functions, interfaces, types
 */

import * as fs from 'fs/promises';
import { IFileTypeParser, FileStructure, FileElement } from './parser.interface.js';

export class TypeScriptParser implements IFileTypeParser {
  readonly name = 'TypeScript Parser';

  supports(extension: string): boolean {
    const ext = extension.toLowerCase();
    return ext === '.ts' || ext === '.tsx';
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

      // Classes
      if (/^(export\s+)?(abstract\s+)?class\s+\w+/.test(trimmed)) {
        const match = trimmed.match(/class\s+(\w+)/);
        if (match) {
          elements.push({
            name: match[1],
            type: 'class',
            startLine: currentLine,
          });
        }
      }

      // Interfaces
      if (/^(export\s+)?interface\s+\w+/.test(trimmed)) {
        const match = trimmed.match(/interface\s+(\w+)/);
        if (match) {
          elements.push({
            name: match[1],
            type: 'interface',
            startLine: currentLine,
          });
        }
      }

      // Types
      if (/^(export\s+)?type\s+\w+\s*=/.test(trimmed)) {
        const match = trimmed.match(/type\s+(\w+)/);
        if (match) {
          elements.push({
            name: match[1],
            type: 'type',
            startLine: currentLine,
          });
        }
      }

      // Functions
      if (/^(export\s+)?(async\s+)?function\s+\w+/.test(trimmed)) {
        const match = trimmed.match(/function\s+(\w+)/);
        if (match) {
          elements.push({
            name: match[1],
            type: 'function',
            startLine: currentLine,
          });
        }
      }

      // Methods (inside classes, indentation, ends with { or :)
      // Pattern: optional access modifiers (private/protected/public), optional async, word characters, parentheses, optional return type, then { or :
      if (/^\s{2,}(private|protected|public)?\s*(async\s+)?\w+\s*\(.*\)\s*(?::\s*\w+)?\s*[:{]/.test(line) && !trimmed.startsWith('//')) {
        const match = trimmed.match(/(?:private|protected|public)?\s*(async\s+)?(\w+)\s*\(/);
        if (match && !['if', 'for', 'while', 'switch', 'catch', 'else'].includes(match[2])) {
          elements.push({
            name: match[2],
            type: 'method',
            startLine: currentLine,
          });
        }
      }

      currentLine++;
    }

    return {
      filePath,
      fileType: 'TypeScript',
      language: 'typescript',
      totalLines: lines.length,
      elements,
    };
  }
}
