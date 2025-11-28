/**
 * Garden - Extension Entry Point
 */

import * as vscode from 'vscode';
import { ChatViewProvider } from './views/chatViewProvider';
import { OpenRouterClient } from './api/openRouterClient';
import { GardenMongoClient } from './db/mongoClient';
import { LedgerService } from './services/ledgerService';
import { getApiKeyValidationHint, isOpenRouterKeyValid, normalizeOpenRouterKey } from './utils/openRouterKey';

// Global instances
let mongoClient: GardenMongoClient;
let ledgerService: LedgerService;

export async function activate(context: vscode.ExtensionContext) {
    console.log('🌱 Garden is growing...');

    // Create output channel for logging
    const outputChannel = vscode.window.createOutputChannel('Garden');
    context.subscriptions.push(outputChannel);

    // Initialize MongoDB client
    mongoClient = new GardenMongoClient(outputChannel);
    
    // Initialize Ledger service
    ledgerService = new LedgerService(mongoClient);

    // Try to connect to MongoDB (non-blocking)
    mongoClient.connect().then(connected => {
        if (connected) {
            vscode.window.showInformationMessage('🌱 Garden connected to MongoDB');
        } else {
            vscode.window.showWarningMessage('🌱 Garden: MongoDB not available. Chat history will not be saved.');
        }
    });

    // Initialize OpenRouter client
    const openRouterClient = new OpenRouterClient(context);
    
    // Register the chat view provider
    const chatViewProvider = new ChatViewProvider(
        context.extensionUri, 
        openRouterClient,
        ledgerService,
        outputChannel
    );
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('garden.chatView', chatViewProvider)
    );
    
    // Command: Open Chat (focus the sidebar)
    context.subscriptions.push(
        vscode.commands.registerCommand('garden.openChat', () => {
            vscode.commands.executeCommand('garden.chatView.focus');
        })
    );
    
    // Command: Set API Key
    context.subscriptions.push(
        vscode.commands.registerCommand('garden.setApiKey', async () => {
            const apiKey = await vscode.window.showInputBox({
                prompt: 'Enter your OpenRouter API Key',
                password: true,
                placeHolder: 'sk-or-v1-...',
                validateInput: (value) => {
                    const normalized = normalizeOpenRouterKey(value);
                    if (!normalized) {
                        return 'API key cannot be empty.';
                    }
                    return isOpenRouterKeyValid(normalized) ? undefined : getApiKeyValidationHint();
                }
            });
            
            const normalizedKey = normalizeOpenRouterKey(apiKey);

            if (!normalizedKey) {
                return;
            }

            if (!isOpenRouterKeyValid(normalizedKey)) {
                vscode.window.showErrorMessage(`⚠️ ${getApiKeyValidationHint()}`);
                return;
            }

            await context.secrets.store('garden.openRouterApiKey', normalizedKey);
            vscode.window.showInformationMessage('🌱 OpenRouter API Key saved!');
        })
    );
    
    // Command: Select Model (dynamically fetch from OpenRouter)
    context.subscriptions.push(
        vscode.commands.registerCommand('garden.selectModel', async () => {
            // Show loading
            const loadingPick = vscode.window.showQuickPick(
                new Promise<vscode.QuickPickItem[]>(async (resolve) => {
                    try {
                        const models = await openRouterClient.getAvailableModels();
                        
                        if (models.length === 0) {
                            resolve([{ label: '$(error) Failed to load models', description: 'Check your connection' }]);
                            return;
                        }

                        // Sort by name and format
                        const items: vscode.QuickPickItem[] = models
                            .sort((a, b) => a.id.localeCompare(b.id))
                            .map(model => ({
                                label: model.name || model.id,
                                description: model.id,
                                detail: `Context: ${model.context_length?.toLocaleString() || '?'} tokens`
                            }));

                        resolve(items);
                    } catch (error) {
                        resolve([{ label: '$(error) Error loading models', description: String(error) }]);
                    }
                }),
                {
                    placeHolder: 'Loading models from OpenRouter...',
                    matchOnDescription: true,
                    matchOnDetail: true
                }
            );

            const selected = await loadingPick;
            
            if (selected && selected.description && !selected.label.startsWith('$(error)')) {
                const modelId = selected.description;
                const config = vscode.workspace.getConfiguration('garden');
                await config.update('model', modelId, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`🌱 Model set to: ${selected.label}`);
            }
        })
    );
    
    console.log('🌱 Garden is ready!');
}

export async function deactivate() {
    console.log('🍂 Garden is sleeping...');
    
    // Close MongoDB connection
    if (mongoClient) {
        await mongoClient.disconnect();
    }
}
