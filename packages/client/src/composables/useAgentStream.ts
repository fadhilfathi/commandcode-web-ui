import { watch, onUnmounted, computed } from 'vue';
import { getSocket } from '../plugins/socket';
import { useStreamsStore } from '../stores/streams';

export function useAgentStream(agentId: () => string) {
  const streamsStore = useStreamsStore();
  const socket = getSocket();

  let currentRoom: string | null = null;

  function joinRoom(id: string) {
    if (currentRoom) {
      socket.emit('agent:output:leave', { agentId: currentRoom });
    }
    currentRoom = id;
    socket.emit('agent:output:join', { agentId: id });
  }

  watch(agentId, (newId, oldId) => {
    if (oldId) socket.emit('agent:output:leave', { agentId: oldId });
    if (newId) joinRoom(newId);
  }, { immediate: true });

  onUnmounted(() => {
    if (currentRoom) {
      socket.emit('agent:output:leave', { agentId: currentRoom });
      currentRoom = null;
    }
  });

  const output = computed(() => streamsStore.getBuffer(agentId()));

  return { output };
}
