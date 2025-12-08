/**
 * Base interface for all file type parsers
 * Each parser knows how to extract structure from a specific file type
 * The skeleton orchestrator doesn't care about implementation details
 */

export interface FileElement {
  name: string;
  type: 'class' | 'function' | 'method' | 'property' | 'interface' | 'type' | 'header' | 'key' | 'object';
  startLine?: number;
  endLine?: number;
  children?: FileElement[];
  description?: string;
}

export interface FileStructure {
  filePath: string;
  fileType: string;
  language: string;
  totalLines: number;
  elements: FileElement[];
  errors?: string[];
}

export interface IFileTypeParser {
  /**
   * Check if this parser can handle the given file extension
   * @param extension e.g. ".ts", ".md", ".py"
   */
  supports(extension: string): boolean;

  /**
   * Parse the file and return its structure
   * @param filePath absolute path to the file
   */
  parse(filePath: string): Promise<FileStructure>;

  /**
   * Display name of the parser
   */
  readonly name: string;
}
