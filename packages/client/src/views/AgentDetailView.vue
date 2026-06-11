<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { NH2, NCard, NButton, NSpace, NInput, NTag, NText, NSpin } from 'naive-ui';
import { useRoute, useRouter } from 'vue-router';
import { useAgentsStore } from '../stores/agents';
import { useAgentStream } from '../composables/useAgentStream';
import TerminalView from '../components/agent/TerminalView.vue';

const route = useRoute();
const router = useRouter();
const agentsStore = useAgentsStore();

const agentId = computed(() => route.params.id as string);
const taskInput = ref('');
const sending = ref(false);

const { output } = useAgentStream(() => agentId.value);

onMounted(() => {
  agentsStore.fetchAgents();
});

const agent = computed(() => agentsStore.agents.find(a => a.id === agentId.value));

async function sendTask() {
  if (!taskInput.value.trim() || !agentId.value) return;
  sending.value = true;
  try {
    await agentsStore.spawnAgent(agentId.value, taskInput.value);
    taskInput.value = '';
  } finally {
    sending.value = false;
  }
}

async function killAgent() {
  if (agentId.value) await agentsStore.killAgent(agentId.value);
}

const statusColor = computed(() => {
  switch (agent.value?.currentStatus) {
    case 'running': return 'success';
    case 'failed': return 'error';
    case 'completed': return 'info';
    default: return 'default';
  }
});
</script>

<template>
  <div v-if="agent" style="display: flex; flex-direction: column; height: 100%; padding: 24px">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <NH2 prefix="bar" style="margin: 0">
        <NText>{{ agent.name }}</NText>
      </NH2>
      <NSpace>
        <NTag :type="statusColor" size="small">{{ agent.currentStatus }}</NTag>
        <NButton size="small" @click="router.push(`/chat/${agentId}`)">Chat</NButton>
        <NButton size="small" @click="router.push(`/manage/${agentId}`)">Manage</NButton>
        <NButton size="small" @click="router.push('/agents')">Back</NButton>
        <NButton size="small" type="error" @click="killAgent" :disabled="agent.currentStatus !== 'running'">
          Kill
        </NButton>
      </NSpace>
    </div>

    <NCard size="small" style="margin-bottom: 12px">
      <div style="display: flex; gap: 24px; font-size: 13px">
        <div>
          <NText depth="3">Project:</NText>
          <NText style="margin-left: 6px">{{ agent.projectDir }}</NText>
        </div>
        <div v-if="agent.model">
          <NText depth="3">Model:</NText>
          <NText style="margin-left: 6px">{{ agent.model }}</NText>
        </div>
      </div>
    </NCard>

    <div style="flex: 1; min-height: 0; margin-bottom: 12px">
      <TerminalView :chunks="output" />
    </div>

    <div style="display: flex; gap: 8px">
      <NInput
        v-model:value="taskInput"
        placeholder="Send a task to this agent..."
        @keyup.enter="sendTask"
        :disabled="sending"
      />
      <NButton type="primary" @click="sendTask" :loading="sending" :disabled="!taskInput.trim()">
        Send
      </NButton>
    </div>
  </div>
  <div v-else style="display: flex; align-items: center; justify-content: center; height: 100%">
    <NSpin v-if="agentsStore.loading" />
    <NText v-else depth="3">Agent not found</NText>
  </div>
</template>
