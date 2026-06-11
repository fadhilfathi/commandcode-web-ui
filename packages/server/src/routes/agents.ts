import Router from '@koa/router';
import { agentStore } from '../db/agent-store.js';
import { agentManager } from '../services/agent-manager.js';
import { streamRouter } from '../services/stream-router.js';

export const agentRoutes = new Router({ prefix: '/api/agents' });

agentRoutes.get('/', async (ctx) => {
  const configs = agentStore.list();
  const agents = configs.map(config => ({
    ...config,
    currentStatus: agentManager.getStatus(config.id),
    currentSession: agentStore.getLatestSession(config.id),
  }));
  ctx.body = { success: true, data: agents };
});

agentRoutes.post('/', async (ctx) => {
  const { name, projectDir, model, color, extraArgs } = ctx.request.body as any;
  if (!name || !projectDir) {
    ctx.status = 400;
    ctx.body = { success: false, error: 'name and projectDir are required' };
    return;
  }
  const agent = agentStore.create({ name, projectDir, model: model ?? null, color: color ?? '#6366f1', extraArgs: extraArgs ?? [] });
  ctx.status = 201;
  ctx.body = { success: true, data: agent };
});

agentRoutes.get('/:id', async (ctx) => {
  const agent = agentStore.get(ctx.params.id);
  if (!agent) {
    ctx.status = 404;
    ctx.body = { success: false, error: 'Agent not found' };
    return;
  }
  const managed = agentManager.get(agent.id);
  ctx.body = {
    success: true,
    data: {
      ...agent,
      currentStatus: managed?.status ?? 'idle',
      currentSession: agentStore.getLatestSession(agent.id),
    },
  };
});

agentRoutes.patch('/:id', async (ctx) => {
  const updated = agentStore.update(ctx.params.id, ctx.request.body as any);
  if (!updated) {
    ctx.status = 404;
    ctx.body = { success: false, error: 'Agent not found' };
    return;
  }
  ctx.body = { success: true, data: updated };
});

agentRoutes.delete('/:id', async (ctx) => {
  await agentManager.kill(ctx.params.id);
  const deleted = agentStore.delete(ctx.params.id);
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { success: false, error: 'Agent not found' };
    return;
  }
  ctx.body = { success: true };
});

agentRoutes.post('/:id/spawn', async (ctx) => {
  const { task, model, yolo } = ctx.request.body as any;
  if (!task) {
    ctx.status = 400;
    ctx.body = { success: false, error: 'task is required' };
    return;
  }
  const managed = agentManager.spawn(ctx.params.id, { task, model, yolo: yolo ?? true });
  if (!managed) {
    ctx.status = 404;
    ctx.body = { success: false, error: 'Agent not found' };
    return;
  }
  ctx.body = { success: true, data: { sessionId: managed.sessionId, status: managed.status } };
});

agentRoutes.post('/:id/kill', async (ctx) => {
  await agentManager.kill(ctx.params.id);
  ctx.body = { success: true };
});

agentRoutes.get('/:id/output', async (ctx) => {
  const since = ctx.query.since ? parseInt(ctx.query.since as string) : undefined;
  const chunks = streamRouter.getReplay(ctx.params.id, since);
  ctx.body = { success: true, data: chunks };
});
