import { onMounted, onUnmounted } from 'vue';
import { getSocket } from '../plugins/socket';
import { useAgentsStore } from '../stores/agents';
import { useStreamsStore } from '../stores/streams';
import { useTasksStore } from '../stores/tasks';

export function useSocket() {
  const agentsStore = useAgentsStore();
  const streamsStore = useStreamsStore();
  const tasksStore = useTasksStore();

  function setup() {
    const socket = getSocket();

    socket.on('agent:output', ({ agentId, chunk }) => {
      streamsStore.appendChunk(agentId, chunk);
    });

    socket.on('agent:status', ({ agentId, status, exitCode }) => {
      agentsStore.updateAgentStatus(agentId, status, exitCode);
    });

    socket.on('task:updated', ({ task }) => {
      tasksStore.updateTask(task);
    });

    socket.on('connect', () => {
      agentsStore.fetchAgents();
    });
  }

  function cleanup() {
    const socket = getSocket();
    socket.off('agent:output');
    socket.off('agent:status');
    socket.off('task:updated');
    socket.off('connect');
  }

  onMounted(setup);
  onUnmounted(cleanup);

  return { setup, cleanup };
}
