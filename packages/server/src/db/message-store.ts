import { getDb } from './connection.js';
import type { ChatMessage } from '@commandcode-web-ui/shared';
import { v4 as uuid } from 'uuid';

export const messageStore = {
  listByAgent(agentId: string, limit = 100): ChatMessage[] {
    return getDb().data!.chatMessages
      .filter(m => m.agentId === agentId)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);
  },

  create(agentId: string, role: 'user' | 'assistant', content: string): ChatMessage {
    const msg: ChatMessage = {
      id: uuid(),
      agentId,
      role,
      content,
      timestamp: Date.now(),
    };
    getDb().data!.chatMessages.push(msg);
    getDb().write();
    return msg;
  },

  deleteByAgent(agentId: string): void {
    getDb().data!.chatMessages = getDb().data!.chatMessages.filter(m => m.agentId !== agentId);
    getDb().write();
  },
};
