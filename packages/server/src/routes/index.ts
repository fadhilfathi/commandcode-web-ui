import Router from '@koa/router';
import { agentRoutes } from './agents.js';
import { taskRoutes } from './tasks.js';
import { healthRoutes } from './health.js';
import { chatRoutes } from './chat.js';

export function mountRoutes(app: Router) {
  app.use(agentRoutes.routes());
  app.use(agentRoutes.allowedMethods());
  app.use(taskRoutes.routes());
  app.use(taskRoutes.allowedMethods());
  app.use(chatRoutes.routes());
  app.use(chatRoutes.allowedMethods());
  app.use(healthRoutes.routes());
  app.use(healthRoutes.allowedMethods());
}
