/**
 * Terminal Output Formatter for Skeleton
 * Makes JSON output human-readable with colors and tree structure
 */

import { FileStructure, FileElement } from './types/parser.interface.js';

interface ColorCodes {
  reset: string;
  bold: string;
  dim: string;
  cyan: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  gray: string;
}

const colors: ColorCodes = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

/**
 * Get icon for element type
 */
function getIcon(type: string): string {
  const icons: Record<string, string> = {
    class: '🏛️ ',
    function: '⚙️  ',
    method: '🔧 ',
    interface: '📋',
    type: '📝',
    header: '📌',
    key: '🔑',
    object: '📦',
    property: '🎯',
  };
  return icons[type] || '• ';
}

/**
 * Format header level as prefix
 */
function getHeaderPrefix(description?: string): string {
  if (!description) return '';
  const match = description.match(/Header level (\d+)/);
  if (!match) return '';
  const level = parseInt(match[1]);
  return '#'.repeat(level) + ' ';
}

/**
 * Format element with proper indentation
 */
function formatElement(
  element: FileElement,
  index: number,
  total: number,
  indent: string = ''
): string[] {
  const lines: string[] = [];
  const isLast = index === total - 1;
  const isRoot = indent === '';

  // Build tree connector
  let tree = '';
  if (!isRoot) {
    tree = isLast ? '└── ' : '├── ';
  }

  const icon = getIcon(element.type);
  const headerPrefix = getHeaderPrefix(element.description);
  const lineInfo = element.startLine ? colors.dim + ` (line ${element.startLine})` + colors.reset : '';

  const nameColor =
    element.type === 'header'
      ? colors.yellow
      : element.type === 'class' || element.type === 'interface'
        ? colors.cyan
        : element.type === 'function'
          ? colors.green
          : colors.blue;

  const line =
    indent +
    tree +
    icon +
    nameColor +
    (headerPrefix ? headerPrefix : '') +
    element.name +
    colors.reset +
    lineInfo;

  lines.push(line);

  // Add children if they exist
  if (element.children && element.children.length > 0) {
    const nextIndent = indent + (isRoot ? '' : isLast ? '    ' : '│   ');
    element.children.forEach((child, childIndex) => {
      lines.push(
        ...formatElement(child, childIndex, element.children!.length, nextIndent)
      );
    });
  }

  return lines;
}

/**
 * Main formatter function
 */
export function formatOutput(structure: FileStructure): string {
  const lines: string[] = [];

  // Header
  const fileTypeIcon =
    structure.fileType === 'Markdown'
      ? '📖'
      : structure.fileType === 'TypeScript'
        ? '📘'
        : structure.fileType === 'Python'
          ? '🐍'
          : structure.fileType === 'JSON'
            ? '📋'
            : '📄';

  const header =
    fileTypeIcon +
    ' ' +
    colors.bold +
    structure.filePath.split(/[\\/]/).pop() +
    colors.reset +
    ' (' +
    colors.magenta +
    structure.fileType +
    colors.reset +
    ', ' +
    colors.dim +
    structure.totalLines +
    ' lines' +
    colors.reset +
    ')';

  lines.push(header);
  lines.push('');

  // Elements - format as tree at root level
  if (structure.elements.length === 0) {
    lines.push(colors.dim + '  (no elements found)' + colors.reset);
  } else {
    structure.elements.forEach((element, index) => {
      const isLast = index === structure.elements.length - 1;
      const tree = isLast ? '└── ' : '├── ';

      const formattedLines = formatElement(element, index, structure.elements.length, '');

      // Add tree connector to first line
      const firstLine = formattedLines[0];
      const icon = getIcon(element.type);
      const headerPrefix = getHeaderPrefix(element.description);
      const lineInfo = element.startLine ? colors.dim + ` (line ${element.startLine})` + colors.reset : '';

      const nameColor =
        element.type === 'header'
          ? colors.yellow
          : element.type === 'class' || element.type === 'interface'
            ? colors.cyan
            : element.type === 'function'
              ? colors.green
              : colors.blue;

      const treeLine =
        tree +
        icon +
        nameColor +
        (headerPrefix ? headerPrefix : '') +
        element.name +
        colors.reset +
        lineInfo;

      lines.push(treeLine);

      // Add children if any
      if (element.children && element.children.length > 0) {
        const nextIndent = isLast ? '    ' : '│   ';
        element.children.forEach((child, childIndex) => {
          lines.push(
            ...formatElement(child, childIndex, element.children!.length, nextIndent)
          );
        });
      }
    });
  }

  // Error info if any
  if (structure.errors && structure.errors.length > 0) {
    lines.push('');
    lines.push(colors.magenta + '⚠️  Errors:' + colors.reset);
    structure.errors.forEach((error) => {
      lines.push('  ' + colors.gray + '• ' + error + colors.reset);
    });
  }

  return lines.join('\n');
}

/**
 * Compact view (one-liner)
 */
export function formatCompact(structure: FileStructure): string {
  const elementCount = structure.elements.length;
  const icon = structure.fileType === 'Markdown' ? '📖' : structure.fileType === 'Python' ? '🐍' : '📄';

  return (
    icon +
    ' ' +
    colors.bold +
    structure.filePath.split(/[\\/]/).pop() +
    colors.reset +
    ' — ' +
    colors.cyan +
    elementCount +
    ' elements' +
    colors.reset +
    ' (' +
    colors.dim +
    structure.totalLines +
    ' lines' +
    colors.reset +
    ')'
  );
}
