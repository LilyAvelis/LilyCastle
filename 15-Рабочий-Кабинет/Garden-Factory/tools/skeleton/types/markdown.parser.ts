/**
 * Markdown (.md) parser
 * Extracts headers and structure
 */

import * as fs from 'fs/promises';
import { IFileTypeParser, FileStructure, FileElement } from './parser.interface.js';

export class MarkdownParser implements IFileTypeParser {
  readonly name = 'Markdown Parser';

  supports(extension: string): boolean {
    return extension.toLowerCase() === '.md' || extension.toLowerCase() === '.markdown';
  }

  async parse(filePath: string): Promise<FileStructure> {
    const content = await fs.readFile(filePath, 'utf-8');
    // Normalize line endings (handle \r\n, \n, \r)
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    const elements: FileElement[] = [];

    let currentLine = 1;
    for (const line of lines) {
      // Match headers: #, ##, ###, etc. (supports any Unicode characters)
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headerMatch) {
        const level = headerMatch[1].length; // 1-6
        const title = headerMatch[2].trim();

        elements.push({
          name: title,
          type: 'header',
          startLine: currentLine,
          description: `Header level ${level}`,
        });
      }

      currentLine++;
    }

    return {
      filePath,
      fileType: 'Markdown',
      language: 'markdown',
      totalLines: lines.length,
      elements,
    };
  }
}
