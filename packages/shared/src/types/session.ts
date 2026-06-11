export interface SessionSummary {
  id: string;
  agentId: string;
  agentName: string;
  status: string;
  modelUsed: string | null;
  startedAt: number;
  endedAt: number | null;
  exitCode: number | null;
}

export interface ChatMessage {
  id: string;
  agentId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
