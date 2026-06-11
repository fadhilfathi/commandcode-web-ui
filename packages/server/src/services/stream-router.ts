import type { Server as SocketServer } from 'socket.io';
import type { StreamChunk } from '@commandcode-web-ui/shared';
import { getDb } from '../db/connection.js';

const MAX_BUFFER_SIZE = 10000;

interface AgentBuffer {
  chunks: StreamChunk[];
  sequence: number;
}

export class StreamRouter {
  private buffers = new Map<string, AgentBuffer>();
  private io: SocketServer | null = null;

  setSocketServer(io: SocketServer): void {
    this.io = io;
  }

  route(agentId: string, source: 'stdout' | 'stderr', data: string): StreamChunk {
    const buffer = this.getBuffer(agentId);
    const chunk: StreamChunk = {
      agentId,
      sequence: ++buffer.sequence,
      timestamp: Date.now(),
      source,
      type: source === 'stderr' ? 'error' : 'text',
      content: data,
    };

    buffer.chunks.push(chunk);
    if (buffer.chunks.length > MAX_BUFFER_SIZE) {
      buffer.chunks.splice(0, buffer.chunks.length - MAX_BUFFER_SIZE);
    }

    this.persistChunk(chunk);
    this.io?.to(`agent:${agentId}:output`).emit('agent:output', { agentId, chunk });

    return chunk;
  }

  routeStructured(chunk: StreamChunk): void {
    const buffer = this.getBuffer(chunk.agentId);
    chunk.sequence = ++buffer.sequence;
    buffer.chunks.push(chunk);
    if (buffer.chunks.length > MAX_BUFFER_SIZE) {
      buffer.chunks.splice(0, buffer.chunks.length - MAX_BUFFER_SIZE);
    }

    this.persistChunk(chunk);
    this.io?.to(`agent:${chunk.agentId}:output`).emit('agent:output', { agentId: chunk.agentId, chunk });
  }

  emitStatus(agentId: string, status: string, exitCode?: number, sessionId?: string): void {
    this.io?.emit('agent:status', { agentId, status, exitCode, sessionId });
  }

  emitTaskUpdated(task: any): void {
    this.io?.emit('task:updated', { task });
  }

  emitDashboardMetrics(metrics: any): void {
    this.io?.emit('dashboard:metrics', metrics);
  }

  getReplay(agentId: string, since?: number): StreamChunk[] {
    const buffer = this.buffers.get(agentId);
    if (!buffer) return [];
    if (!since) return [...buffer.chunks];
    return buffer.chunks.filter(c => c.timestamp >= since);
  }

  clearBuffer(agentId: string): void {
    this.buffers.delete(agentId);
  }

  private getBuffer(agentId: string): AgentBuffer {
    let buffer = this.buffers.get(agentId);
    if (!buffer) {
      buffer = { chunks: [], sequence: 0 };
      this.buffers.set(agentId, buffer);
    }
    return buffer;
  }

  private persistChunk(chunk: StreamChunk): void {
    try {
      const db = getDb();
      db.data!.outputChunks.push({
        id: db.data!.outputChunks.length + 1,
        agentId: chunk.agentId,
        sessionId: null,
        taskId: null,
        sequence: chunk.sequence,
        source: chunk.source,
        chunkType: chunk.type,
        content: chunk.content,
        metadata: chunk.metadata ? JSON.stringify(chunk.metadata) : null,
        createdAt: chunk.timestamp,
      });
      db.write();
    } catch {
      // Best effort persistence — don't crash the stream on DB errors
    }
  }
}

export const streamRouter = new StreamRouter();
