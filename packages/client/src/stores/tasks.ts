import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../plugins/api';
import type { Task } from '@commandcode-web-ui/shared';

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);

  async function fetchTasks(filter?: { status?: string; agentId?: string }) {
    loading.value = true;
    try {
      const params = new URLSearchParams();
      if (filter?.status) params.set('status', filter.status);
      if (filter?.agentId) params.set('agentId', filter.agentId);
      const res: any = await api.get(`/tasks?${params}`);
      tasks.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  async function createTask(input: { title: string; description: string; agentId?: string; modelOverride?: string }) {
    const res: any = await api.post('/tasks', input);
    tasks.value.push(res.data);
    return res.data;
  }

  async function assignTask(taskId: string, agentId: string) {
    const res: any = await api.post(`/tasks/${taskId}/assign`, { agentId });
    const idx = tasks.value.findIndex(t => t.id === taskId);
    if (idx >= 0) tasks.value[idx] = res.data;
    return res.data;
  }

  async function cancelTask(taskId: string) {
    await api.post(`/tasks/${taskId}/cancel`);
    const task = tasks.value.find(t => t.id === taskId);
    if (task) task.status = 'cancelled';
  }

  function updateTask(task: Task) {
    const idx = tasks.value.findIndex(t => t.id === task.id);
    if (idx >= 0) tasks.value[idx] = task;
    else tasks.value.push(task);
  }

  return { tasks, loading, fetchTasks, createTask, assignTask, cancelTask, updateTask };
});
