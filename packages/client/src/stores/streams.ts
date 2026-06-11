import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { StreamChunk } from '@commandcode-web-ui/shared';

const MAX_BUFFER = 5000;

export const useStreamsStore = defineStore('streams', () => {
  const buffers = ref<Map<string, StreamChunk[]>>(new Map());

  function appendChunk(agentId: string, chunk: StreamChunk) {
    const buf = buffers.value.get(agentId) ?? [];
    buf.push(chunk);
    if (buf.length > MAX_BUFFER) {
      buf.splice(0, buf.length - MAX_BUFFER);
    }
    buffers.value.set(agentId, buf);
  }

  function getBuffer(agentId: string): StreamChunk[] {
    return buffers.value.get(agentId) ?? [];
  }

  function clearBuffer(agentId: string) {
    buffers.value.delete(agentId);
  }

  return { buffers, appendChunk, getBuffer, clearBuffer };
});
