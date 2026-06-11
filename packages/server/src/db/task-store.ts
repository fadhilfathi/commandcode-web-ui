import { getDb } from './connection.js';
import type { Task, CreateTaskInput } from '@commandcode-web-ui/shared';
import { v4 as uuid } from 'uuid';

export const taskStore = {
  list(filter?: { status?: string; agentId?: string }): Task[] {
    let tasks = getDb().data!.tasks;
    if (filter?.status) tasks = tasks.filter(t => t.status === filter.status);
    if (filter?.agentId) tasks = tasks.filter(t => t.agentId === filter.agentId);
    return tasks.sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);
  },

  get(id: string): Task | null {
    return getDb().data!.tasks.find(t => t.id === id) ?? null;
  },

  create(input: CreateTaskInput): Task {
    const task: Task = {
      id: uuid(),
      title: input.title,
      description: input.description,
      status: input.agentId ? 'assigned' : 'queued',
      priority: input.priority ?? 0,
      agentId: input.agentId ?? null,
      sessionId: null,
      projectDir: input.projectDir ?? null,
      modelOverride: input.modelOverride ?? null,
      dependsOn: input.dependsOn ?? [],
      result: null,
      retryCount: 0,
      maxRetries: input.maxRetries ?? 2,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
    };
    getDb().data!.tasks.push(task);
    getDb().write();
    return task;
  },

  assign(taskId: string, agentId: string): Task | null {
    const task = this.get(taskId);
    if (!task || task.status !== 'queued') return null;
    task.agentId = agentId;
    task.status = 'assigned';
    getDb().write();
    return task;
  },

  start(taskId: string, sessionId: string): void {
    const task = this.get(taskId);
    if (!task) return;
    task.status = 'running';
    task.sessionId = sessionId;
    task.startedAt = Date.now();
    getDb().write();
  },

  complete(taskId: string, result: string | null): void {
    const task = this.get(taskId);
    if (!task) return;
    task.status = 'completed';
    task.result = result;
    task.completedAt = Date.now();
    getDb().write();
  },

  fail(taskId: string, result: string | null): void {
    const task = this.get(taskId);
    if (!task) return;
    task.status = 'failed';
    task.result = result;
    task.completedAt = Date.now();
    getDb().write();
  },

  cancel(taskId: string): void {
    const task = this.get(taskId);
    if (!task) return;
    task.status = 'cancelled';
    getDb().write();
  },

  getQueued(): Task[] {
    return this.list({ status: 'queued' });
  },

  getAgentTasks(agentId: string): Task[] {
    return this.list({ agentId });
  },
};
