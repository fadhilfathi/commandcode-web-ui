<script setup lang="ts">
import { NCard, NTag, NText, NButton, NSpace } from 'naive-ui';
import { useRouter } from 'vue-router';
import type { Agent } from '@commandcode-web-ui/shared';

const props = defineProps<{ agent: Agent }>();
const router = useRouter();

const statusType = (() => {
  switch (props.agent.currentStatus) {
    case 'running': return 'success';
    case 'failed': return 'error';
    case 'completed': return 'info';
    default: return 'default';
  }
})();
</script>

<template>
  <NCard
    size="small"
    :style="{ borderLeft: `3px solid ${agent.color}` }"
    @click="router.push(`/agents/${agent.id}`)"
    style="cursor: pointer"
  >
    <div style="display: flex; justify-content: space-between; align-items: start">
      <div>
        <div style="font-weight: 600; margin-bottom: 4px">{{ agent.name }}</div>
        <NText depth="3" style="font-size: 12px">{{ agent.projectDir }}</NText>
      </div>
      <NTag :type="statusType" size="small">{{ agent.currentStatus }}</NTag>
    </div>
    <div v-if="agent.model" style="margin-top: 8px">
      <NText depth="3" style="font-size: 11px">Model: {{ agent.model }}</NText>
    </div>
    <div style="display: flex; gap: 8px; margin-top: 10px">
      <NButton size="tiny" @click.stop="router.push(`/chat/${agent.id}`)">Chat</NButton>
      <NButton size="tiny" @click.stop="router.push(`/manage/${agent.id}`)">Manage</NButton>
    </div>
  </NCard>
</template>
