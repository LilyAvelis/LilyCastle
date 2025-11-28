/**
 * Garden Database Types
 * 
 * Core types for the Chrono-Page Protocol.
 */

import { ObjectId } from 'mongodb';

// === PAGE (The fundamental unit) ===
export interface Page {
    _id?: ObjectId;
    
    // === IDENTITY ===
    pageId: number;                    // Auto-increment (1, 2, 3...)
    who: string;                       // '@Claude' | '@Lily' | '@System' | '@GPT-4o'
    type: 'INVOKE' | 'RESPONSE';       // INVOKE = odd, RESPONSE = even
    rank?: number | null;              // Agent rank (Arch-Mage = 5, etc.)
    
    // === CHRONOCEPTION ===
    timeStart: Date;                   // When started
    timeEnd: Date;                     // When finished (for user: timeStart === timeEnd)
    
    // === SESSION ===
    sessionId: string;                 // UUID (dies with mana)
    
    // === CONTENT ===
    content: string;                   // Markdown (always)
}

// === SESSION (Chat container) ===
export interface Session {
    _id?: ObjectId;
    
    sessionId: string;                 // UUID
    title: string;                     // "Обсуждение кнопки" | "Bugfix #42"
    
    // === PARTICIPANTS ===
    model: string;                     // 'anthropic/claude-sonnet-4'
    who: string;                       // '@Claude' — primary agent
    
    // === TIMELINE ===
    createdAt: Date;
    updatedAt: Date;
    lastPageId: number;                // Last page in this session
    
    // === STATUS ===
    status: 'active' | 'closed';
}

// === PAGE WITH COMPUTED DELTA ===
export interface PageWithDelta extends Page {
    delta: number;                     // timeEnd - timeStart in milliseconds
}

// === SESSION WITH STATS ===
export interface SessionWithStats extends Session {
    pageCount: number;
    invokeCount: number;
    responseCount: number;
}
