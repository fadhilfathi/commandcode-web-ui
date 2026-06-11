<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NButton, NCard, NDataTable, NH2, NText, NModal, NForm, NFormItem, NInput, NSelect, NSpace } from 'naive-ui';
import { useTasksStore } from '../stores/tasks';
import { useAgentsStore } from '../stores/agents';
import type { Task } from '@commandcode-web-ui/shared';

const tasksStore = useTasksStore();
const agentsStore = useAgentsStore();
const showModal = ref(false);
const form = ref({ title: '', description: '', agentId: null as string | null });

onMounted(() => {
  tasksStore.fetchTasks();
  agentsStore.fetchAgents();
});

async function createTask() {
  if (!form.value.title || !form.value.description) return;
  await tasksStore.createTask({
    title: form.value.title,
    description: form.value.description,
    agentId: form.value.agentId ?? undefined,
  });
  showModal.value = false;
  form.value = { title: '', description: '', agentId: null };
}

const columns = [
  { title: 'Title', key: 'title' },
  { title: 'Status', key: 'status' },
  { title: 'Priority', key: 'priority' },
  { title: 'Agent', key: 'agentId', render: (row: Task) => row.agentId ? 'Assigned' : '-' },
];

const agentOptions = () => agentsStore.agents.map(a => ({ label: a.name, value: a.id }));
</script>

<template>
  <div style="padding: 24px; height: 100%; overflow-y: auto">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px">
      <NH2 prefix="bar" style="margin: 0">
        <NText>Tasks</NText>
      </NH2>
      <NButton type="primary" @click="showModal = true">+ New Task</NButton>
    </div>

    <NCard>
      <NDataTable :columns="columns" :data="tasksStore.tasks" :bordered="false" />
    </NCard>

    <NModal v-model:show="showModal" title="Create Task" preset="card" style="width: 500px">
      <NForm label-placement="top">
        <NFormItem label="Title">
          <NInput v-model:value="form.title" placeholder="Task title" />
        </NFormItem>
        <NFormItem label="Description (sent to agent)">
          <NInput v-model:value="form.description" type="textarea" placeholder="What should the agent do?" :rows="3" />
        </NFormItem>
        <NFormItem label="Assign to Agent (optional)">
          <NSelect v-model:value="form.agentId" :options="agentOptions()" clearable placeholder="Auto-assign to next idle agent" />
        </NFormItem>
      </NForm>
      <NSpace justify="end">
        <NButton @click="showModal = false">Cancel</NButton>
        <NButton type="primary" @click="createTask" :disabled="!form.title || !form.description">Create</NButton>
      </NSpace>
    </NModal>
  </div>
</template>
