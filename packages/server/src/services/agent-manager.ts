import { spawn, type ChildProcess } from 'child_process';
import { agentStore } from '../db/agent-store.js';
import { taskStore } from '../db/task-store.js';
import { streamRouter } from './stream-router.js';
import type { AgentConfig, AgentStatus, SpawnOptions } from '@commandcode-web-ui/shared';

interface ManagedAgent {
  id: string;
  process: ChildProcess | null;
  config: AgentConfig;
  status: AgentStatus;
  sessionId: string | null;
  startedAt: Date | null;
  exitCode: number | null;
}

const CMD_BIN = process.platform === 'win32' ? 'cmdc' : 'cmd';

export class AgentManager {
  private agents = new Map<string, ManagedAgent>();

  list(): ManagedAgent[] {
    return Array.from(this.agents.values());
  }

  get(agentId: string): ManagedAgent | undefined {
    return this.agents.get(agentId);
  }

  getStatus(agentId: string): AgentStatus {
    return this.agents.get(agentId)?.status ?? 'idle';
  }

  spawn(agentId: string, spawnOptions: SpawnOptions): ManagedAgent | null {
    const config = agentStore.get(agentId);
    if (!config) return null;

    const existing = this.agents.get(agentId);
    if (existing?.status === 'running') {
      this.kill(agentId);
    }

    const args = ['-p', spawnOptions.task, '--yolo'];
    if (spawnOptions.model) args.push('-m', spawnOptions.model);
    else if (config.model) args.push('-m', config.model);
    args.push(...config.extraArgs);

    const child = spawn(CMD_BIN, args, {
      cwd: config.projectDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
      shell: true,
    });

    const session = agentStore.createSession(agentId, spawnOptions.model ?? config.model, child.pid ?? null);

    const managed: ManagedAgent = {
      id: agentId,
      process: child,
      config,
      status: 'running',
      sessionId: session.id,
      startedAt: new Date(),
      exitCode: null,
    };

    this.agents.set(agentId, managed);
    streamRouter.emitStatus(agentId, 'running', undefined, session.id);

    child.stdout?.on('data', (data: Buffer) => {
      streamRouter.route(agentId, 'stdout', data.toString('utf-8'));
    });

    child.stderr?.on('data', (data: Buffer) => {
      streamRouter.route(agentId, 'stderr', data.toString('utf-8'));
    });

    child.on('exit', (code) => {
      managed.status = code === 0 ? 'completed' : 'failed';
      managed.exitCode = code;
      managed.process = null;

      agentStore.updateSession(session.id, {
        status: managed.status,
        endedAt: Date.now(),
        exitCode: code ?? undefined,
      });

      streamRouter.emitStatus(agentId, managed.status, code ?? undefined, session.id);
      this.processTaskCompletion(agentId, code);
    });

    child.on('error', (err) => {
      managed.status = 'failed';
      managed.process = null;
      agentStore.updateSession(session.id, { status: 'failed', endedAt: Date.now() });
      streamRouter.route(agentId, 'stderr', `[process error] ${err.message}`);
      streamRouter.emitStatus(agentId, 'failed');
    });

    return managed;
  }

  async kill(agentId: string): Promise<void> {
    const managed = this.agents.get(agentId);
    if (!managed || !managed.process) return;

    return new Promise((resolve) => {
      const proc = managed.process!;
      proc.on('exit', () => resolve());
      proc.kill('SIGTERM');
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill('SIGKILL');
        }
        resolve();
      }, 5000);
    });
  }

  async autoAssignTasks(): Promise<void> {
    const queued = taskStore.getQueued();
    const idleAgents = Array.from(this.agents.values()).filter(a => a.status !== 'running');

    for (const task of queued) {
      if (idleAgents.length === 0) break;
      const agent = idleAgents.shift()!;
      taskStore.assign(task.id, agent.id);
      const managed = this.spawn(agent.id, {
        task: task.description,
        model: task.modelOverride ?? undefined,
      });
      if (managed?.sessionId) {
        taskStore.start(task.id, managed.sessionId);
      }
    }
  }

  private processTaskCompletion(agentId: string, exitCode: number | null): void {
    const tasks = taskStore.getAgentTasks(agentId).filter(t => t.status === 'running');
    for (const task of tasks) {
      if (exitCode === 0) {
        taskStore.complete(task.id, 'Completed successfully (exit code 0)');
      } else {
        if (task.retryCount < task.maxRetries) {
          const t = taskStore.get(task.id);
          if (t) {
            t.retryCount++;
            taskStore.assign(task.id, agentId);
          }
        } else {
          taskStore.fail(task.id, `Failed with exit code ${exitCode}`);
        }
      }
      streamRouter.emitTaskUpdated(taskStore.get(task.id));
    }
  }
}

export const agentManager = new AgentManager();
