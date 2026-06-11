export type ChunkType = 'text' | 'tool_call' | 'tool_result' | 'thinking' | 'error' | 'status' | 'usage';

export interface StreamChunk {
  agentId: string;
  sequence: number;
  timestamp: number;
  source: 'stdout' | 'stderr';
  type: ChunkType;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface StreamPayload {
  agentId: string;
  chunk: StreamChunk;
}

export interface AgentStatusPayload {
  agentId: string;
  status: string;
  exitCode?: number;
  sessionId?: string;
}

export interface DashboardMetrics {
  totalAgents: number;
  runningAgents: number;
  queuedTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  todayUsage: UsageSummary;
}

export interface UsageSummary {
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCostCents: number;
  requestCount: number;
}

export interface UsageRecord {
  id: number;
  agentId: string;
  sessionId: string | null;
  taskId: string | null;
  model: string | null;
  inputTokens: number;
  outputTokens: number;
  estimatedCostCents: number;
  createdAt: number;
}
