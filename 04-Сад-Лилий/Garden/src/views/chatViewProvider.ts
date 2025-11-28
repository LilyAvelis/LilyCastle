import * as vscode from 'vscode';
import { OpenRouterClient } from '../api/openRouterClient';
import { LedgerService } from '../services/ledgerService';

/**
 * Извлекает @who из model ID
 * 'meta-llama/llama-3.1-8b-instruct:free' -> '@Llama'
 * 'anthropic/claude-sonnet-4' -> '@Claude'
 * 'mistralai/mistral-small' -> '@Mistral'
 */
function getAgentName(modelId: string): string {
  const parts = modelId.split('/');
  const modelName = parts[parts.length - 1]; // 'llama-3.1-8b-instruct:free'
  
  // Убираем версии, размеры и суффиксы
  const baseName = modelName
    .split(':')[0]           // убираем :free
    .split('-')[0]           // берём первое слово
    .replace(/[0-9.]/g, '')  // убираем цифры
    .toLowerCase();
  
  // Capitalize
  const capitalized = baseName.charAt(0).toUpperCase() + baseName.slice(1);
  return '@' + capitalized;
}

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'garden.chatView';
  private _view?: vscode.WebviewView;
  private openRouterClient: OpenRouterClient;
  private ledgerService: LedgerService;
  private currentSessionId: string | null = null;
  private outputChannel: vscode.OutputChannel;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    openRouterClient: OpenRouterClient,
    ledgerService: LedgerService,
    outputChannel: vscode.OutputChannel
  ) {
    this.openRouterClient = openRouterClient;
    this.ledgerService = ledgerService;
    this.outputChannel = outputChannel;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible && this.currentSessionId) {
        this.loadSessionMessages(this.currentSessionId);
      }
    });

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'webviewReady':
          await this.loadSessionsList();
          break;
        case 'sendMessage':
          await this.handleUserMessage(data.message);
          break;
        case 'createSession':
          await this.createNewSession(data.title);
          break;
        case 'selectSession':
          await this.selectSession(data.sessionId);
          break;
        case 'renameSession':
          await this.renameSession(data.sessionId, data.newTitle);
          break;
        case 'updateSession':
          await this.updateSession(data.sessionId, data.title, data.who);
          break;
        case 'deleteSession':
          await this.deleteSession(data.sessionId);
          break;
        case 'copyContent':
          await vscode.env.clipboard.writeText(data.content);
          vscode.window.showInformationMessage('📋 Скопировано!');
          break;
        case 'setApiKey':
          await this.setApiKey();
          break;
        case 'selectModel':
          await this.selectModel();
          break;
      }
    });
  }

  private async setApiKey(): Promise<void> {
    vscode.commands.executeCommand('garden.setApiKey');
  }

  private async selectModel(): Promise<void> {
    vscode.commands.executeCommand('garden.selectModel');
  }

  private async loadSessionsList(): Promise<void> {
    try {
      const sessions = await this.ledgerService.getAllSessions();
      const currentModel = this.openRouterClient.getModel();
      
      this._view?.webview.postMessage({
        type: 'sessionsList',
        sessions: sessions,
        currentModel: currentModel
      });
      
      if (sessions.length > 0 && !this.currentSessionId) {
        const lastSession = sessions[0];
        this.currentSessionId = lastSession.sessionId;
        await this.loadSessionMessages(lastSession.sessionId);
      }
    } catch (error) {
      this.outputChannel.appendLine(`[Garden] Ошибка загрузки сессий: ${error}`);
    }
  }

  private async loadSessionMessages(sessionId: string): Promise<void> {
    try {
      const pages = await this.ledgerService.getSessionPages(sessionId);
      const session = await this.ledgerService.getSession(sessionId);
      
      this._view?.webview.postMessage({
        type: 'loadMessages',
        sessionId: sessionId,
        sessionTitle: session?.title || 'Диалог',
        sessionWho: session?.who || '@Agent',
        sessionModel: session?.model || 'unknown',
        pages: pages.map(p => ({
          pageId: p.pageId,
          who: p.who,
          type: p.type,
          rank: p.rank,
          content: p.content,
          timeStart: p.timeStart,
          timeEnd: p.timeEnd,
          delta: p.timeEnd && p.timeStart 
            ? new Date(p.timeEnd).getTime() - new Date(p.timeStart).getTime() 
            : null
        }))
      });
    } catch (error) {
      this.outputChannel.appendLine(`[Garden] Ошибка загрузки сообщений: ${error}`);
    }
  }

  private async createNewSession(title?: string): Promise<void> {
    const sessionTitle = title || `Chat ${new Date().toLocaleString('ru-RU')}`;
    const session = await this.ledgerService.createSession(sessionTitle);
    this.currentSessionId = session.sessionId;
    await this.loadSessionsList();
    this._view?.webview.postMessage({ type: 'clearMessages' });
    this._view?.webview.postMessage({ 
      type: 'sessionCreated', 
      sessionId: session.sessionId,
      title: sessionTitle 
    });
  }

  private async selectSession(sessionId: string): Promise<void> {
    this.currentSessionId = sessionId;
    await this.loadSessionMessages(sessionId);
  }

  private async renameSession(sessionId: string, newTitle: string): Promise<void> {
    try {
      await this.ledgerService.updateSessionTitle(sessionId, newTitle);
      await this.loadSessionsList();
    } catch (error) {
      this.outputChannel.appendLine(`[Garden] Ошибка переименования: ${error}`);
    }
  }

  private async updateSession(sessionId: string, title: string, who: string): Promise<void> {
    try {
      await this.ledgerService.updateSessionTitle(sessionId, title);
      await this.ledgerService.updateSessionWho(sessionId, who);
      await this.ledgerService.updateSessionPagesWho(sessionId, who);
      await this.loadSessionsList();
      await this.loadSessionMessages(sessionId);
    } catch (error) {
      this.outputChannel.appendLine(`[Garden] Ошибка обновления сессии: ${error}`);
    }
  }

  private async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.ledgerService.deleteSession(sessionId);
      if (this.currentSessionId === sessionId) {
        this.currentSessionId = null;
        this._view?.webview.postMessage({ type: 'clearMessages' });
      }
      await this.loadSessionsList();
    } catch (error) {
      this.outputChannel.appendLine(`[Garden] Ошибка удаления: ${error}`);
    }
  }

  private getAgentWho(): string {
    const model = this.openRouterClient.getModel();
    return getAgentName(model);
  }

  private async handleUserMessage(message: string): Promise<void> {
    if (!message.trim()) return;

    const agentWho = this.getAgentWho();

    if (!this.currentSessionId) {
      const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
      const model = this.openRouterClient.getModel();
      const session = await this.ledgerService.createSession({
        title,
        model,
        who: agentWho
      });
      this.currentSessionId = session.sessionId;
      await this.loadSessionsList();
    }

    const invokePage = await this.ledgerService.createInvoke(
      this.currentSessionId,
      '@Lily',
      message
    );

    this._view?.webview.postMessage({
      type: 'addPage',
      page: {
        pageId: invokePage.pageId,
        who: invokePage.who,
        type: invokePage.type,
        rank: invokePage.rank,
        content: invokePage.content,
        timeStart: invokePage.timeStart,
        timeEnd: invokePage.timeEnd,
        delta: null
      }
    });

    try {
      const history = await this.ledgerService.getSessionPages(this.currentSessionId);
      const messages = history.map(p => ({
        role: p.type === 'INVOKE' ? 'user' as const : 'assistant' as const,
        content: p.content
      }));

      const responsePage = await this.ledgerService.startResponse(
        this.currentSessionId,
        agentWho
      );

      this._view?.webview.postMessage({
        type: 'startResponse',
        pageId: responsePage.pageId,
        who: responsePage.who
      });

      let fullResponse = '';

      await new Promise<void>((resolve, reject) => {
        this.openRouterClient.chat(
          messages,
          {
            onToken: (token: string) => {
              fullResponse += token;
              this._view?.webview.postMessage({
                type: 'streamToken',
                pageId: responsePage.pageId,
                token: token
              });
            },
            onComplete: () => {
              resolve();
            },
            onError: (error: Error) => {
              reject(error);
            }
          }
        );
      });

      const committedPage = await this.ledgerService.commitResponse(
        responsePage.pageId,
        fullResponse
      );

      this._view?.webview.postMessage({
        type: 'endResponse',
        pageId: committedPage.pageId,
        timeStart: new Date(committedPage.timeStart).getTime(),
        timeEnd: new Date(committedPage.timeEnd!).getTime(),
        delta: new Date(committedPage.timeEnd!).getTime() - new Date(committedPage.timeStart).getTime()
      });

    } catch (error) {
      this.outputChannel.appendLine(`[Garden] Ошибка: ${error}`);
      this._view?.webview.postMessage({
        type: 'error',
        message: `Ошибка: ${error}`
      });
    }
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline' https://cdn.jsdelivr.net; font-src ${webview.cspSource};">
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <title>Garden Chat</title>
  <style>
    :root {
      --lily-pink: #FFB6C1;
      --lily-purple: #DDA0DD;
      --lily-lavender: #E6E6FA;
      --lily-rose: #FF69B4;
      --glass-bg: rgba(255, 255, 255, 0.08);
      --glass-border: rgba(255, 255, 255, 0.15);
      --invoke-bg: linear-gradient(135deg, rgba(255, 182, 193, 0.15), rgba(255, 105, 180, 0.08));
      --response-bg: linear-gradient(135deg, rgba(221, 160, 221, 0.15), rgba(230, 230, 250, 0.08));
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--vscode-font-family);
      background: transparent;
      color: var(--vscode-foreground);
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ============ HEADER ============ */
    .header {
      padding: 8px 10px;
      background: var(--glass-bg);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--glass-border);
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .session-selector {
      flex: 1;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--glass-border);
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 12px;
      cursor: pointer;
      min-width: 0;
    }

    .header-btn {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 6px;
      padding: 6px 8px;
      color: var(--vscode-foreground);
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .header-btn:hover {
      background: rgba(255, 182, 193, 0.3);
      border-color: var(--lily-pink);
    }

    /* ============ MESSAGES CONTAINER ============ */
    .messages-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ============ PAGE (MESSAGE) ============ */
    .page {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 10px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .page.invoke {
      background: var(--invoke-bg);
      border-left: 3px solid var(--lily-pink);
    }

    .page.response {
      background: var(--response-bg);
      border-left: 3px solid var(--lily-purple);
    }

    .page-header {
      display: flex;
      align-items: center;
      padding: 6px 10px;
      background: rgba(0, 0, 0, 0.15);
      border-bottom: 1px solid var(--glass-border);
      gap: 6px;
      font-size: 11px;
    }

    .page-id {
      font-weight: bold;
      color: var(--lily-rose);
    }

    .page-who {
      color: var(--lily-lavender);
      flex: 1;
    }

    .page-delta {
      color: var(--vscode-descriptionForeground);
      font-size: 10px;
    }

    .page-action-btn {
      background: transparent;
      border: none;
      color: var(--vscode-foreground);
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 11px;
      opacity: 0.5;
      transition: all 0.2s;
    }

    .page-action-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      opacity: 1;
    }

    /* ============ PAGE CONTENT WITH COLLAPSE ============ */
    .page-content-wrapper {
      position: relative;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .page-content-wrapper.collapsed {
      max-height: 120px;
    }

    .page-content-wrapper.collapsed::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: linear-gradient(transparent, var(--vscode-sideBar-background, #1e1e1e));
      pointer-events: none;
    }

    .page-content-wrapper.expanded {
      max-height: none;
    }

    .page-content {
      padding: 10px;
      line-height: 1.5;
      font-size: 13px;
    }

    .page-content pre {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      padding: 10px;
      overflow-x: auto;
      margin: 6px 0;
    }

    .page-content code {
      font-family: var(--vscode-editor-font-family);
      font-size: 12px;
    }

    .page-content p { margin: 6px 0; }
    .page-content ul, .page-content ol { margin: 6px 0; padding-left: 20px; }
    .page-content h1, .page-content h2, .page-content h3 { margin: 12px 0 6px; color: var(--lily-pink); }
    .page-content blockquote { border-left: 3px solid var(--lily-purple); padding-left: 10px; margin: 6px 0; opacity: 0.8; }

    /* ============ STREAMING ============ */
    .streaming-cursor {
      display: inline-block;
      width: 6px;
      height: 14px;
      background: var(--lily-pink);
      animation: blink 1s infinite;
      vertical-align: middle;
      margin-left: 2px;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    /* ============ INPUT ============ */
    .input-container {
      padding: 10px;
      background: var(--glass-bg);
      border-top: 1px solid var(--glass-border);
      flex-shrink: 0;
    }

    .input-wrapper {
      display: flex;
      gap: 6px;
    }

    #messageInput {
      flex: 1;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      resize: none;
      min-height: 40px;
      max-height: 100px;
    }

    #messageInput:focus {
      outline: none;
      border-color: var(--lily-pink);
    }

    #sendBtn {
      background: linear-gradient(135deg, var(--lily-pink), var(--lily-rose));
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    #sendBtn:hover { transform: scale(1.05); }
    #sendBtn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* ============ EMPTY STATE ============ */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--vscode-descriptionForeground);
      text-align: center;
      padding: 20px;
    }

    .empty-state-emoji { font-size: 40px; margin-bottom: 12px; }

    /* ============ MODAL ============ */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 100;
      align-items: center;
      justify-content: center;
    }

    .modal-overlay.visible { display: flex; }

    .modal {
      background: var(--vscode-editor-background);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      padding: 16px;
      min-width: 260px;
      max-width: 90%;
    }

    .modal-title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 12px;
      color: var(--lily-pink);
    }

    .modal-field {
      margin-bottom: 10px;
    }

    .modal-label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 4px;
    }

    .modal-input {
      width: 100%;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--glass-border);
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 12px;
    }

    .modal-info {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      padding: 6px 8px;
      background: rgba(0,0,0,0.2);
      border-radius: 6px;
    }

    .modal-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .modal-btn {
      flex: 1;
      padding: 8px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }

    .modal-btn.primary {
      background: var(--lily-pink);
      color: white;
    }

    .modal-btn.danger {
      background: #dc3545;
      color: white;
    }

    .modal-btn.secondary {
      background: var(--glass-bg);
      color: var(--vscode-foreground);
      border: 1px solid var(--glass-border);
    }

    .modal-btn:hover { opacity: 0.9; }

    /* ============ SCROLLBAR ============ */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--lily-pink); }
  </style>
</head>
<body>
  <div class="header">
    <select class="session-selector" id="sessionSelector">
      <option value="__new__">✨ Новый диалог...</option>
    </select>
    <button class="header-btn" id="editSessionBtn" title="Редактировать диалог">✏️</button>
    <button class="header-btn" id="apiKeyBtn" title="API ключ">🔑</button>
    <button class="header-btn" id="modelBtn" title="Выбор модели">🤖</button>
  </div>

  <div class="messages-container" id="messagesContainer">
    <div class="empty-state" id="emptyState">
      <div class="empty-state-emoji">🌸</div>
      <p>Добро пожаловать в Garden!</p>
      <p style="font-size: 11px; margin-top: 6px;">Начните новый диалог</p>
    </div>
  </div>

  <div class="input-container">
    <div class="input-wrapper">
      <textarea id="messageInput" placeholder="Сообщение... (Shift+Enter для переноса)" rows="1"></textarea>
      <button id="sendBtn">🌷</button>
    </div>
  </div>

  <!-- Modal для редактирования сессии -->
  <div class="modal-overlay" id="sessionModal">
    <div class="modal">
      <div class="modal-title">📝 Настройки диалога</div>
      <div class="modal-field">
        <div class="modal-label">Название</div>
        <input type="text" class="modal-input" id="modalTitle" />
      </div>
      <div class="modal-field">
        <div class="modal-label">Модель (OpenRouter)</div>
        <div class="modal-info" id="modalModel">unknown</div>
      </div>
      <div class="modal-field">
        <div class="modal-label">Псевдоним в чате</div>
        <input type="text" class="modal-input" id="modalWho" placeholder="@Agent" />
      </div>
      <div class="modal-actions">
        <button class="modal-btn danger" id="modalDelete">🗑️</button>
        <button class="modal-btn secondary" id="modalCancel">Отмена</button>
        <button class="modal-btn primary" id="modalSave">💾 Сохранить</button>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    
    let currentSessionId = null;
    let currentSessionTitle = '';
    let currentSessionWho = '@Agent';
    let currentSessionModel = 'unknown';
    let sessions = [];
    let isStreaming = false;

    const messagesContainer = document.getElementById('messagesContainer');
    const emptyState = document.getElementById('emptyState');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const sessionSelector = document.getElementById('sessionSelector');
    const editSessionBtn = document.getElementById('editSessionBtn');
    const apiKeyBtn = document.getElementById('apiKeyBtn');
    const modelBtn = document.getElementById('modelBtn');
    
    const sessionModal = document.getElementById('sessionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalModel = document.getElementById('modalModel');
    const modalWho = document.getElementById('modalWho');
    const modalDelete = document.getElementById('modalDelete');
    const modalCancel = document.getElementById('modalCancel');
    const modalSave = document.getElementById('modalSave');

    // Marked setup
    if (typeof marked !== 'undefined') {
      marked.setOptions({ breaks: true, gfm: true });
    }

    function renderMarkdown(content) {
      if (typeof marked !== 'undefined') {
        return marked.parse(content);
      }
      return content.replace(/\\n/g, '<br>');
    }

    function formatDelta(delta) {
      if (!delta) return '';
      if (delta < 1000) return delta + 'ms';
      return (delta / 1000).toFixed(1) + 's';
    }

    function createPageElement(page) {
      const div = document.createElement('div');
      div.className = 'page ' + (page.type === 'INVOKE' ? 'invoke' : 'response');
      div.id = 'page-' + page.pageId;
      div.dataset.content = page.content || '';

      const contentHtml = page.content ? renderMarkdown(page.content) : '';
      const isLong = (page.content || '').split('\\n').length > 5 || (page.content || '').length > 300;

      div.innerHTML = \`
        <div class="page-header">
          <span class="page-id">#\${page.pageId}</span>
          <span class="page-who">\${page.who}</span>
          <span class="page-delta">\${formatDelta(page.delta)}</span>
          <button class="page-action-btn copy-btn" title="Копировать">📋</button>
          \${isLong ? '<button class="page-action-btn collapse-btn" title="Свернуть/Развернуть">▼</button>' : ''}
        </div>
        <div class="page-content-wrapper \${isLong ? 'collapsed' : 'expanded'}">
          <div class="page-content">\${contentHtml}</div>
        </div>
      \`;

      const copyBtn = div.querySelector('.copy-btn');
      const collapseBtn = div.querySelector('.collapse-btn');
      const wrapper = div.querySelector('.page-content-wrapper');

      copyBtn.addEventListener('click', () => {
        vscode.postMessage({ type: 'copyContent', content: div.dataset.content });
      });

      if (collapseBtn && wrapper) {
        collapseBtn.addEventListener('click', () => {
          const isCollapsed = wrapper.classList.contains('collapsed');
          wrapper.classList.toggle('collapsed', !isCollapsed);
          wrapper.classList.toggle('expanded', isCollapsed);
          collapseBtn.textContent = isCollapsed ? '▼' : '▶';
        });
      }

      return div;
    }

    // Session selector
    sessionSelector.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === '__new__') {
        const title = 'Chat ' + new Date().toLocaleString('ru-RU');
        vscode.postMessage({ type: 'createSession', title });
      } else if (val) {
        vscode.postMessage({ type: 'selectSession', sessionId: val });
      }
    });

    // Edit session button
    editSessionBtn.addEventListener('click', () => {
      if (!currentSessionId) return;
      modalTitle.value = currentSessionTitle;
      modalModel.textContent = currentSessionModel;
      modalWho.value = currentSessionWho;
      sessionModal.classList.add('visible');
    });

    // Modal handlers
    modalCancel.addEventListener('click', () => {
      sessionModal.classList.remove('visible');
    });

    modalSave.addEventListener('click', () => {
      if (currentSessionId && modalTitle.value.trim()) {
        const newWho = modalWho.value.trim() || '@Agent';
        vscode.postMessage({ 
          type: 'updateSession', 
          sessionId: currentSessionId, 
          title: modalTitle.value.trim(),
          who: newWho.startsWith('@') ? newWho : '@' + newWho
        });
      }
      sessionModal.classList.remove('visible');
    });

    modalDelete.addEventListener('click', () => {
      if (currentSessionId && confirm('Удалить этот диалог навсегда?')) {
        vscode.postMessage({ type: 'deleteSession', sessionId: currentSessionId });
        sessionModal.classList.remove('visible');
      }
    });

    sessionModal.addEventListener('click', (e) => {
      if (e.target === sessionModal) {
        sessionModal.classList.remove('visible');
      }
    });

    // API Key & Model
    apiKeyBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'setApiKey' });
    });

    modelBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'selectModel' });
    });

    // Send message
    sendBtn.addEventListener('click', sendMessage);

    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
    });

    function sendMessage() {
      const message = messageInput.value.trim();
      if (!message || isStreaming) return;
      vscode.postMessage({ type: 'sendMessage', message });
      messageInput.value = '';
      messageInput.style.height = 'auto';
    }

    // Messages from extension
    window.addEventListener('message', (event) => {
      const data = event.data;

      switch (data.type) {
        case 'sessionsList':
          sessions = data.sessions;
          sessionSelector.innerHTML = '<option value="__new__">✨ Новый диалог...</option>';
          sessions.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.sessionId;
            opt.textContent = s.title;
            sessionSelector.appendChild(opt);
          });
          if (currentSessionId) {
            sessionSelector.value = currentSessionId;
          }
          break;

        case 'loadMessages':
          currentSessionId = data.sessionId;
          currentSessionTitle = data.sessionTitle;
          currentSessionWho = data.sessionWho || '@Agent';
          currentSessionModel = data.sessionModel || 'unknown';
          sessionSelector.value = data.sessionId;
          messagesContainer.innerHTML = '';
          emptyState.style.display = 'none';
          
          data.pages.forEach(page => {
            messagesContainer.appendChild(createPageElement(page));
          });
          
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
          break;

        case 'sessionCreated':
          currentSessionId = data.sessionId;
          currentSessionTitle = data.title;
          break;

        case 'clearMessages':
          messagesContainer.innerHTML = '';
          emptyState.style.display = 'flex';
          currentSessionId = null;
          sessionSelector.value = '__new__';
          break;

        case 'addPage':
          emptyState.style.display = 'none';
          messagesContainer.appendChild(createPageElement(data.page));
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
          break;

        case 'startResponse':
          isStreaming = true;
          sendBtn.disabled = true;
          emptyState.style.display = 'none';
          
          const streamingPage = document.createElement('div');
          streamingPage.className = 'page response';
          streamingPage.id = 'page-' + data.pageId;
          streamingPage.dataset.content = '';
          streamingPage.innerHTML = \`
            <div class="page-header">
              <span class="page-id">#\${data.pageId}</span>
              <span class="page-who">\${data.who}</span>
              <span class="page-delta">⏳</span>
              <button class="page-action-btn copy-btn" title="Копировать">📋</button>
            </div>
            <div class="page-content-wrapper expanded">
              <div class="page-content"><span class="streaming-cursor"></span></div>
            </div>
          \`;
          messagesContainer.appendChild(streamingPage);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
          break;

        case 'streamToken':
          const page = document.getElementById('page-' + data.pageId);
          if (page) {
            page.dataset.content += data.token;
            const content = page.querySelector('.page-content');
            content.innerHTML = renderMarkdown(page.dataset.content) + '<span class="streaming-cursor"></span>';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
          break;

        case 'endResponse':
          isStreaming = false;
          sendBtn.disabled = false;
          
          const finishedPage = document.getElementById('page-' + data.pageId);
          if (finishedPage) {
            const rawContent = finishedPage.dataset.content;
            const isLong = rawContent.split('\\n').length > 5 || rawContent.length > 300;
            
            const delta = finishedPage.querySelector('.page-delta');
            delta.textContent = formatDelta(data.delta);
            
            const header = finishedPage.querySelector('.page-header');
            if (isLong && !header.querySelector('.collapse-btn')) {
              const collapseBtn = document.createElement('button');
              collapseBtn.className = 'page-action-btn collapse-btn';
              collapseBtn.title = 'Свернуть/Развернуть';
              collapseBtn.textContent = '▼';
              header.appendChild(collapseBtn);
              
              const wrapper = finishedPage.querySelector('.page-content-wrapper');
              collapseBtn.addEventListener('click', () => {
                const isCollapsed = wrapper.classList.contains('collapsed');
                wrapper.classList.toggle('collapsed', !isCollapsed);
                wrapper.classList.toggle('expanded', isCollapsed);
                collapseBtn.textContent = isCollapsed ? '▼' : '▶';
              });
            }
            
            const content = finishedPage.querySelector('.page-content');
            content.innerHTML = renderMarkdown(rawContent);
            
            const copyBtn = finishedPage.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
              vscode.postMessage({ type: 'copyContent', content: rawContent });
            });
          }
          break;

        case 'error':
          isStreaming = false;
          sendBtn.disabled = false;
          alert(data.message);
          break;
      }
    });

    vscode.postMessage({ type: 'webviewReady' });
  </script>
</body>
</html>`;
  }
}
