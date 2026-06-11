import type { StreamChunk } from './stream.js';

export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed' | 'stopped';

export interface AgentConfig {
  id: string;
  name: string;
  projectDir: string;
  model: string | null;
  color: string;
  extraArgs: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AgentSession {
  id: string;
  agentId: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  pid: number | null;
  modelUsed: string | null;
  startedAt: number;
  endedAt: number | null;
  exitCode: number | null;
}

export interface Agent extends AgentConfig {
  currentStatus: AgentStatus;
  currentSession: AgentSession | null;
  taskCount: number;
}

export interface ManagedAgent {
  id: string;
  process: import('child_process').ChildProcess | null;
  config: AgentConfig;
  status: AgentStatus;
  sessionId: string | null;
  outputBuffer: StreamChunk[];
  startedAt: Date | null;
  exitCode: number | null;
}

export interface SpawnOptions {
  task: string;
  model?: string;
  yolo?: boolean;
}
