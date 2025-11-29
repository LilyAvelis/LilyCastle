/**
 * OpenRouter API Client
 * 
 * Handles communication with OpenRouter API.
 * Supports streaming responses.
 */

import * as vscode from 'vscode';
import { getApiKeyValidationHint, isOpenRouterKeyValid, normalizeOpenRouterKey } from '../utils/openRouterKey';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface StreamCallbacks {
    onToken: (token: string) => void;
    onComplete: (fullResponse: string) => void;
    onError: (error: Error) => void;
}

export interface OpenRouterModel {
    id: string;
    name: string;
    pricing: {
        prompt: string;
        completion: string;
    };
    context_length: number;
}

interface RequestMetadata {
    referer: string;
    title: string;
    userAgent: string;
}

const MODELS_CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export class OpenRouterClient {
    private context: vscode.ExtensionContext;
    private baseUrl = 'https://openrouter.ai/api/v1';
    private outputChannel: vscode.OutputChannel;
    private modelsCache: { data: OpenRouterModel[]; fetchedAt: number } | null = null;
    private modelNameCache = new Map<string, string>();

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.outputChannel = vscode.window.createOutputChannel('Garden');
        this.context.subscriptions.push(this.outputChannel);
    }

    /**
     * Get API key from secrets storage
     */
    async getApiKey(): Promise<string | undefined> {
        const stored = await this.context.secrets.get('garden.openRouterApiKey');
        return normalizeOpenRouterKey(stored);
    }

    /**
     * Check if API key is configured
     */
    async hasApiKey(): Promise<boolean> {
        const key = await this.getApiKey();
        return isOpenRouterKeyValid(key);
    }

    /**
     * Get current model from settings
     */
    getModel(): string {
        const config = vscode.workspace.getConfiguration('garden');
        return config.get<string>('model', 'anthropic/claude-sonnet-4');
    }

    /**
     * Get system prompt from settings
     */
    getSystemPrompt(): string {
        const config = vscode.workspace.getConfiguration('garden');
        return config.get<string>('systemPrompt', 'You are a helpful AI assistant.');
    }

    /**
     * Fetch all available models from OpenRouter (with caching)
     */
    async getAvailableModels(): Promise<OpenRouterModel[]> {
        const now = Date.now();
        if (this.modelsCache && now - this.modelsCache.fetchedAt < MODELS_CACHE_TTL) {
            return this.modelsCache.data;
        }

        const metadata = this.getRequestMetadata();
        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Title': metadata.title,
            'User-Agent': metadata.userAgent
        };

        const apiKey = await this.getApiKey();
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        if (metadata.referer) {
            headers['HTTP-Referer'] = metadata.referer;
            headers['Referer'] = metadata.referer;
        }

        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.status}`);
            }

            const data = await response.json() as { data: OpenRouterModel[] };
            const models = data.data || [];
            this.modelsCache = { data: models, fetchedAt: now };
            models.forEach(model => {
                if (model.name) {
                    this.modelNameCache.set(model.id, model.name);
                }
            });
            return models;
        } catch (error) {
            this.logError('Failed to fetch models from OpenRouter', error);
            if (this.modelsCache) {
                return this.modelsCache.data;
            }
            return [];
        }
    }

    /**
     * Get display name for a model ID from OpenRouter
     * Example: 'anthropic/claude-sonnet-4' -> 'Claude Sonnet 4'
     */
    async getModelDisplayName(modelId: string): Promise<string> {
        if (this.modelNameCache.has(modelId)) {
            return this.modelNameCache.get(modelId)!;
        }

        try {
            const models = await this.getAvailableModels();
            const found = models.find(m => m.id === modelId);
            if (found?.name) {
                this.modelNameCache.set(modelId, found.name);
                return found.name;
            }
        } catch (error) {
            this.logError('Failed to resolve model display name', error);
        }

        const fallback = this.buildFriendlyModelName(modelId);
        this.modelNameCache.set(modelId, fallback);
        return fallback;
    }

    /**
     * Send a chat request with streaming
     */
    async chat(
        messages: ChatMessage[],
        callbacks: StreamCallbacks,
        abortSignal?: AbortSignal
    ): Promise<void> {
        const apiKey = await this.getApiKey();
        
        if (!apiKey) {
            callbacks.onError(new Error('API key not configured. Use "Garden: Set OpenRouter API Key" command.'));
            return;
        }

        if (!isOpenRouterKeyValid(apiKey)) {
            callbacks.onError(new Error(`Stored OpenRouter API key looks invalid. ${getApiKeyValidationHint()}`));
            return;
        }

        const model = this.getModel();
        const systemPrompt = this.getSystemPrompt();
        const metadata = this.getRequestMetadata();
        const headers = this.buildRequestHeaders(apiKey, metadata);

        // Prepend system message
        const fullMessages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        this.logInfo('Sending chat request to OpenRouter', {
            model,
            messageCount: fullMessages.length,
            referer: metadata.referer || '(none)',
            title: metadata.title
        });

        let fullResponse = '';

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    model: model,
                    messages: fullMessages,
                    stream: true
                }),
                signal: abortSignal
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logApiError(response, errorText, {
                    model,
                    messageCount: fullMessages.length,
                    referer: metadata.referer || '(none)',
                    title: metadata.title
                });
                const serverMessage = this.extractServerMessage(errorText);
                const friendlyMessage = this.buildFriendlyErrorMessage(response.status, serverMessage, metadata);
                callbacks.onError(new Error(friendlyMessage));
                return;
            }

            if (!response.body) {
                callbacks.onError(new Error('No response body'));
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                
                if (done || !value) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                buffer = this.processSseBuffer(buffer, (content) => {
                    fullResponse += content;
                    callbacks.onToken(content);
                });
            }

            // Flush any remaining buffered content
            buffer += decoder.decode(new Uint8Array(), { stream: false });
            this.processSseBuffer(buffer, (content) => {
                fullResponse += content;
                callbacks.onToken(content);
            });

            callbacks.onComplete(fullResponse);
            this.logInfo('OpenRouter streaming completed', {
                model,
                charactersReceived: fullResponse.length
            });

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    callbacks.onComplete(fullResponse || '');
                    this.logInfo('OpenRouter request aborted by user');
                } else {
                    callbacks.onError(error);
                    this.logError('OpenRouter request failed with unexpected error', error);
                }
            } else {
                callbacks.onError(new Error('Unknown error'));
                this.logError('OpenRouter request failed with non-Error rejection', error);
            }
        }
    }

    private getRequestMetadata(): RequestMetadata {
        const config = vscode.workspace.getConfiguration('garden');
        const referer = (config.get<string>('httpReferer', 'https://github.com/LilyAvelis/LilyCastle') || '').trim();
        const titleFallback = 'Garden VS Code Extension';
        const title = (config.get<string>('appTitle', titleFallback) || titleFallback).trim() || titleFallback;
        const userAgent = `${title} (VS Code ${vscode.version})`;

        return { referer, title, userAgent };
    }

    private buildRequestHeaders(apiKey: string, metadata: RequestMetadata) {
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'X-Title': metadata.title,
            'User-Agent': metadata.userAgent
        };

        if (metadata.referer) {
            headers['HTTP-Referer'] = metadata.referer;
            headers['Referer'] = metadata.referer;
        }

        return headers;
    }

    private extractServerMessage(payload: string): string {
        if (!payload) {
            return '';
        }

        try {
            const parsed = JSON.parse(payload);
            return parsed.error?.message || payload;
        } catch {
            return payload;
        }
    }

    private buildFriendlyErrorMessage(status: number, serverMessage: string, metadata: RequestMetadata): string {
        const trimmedMessage = serverMessage?.trim();

        if (status === 401 && trimmedMessage && /user not found/i.test(trimmedMessage)) {
            const refererHint = metadata.referer ? `HTTP Referer: ${metadata.referer}` : 'HTTP Referer is not set';
            return `${trimmedMessage}.\n• Confirm that your OpenRouter API key is active and copied in full.\n• ${refererHint}.\n• ${getApiKeyValidationHint()}`;
        }

        if (status === 401 && trimmedMessage && /referer/i.test(trimmedMessage)) {
            return `${trimmedMessage}. Update the "Garden › HTTP Referer" setting with a URL you control.`;
        }

        return trimmedMessage ? `OpenRouter (${status}): ${trimmedMessage}` : `OpenRouter request failed with status ${status}.`;
    }

    private logApiError(response: Response, body: string, context?: Record<string, unknown>): void {
        try {
            const headers = Object.fromEntries(response.headers.entries());
            this.logError('OpenRouter request failed', {
                status: response.status,
                statusText: response.statusText,
                headers,
                body: body?.slice(0, 2000),
                ...context
            });
        } catch (loggingError) {
            this.logError('Failed to log OpenRouter error', loggingError);
        }
    }

    private processSseBuffer(buffer: string, onContent: (content: string) => void): string {
        if (!buffer) {
            return '';
        }

        const lines = buffer.split(/\r?\n/);
        let remainder = lines.pop() ?? '';

        for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed || trimmed === 'data: [DONE]') {
                continue;
            }

            if (trimmed.startsWith('data: ')) {
                try {
                    const json = JSON.parse(trimmed.slice(6));
                    const content = json.choices?.[0]?.delta?.content;

                    if (content) {
                        onContent(content);
                    }
                } catch {
                    // Ignore JSON parse errors for incomplete SSE chunks
                }
            }
        }

        return remainder;
    }

    private logInfo(message: string, details?: unknown): void {
        this.writeToOutput('INFO', message, details);
    }

    private logError(message: string, details?: unknown): void {
        this.writeToOutput('ERROR', message, details);
    }

    private writeToOutput(level: 'INFO' | 'ERROR', message: string, details?: unknown): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
        if (details !== undefined) {
            const text = this.serializeDetails(details);
            this.outputChannel.appendLine(text);
        }

        if (level === 'ERROR') {
            console.error('[Garden]', message, details);
        } else {
            console.log('[Garden]', message, details);
        }
    }

    private serializeDetails(details: unknown): string {
        if (details instanceof Error) {
            return details.stack || details.message;
        }

        if (typeof details === 'string') {
            return details;
        }

        try {
            return JSON.stringify(details, null, 2);
        } catch {
            return String(details);
        }
    }

    private buildFriendlyModelName(modelId: string): string {
        if (!modelId) {
            return 'unknown';
        }

        const withoutNamespace = modelId.split('/').pop() || modelId;
        const normalized = withoutNamespace.replace(/[_-]+/g, ' ').trim();
        if (!normalized) {
            return modelId;
        }

        const tokens = normalized
            .split(' ')
            .filter(Boolean)
            .map(token => {
                if (/^[0-9.]+$/.test(token)) {
                    return token;
                }
                return token.charAt(0).toUpperCase() + token.slice(1);
            });

        return tokens.join(' ') || modelId;
    }
}
