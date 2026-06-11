<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { NInput, NButton, NSpace, NText, NEmpty, NTag, NScrollbar, NIcon } from 'naive-ui';
import { useRoute } from 'vue-router';
import { useAgentsStore } from '../stores/agents';
import { useChatStore } from '../stores/chat';
import { useStreamsStore } from '../stores/streams';

const route = useRoute();
const agentsStore = useAgentsStore();
const chatStore = useChatStore();
const streamsStore = useStreamsStore();

const agentId = computed(() => route.params.agentId as string);
const inputText = ref('');
const sending = ref(false);
const scrollRef = ref<InstanceType<typeof NScrollbar> | null>(null);

const agent = computed(() => agentsStore.agents.find(a => a.id === agentId.value));
const messages = computed(() => chatStore.getMessages(agentId.value));

onMounted(() => {
  agentsStore.fetchAgents();
});

watch(agentId, (id) => {
  if (id) chatStore.fetchMessages(id);
}, { immediate: true });

async function handleSend() {
  if (!inputText.value.trim() || !agentId.value || sending.value) return;
  const text = inputText.value.trim();
  inputText.value = '';
  sending.value = true;
  try {
    await chatStore.sendMessage(agentId.value, text);
    await nextTick();
    scrollRef.value?.scrollTo({ top: 999999 });
  } finally {
    sending.value = false;
  }
}

watch(
  () => streamsStore.getBuffer(agentId.value).length,
  () => {
    const chunks = streamsStore.getBuffer(agentId.value);
    if (chunks.length > 0) {
      const lastChunk = chunks[chunks.length - 1];
      chatStore.appendStreamChunk(agentId.value, lastChunk.content);
    }
  }
);

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
</script>

<template>
  <div style="display: flex; height: 100%; gap: 0">
    <div style="width: 260px; border-right: 1px solid #333; display: flex; flex-direction: column; background: #1a1a2e">
      <div style="padding: 16px; border-bottom: 1px solid #333">
        <NText strong style="font-size: 14px">Select Agent</NText>
      </div>
      <div style="flex: 1; overflow-y: auto; padding: 8px">
        <div
          v-for="a in agentsStore.agents"
          :key="a.id"
          @click="$router.push(`/chat/${a.id}`)"
          :style="{
            padding: '10px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '4px',
            background: a.id === agentId ? '#2d2d44' : 'transparent',
            borderLeft: `3px solid ${a.color}`,
            transition: 'background 0.15s',
          }"
        >
          <div style="font-size: 13px; font-weight: 600">{{ a.name }}</div>
          <div style="font-size: 11px; color: #888; margin-top: 2px">{{ a.model || 'Default model' }}</div>
        </div>
        <NEmpty v-if="agentsStore.agents.length === 0" description="No agents yet" style="margin-top: 32px" />
      </div>
    </div>

    <div style="flex: 1; display: flex; flex-direction: column; min-width: 0">
      <div v-if="agent" style="padding: 16px 20px; border-bottom: 1px solid #333; display: flex; align-items: center; gap: 12px">
        <div :style="{ width: '10px', height: '10px', borderRadius: '50%', background: agent.color }" />
        <NText strong>{{ agent.name }}</NText>
        <NTag :type="agent.currentStatus === 'running' ? 'success' : 'default'" size="small">
          {{ agent.currentStatus }}
        </NTag>
        <NText depth="3" style="font-size: 12px; margin-left: auto">{{ agent.model || 'Default' }}</NText>
      </div>

      <div v-if="agent" style="flex: 1; display: flex; flex-direction: column; min-height: 0">
        <NScrollbar ref="scrollRef" style="flex: 1; padding: 16px 20px">
          <div v-if="messages.length === 0" style="display: flex; align-items: center; justify-content: center; height: 100%">
            <NEmpty description="Start a conversation with this agent" />
          </div>
          <div v-else>
            <div
              v-for="msg in messages"
              :key="msg.id"
              :style="{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }"
            >
              <div
                :style="{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: msg.role === 'user' ? '#6366f1' : '#2d2d44',
                  color: '#e0e0e0',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }"
              >
                <div>{{ msg.content }}</div>
                <div style="font-size: 10px; color: #666; margin-top: 4px; text-align: right">
                  {{ formatTime(msg.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </NScrollbar>

        <div style="padding: 12px 20px; border-top: 1px solid #333">
          <NSpace>
            <NInput
              v-model:value="inputText"
              placeholder="Type a message to this agent..."
              :disabled="sending"
              @keyup.enter="handleSend"
              style="flex: 1"
              :style="{ width: '100%' }"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 4 }"
            />
            <NButton type="primary" @click="handleSend" :loading="sending" :disabled="!inputText.trim()">
              Send
            </NButton>
          </NSpace>
        </div>
      </div>

      <div v-else style="flex: 1; display: flex; align-items: center; justify-content: center">
        <NEmpty description="Select an agent to start chatting" />
      </div>
    </div>
  </div>
</template>
