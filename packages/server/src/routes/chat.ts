import Router from '@koa/router';
import { messageStore } from '../db/message-store.js';
import { agentStore } from '../db/agent-store.js';
import { agentManager } from '../services/agent-manager.js';

export const chatRoutes = new Router({ prefix: '/api/chat' });

chatRoutes.get('/:agentId/messages', async (ctx) => {
  const agent = agentStore.get(ctx.params.agentId);
  if (!agent) {
    ctx.status = 404;
    ctx.body = { success: false, error: 'Agent not found' };
    return;
  }
  const limit = ctx.query.limit ? parseInt(ctx.query.limit as string) : 100;
  const messages = messageStore.listByAgent(ctx.params.agentId, limit);
  ctx.body = { success: true, data: messages };
});

chatRoutes.post('/:agentId/messages', async (ctx) => {
  const agent = agentStore.get(ctx.params.agentId);
  if (!agent) {
    ctx.status = 404;
    ctx.body = { success: false, error: 'Agent not found' };
    return;
  }
  const { content } = ctx.request.body as any;
  if (!content || typeof content !== 'string' || !content.trim()) {
    ctx.status = 400;
    ctx.body = { success: false, error: 'content is required' };
    return;
  }

  const userMsg = messageStore.create(ctx.params.agentId, 'user', content.trim());

  const managed = agentManager.spawn(ctx.params.agentId, {
    task: content.trim(),
    yolo: true,
  });

  if (managed) {
    const assistantMsg = messageStore.create(
      ctx.params.agentId,
      'assistant',
      `[Agent ${agent.name}] Task sent. Monitoring output...`
    );
    ctx.body = { success: true, data: { userMessage: userMsg, assistantMessage: assistantMsg } };
  } else {
    ctx.body = { success: true, data: { userMessage: userMsg, assistantMessage: null } };
  }
});

chatRoutes.delete('/:agentId/messages', async (ctx) => {
  messageStore.deleteByAgent(ctx.params.agentId);
  ctx.body = { success: true };
});
