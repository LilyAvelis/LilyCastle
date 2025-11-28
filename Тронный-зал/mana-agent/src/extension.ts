/**
 * Mana Agent - Extension Entry Point
 * 
 * This is Lily's custom AI agent system with mana-based resource management.
 * Unlike traditional AI assistants, this agent has a "life force" (mana) that
 * grows with successful actions and depletes with failures.
 */

import * as vscode from 'vscode';
import { ManaStateManager } from './mana/stateManager';
import { registerManaParticipant } from './chat/participant';
import { registerManaTools } from './tools/registry';
import { ManaStatusProvider } from './views/statusProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('🔮 Mana Agent is awakening...');

    // Initialize the mana state manager (the heart of the system)
    const manaManager = new ManaStateManager(context);
    
    // Register the chat participant (@mana)
    registerManaParticipant(context, manaManager);
    
    // Register tools that the agent can use
    registerManaTools(context, manaManager);
    
    // Register the status view in the sidebar
    const statusProvider = new ManaStatusProvider(context.extensionUri, manaManager);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('mana-agent.statusView', statusProvider)
    );
    
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('mana-agent.showStatus', () => {
            const status = manaManager.getStatus();
            vscode.window.showInformationMessage(
                `🔮 Mana: ${status.currentMana}/${status.maxMana} | Rank: ${status.rank} | ${status.rankName}`
            );
        })
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand('mana-agent.resetMana', async () => {
            const confirm = await vscode.window.showWarningMessage(
                '⚠️ This will reset all mana progress. Are you sure?',
                'Yes, Reset',
                'Cancel'
            );
            if (confirm === 'Yes, Reset') {
                manaManager.reset();
                vscode.window.showInformationMessage('🔄 Mana has been reset to initial state.');
            }
        })
    );
    
    console.log('✨ Mana Agent is ready! Current mana:', manaManager.getStatus().currentMana);
}

export function deactivate() {
    console.log('💤 Mana Agent is sleeping...');
}
