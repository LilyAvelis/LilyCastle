/**
 * Mana State Manager
 * 
 * The core of the Mana Agent system. Manages:
 * - Current mana pool
 * - Maximum mana (grows with rank)
 * - Rank progression
 * - Persistence across sessions
 * 
 * Philosophy:
 * - No punishments, only rewards
 * - Success grows the agent
 * - Failure costs committed mana, nothing more
 * - Ranks are quantized plateaus, not linear growth
 */

import * as vscode from 'vscode';

export interface ManaState {
    currentMana: number;
    maxMana: number;
    rank: number;
    totalSuccesses: number;
    totalFailures: number;
    createdAt: string;
    lastActionAt: string;
}

export interface ManaStatus extends ManaState {
    rankName: string;
    nextRankThreshold: number | null;
    manaToNextRank: number;
}

export interface ActionResult {
    success: boolean;
    manaSpent: number;
    manaReturned: number;
    bonusMana: number;
    newRank: boolean;
}

const RANK_NAMES = [
    'Искра',        // Rank 0: 10 mana
    'Ученик',       // Rank 1: 30 mana
    'Адепт',        // Rank 2: 100 mana
    'Мастер',       // Rank 3: 300 mana
    'Магистр',      // Rank 4: 1000 mana
    'Архимаг',      // Rank 5: 3000 mana
    'Высший',       // Rank 6: 10000 mana
    'Трансцендент'  // Rank 7+: beyond
];

const DEFAULT_RANK_THRESHOLDS = [10, 30, 100, 300, 1000, 3000, 10000];

export class ManaStateManager {
    private state: ManaState;
    private context: vscode.ExtensionContext;
    private stateKey = 'mana-agent.state';

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.state = this.loadState();
    }

    private loadState(): ManaState {
        const saved = this.context.globalState.get<ManaState>(this.stateKey);
        if (saved) {
            return saved;
        }
        
        // Initialize new agent
        const config = vscode.workspace.getConfiguration('mana-agent');
        const initialMana = config.get<number>('initialMana', 10);
        
        return {
            currentMana: initialMana,
            maxMana: initialMana,
            rank: 0,
            totalSuccesses: 0,
            totalFailures: 0,
            createdAt: new Date().toISOString(),
            lastActionAt: new Date().toISOString()
        };
    }

    private async saveState(): Promise<void> {
        await this.context.globalState.update(this.stateKey, this.state);
    }

    private getRankThresholds(): number[] {
        const config = vscode.workspace.getConfiguration('mana-agent');
        return config.get<number[]>('rankThresholds', DEFAULT_RANK_THRESHOLDS);
    }

    private getSuccessMultiplier(): number {
        const config = vscode.workspace.getConfiguration('mana-agent');
        return config.get<number>('successMultiplier', 1.5);
    }

    /**
     * Get current status of the agent
     */
    getStatus(): ManaStatus {
        const thresholds = this.getRankThresholds();
        const nextThreshold = thresholds[this.state.rank + 1] ?? null;
        
        return {
            ...this.state,
            rankName: RANK_NAMES[Math.min(this.state.rank, RANK_NAMES.length - 1)],
            nextRankThreshold: nextThreshold,
            manaToNextRank: nextThreshold ? nextThreshold - this.state.maxMana : 0
        };
    }

    /**
     * Check if agent can afford an action
     */
    canAfford(manaCost: number): boolean {
        return this.state.currentMana >= manaCost;
    }

    /**
     * Commit mana for an action (called before action starts)
     * Returns the amount of mana committed, or 0 if can't afford
     */
    commitMana(requestedMana: number): number {
        if (!this.canAfford(requestedMana)) {
            return 0;
        }
        
        this.state.currentMana -= requestedMana;
        this.state.lastActionAt = new Date().toISOString();
        this.saveState();
        
        return requestedMana;
    }

    /**
     * Complete an action - called when action finishes
     * On success: return unused mana + bonus
     * On failure: committed mana is lost
     */
    async completeAction(
        committedMana: number,
        usedMana: number,
        success: boolean
    ): Promise<ActionResult> {
        const result: ActionResult = {
            success,
            manaSpent: usedMana,
            manaReturned: 0,
            bonusMana: 0,
            newRank: false
        };

        if (success) {
            // Return unused mana
            const unusedMana = committedMana - usedMana;
            result.manaReturned = unusedMana;
            
            // Add bonus mana based on what was actually used
            const multiplier = this.getSuccessMultiplier();
            result.bonusMana = Math.floor(usedMana * (multiplier - 1));
            
            // Apply returns and bonus
            this.state.currentMana += unusedMana + result.bonusMana;
            this.state.totalSuccesses++;
            
            // Check for rank up
            const oldRank = this.state.rank;
            this.checkRankUp();
            result.newRank = this.state.rank > oldRank;
            
        } else {
            // Failure: committed mana is lost (already deducted)
            this.state.totalFailures++;
        }

        this.state.lastActionAt = new Date().toISOString();
        await this.saveState();
        
        return result;
    }

    /**
     * Check if agent should rank up and increase max mana
     */
    private checkRankUp(): void {
        const thresholds = this.getRankThresholds();
        
        while (
            this.state.rank < thresholds.length - 1 &&
            this.state.currentMana >= thresholds[this.state.rank + 1]
        ) {
            this.state.rank++;
            this.state.maxMana = thresholds[this.state.rank];
        }
    }

    /**
     * Regenerate mana over time (optional passive regen)
     * Called periodically or on certain events
     */
    passiveRegen(amount: number): void {
        this.state.currentMana = Math.min(
            this.state.currentMana + amount,
            this.state.maxMana
        );
        this.saveState();
    }

    /**
     * Reset agent to initial state (admin command)
     */
    reset(): void {
        const config = vscode.workspace.getConfiguration('mana-agent');
        const initialMana = config.get<number>('initialMana', 10);
        
        this.state = {
            currentMana: initialMana,
            maxMana: initialMana,
            rank: 0,
            totalSuccesses: 0,
            totalFailures: 0,
            createdAt: new Date().toISOString(),
            lastActionAt: new Date().toISOString()
        };
        this.saveState();
    }

    /**
     * Grant mana directly (Lily's admin power)
     */
    grantMana(amount: number): void {
        this.state.currentMana += amount;
        this.checkRankUp();
        this.saveState();
    }

    /**
     * Check if agent is "alive" (has any mana)
     */
    isAlive(): boolean {
        return this.state.currentMana > 0;
    }

    /**
     * Get mana cost estimate for token count
     */
    estimateManaCost(tokenCount: number): number {
        const config = vscode.workspace.getConfiguration('mana-agent');
        const manaPerToken = config.get<number>('manaPerToken', 0.001);
        return Math.ceil(tokenCount * manaPerToken);
    }
}
