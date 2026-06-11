import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../plugins/api';
import type { ChatMessage } from '@commandcode-web-ui/shared';

export const useChatStore = defineStore('chat', () => {
  const messagesByAgent = ref<Map<string, ChatMessage[]>>(new Map());
  const loading = ref(false);

  function getMessages(agentId: string): ChatMessage[] {
    return messagesByAgent.value.get(agentId) ?? [];
  }

  async function fetchMessages(agentId: string) {
    loading.value = true;
    try {
      const res: any = await api.get(`/chat/${agentId}/messages`);
      messagesByAgent.value.set(agentId, res.data);
    } finally {
      loading.value = false;
    }
  }

  async function sendMessage(agentId: string, content: string) {
    const res: any = await api.post(`/chat/${agentId}/messages`, { content });
    const existing = messagesByAgent.value.get(agentId) ?? [];
    existing.push(res.data.userMessage);
    if (res.data.assistantMessage) {
      existing.push(res.data.assistantMessage);
    }
    messagesByAgent.value.set(agentId, [...existing]);
    return res.data;
  }

  async function clearMessages(agentId: string) {
    await api.delete(`/chat/${agentId}/messages`);
    messagesByAgent.value.set(agentId, []);
  }

  function appendStreamChunk(agentId: string, content: string) {
    const msgs = messagesByAgent.value.get(agentId) ?? [];
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content.startsWith('[Agent')) {
      lastMsg.content = content;
    } else {
      msgs.push({
        id: `stream-${Date.now()}`,
        agentId,
        role: 'assistant',
        content,
        timestamp: Date.now(),
      });
    }
    messagesByAgent.value.set(agentId, [...msgs]);
  }

  return { messagesByAgent, loading, getMessages, fetchMessages, sendMessage, clearMessages, appendStreamChunk };
});
