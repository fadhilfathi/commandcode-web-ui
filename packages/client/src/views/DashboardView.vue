<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { NGrid, NGi, NCard, NStatistic, NSpace, NButton, NH2, NText } from 'naive-ui';
import { useAgentsStore } from '../stores/agents';
import { useTasksStore } from '../stores/tasks';
import AgentCard from '../components/agent/AgentCard.vue';

const agentsStore = useAgentsStore();
const tasksStore = useTasksStore();

onMounted(() => {
  agentsStore.fetchAgents();
  tasksStore.fetchTasks();
});

const runningCount = computed(() => agentsStore.runningAgents.length);
const queuedTasks = computed(() => tasksStore.tasks.filter(t => t.status === 'queued').length);
const runningTasks = computed(() => tasksStore.tasks.filter(t => t.status === 'running').length);
const completedTasks = computed(() => tasksStore.tasks.filter(t => t.status === 'completed').length);
</script>

<template>
  <div style="padding: 24px; height: 100%; overflow-y: auto">
    <NH2 prefix="bar" style="margin-bottom: 24px">
      <NText>Team Dashboard</NText>
    </NH2>

    <NGrid :x-gap="16" :y-gap="16" :cols="4" style="margin-bottom: 24px">
      <NGi>
        <NCard size="small">
          <NStatistic label="Agents" :value="agentsStore.agents.length" />
        </NCard>
      </NGi>
      <NGi>
        <NCard size="small">
          <NStatistic label="Running" :value="runningCount" />
        </NCard>
      </NGi>
      <NGi>
        <NCard size="small">
          <NStatistic label="Queued Tasks" :value="queuedTasks" />
        </NCard>
      </NGi>
      <NGi>
        <NCard size="small">
          <NStatistic label="Completed" :value="completedTasks" />
        </NCard>
      </NGi>
    </NGrid>

    <NH2 prefix="bar" style="margin-bottom: 16px">
      <NText>Agents</NText>
    </NH2>

    <NSpace vertical :size="12">
      <NButton @click="$router.push('/agents')" type="primary" size="small">
        + New Agent
      </NButton>
    </NSpace>

    <NGrid :x-gap="16" :y-gap="16" :cols="3" style="margin-top: 16px">
      <NGi v-for="agent in agentsStore.agents" :key="agent.id">
        <AgentCard :agent="agent" />
      </NGi>
      <NGi v-if="agentsStore.agents.length === 0">
        <NCard size="small">
          <NText depth="3">No agents configured yet. Create one to get started.</NText>
        </NCard>
      </NGi>
    </NGrid>

    <NH2 prefix="bar" style="margin: 24px 0 16px">
      <NText>Recent Tasks</NText>
    </NH2>

    <NCard size="small" v-if="tasksStore.tasks.length > 0">
      <div v-for="task in tasksStore.tasks.slice(0, 10)" :key="task.id" style="padding: 8px 0; border-bottom: 1px solid #333">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>{{ task.title }}</span>
          <NText :depth="3" style="font-size: 12px">
            {{ task.status }}
          </NText>
        </div>
      </div>
    </NCard>
    <NCard size="small" v-else>
      <NText depth="3">No tasks yet.</NText>
    </NCard>
  </div>
</template>
