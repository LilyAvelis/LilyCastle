/**
 * Skeleton - File Structure Parser Orchestrator
 *
 * This is the main entry point. It doesn't know about specific file types.
 * It only knows: "I have a collection of parsers, and I pick the right one based on extension"
 *
 * Add new type? Create a new parser in types/ and register it. Skeleton doesn't change.
 */

import * as fs from 'fs';
import * as path from 'path';
import { IFileTypeParser, FileStructure } from './types/parser.interface.js';

// Import all parsers
import { MarkdownParser } from './types/markdown.parser.js';
import { TypeScriptParser } from './types/typescript.parser.js';
import { PythonParser } from './types/python.parser.js';
import { JSONParser } from './types/json.parser.js';

export class Skeleton {
  private parsers: IFileTypeParser[] = [];

  constructor() {
    // Register all available parsers
    this.registerParser(new MarkdownParser());
    this.registerParser(new TypeScriptParser());
    this.registerParser(new PythonParser());
    this.registerParser(new JSONParser());
  }

  /**
   * Register a new parser (internal API)
   */
  private registerParser(parser: IFileTypeParser): void {
    this.parsers.push(parser);
  }

  /**
   * Get list of supported extensions
   */
  getSupportedExtensions(): string[] {
    const extensions = new Set<string>();

    for (const parser of this.parsers) {
      if (parser.name.includes('Markdown')) extensions.add('.md');
      if (parser.name.includes('TypeScript')) {
        extensions.add('.ts');
        extensions.add('.tsx');
      }
      if (parser.name.includes('Python')) extensions.add('.py');
      if (parser.name.includes('JSON')) extensions.add('.json');
    }

    return Array.from(extensions);
  }

  /**
   * Main entry point: parse a file
   */
  async parse(filePath: string): Promise<FileStructure> {
    // Normalize path
    const normalizedPath = path.resolve(filePath);

    // Check file exists
    if (!fs.existsSync(normalizedPath)) {
      throw new Error(`File not found: ${normalizedPath}`);
    }

    // Get extension
    const extension = path.extname(normalizedPath);

    // Find matching parser
    const parser = this.parsers.find((p) => p.supports(extension));

    if (!parser) {
      throw new Error(
        `Unsupported file type: ${extension}\nSupported: ${this.getSupportedExtensions().join(', ')}`
      );
    }

    // Parse
    return await parser.parse(normalizedPath);
  }
}

export default Skeleton;
