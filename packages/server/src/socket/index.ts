import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { streamRouter } from '../services/stream-router.js';
import { config } from '../config.js';

export function createSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: config.corsOrigins,
      methods: ['GET', 'POST'],
    },
  });

  streamRouter.setSocketServer(io);

  io.on('connection', (socket) => {
    socket.on('agent:output:join', ({ agentId }) => {
      socket.join(`agent:${agentId}:output`);
    });

    socket.on('agent:output:leave', ({ agentId }) => {
      socket.leave(`agent:${agentId}:output`);
    });

    socket.on('disconnect', () => {
      // Cleanup handled by room auto-leave on disconnect
    });
  });

  return io;
}
