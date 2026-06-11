import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
    { path: '/agents', name: 'agents', component: () => import('../views/AgentsView.vue') },
    { path: '/agents/:id', name: 'agent-detail', component: () => import('../views/AgentDetailView.vue'), props: true },
    { path: '/chat', name: 'chat', component: () => import('../views/ChatView.vue') },
    { path: '/chat/:agentId', name: 'chat-agent', component: () => import('../views/ChatView.vue'), props: true },
    { path: '/manage', name: 'manage', component: () => import('../views/ManageAgentsView.vue') },
    { path: '/manage/:id', name: 'manage-agent', component: () => import('../views/ManageAgentsView.vue'), props: true },
    { path: '/tasks', name: 'tasks', component: () => import('../views/TasksView.vue') },
    { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
  ],
});

export default router;
