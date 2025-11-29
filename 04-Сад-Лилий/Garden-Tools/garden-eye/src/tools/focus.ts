import * as vscode from 'vscode';

export interface FocusResult {
  content: string;
  startLine: number;
  endLine: number;
  symbol: vscode.DocumentSymbol;
}

/**
 * Найти символ по адресу и вернуть его содержимое
 * Адрес: "ClassName.methodName" или "functionName" или "# Заголовок"
 */
export async function focusSymbol(
  document: vscode.TextDocument,
  symbols: vscode.DocumentSymbol[],
  address: string
): Promise<FocusResult | undefined> {
  
  // Разбиваем адрес на части: "Class.method" → ["Class", "method"]
  const parts = address.split('.');
  
  let currentSymbols = symbols;
  let foundSymbol: vscode.DocumentSymbol | undefined;
  
  for (const part of parts) {
    foundSymbol = currentSymbols.find(s => s.name === part);
    if (!foundSymbol) {
      // Попробуем partial match для Markdown заголовков
      foundSymbol = currentSymbols.find(s => s.name.includes(part));
    }
    if (!foundSymbol) {
      return undefined;
    }
    currentSymbols = foundSymbol.children || [];
  }
  
  if (!foundSymbol) {
    return undefined;
  }
  
  // Извлекаем содержимое по range
  const range = foundSymbol.range;
  const content = document.getText(range);
  
  return {
    content,
    startLine: range.start.line,
    endLine: range.end.line,
    symbol: foundSymbol
  };
}

/**
 * Найти символ, который содержит текущую позицию курсора
 */
export function findSymbolAtPosition(
  symbols: vscode.DocumentSymbol[],
  position: vscode.Position,
  prefix: string = ''
): { symbol: vscode.DocumentSymbol; address: string } | undefined {
  
  for (const symbol of symbols) {
    if (symbol.range.contains(position)) {
      const address = prefix ? `${prefix}.${symbol.name}` : symbol.name;
      
      // Проверяем детей — может позиция внутри более глубокого символа
      if (symbol.children && symbol.children.length > 0) {
        const deeper = findSymbolAtPosition(symbol.children, position, address);
        if (deeper) {
          return deeper;
        }
      }
      
      return { symbol, address };
    }
  }
  
  return undefined;
}
