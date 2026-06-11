import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import Router from '@koa/router';
import { createServer } from 'http';
import { config } from './config.js';
import { initDb } from './db/connection.js';
import { createSocketServer } from './socket/index.js';
import { mountRoutes } from './routes/index.js';

async function main() {
  await initDb();

  const app = new Koa();
  const router = new Router();

  app.use(cors({ origin: (ctx) => config.corsOrigins.includes(ctx.origin) ? ctx.origin : config.corsOrigins[0] ?? '' }));
  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());

  mountRoutes(router);

  const httpServer = createServer(app.callback());
  createSocketServer(httpServer);

  httpServer.listen(config.port, config.host, () => {
    console.log(`[commandcode-web-ui] Server running at http://${config.host}:${config.port}`);
    console.log(`[commandcode-web-ui] Data dir: ${config.dataDir}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
