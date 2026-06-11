import { getDb } from './connection.js';
import type { AgentConfig, AgentSession } from '@commandcode-web-ui/shared';
import { v4 as uuid } from 'uuid';

export const agentStore = {
  list(): AgentConfig[] {
    return getDb().data!.agents;
  },

  get(id: string): AgentConfig | null {
    return getDb().data!.agents.find(a => a.id === id) ?? null;
  },

  create(data: Omit<AgentConfig, 'id' | 'createdAt' | 'updatedAt'>): AgentConfig {
    const now = Date.now();
    const agent: AgentConfig = {
      id: uuid(),
      name: data.name,
      projectDir: data.projectDir,
      model: data.model,
      color: data.color,
      extraArgs: data.extraArgs,
      createdAt: now,
      updatedAt: now,
    };
    getDb().data!.agents.push(agent);
    getDb().write();
    return agent;
  },

  update(id: string, data: Partial<Omit<AgentConfig, 'id' | 'createdAt' | 'updatedAt'>>): AgentConfig | null {
    const agent = this.get(id);
    if (!agent) return null;
    Object.assign(agent, data, { updatedAt: Date.now() });
    getDb().write();
    return agent;
  },

  delete(id: string): boolean {
    const data = getDb().data!;
    const idx = data.agents.findIndex(a => a.id === id);
    if (idx < 0) return false;
    data.agents.splice(idx, 1);
    data.agentSessions = data.agentSessions.filter(s => s.agentId !== id);
    getDb().write();
    return true;
  },

  createSession(agentId: string, modelUsed: string | null, pid: number | null): AgentSession {
    const session: AgentSession = {
      id: uuid(),
      agentId,
      status: 'running',
      pid,
      modelUsed,
      startedAt: Date.now(),
      endedAt: null,
      exitCode: null,
    };
    getDb().data!.agentSessions.push(session);
    getDb().write();
    return session;
  },

  updateSession(id: string, data: { status?: string; endedAt?: number; exitCode?: number }): void {
    const session = getDb().data!.agentSessions.find(s => s.id === id);
    if (!session) return;
    if (data.status !== undefined) session.status = data.status as any;
    if (data.endedAt !== undefined) session.endedAt = data.endedAt;
    if (data.exitCode !== undefined) session.exitCode = data.exitCode;
    getDb().write();
  },

  getSession(id: string): AgentSession | null {
    return getDb().data!.agentSessions.find(s => s.id === id) ?? null;
  },

  getLatestSession(agentId: string): AgentSession | null {
    const sessions = getDb().data!.agentSessions
      .filter(s => s.agentId === agentId)
      .sort((a, b) => b.startedAt - a.startedAt);
    return sessions[0] ?? null;
  },

  getAgentSessions(agentId: string, limit = 50): AgentSession[] {
    return getDb().data!.agentSessions
      .filter(s => s.agentId === agentId)
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, limit);
  },
};
