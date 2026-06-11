import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../plugins/api';
import type { Agent, AgentStatus } from '@commandcode-web-ui/shared';

export const useAgentsStore = defineStore('agents', () => {
  const agents = ref<Agent[]>([]);
  const selectedId = ref<string | null>(null);
  const loading = ref(false);

  const runningAgents = computed(() => agents.value.filter(a => a.currentStatus === 'running'));
  const idleAgents = computed(() => agents.value.filter(a => a.currentStatus === 'idle'));
  const selectedAgent = computed(() => agents.value.find(a => a.id === selectedId.value) ?? null);

  async function fetchAgents() {
    loading.value = true;
    try {
      const res: any = await api.get('/agents');
      agents.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  async function createAgent(data: { name: string; projectDir: string; model?: string; color?: string }) {
    const res: any = await api.post('/agents', data);
    agents.value.unshift(res.data);
    return res.data;
  }

  async function updateAgent(id: string, data: Partial<Agent>) {
    const res: any = await api.patch(`/agents/${id}`, data);
    const idx = agents.value.findIndex(a => a.id === id);
    if (idx >= 0) agents.value[idx] = res.data;
    return res.data;
  }

  async function deleteAgent(id: string) {
    await api.delete(`/agents/${id}`);
    agents.value = agents.value.filter(a => a.id !== id);
    if (selectedId.value === id) selectedId.value = null;
  }

  async function spawnAgent(id: string, task: string, model?: string) {
    const res: any = await api.post(`/agents/${id}/spawn`, { task, model });
    return res.data;
  }

  async function killAgent(id: string) {
    await api.post(`/agents/${id}/kill`);
    const agent = agents.value.find(a => a.id === id);
    if (agent) agent.currentStatus = 'stopped';
  }

  function updateAgentStatus(agentId: string, status: AgentStatus, exitCode?: number) {
    const agent = agents.value.find(a => a.id === agentId);
    if (agent) {
      agent.currentStatus = status;
    }
  }

  return {
    agents, selectedId, loading,
    runningAgents, idleAgents, selectedAgent,
    fetchAgents, createAgent, updateAgent, deleteAgent,
    spawnAgent, killAgent, updateAgentStatus,
  };
});
