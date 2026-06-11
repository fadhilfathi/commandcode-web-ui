<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  NCard, NForm, NFormItem, NInput, NSelect, NButton, NSpace,
  NH2, NText, NTag, NModal, NPopconfirm, NEmpty, NColorPicker,
  NGi, NGrid,
} from 'naive-ui';
import { useRoute, useRouter } from 'vue-router';
import { useAgentsStore } from '../stores/agents';
import type { Agent } from '@commandcode-web-ui/shared';

const route = useRoute();
const router = useRouter();
const agentsStore = useAgentsStore();

const selectedId = ref<string | null>(null);
const editForm = ref({ name: '', projectDir: '', model: '', color: '#6366f1', extraArgs: '' });
const saving = ref(false);
const showCreateModal = ref(false);
const createForm = ref({ name: '', projectDir: '', model: '', color: '#6366f1' });

onMounted(() => {
  agentsStore.fetchAgents();
  if (route.params.id) {
    selectedId.value = route.params.id as string;
  }
});

watch(selectedId, (id) => {
  if (id) loadAgent(id);
});

function loadAgent(id: string) {
  const agent = agentsStore.agents.find(a => a.id === id);
  if (agent) {
    editForm.value = {
      name: agent.name,
      projectDir: agent.projectDir,
      model: agent.model || '',
      color: agent.color,
      extraArgs: (agent.extraArgs || []).join(' '),
    };
  }
}

const selectedAgent = computed(() => agentsStore.agents.find(a => a.id === selectedId.value));

async function handleSave() {
  if (!selectedId.value) return;
  saving.value = true;
  try {
    await agentsStore.updateAgent(selectedId.value, {
      name: editForm.value.name,
      projectDir: editForm.value.projectDir,
      model: editForm.value.model || null,
      color: editForm.value.color,
      extraArgs: editForm.value.extraArgs.split(/\s+/).filter(Boolean),
    });
  } finally {
    saving.value = false;
  }
}

async function handleCreate() {
  if (!createForm.value.name || !createForm.value.projectDir) return;
  const agent = await agentsStore.createAgent({
    name: createForm.value.name,
    projectDir: createForm.value.projectDir,
    model: createForm.value.model || undefined,
    color: createForm.value.color,
  });
  showCreateModal.value = false;
  createForm.value = { name: '', projectDir: '', model: '', color: '#6366f1' };
  selectedId.value = agent.id;
}

async function handleDelete() {
  if (!selectedId.value) return;
  await agentsStore.deleteAgent(selectedId.value);
  selectedId.value = null;
}

function selectAgent(id: string) {
  selectedId.value = id;
  router.replace({ params: { id } });
}
</script>

<template>
  <div style="display: flex; height: 100%; gap: 0">
    <div style="width: 280px; border-right: 1px solid #333; display: flex; flex-direction: column; background: #1a1a2e">
      <div style="padding: 16px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center">
        <NText strong style="font-size: 14px">Agents</NText>
        <NButton size="small" type="primary" @click="showCreateModal = true">+ New</NButton>
      </div>
      <div style="flex: 1; overflow-y: auto; padding: 8px">
        <div
          v-for="a in agentsStore.agents"
          :key="a.id"
          @click="selectAgent(a.id)"
          :style="{
            padding: '10px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '4px',
            background: a.id === selectedId ? '#2d2d44' : 'transparent',
            borderLeft: `3px solid ${a.color}`,
            transition: 'background 0.15s',
          }"
        >
          <div style="font-size: 13px; font-weight: 600">{{ a.name }}</div>
          <div style="font-size: 11px; color: #888; margin-top: 2px">{{ a.projectDir }}</div>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px">
            <NTag :type="a.currentStatus === 'running' ? 'success' : 'default'" size="tiny">
              {{ a.currentStatus }}
            </NTag>
            <NText depth="3" style="font-size: 11px">{{ a.model || 'Default' }}</NText>
          </div>
        </div>
        <NEmpty v-if="agentsStore.agents.length === 0" description="No agents configured" style="margin-top: 32px" />
      </div>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 24px">
      <div v-if="selectedAgent">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px">
          <NH2 prefix="bar" style="margin: 0">
            <NText>{{ selectedAgent.name }}</NText>
          </NH2>
          <NSpace>
            <NPopconfirm @positive-click="handleDelete">
              <template #trigger>
                <NButton size="small" type="error" ghost>Delete Agent</NButton>
              </template>
              Are you sure you want to delete this agent?
            </NPopconfirm>
          </NSpace>
        </div>

        <NCard title="Configuration">
          <NForm label-placement="top">
            <NGrid :cols="2" :x-gap="16">
              <NGi>
                <NFormItem label="Agent Name">
                  <NInput v-model:value="editForm.name" placeholder="e.g., Frontend Agent" />
                </NFormItem>
              </NGi>
              <NGi>
                <NFormItem label="Model">
                  <NInput v-model:value="editForm.model" placeholder="e.g., claude-sonnet-4-6" />
                </NFormItem>
              </NGi>
            </NGrid>
            <NFormItem label="Project Directory">
              <NInput v-model:value="editForm.projectDir" placeholder="/path/to/project" />
            </NFormItem>
            <NFormItem label="Color">
              <NColorPicker v-model:value="editForm.color" :show-alpha="false" style="width: 120px" />
            </NFormItem>
            <NFormItem label="Extra Arguments (space-separated)">
              <NInput v-model:value="editForm.extraArgs" placeholder="--add-dir ../shared --trust" />
            </NFormItem>
          </NForm>
          <NSpace justify="end">
            <NButton @click="loadAgent(selectedId!)">Reset</NButton>
            <NButton type="primary" @click="handleSave" :loading="saving">Save Changes</NButton>
          </NSpace>
        </NCard>

        <NCard title="Status" style="margin-top: 16px">
          <NSpace>
            <NText depth="3">Status:</NText>
            <NTag :type="selectedAgent.currentStatus === 'running' ? 'success' : 'default'" size="small">
              {{ selectedAgent.currentStatus }}
            </NTag>
          </NSpace>
          <NSpace v-if="selectedAgent.currentSession" style="margin-top: 8px">
            <NText depth="3">Model used:</NText>
            <NText>{{ selectedAgent.currentSession.modelUsed || 'Default' }}</NText>
          </NSpace>
          <NSpace v-if="selectedAgent.currentSession" style="margin-top: 4px">
            <NText depth="3">Session started:</NText>
            <NText>{{ new Date(selectedAgent.currentSession.startedAt).toLocaleString() }}</NText>
          </NSpace>
        </NCard>
      </div>

      <div v-else style="display: flex; align-items: center; justify-content: center; height: 100%">
        <NEmpty description="Select an agent to manage its settings" />
      </div>
    </div>

    <NModal v-model:show="showCreateModal" title="Create New Agent" preset="card" style="width: 500px">
      <NForm label-placement="top">
        <NFormItem label="Agent Name">
          <NInput v-model:value="createForm.name" placeholder="e.g., Frontend Agent" />
        </NFormItem>
        <NFormItem label="Project Directory">
          <NInput v-model:value="createForm.projectDir" placeholder="/path/to/project" />
        </NFormItem>
        <NFormItem label="Model (optional)">
          <NInput v-model:value="createForm.model" placeholder="e.g., claude-sonnet-4-6" />
        </NFormItem>
        <NFormItem label="Color">
          <NColorPicker v-model:value="createForm.color" :show-alpha="false" style="width: 120px" />
        </NFormItem>
      </NForm>
      <NSpace justify="end">
        <NButton @click="showCreateModal = false">Cancel</NButton>
        <NButton type="primary" @click="handleCreate" :disabled="!createForm.name || !createForm.projectDir">Create</NButton>
      </NSpace>
    </NModal>
  </div>
</template>
