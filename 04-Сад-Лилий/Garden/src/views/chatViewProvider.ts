import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { OpenRouterClient } from '../api/openRouterClient';
import { LedgerService } from '../services/ledgerService';

function getAgentName(modelId: string): string {
	const parts = modelId.split('/');
	const modelName = parts[parts.length - 1];

	const baseName = modelName
		.split(':')[0]
		.split('-')[0]
		.replace(/[0-9.]/g, '')
		.toLowerCase();

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
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken
	): void {
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
				sessions,
				currentModel
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
				sessionId,
				sessionTitle: session?.title || 'Диалог',
				sessionWho: session?.who || '@Agent',
				sessionModel: session?.model || 'unknown',
				pages: pages.map((p) => ({
					pageId: p.pageId,
					who: p.who,
					type: p.type,
					rank: p.rank,
					content: p.content,
					timeStart: p.timeStart,
					timeEnd: p.timeEnd,
					delta:
						p.timeEnd && p.timeStart
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
		const { displayName, who } = await this.resolveModelIdentity();
		const session = await this.ledgerService.createSession({
			title: sessionTitle,
			model: displayName,
			who
		});
		this.currentSessionId = session.sessionId;
		await this.loadSessionsList();
		await this.loadSessionMessages(session.sessionId);
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
			const session = await this.ledgerService.getSession(sessionId);
			const title = session?.title || 'диалог';
			const choice = await vscode.window.showWarningMessage(
				`Удалить "${title}" и все связанные страницы?`,
				{ modal: true },
				'Удалить',
				'Отмена'
			);

			if (choice !== 'Удалить') {
				return;
			}

			await this.ledgerService.deleteSession(sessionId);
			if (this.currentSessionId === sessionId) {
				this.currentSessionId = null;
				this._view?.webview.postMessage({ type: 'clearMessages' });
			}
			await this.loadSessionsList();
		} catch (error) {
			this.outputChannel.appendLine(`[Garden] Ошибка удаления: ${error}`);
			vscode.window.showErrorMessage('Не удалось удалить диалог. Подробности в журнале Garden.');
		}
	}

	private async resolveModelIdentity(): Promise<{ modelId: string; displayName: string; who: string }> {
		const modelId = this.openRouterClient.getModel();
		const displayName = await this.openRouterClient.getModelDisplayName(modelId);
		const who = getAgentName(modelId);
		return { modelId, displayName, who };
	}

	/**
	 * Format a page with YAML metadata header for AI consumption
	 * This implements the Deep Lung Chrono-Page Protocol
	 */
	private formatPageForAI(page: {
		pageId: number;
		who: string;
		type: string;
		rank?: number | null;
		content: string;
		timeStart: Date;
		timeEnd: Date;
	}): string {
		const meta = [
			`PAGE_ID: ${page.pageId}`,
			`TYPE: ${page.type}`,
			`AUTHOR: ${page.who}`,
			page.rank !== null ? `RANK: ${page.rank}` : null,
			`TIMESTAMP: ${new Date(page.timeStart).toISOString()}`
		].filter(Boolean).join('\n');

		return `---\n${meta}\n---\n${page.content}`;
	}

	private async handleUserMessage(message: string): Promise<void> {
		if (!message.trim()) {
			return;
		}

		const modelId = this.openRouterClient.getModel();
		const agentWho = getAgentName(modelId);

		if (!this.currentSessionId) {
			const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
			const modelName = await this.openRouterClient.getModelDisplayName(modelId);
			const session = await this.ledgerService.createSession({
				title,
				model: modelName,
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
			// Format messages WITH metadata for AI (Deep Lung Protocol)
			const messages = history.map((p) => ({
				role: p.type === 'INVOKE' ? ('user' as const) : ('assistant' as const),
				content: this.formatPageForAI(p)
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
				this.openRouterClient.chat(messages, {
					onToken: (token: string) => {
						fullResponse += token;
						this._view?.webview.postMessage({
							type: 'streamToken',
							pageId: responsePage.pageId,
							token
						});
					},
					onComplete: () => {
						resolve();
					},
					onError: (error: Error) => {
						reject(error);
					}
				});
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
				delta:
					new Date(committedPage.timeEnd!).getTime() -
					new Date(committedPage.timeStart).getTime()
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
		try {
			const webviewDir = path.join(this._extensionUri.fsPath, 'src', 'views', 'webview');
			const htmlTemplate = fs.readFileSync(path.join(webviewDir, 'index.html'), 'utf8');
			const styles = fs.readFileSync(path.join(webviewDir, 'styles.css'), 'utf8');
			const script = fs.readFileSync(path.join(webviewDir, 'main.js'), 'utf8');

			return htmlTemplate
				.replace('${cspSource}', webview.cspSource)
				.replace('${styles}', styles)
				.replace('${script}', script);
		} catch (error) {
			const message = `Не удалось загрузить webview: ${error}`;
			this.outputChannel.appendLine(`[Garden] ${message}`);
			return `<html><body><h3>${message}</h3></body></html>`;
		}
	}
}

