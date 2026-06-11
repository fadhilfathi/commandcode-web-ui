export type TaskStatus = 'queued' | 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: number;
  agentId: string | null;
  sessionId: string | null;
  projectDir: string | null;
  modelOverride: string | null;
  dependsOn: string[];
  result: string | null;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  priority?: number;
  agentId?: string;
  projectDir?: string;
  modelOverride?: string;
  dependsOn?: string[];
  maxRetries?: number;
}
