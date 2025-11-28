/**
 * Ledger Service
 * 
 * Manages the Chrono-Page Protocol.
 * Handles creation and retrieval of Pages (Invoke/Response) and Sessions.
 */

import * as crypto from 'crypto';
import { GardenMongoClient, Page, Session, PageWithDelta } from '../db/mongoClient';

export interface CreateSessionOptions {
    title: string;                     // "Обсуждение кнопки"
    model: string;                     // 'anthropic/claude-sonnet-4'
    who: string;                       // '@Claude'
}

export interface CreatePageOptions {
    who: string;                       // '@Claude' | '@Lily' | '@System'
    content: string;                   // Markdown content
    rank?: number | null;              // Agent rank (optional)
}

export class LedgerService {
    private mongoClient: GardenMongoClient;
    private currentSession: Session | null = null;

    constructor(mongoClient: GardenMongoClient) {
        this.mongoClient = mongoClient;
    }

    // ==================== SESSION MANAGEMENT ====================

    /**
     * Create and start a new session
     * Can accept CreateSessionOptions or just a title string
     */
    async createSession(optionsOrTitle: CreateSessionOptions | string): Promise<Session> {
        const now = new Date();
        
        // Support both string and object
        const opts: CreateSessionOptions = typeof optionsOrTitle === 'string' 
            ? { title: optionsOrTitle, model: 'unknown', who: '@Agent' }
            : optionsOrTitle;
        
        const session: Session = {
            sessionId: crypto.randomUUID(),
            title: opts.title,
            model: opts.model,
            who: opts.who,
            createdAt: now,
            updatedAt: now,
            lastPageId: 0,
            status: 'active'
        };

        const sessions = this.mongoClient.getSessions();
        await sessions.insertOne(session);
        
        this.currentSession = session;
        return session;
    }

    /**
     * Get a session by ID
     */
    async getSession(sessionId: string): Promise<Session | null> {
        const sessions = this.mongoClient.getSessions();
        return sessions.findOne({ sessionId });
    }

    /**
     * Delete a session and all its pages
     */
    async deleteSession(sessionId: string): Promise<void> {
        const sessions = this.mongoClient.getSessions();
        const pages = this.mongoClient.getPages();
        
        await pages.deleteMany({ sessionId });
        await sessions.deleteOne({ sessionId });
        
        if (this.currentSession?.sessionId === sessionId) {
            this.currentSession = null;
        }
    }

    /**
     * Get current session
     */
    getCurrentSession(): Session | null {
        return this.currentSession;
    }

    /**
     * Get current session ID
     */
    getSessionId(): string | null {
        return this.currentSession?.sessionId ?? null;
    }

    /**
     * Load an existing session by ID
     */
    async loadSession(sessionId: string): Promise<Session | null> {
        const sessions = this.mongoClient.getSessions();
        const session = await sessions.findOne({ sessionId });
        
        if (session) {
            this.currentSession = session;
        }
        
        return session;
    }

    /**
     * Update session title
     */
    async updateSessionTitle(sessionId: string, title: string): Promise<void> {
        const sessions = this.mongoClient.getSessions();
        await sessions.updateOne(
            { sessionId },
            { $set: { title, updatedAt: new Date() } }
        );
        
        if (this.currentSession?.sessionId === sessionId) {
            this.currentSession.title = title;
        }
    }

    /**
     * Update session who (agent pseudonym)
     */
    async updateSessionWho(sessionId: string, who: string): Promise<void> {
        const sessions = this.mongoClient.getSessions();
        await sessions.updateOne(
            { sessionId },
            { $set: { who, updatedAt: new Date() } }
        );
        
        if (this.currentSession?.sessionId === sessionId) {
            this.currentSession.who = who;
        }
    }

    /**
     * Update all RESPONSE pages in session with new who
     */
    async updateSessionPagesWho(sessionId: string, who: string): Promise<void> {
        const pages = this.mongoClient.getPages();
        await pages.updateMany(
            { sessionId, type: 'RESPONSE' },
            { $set: { who } }
        );
    }

    /**
     * Close current session
     */
    async closeSession(): Promise<void> {
        if (!this.currentSession) return;
        
        const sessions = this.mongoClient.getSessions();
        await sessions.updateOne(
            { sessionId: this.currentSession.sessionId },
            { $set: { status: 'closed', updatedAt: new Date() } }
        );
        
        this.currentSession = null;
    }

    /**
     * Get all sessions (recent first)
     */
    async getAllSessions(limit: number = 50): Promise<Session[]> {
        const sessions = this.mongoClient.getSessions();
        return sessions
            .find({})
            .sort({ updatedAt: -1 })
            .limit(limit)
            .toArray();
    }

    /**
     * Get active sessions only
     */
    async getActiveSessions(): Promise<Session[]> {
        const sessions = this.mongoClient.getSessions();
        return sessions
            .find({ status: 'active' })
            .sort({ updatedAt: -1 })
            .toArray();
    }

    // ==================== PAGE MANAGEMENT ====================

    /**
     * Get the next page ID for current session
     */
    private async getNextPageId(): Promise<number> {
        if (!this.currentSession) {
            throw new Error('No active session. Call createSession() first.');
        }
        
        return this.currentSession.lastPageId + 1;
    }

    /**
     * Update session's lastPageId
     */
    private async updateLastPageId(pageId: number): Promise<void> {
        if (!this.currentSession) return;
        
        const sessions = this.mongoClient.getSessions();
        await sessions.updateOne(
            { sessionId: this.currentSession.sessionId },
            { $set: { lastPageId: pageId, updatedAt: new Date() } }
        );
        
        this.currentSession.lastPageId = pageId;
    }

    /**
     * Create an INVOKE page (odd numbers: 1, 3, 5...)
     * Used for: User input, System errors, Cross-agent messages, Self-loops
     */
    async createInvoke(sessionId: string, who: string, content: string, rank?: number | null): Promise<Page> {
        // Load session if not current
        if (!this.currentSession || this.currentSession.sessionId !== sessionId) {
            await this.loadSession(sessionId);
        }
        
        if (!this.currentSession) {
            throw new Error('Session not found: ' + sessionId);
        }
        
        let pageId = await this.getNextPageId();
        
        // Ensure INVOKE is always ODD
        if (pageId % 2 === 0) {
            pageId += 1;
        }

        const now = new Date();
        
        const page: Page = {
            pageId,
            who,
            type: 'INVOKE',
            rank: rank ?? null,
            timeStart: now,
            timeEnd: now,           // For INVOKE: delta = 0
            sessionId: this.currentSession.sessionId,
            content
        };

        const pages = this.mongoClient.getPages();
        await pages.insertOne(page);
        await this.updateLastPageId(pageId);

        return page;
    }

    /**
     * Create a RESPONSE page (even numbers: 2, 4, 6...)
     * Used for: Agent responses
     * 
     * Returns a "draft" page that should be committed when generation is complete.
     */
    async startResponse(sessionId: string, who: string, rank?: number | null): Promise<Page> {
        // Load session if not current
        if (!this.currentSession || this.currentSession.sessionId !== sessionId) {
            await this.loadSession(sessionId);
        }
        
        if (!this.currentSession) {
            throw new Error('Session not found: ' + sessionId);
        }
        
        let pageId = await this.getNextPageId();
        
        // Ensure RESPONSE is always EVEN
        if (pageId % 2 === 1) {
            pageId += 1;
        }

        const now = new Date();
        
        const page: Page = {
            pageId,
            who,
            type: 'RESPONSE',
            rank: rank ?? null,
            timeStart: now,
            timeEnd: now,           // Will be updated on commit
            sessionId: this.currentSession.sessionId,
            content: ''             // Empty until commit
        };

        const pages = this.mongoClient.getPages();
        await pages.insertOne(page);
        await this.updateLastPageId(pageId);

        return page;
    }

    /**
     * Commit a RESPONSE page (update content and timeEnd)
     * Called when generation is complete.
     */
    async commitResponse(pageId: number, finalContent: string): Promise<Page> {
        if (!this.currentSession) {
            throw new Error('No active session');
        }
        
        const pages = this.mongoClient.getPages();
        
        const result = await pages.findOneAndUpdate(
            { sessionId: this.currentSession.sessionId, pageId },
            { 
                $set: { 
                    content: finalContent,
                    timeEnd: new Date()
                } 
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            throw new Error('Page not found: ' + pageId);
        }

        return result;
    }

    /**
     * Get all pages for a session (chronological order)
     */
    async getSessionPages(sessionId: string): Promise<PageWithDelta[]> {
        const pages = this.mongoClient.getPages();
        
        const docs = await pages
            .find({ sessionId })
            .sort({ pageId: 1 })
            .toArray();

        return docs.map(page => ({
            ...page,
            delta: page.timeEnd.getTime() - page.timeStart.getTime()
        }));
    }

    /**
     * Get the last N pages for a session
     */
    async getRecentPages(sessionId: string, limit: number = 10): Promise<PageWithDelta[]> {
        const pages = this.mongoClient.getPages();
        
        const docs = await pages
            .find({ sessionId })
            .sort({ pageId: -1 })
            .limit(limit)
            .toArray();

        return docs
            .reverse()  // Back to chronological order
            .map(page => ({
                ...page,
                delta: page.timeEnd.getTime() - page.timeStart.getTime()
            }));
    }

    /**
     * Get a specific page
     */
    async getPage(sessionId: string, pageId: number): Promise<PageWithDelta | null> {
        const pages = this.mongoClient.getPages();
        
        const page = await pages.findOne({ sessionId, pageId });
        
        if (!page) return null;

        return {
            ...page,
            delta: page.timeEnd.getTime() - page.timeStart.getTime()
        };
    }

    /**
     * Get time delta between two pages (chronoception)
     */
    async getChronoDelta(
        sessionId: string, 
        fromPageId: number, 
        toPageId: number
    ): Promise<number | null> {
        const fromPage = await this.getPage(sessionId, fromPageId);
        const toPage = await this.getPage(sessionId, toPageId);

        if (!fromPage || !toPage) return null;

        return toPage.timeStart.getTime() - fromPage.timeEnd.getTime();
    }

    /**
     * Calculate total mana spent in a session
     * (Placeholder: will be based on token counting later)
     */
    async getSessionStats(sessionId: string): Promise<{
        totalPages: number;
        invokeCount: number;
        responseCount: number;
        totalDelta: number;
    }> {
        const pages = await this.getSessionPages(sessionId);
        
        const invokeCount = pages.filter(p => p.type === 'INVOKE').length;
        const responseCount = pages.filter(p => p.type === 'RESPONSE').length;
        const totalDelta = pages.reduce((sum, p) => sum + p.delta, 0);

        return {
            totalPages: pages.length,
            invokeCount,
            responseCount,
            totalDelta
        };
    }
}
