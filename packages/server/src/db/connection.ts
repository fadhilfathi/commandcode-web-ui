import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { config } from '../config.js';
import type { AgentConfig, AgentSession, Task, UsageRecord, ChatMessage } from '@commandcode-web-ui/shared';

export interface DbSchema {
  agents: AgentConfig[];
  agentSessions: AgentSession[];
  tasks: Task[];
  chatMessages: ChatMessage[];
  outputChunks: Array<{
    id: number;
    agentId: string;
    sessionId: string | null;
    taskId: string | null;
    sequence: number;
    source: string;
    chunkType: string;
    content: string;
    metadata: string | null;
    createdAt: number;
  }>;
  usageRecords: UsageRecord[];
}

const defaultData: DbSchema = {
  agents: [],
  agentSessions: [],
  tasks: [],
  chatMessages: [],
  outputChunks: [],
  usageRecords: [],
};

let db: Low<DbSchema>;

export async function initDb(): Promise<void> {
  const adapter = new JSONFile<DbSchema>(join(config.dataDir, 'dashboard.json'));
  db = new Low<DbSchema>(adapter, defaultData);
  await db.read();
  if (!db.data) {
    db.data = defaultData;
    await db.write();
  }
}

export function getDb(): Low<DbSchema> {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}
