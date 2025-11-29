import * as vscode from 'vscode';

/**
 * Получить структуру документа через встроенный DocumentSymbolProvider
 * Работает для любого языка с Language Server (TS, Python, Rust, Go, Markdown, etc.)
 */
export async function getSkeleton(uri: vscode.Uri): Promise<vscode.DocumentSymbol[] | undefined> {
  try {
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider',
      uri
    );
    return symbols;
  } catch (error) {
    console.error('Garden Eye: ошибка получения символов', error);
    return undefined;
  }
}

/**
 * Форматировать дерево символов в читаемый текст
 */
export function formatSkeleton(
  symbols: vscode.DocumentSymbol[], 
  languageId: string,
  indent: number = 0
): string {
  const lines: string[] = [];
  const prefix = '  '.repeat(indent);
  
  for (const symbol of symbols) {
    const line = formatSymbol(symbol, languageId, prefix);
    lines.push(line);
    
    // Рекурсивно форматируем детей
    if (symbol.children && symbol.children.length > 0) {
      lines.push(formatSkeleton(symbol.children, languageId, indent + 1));
    }
  }
  
  return lines.join('\n');
}

/**
 * Форматировать один символ
 */
function formatSymbol(
  symbol: vscode.DocumentSymbol, 
  languageId: string,
  prefix: string
): string {
  const icon = getSymbolIcon(symbol.kind);
  const kindName = getKindName(symbol.kind, languageId);
  const detail = symbol.detail ? `: ${symbol.detail}` : '';
  const lines = `[${symbol.range.start.line + 1}–${symbol.range.end.line + 1}]`;
  
  // Для Markdown показываем заголовки красиво
  if (languageId === 'markdown' && symbol.kind === vscode.SymbolKind.String) {
    return `${prefix}${symbol.name}`;
  }
  
  return `${prefix}${icon} ${kindName} ${symbol.name}${detail} ${lines}`;
}

/**
 * Иконка для типа символа
 */
function getSymbolIcon(kind: vscode.SymbolKind): string {
  const icons: Record<number, string> = {
    [vscode.SymbolKind.File]: '📄',
    [vscode.SymbolKind.Module]: '📦',
    [vscode.SymbolKind.Namespace]: '🏷️',
    [vscode.SymbolKind.Package]: '📦',
    [vscode.SymbolKind.Class]: '🏛️',
    [vscode.SymbolKind.Method]: '⚙️',
    [vscode.SymbolKind.Property]: '🔹',
    [vscode.SymbolKind.Field]: '🔸',
    [vscode.SymbolKind.Constructor]: '🔨',
    [vscode.SymbolKind.Enum]: '📋',
    [vscode.SymbolKind.Interface]: '🔷',
    [vscode.SymbolKind.Function]: '⚡',
    [vscode.SymbolKind.Variable]: '📌',
    [vscode.SymbolKind.Constant]: '🔒',
    [vscode.SymbolKind.String]: '📝',      // Markdown headers
    [vscode.SymbolKind.Number]: '🔢',
    [vscode.SymbolKind.Boolean]: '✅',
    [vscode.SymbolKind.Array]: '📚',
    [vscode.SymbolKind.Object]: '📦',
    [vscode.SymbolKind.Key]: '🔑',
    [vscode.SymbolKind.Null]: '⭕',
    [vscode.SymbolKind.EnumMember]: '📋',
    [vscode.SymbolKind.Struct]: '🏗️',
    [vscode.SymbolKind.Event]: '⚡',
    [vscode.SymbolKind.Operator]: '➕',
    [vscode.SymbolKind.TypeParameter]: '🔤',
  };
  return icons[kind] || '❓';
}

/**
 * Человекочитаемое имя типа
 */
function getKindName(kind: vscode.SymbolKind, languageId: string): string {
  // Для Markdown упрощаем
  if (languageId === 'markdown') {
    return '';
  }
  
  const names: Record<number, string> = {
    [vscode.SymbolKind.File]: 'file',
    [vscode.SymbolKind.Module]: 'module',
    [vscode.SymbolKind.Namespace]: 'namespace',
    [vscode.SymbolKind.Package]: 'package',
    [vscode.SymbolKind.Class]: 'class',
    [vscode.SymbolKind.Method]: 'method',
    [vscode.SymbolKind.Property]: 'prop',
    [vscode.SymbolKind.Field]: 'field',
    [vscode.SymbolKind.Constructor]: 'ctor',
    [vscode.SymbolKind.Enum]: 'enum',
    [vscode.SymbolKind.Interface]: 'interface',
    [vscode.SymbolKind.Function]: 'fn',
    [vscode.SymbolKind.Variable]: 'var',
    [vscode.SymbolKind.Constant]: 'const',
    [vscode.SymbolKind.String]: 'string',
    [vscode.SymbolKind.Struct]: 'struct',
    [vscode.SymbolKind.TypeParameter]: 'type',
  };
  return names[kind] || vscode.SymbolKind[kind].toLowerCase();
}
