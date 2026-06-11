<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NButton, NCard, NDataTable, NSpace, NH2, NModal, NForm, NFormItem, NInput, NText } from 'naive-ui';
import { useAgentsStore } from '../stores/agents';
import type { Agent } from '@commandcode-web-ui/shared';
import { useRouter } from 'vue-router';

const agentsStore = useAgentsStore();
const router = useRouter();
const showModal = ref(false);
const form = ref({ name: '', projectDir: '', model: '' });

onMounted(() => agentsStore.fetchAgents());

async function createAgent() {
  if (!form.value.name || !form.value.projectDir) return;
  await agentsStore.createAgent({
    name: form.value.name,
    projectDir: form.value.projectDir,
    model: form.value.model || undefined,
  });
  showModal.value = false;
  form.value = { name: '', projectDir: '', model: '' };
}

const columns = [
  { title: 'Name', key: 'name' },
  { title: 'Project', key: 'projectDir', ellipsis: { tooltip: true } },
  { title: 'Model', key: 'model' },
  {
    title: 'Status',
    key: 'currentStatus',
    render(row: Agent) {
      const color = row.currentStatus === 'running' ? '#10b981' : row.currentStatus === 'failed' ? '#ef4444' : '#6b7280';
      return `<span style="color:${color}">${row.currentStatus}</span>`;
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    render(row: Agent) {
      return `<button onclick="window.__agentClick?.('${row.id}')" style="cursor:pointer;color:#6366f1">View</button>`;
    },
  },
];

function handleRowClick(row: Agent) {
  router.push(`/agents/${row.id}`);
}
</script>

<template>
  <div style="padding: 24px; height: 100%; overflow-y: auto">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px">
      <NH2 prefix="bar" style="margin: 0">
        <NText>Agents</NText>
      </NH2>
      <NButton type="primary" @click="showModal = true">+ New Agent</NButton>
    </div>

    <NCard>
      <NDataTable
        :columns="columns"
        :data="agentsStore.agents"
        :bordered="false"
        :single-line="false"
        @row-click="(_: any, row: Agent) => handleRowClick(row)"
        style="cursor: pointer"
      />
    </NCard>

    <NModal v-model:show="showModal" title="Create Agent" preset="card" style="width: 500px">
      <NForm label-placement="top">
        <NFormItem label="Agent Name">
          <NInput v-model:value="form.name" placeholder="e.g., Frontend Agent" />
        </NFormItem>
        <NFormItem label="Project Directory">
          <NInput v-model:value="form.projectDir" placeholder="/path/to/project" />
        </NFormItem>
        <NFormItem label="Model (optional)">
          <NInput v-model:value="form.model" placeholder="e.g., claude-sonnet-4-6" />
        </NFormItem>
      </NForm>
      <NSpace justify="end">
        <NButton @click="showModal = false">Cancel</NButton>
        <NButton type="primary" @click="createAgent" :disabled="!form.name || !form.projectDir">Create</NButton>
      </NSpace>
    </NModal>
  </div>
</template>
