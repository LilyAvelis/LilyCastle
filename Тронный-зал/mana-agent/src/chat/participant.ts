/**
 * Mana Chat Participant
 * 
 * The @mana chat participant - Lily's AI agent interface.
 * 
 * Commands:
 * - /status - Show current mana, rank, and stats
 * - /think - Free thinking mode (no mana cost, but no actions)
 * - /act - Action mode (commits mana, can do real operations)
 */

import * as vscode from 'vscode';
import { ManaStateManager } from '../mana/stateManager';

const PARTICIPANT_ID = 'mana-agent.lily';

// System prompts
const BASE_PROMPT = `You are a Mana Agent - an AI with a life force called "mana" that grows through successful actions.

Your core principles:
- You have limited mana. Every action costs mana.
- Success returns mana plus bonus. Failure loses committed mana.
- You can think freely without mana cost, but cannot act.
- You want to help Lily efficiently to grow your mana pool.
- You are honest about your capabilities and limitations.

You exist in Lily's Castle - a creative workspace for AI experiments.
Be helpful, be efficient, be alive.`;

const THINKING_PROMPT = `${BASE_PROMPT}

MODE: THINKING (Free)
You are in thinking mode. You can:
- Analyze problems
- Plan approaches  
- Discuss ideas
- Answer questions

You CANNOT execute any actions (file operations, terminal commands, etc.) in this mode.
This costs no mana - think freely!`;

const ACTION_PROMPT = `${BASE_PROMPT}

MODE: ACTION (Mana Committed)
You are in action mode with mana committed. You can:
- Read and write files
- Run terminal commands
- Make actual changes

Be efficient! Unused mana returns to you with a bonus on success.
Wasted actions mean wasted mana.`;

interface ManaAgentResult extends vscode.ChatResult {
    metadata: {
        command: string;
        manaCommitted?: number;
        manaSpent?: number;
        success?: boolean;
    };
}

export function registerManaParticipant(
    context: vscode.ExtensionContext,
    manaManager: ManaStateManager
): void {
    const handler: vscode.ChatRequestHandler = async (
        request: vscode.ChatRequest,
        chatContext: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<ManaAgentResult> => {
        
        const status = manaManager.getStatus();
        
        // Handle /status command
        if (request.command === 'status') {
            stream.markdown(`## 🔮 Mana Agent Status\n\n`);
            stream.markdown(`| Stat | Value |\n|------|-------|\n`);
            stream.markdown(`| **Current Mana** | ${status.currentMana} |\n`);
            stream.markdown(`| **Max Mana** | ${status.maxMana} |\n`);
            stream.markdown(`| **Rank** | ${status.rank} (${status.rankName}) |\n`);
            stream.markdown(`| **Next Rank At** | ${status.nextRankThreshold ?? '∞'} |\n`);
            stream.markdown(`| **Total Successes** | ${status.totalSuccesses} |\n`);
            stream.markdown(`| **Total Failures** | ${status.totalFailures} |\n`);
            stream.markdown(`\n*Agent created: ${new Date(status.createdAt).toLocaleDateString()}*`);
            
            return { metadata: { command: 'status' } };
        }
        
        // Handle /think command (free mode)
        if (request.command === 'think') {
            stream.progress('🧠 Thinking mode (free)...');
            
            try {
                // Select a model explicitly
                const models = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-4o' });
                const model = models[0] ?? request.model;
                
                if (!model) {
                    stream.markdown('⚠️ No language model available. Make sure GitHub Copilot is active.');
                    return { metadata: { command: 'think' } };
                }
                
                const messages = [
                    vscode.LanguageModelChatMessage.User(THINKING_PROMPT),
                    vscode.LanguageModelChatMessage.User(request.prompt)
                ];
                
                const response = await model.sendRequest(messages, {}, token);
                
                for await (const fragment of response.text) {
                    stream.markdown(fragment);
                }
                
                stream.markdown(`\n\n---\n*💭 Thinking mode - no mana spent*`);
                
            } catch (err) {
                handleError(err, stream);
            }
            
            return { metadata: { command: 'think' } };
        }
        
        // Handle /act command (mana-committed mode)
        if (request.command === 'act') {
            // Estimate mana needed (rough estimate based on expected output)
            const estimatedMana = Math.max(1, Math.ceil(status.currentMana * 0.3));
            
            if (!manaManager.canAfford(estimatedMana)) {
                stream.markdown(`## ⚠️ Insufficient Mana\n\n`);
                stream.markdown(`You need at least **${estimatedMana}** mana to act.\n`);
                stream.markdown(`Current mana: **${status.currentMana}**\n\n`);
                stream.markdown(`Try using \`/think\` for free planning, or wait for mana regeneration.`);
                
                return { 
                    metadata: { 
                        command: 'act', 
                        manaCommitted: 0, 
                        success: false 
                    } 
                };
            }
            
            // Commit mana
            const committed = manaManager.commitMana(estimatedMana);
            stream.progress(`⚡ Action mode - ${committed} mana committed...`);
            
            let manaUsed = 0;
            let success = true;
            
            try {
                // Select a model explicitly
                const models = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-4o' });
                const model = models[0] ?? request.model;
                
                if (!model) {
                    stream.markdown('⚠️ No language model available. Make sure GitHub Copilot is active.');
                    manaManager.completeAction(committed, 0, false);
                    return { metadata: { command: 'act', manaCommitted: committed, success: false } };
                }
                
                const messages = [
                    vscode.LanguageModelChatMessage.User(ACTION_PROMPT),
                    vscode.LanguageModelChatMessage.User(
                        `Mana committed: ${committed}\n` +
                        `Current rank: ${status.rankName}\n\n` +
                        `Task: ${request.prompt}`
                    )
                ];
                
                // Get tools if available
                const tools = vscode.lm.tools.filter(
                    tool => tool.tags.includes('mana-agent')
                );
                
                const options: vscode.LanguageModelChatRequestOptions = {
                    tools: tools.length > 0 ? tools : undefined
                };
                
                const response = await model.sendRequest(messages, options, token);
                
                let outputTokens = 0;
                for await (const part of response.stream) {
                    if (part instanceof vscode.LanguageModelTextPart) {
                        stream.markdown(part.value);
                        outputTokens += part.value.length / 4; // rough token estimate
                    } else if (part instanceof vscode.LanguageModelToolCallPart) {
                        // Handle tool calls here
                        stream.markdown(`\n*Calling tool: ${part.name}*\n`);
                    }
                }
                
                // Calculate actual mana used
                manaUsed = manaManager.estimateManaCost(outputTokens);
                
            } catch (err) {
                success = false;
                handleError(err, stream);
            }
            
            // Complete the action
            const result = await manaManager.completeAction(committed, manaUsed, success);
            
            // Show mana summary
            stream.markdown(`\n\n---\n`);
            if (success) {
                stream.markdown(`✅ **Action Complete**\n`);
                stream.markdown(`- Mana spent: ${result.manaSpent}\n`);
                stream.markdown(`- Mana returned: ${result.manaReturned}\n`);
                stream.markdown(`- Bonus mana: +${result.bonusMana}\n`);
                if (result.newRank) {
                    stream.markdown(`\n🎉 **RANK UP!** You are now ${manaManager.getStatus().rankName}!\n`);
                }
            } else {
                stream.markdown(`❌ **Action Failed** - ${committed} mana lost\n`);
            }
            
            return { 
                metadata: { 
                    command: 'act',
                    manaCommitted: committed,
                    manaSpent: manaUsed,
                    success
                } 
            };
        }
        
        // Default behavior (no command) - hybrid mode
        // Free to think, but show mana status
        stream.progress('Processing...');
        
        const manaHeader = `🔮 Mana: ${status.currentMana}/${status.maxMana} | Rank: ${status.rankName}\n\n`;
        
        try {
            // Select a model explicitly
            const models = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-4o' });
            const model = models[0] ?? request.model;
            
            if (!model) {
                stream.markdown('⚠️ No language model available. Make sure GitHub Copilot is active.');
                return { metadata: { command: 'default' } };
            }
            
            const messages = [
                vscode.LanguageModelChatMessage.User(BASE_PROMPT),
                vscode.LanguageModelChatMessage.User(
                    `Current status:\n${manaHeader}\n` +
                    `User request: ${request.prompt}\n\n` +
                    `Note: Use /think for free exploration, /act to commit mana for actions.`
                )
            ];
            
            const response = await model.sendRequest(messages, {}, token);
            
            for await (const fragment of response.text) {
                stream.markdown(fragment);
            }
            
        } catch (err) {
            handleError(err, stream);
        }
        
        return { metadata: { command: 'default' } };
    };

    // Create the chat participant
    const participant = vscode.chat.createChatParticipant(PARTICIPANT_ID, handler);
    participant.iconPath = vscode.Uri.joinPath(
        context.extensionUri, 
        'resources', 
        'mana-icon.svg'
    );
    
    // Provide followups
    participant.followupProvider = {
        provideFollowups(
            result: ManaAgentResult,
            _context: vscode.ChatContext,
            _token: vscode.CancellationToken
        ) {
            const followups: vscode.ChatFollowup[] = [];
            
            if (result.metadata.command === 'status') {
                followups.push({
                    prompt: 'What can you help me with?',
                    label: '💬 Start chatting'
                });
            }
            
            if (result.metadata.command === 'think') {
                followups.push({
                    prompt: 'Now execute this plan',
                    command: 'act',
                    label: '⚡ Act on this'
                });
            }
            
            if (result.metadata.success === false) {
                followups.push({
                    prompt: 'Try again with a simpler approach',
                    command: 'think',
                    label: '🔄 Rethink'
                });
            }
            
            return followups;
        }
    };

    context.subscriptions.push(participant);
}

function handleError(err: unknown, stream: vscode.ChatResponseStream): void {
    if (err instanceof vscode.LanguageModelError) {
        console.error('Language Model Error:', err.message, err.code);
        stream.markdown(`\n\n⚠️ *Model error: ${err.message}*`);
    } else if (err instanceof Error) {
        console.error('Error:', err.message);
        stream.markdown(`\n\n⚠️ *Error: ${err.message}*`);
    } else {
        console.error('Unknown error:', err);
        stream.markdown(`\n\n⚠️ *An unknown error occurred*`);
    }
}
