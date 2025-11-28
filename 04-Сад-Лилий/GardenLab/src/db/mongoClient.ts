/**
 * MongoDB Client for Garden
 * 
 * Manages connection to MongoDB for the Ledger system.
 */

import { MongoClient, Db, Collection } from 'mongodb';
import * as vscode from 'vscode';
import { Page, Session } from './types';

export class GardenMongoClient {
    private client: MongoClient | null = null;
    private db: Db | null = null;
    private outputChannel: vscode.OutputChannel;
    
    private static readonly DB_NAME = 'garden';
    private static readonly PAGES_COLLECTION = 'pages';
    private static readonly SESSIONS_COLLECTION = 'sessions';

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    /**
     * Get MongoDB connection URI from settings
     */
    private getConnectionUri(): string {
        const config = vscode.workspace.getConfiguration('garden');
        return config.get<string>('mongoUri', 'mongodb://localhost:27017');
    }

    /**
     * Connect to MongoDB
     */
    async connect(): Promise<boolean> {
        if (this.client && this.db) {
            return true;
        }

        const uri = this.getConnectionUri();
        
        try {
            this.log('Connecting to MongoDB...', uri.replace(/\/\/.*:.*@/, '//<credentials>@'));
            
            this.client = new MongoClient(uri);
            await this.client.connect();
            this.db = this.client.db(GardenMongoClient.DB_NAME);
            
            // Ensure indexes
            await this.ensureIndexes();
            
            this.log('✅ Connected to MongoDB');
            return true;
        } catch (error) {
            this.logError('❌ Failed to connect to MongoDB', error);
            this.client = null;
            this.db = null;
            return false;
        }
    }

    /**
     * Disconnect from MongoDB
     */
    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            this.log('Disconnected from MongoDB');
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.client !== null && this.db !== null;
    }

    /**
     * Get the pages collection
     */
    getPages(): Collection<Page> {
        if (!this.db) {
            throw new Error('Not connected to MongoDB. Call connect() first.');
        }
        return this.db.collection<Page>(GardenMongoClient.PAGES_COLLECTION);
    }

    /**
     * Get the sessions collection
     */
    getSessions(): Collection<Session> {
        if (!this.db) {
            throw new Error('Not connected to MongoDB. Call connect() first.');
        }
        return this.db.collection<Session>(GardenMongoClient.SESSIONS_COLLECTION);
    }

    /**
     * Get the database instance
     */
    getDb(): Db {
        if (!this.db) {
            throw new Error('Not connected to MongoDB. Call connect() first.');
        }
        return this.db;
    }

    /**
     * Ensure required indexes exist
     */
    private async ensureIndexes(): Promise<void> {
        if (!this.db) return;

        const pages = this.getPages();
        const sessions = this.getSessions();
        
        // === PAGES INDEXES ===
        
        // Unique index on pageId within session
        await pages.createIndex(
            { sessionId: 1, pageId: 1 }, 
            { unique: true }
        );
        
        // Index for chronological queries
        await pages.createIndex({ sessionId: 1, timeStart: 1 });
        
        // Index for filtering by type
        await pages.createIndex({ sessionId: 1, type: 1 });
        
        // Index for who (agent/user)
        await pages.createIndex({ who: 1 });

        // === SESSIONS INDEXES ===
        
        // Unique session ID
        await sessions.createIndex({ sessionId: 1 }, { unique: true });
        
        // Recent sessions first
        await sessions.createIndex({ updatedAt: -1 });
        
        // Filter by status
        await sessions.createIndex({ status: 1 });

        this.log('✅ Indexes ensured');
    }

    /**
     * Ping the database to check connection health
     */
    async ping(): Promise<boolean> {
        if (!this.db) return false;
        
        try {
            await this.db.command({ ping: 1 });
            return true;
        } catch {
            return false;
        }
    }

    private log(message: string, details?: unknown): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] [MONGO] ${message}`);
        if (details !== undefined) {
            this.outputChannel.appendLine(JSON.stringify(details, null, 2));
        }
    }

    private logError(message: string, error: unknown): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] [MONGO ERROR] ${message}`);
        if (error instanceof Error) {
            this.outputChannel.appendLine(error.stack || error.message);
        } else {
            this.outputChannel.appendLine(String(error));
        }
    }
}

// Re-export types
export { Page, Session, PageWithDelta, SessionWithStats } from './types';
