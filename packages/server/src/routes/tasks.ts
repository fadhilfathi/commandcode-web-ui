import Router from '@koa/router';
import { taskStore } from '../db/task-store.js';
import { agentManager } from '../services/agent-manager.js';
import { streamRouter } from '../services/stream-router.js';

export const taskRoutes = new Router({ prefix: '/api/tasks' });

taskRoutes.get('/', async (ctx) => {
  const filter: any = {};
  if (ctx.query.status) filter.status = ctx.query.status as string;
  if (ctx.query.agentId) filter.agentId = ctx.query.agentId as string;
  ctx.body = { success: true, data: taskStore.list(filter) };
});

taskRoutes.post('/', async (ctx) => {
  const input = ctx.request.body as any;
  if (!input.title || !input.description) {
    ctx.status = 400;
    ctx.body = { success: false, error: 'title and description are required' };
    return;
  }
  const task = taskStore.create(input);

  if (task.agentId) {
    const managed = agentManager.spawn(task.agentId, {
      task: task.description,
      model: task.modelOverride ?? undefined,
    });
    if (managed?.sessionId) {
      taskStore.start(task.id, managed.sessionId);
    }
  }

  ctx.status = 201;
  ctx.body = { success: true, data: task };
});

taskRoutes.post('/:id/assign', async (ctx) => {
  const { agentId } = ctx.request.body as any;
  if (!agentId) {
    ctx.status = 400;
    ctx.body = { success: false, error: 'agentId is required' };
    return;
  }
  const task = taskStore.assign(ctx.params.id, agentId);
  if (!task) {
    ctx.status = 404;
    ctx.body = { success: false, error: 'Task not found or not queued' };
    return;
  }
  ctx.body = { success: true, data: task };
});

taskRoutes.post('/:id/cancel', async (ctx) => {
  taskStore.cancel(ctx.params.id);
  ctx.body = { success: true };
});

taskRoutes.post('/:id/retry', async (ctx) => {
  const task = taskStore.get(ctx.params.id);
  if (!task) {
    ctx.status = 404;
    ctx.body = { success: false, error: 'Task not found' };
    return;
  }
  taskStore.assign(ctx.params.id, task.agentId!);
  ctx.body = { success: true, data: taskStore.get(ctx.params.id) };
});

taskRoutes.get('/:id', async (ctx) => {
  const task = taskStore.get(ctx.params.id);
  if (!task) {
    ctx.status = 404;
    ctx.body = { success: false, error: 'Task not found' };
    return;
  }
  ctx.body = { success: true, data: task };
});
