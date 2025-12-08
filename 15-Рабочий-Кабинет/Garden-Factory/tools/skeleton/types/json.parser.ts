/**
 * JSON (.json) parser
 * Extracts object structure and keys
 */

import * as fs from 'fs/promises';
import { IFileTypeParser, FileStructure, FileElement } from './parser.interface.js';

export class JSONParser implements IFileTypeParser {
  readonly name = 'JSON Parser';

  supports(extension: string): boolean {
    return extension.toLowerCase() === '.json';
  }

  async parse(filePath: string): Promise<FileStructure> {
    const content = await fs.readFile(filePath, 'utf-8');
    // Normalize line endings
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const elements: FileElement[] = [];

    try {
      const parsed = JSON.parse(content);
      const lines = normalized.split('\n');

      // Extract root-level keys
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        for (const [key, value] of Object.entries(parsed)) {
          const valueType = Array.isArray(value) ? 'array' : typeof value;
          elements.push({
            name: key,
            type: 'key',
            description: `Type: ${valueType}`,
          });

          // If object, extract its keys too
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            for (const nestedKey of Object.keys(value)) {
              elements.push({
                name: `${key}.${nestedKey}`,
                type: 'key',
              });
            }
          }
        }
      } else if (Array.isArray(parsed)) {
        elements.push({
          name: '[Array]',
          type: 'object',
          description: `Length: ${parsed.length}`,
        });
      }

      return {
        filePath,
        fileType: 'JSON',
        language: 'json',
        totalLines: lines.length,
        elements,
      };
    } catch (error) {
      return {
        filePath,
        fileType: 'JSON',
        language: 'json',
        totalLines: content.split('\n').length,
        elements: [],
        errors: ['Invalid JSON: ' + (error as Error).message],
      };
    }
  }
}
