import Router from '@koa/router';
import { agentManager } from '../services/agent-manager.js';
import { getDb } from '../db/connection.js';

export const healthRoutes = new Router({ prefix: '/api' });

healthRoutes.get('/health', async (ctx) => {
  const agents = agentManager.list();
  const running = agents.filter(a => a.status === 'running').length;

  ctx.body = {
    success: true,
    data: {
      status: 'ok',
      agents: {
        total: agents.length,
        running,
      },
      db: 'connected',
      uptime: process.uptime(),
    },
  };
});
