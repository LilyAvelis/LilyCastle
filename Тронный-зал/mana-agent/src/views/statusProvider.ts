/**
 * Mana Status Webview Provider
 * 
 * Shows a visual representation of the agent's mana status
 * in the sidebar.
 */

import * as vscode from 'vscode';
import { ManaStateManager } from '../mana/stateManager';

export class ManaStatusProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    
    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly manaManager: ManaStateManager
    ) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;
        
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };
        
        webviewView.webview.html = this.getHtmlContent();
        
        // Update periodically
        setInterval(() => {
            if (this._view) {
                this._view.webview.html = this.getHtmlContent();
            }
        }, 5000);
    }

    private getHtmlContent(): string {
        const status = this.manaManager.getStatus();
        const manaPercent = Math.round((status.currentMana / status.maxMana) * 100);
        
        // Color based on mana level
        let manaColor = '#4CAF50'; // Green
        if (manaPercent < 30) {
            manaColor = '#f44336'; // Red
        } else if (manaPercent < 60) {
            manaColor = '#ff9800'; // Orange
        }
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mana Status</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            padding: 10px;
            margin: 0;
        }
        
        .status-card {
            background: var(--vscode-editor-background);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .rank-badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .mana-bar-container {
            background: var(--vscode-input-background);
            border-radius: 10px;
            height: 20px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .mana-bar {
            height: 100%;
            background: ${manaColor};
            border-radius: 10px;
            transition: width 0.5s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
        }
        
        .stat-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid var(--vscode-widget-border);
        }
        
        .stat-label {
            color: var(--vscode-descriptionForeground);
        }
        
        .stat-value {
            font-weight: bold;
        }
        
        .emoji {
            font-size: 20px;
            margin-right: 5px;
        }
        
        h3 {
            margin: 0 0 10px 0;
            display: flex;
            align-items: center;
        }
    </style>
</head>
<body>
    <div class="status-card">
        <h3><span class="emoji">🔮</span> Mana Agent</h3>
        <div class="rank-badge">${status.rankName} (Rank ${status.rank})</div>
        
        <div class="mana-bar-container">
            <div class="mana-bar" style="width: ${manaPercent}%">
                ${status.currentMana} / ${status.maxMana}
            </div>
        </div>
        
        <div class="stat-row">
            <span class="stat-label">Next Rank</span>
            <span class="stat-value">${status.nextRankThreshold ?? '∞'}</span>
        </div>
        
        <div class="stat-row">
            <span class="stat-label">Mana to Rank Up</span>
            <span class="stat-value">${status.manaToNextRank}</span>
        </div>
        
        <div class="stat-row">
            <span class="stat-label">✅ Successes</span>
            <span class="stat-value">${status.totalSuccesses}</span>
        </div>
        
        <div class="stat-row">
            <span class="stat-label">❌ Failures</span>
            <span class="stat-value">${status.totalFailures}</span>
        </div>
        
        <div class="stat-row">
            <span class="stat-label">Created</span>
            <span class="stat-value">${new Date(status.createdAt).toLocaleDateString()}</span>
        </div>
    </div>
    
    <div class="status-card" style="font-size: 12px; color: var(--vscode-descriptionForeground);">
        <strong>Commands:</strong><br>
        <code>@mana /status</code> - View status<br>
        <code>@mana /think</code> - Free thinking<br>
        <code>@mana /act</code> - Commit mana to act
    </div>
</body>
</html>`;
    }
}
