<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { StreamChunk } from '@commandcode-web-ui/shared';

const props = defineProps<{ chunks: StreamChunk[] }>();
const container = ref<HTMLDivElement>();
const autoScroll = ref(true);

function renderChunks(chunks: StreamChunk[]): string {
  return chunks
    .map(c => {
      const text = c.content;
      if (c.type === 'error') return `<span style="color:#ef4444">${escapeHtml(text)}</span>`;
      return escapeHtml(text);
    })
    .join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

function scrollToBottom() {
  if (autoScroll.value && container.value) {
    container.value.scrollTop = container.value.scrollHeight;
  }
}

function handleScroll() {
  if (!container.value) return;
  const { scrollTop, scrollHeight, clientHeight } = container.value;
  autoScroll.value = scrollHeight - scrollTop - clientHeight < 50;
}

watch(() => props.chunks.length, () => nextTick(scrollToBottom));

onMounted(scrollToBottom);
</script>

<template>
  <div
    ref="container"
    @scroll="handleScroll"
    style="
      height: 100%;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 12px 16px;
      overflow-y: auto;
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 13px;
      line-height: 1.6;
      color: #c9d1d9;
      white-space: pre-wrap;
      word-break: break-all;
    "
  >
    <div v-if="chunks.length === 0" style="color: #484f58; font-style: italic">
      Waiting for agent output...
    </div>
    <div v-else v-html="renderChunks(chunks)" />
  </div>
</template>
