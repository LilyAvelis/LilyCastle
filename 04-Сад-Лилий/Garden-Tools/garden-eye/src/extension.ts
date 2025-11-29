import * as vscode from 'vscode';
import { getSkeleton, formatSkeleton } from './tools/skeleton';
import { focusSymbol } from './tools/focus';

export function activate(context: vscode.ExtensionContext) {
  console.log('👁️ Garden Eye activated');

  // Command: Skeleton — показать структуру файла
  const skeletonCmd = vscode.commands.registerCommand('gardenEye.skeleton', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Нет открытого файла');
      return;
    }

    const document = editor.document;
    const skeleton = await getSkeleton(document.uri);
    
    if (!skeleton || skeleton.length === 0) {
      vscode.window.showInformationMessage('Структура не найдена (возможно Language Server ещё не загрузился)');
      return;
    }

    const formatted = formatSkeleton(skeleton, document.languageId);
    
    // Показываем в Output Channel
    const channel = vscode.window.createOutputChannel('Garden Eye');
    channel.clear();
    channel.appendLine(`📄 ${document.fileName}`);
    channel.appendLine(`📝 Language: ${document.languageId}`);
    channel.appendLine('─'.repeat(50));
    channel.appendLine(formatted);
    channel.show();
  });

  // Command: Skeleton to Clipboard
  const skeletonClipboardCmd = vscode.commands.registerCommand('gardenEye.skeletonToClipboard', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Нет открытого файла');
      return;
    }

    const document = editor.document;
    const skeleton = await getSkeleton(document.uri);
    
    if (!skeleton || skeleton.length === 0) {
      vscode.window.showWarningMessage('Структура не найдена');
      return;
    }

    const formatted = formatSkeleton(skeleton, document.languageId);
    await vscode.env.clipboard.writeText(formatted);
    vscode.window.showInformationMessage(`👁️ Skeleton скопирован (${skeleton.length} символов)`);
  });

  // Command: Focus — прочитать конкретный элемент
  const focusCmd = vscode.commands.registerCommand('gardenEye.focus', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Нет открытого файла');
      return;
    }

    const document = editor.document;
    const skeleton = await getSkeleton(document.uri);
    
    if (!skeleton || skeleton.length === 0) {
      vscode.window.showWarningMessage('Структура не найдена');
      return;
    }

    // Собираем все адреса для QuickPick
    const addresses = collectAddresses(skeleton);
    
    const selected = await vscode.window.showQuickPick(addresses, {
      placeHolder: 'Выбери элемент для фокуса (Class.method)',
      matchOnDescription: true
    });

    if (!selected) return;

    const result = await focusSymbol(document, skeleton, selected.label);
    
    if (result) {
      const channel = vscode.window.createOutputChannel('Garden Eye');
      channel.clear();
      channel.appendLine(`🔍 Focus: ${selected.label}`);
      channel.appendLine(`📍 Lines: ${result.startLine + 1}–${result.endLine + 1}`);
      channel.appendLine('─'.repeat(50));
      channel.appendLine(result.content);
      channel.show();
    }
  });

  context.subscriptions.push(skeletonCmd, skeletonClipboardCmd, focusCmd);
}

// Собрать все адреса из дерева символов
function collectAddresses(
  symbols: vscode.DocumentSymbol[], 
  prefix: string = ''
): vscode.QuickPickItem[] {
  const items: vscode.QuickPickItem[] = [];
  
  for (const symbol of symbols) {
    const address = prefix ? `${prefix}.${symbol.name}` : symbol.name;
    const kindName = vscode.SymbolKind[symbol.kind];
    
    items.push({
      label: address,
      description: kindName,
      detail: symbol.detail || undefined
    });
    
    // Рекурсивно для детей
    if (symbol.children && symbol.children.length > 0) {
      items.push(...collectAddresses(symbol.children, address));
    }
  }
  
  return items;
}

export function deactivate() {
  console.log('👁️ Garden Eye deactivated');
}
