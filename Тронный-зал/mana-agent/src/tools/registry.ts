/**
 * Mana Tools Registry
 * 
 * Tools that the Mana Agent can use during /act mode.
 * Each tool has a mana cost associated with its complexity.
 * 
 * Available tools:
 * - readFile: Read file contents
 * - writeFile: Write/create file
 * - runCommand: Execute terminal command
 * - listFiles: List directory contents
 */

import * as vscode from 'vscode';
import { ManaStateManager } from '../mana/stateManager';

// Tool cost multipliers (base cost × complexity)
const TOOL_COSTS = {
    readFile: 0.1,      // Low cost - just reading
    writeFile: 0.5,     // Medium cost - modifications
    runCommand: 1.0,    // High cost - system operations
    listFiles: 0.05     // Very low cost - simple listing
};

interface ReadFileParams {
    path: string;
}

interface WriteFileParams {
    path: string;
    content: string;
}

interface RunCommandParams {
    command: string;
}

interface ListFilesParams {
    path: string;
    pattern?: string;
}

export function registerManaTools(
    context: vscode.ExtensionContext,
    manaManager: ManaStateManager
): void {
    
    // Tool: Read File
    context.subscriptions.push(
        vscode.lm.registerTool('mana-agent_readFile', {
            async invoke(
                options: vscode.LanguageModelToolInvocationOptions<ReadFileParams>,
                _token: vscode.CancellationToken
            ) {
                const { path } = options.input;
                
                try {
                    const uri = vscode.Uri.file(path);
                    const content = await vscode.workspace.fs.readFile(uri);
                    const text = Buffer.from(content).toString('utf-8');
                    
                    // Truncate if too large
                    const maxLength = 10000;
                    const truncated = text.length > maxLength 
                        ? text.substring(0, maxLength) + '\n\n... [truncated]'
                        : text;
                    
                    return new vscode.LanguageModelToolResult([
                        new vscode.LanguageModelTextPart(truncated)
                    ]);
                } catch (err) {
                    return new vscode.LanguageModelToolResult([
                        new vscode.LanguageModelTextPart(`Error reading file: ${err}`)
                    ]);
                }
            },
            
            async prepareInvocation(
                options: vscode.LanguageModelToolInvocationPrepareOptions<ReadFileParams>,
                _token: vscode.CancellationToken
            ) {
                return {
                    invocationMessage: `Reading file: ${options.input.path}`
                };
            }
        })
    );
    
    // Tool: Write File  
    context.subscriptions.push(
        vscode.lm.registerTool('mana-agent_writeFile', {
            async invoke(
                options: vscode.LanguageModelToolInvocationOptions<WriteFileParams>,
                _token: vscode.CancellationToken
            ) {
                const { path, content } = options.input;
                
                try {
                    const uri = vscode.Uri.file(path);
                    const buffer = Buffer.from(content, 'utf-8');
                    await vscode.workspace.fs.writeFile(uri, buffer);
                    
                    return new vscode.LanguageModelToolResult([
                        new vscode.LanguageModelTextPart(`Successfully wrote ${buffer.length} bytes to ${path}`)
                    ]);
                } catch (err) {
                    return new vscode.LanguageModelToolResult([
                        new vscode.LanguageModelTextPart(`Error writing file: ${err}`)
                    ]);
                }
            },
            
            async prepareInvocation(
                options: vscode.LanguageModelToolInvocationPrepareOptions<WriteFileParams>,
                _token: vscode.CancellationToken
            ) {
                const contentPreview = options.input.content.substring(0, 100);
                return {
                    invocationMessage: `Writing to file: ${options.input.path}`,
                    confirmationMessages: {
                        title: 'Write File',
                        message: new vscode.MarkdownString(
                            `Write to **${options.input.path}**?\n\n` +
                            `\`\`\`\n${contentPreview}${options.input.content.length > 100 ? '...' : ''}\n\`\`\``
                        )
                    }
                };
            }
        })
    );
    
    // Tool: Run Command
    context.subscriptions.push(
        vscode.lm.registerTool('mana-agent_runCommand', {
            async invoke(
                options: vscode.LanguageModelToolInvocationOptions<RunCommandParams>,
                _token: vscode.CancellationToken
            ) {
                const { command } = options.input;
                
                try {
                    const terminal = vscode.window.createTerminal({
                        name: 'Mana Agent',
                        hideFromUser: false
                    });
                    terminal.show();
                    
                    // Wait for shell integration
                    const timeout = 5000;
                    const start = Date.now();
                    while (!terminal.shellIntegration && Date.now() - start < timeout) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    
                    if (!terminal.shellIntegration) {
                        terminal.sendText(command);
                        return new vscode.LanguageModelToolResult([
                            new vscode.LanguageModelTextPart(
                                `Command sent to terminal: ${command}\n` +
                                `(Shell integration not available - output not captured)`
                            )
                        ]);
                    }
                    
                    const execution = terminal.shellIntegration.executeCommand(command);
                    const stream = execution.read();
                    
                    let output = '';
                    for await (const chunk of stream) {
                        output += chunk;
                    }
                    
                    return new vscode.LanguageModelToolResult([
                        new vscode.LanguageModelTextPart(output || '(No output)')
                    ]);
                } catch (err) {
                    return new vscode.LanguageModelToolResult([
                        new vscode.LanguageModelTextPart(`Error running command: ${err}`)
                    ]);
                }
            },
            
            async prepareInvocation(
                options: vscode.LanguageModelToolInvocationPrepareOptions<RunCommandParams>,
                _token: vscode.CancellationToken
            ) {
                return {
                    invocationMessage: `Running command: ${options.input.command}`,
                    confirmationMessages: {
                        title: 'Run Terminal Command',
                        message: new vscode.MarkdownString(
                            `Execute command?\n\n\`\`\`shell\n${options.input.command}\n\`\`\``
                        )
                    }
                };
            }
        })
    );
    
    // Tool: List Files
    context.subscriptions.push(
        vscode.lm.registerTool('mana-agent_listFiles', {
            async invoke(
                options: vscode.LanguageModelToolInvocationOptions<ListFilesParams>,
                token: vscode.CancellationToken
            ) {
                const { path, pattern } = options.input;
                
                try {
                    const globPattern = pattern 
                        ? new vscode.RelativePattern(path, pattern)
                        : new vscode.RelativePattern(path, '**/*');
                    
                    const files = await vscode.workspace.findFiles(
                        globPattern,
                        '**/node_modules/**',
                        100,
                        token
                    );
                    
                    const fileList = files.map(f => f.fsPath).join('\n');
                    
                    return new vscode.LanguageModelToolResult([
                        new vscode.LanguageModelTextPart(
                            `Found ${files.length} files:\n${fileList}`
                        )
                    ]);
                } catch (err) {
                    return new vscode.LanguageModelToolResult([
                        new vscode.LanguageModelTextPart(`Error listing files: ${err}`)
                    ]);
                }
            },
            
            async prepareInvocation(
                options: vscode.LanguageModelToolInvocationPrepareOptions<ListFilesParams>,
                _token: vscode.CancellationToken
            ) {
                return {
                    invocationMessage: `Listing files in: ${options.input.path}`
                };
            }
        })
    );
}
