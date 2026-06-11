<script setup lang="ts">
import { NLayout, NLayoutSider, NLayoutContent, NMenu } from 'naive-ui';
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

const menuOptions = [
  { label: 'Dashboard', key: 'dashboard', path: '/' },
  { label: 'Chat', key: 'chat', path: '/chat' },
  { label: 'Manage Agents', key: 'manage', path: '/manage' },
  { label: 'Agents', key: 'agents', path: '/agents' },
  { label: 'Tasks', key: 'tasks', path: '/tasks' },
  { label: 'Settings', key: 'settings', path: '/settings' },
];

const activeKey = computed(() => {
  const name = route.name as string;
  if (name === 'chat-agent') return 'chat';
  if (name === 'manage-agent') return 'manage';
  return name;
});

function handleMenuUpdate(key: string) {
  const item = menuOptions.find(o => o.key === key);
  if (item) router.push(item.path);
}
</script>

<template>
  <NLayout has-sider style="height: 100vh">
    <NLayoutSider
      bordered
      :width="220"
      :native-scrollbar="false"
      content-style="padding: 16px 0"
    >
      <div style="padding: 0 20px 16px; font-size: 18px; font-weight: 700; color: #6366f1">
        Command Code
      </div>
      <div style="padding: 0 20px 12px; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px">
        Agent Dashboard
      </div>
      <NMenu
        :value="activeKey"
        :options="menuOptions.map(o => ({ label: o.label, key: o.key }))"
        @update:value="handleMenuUpdate"
      />
    </NLayoutSider>
    <NLayoutContent :native-scrollbar="false" content-style="padding: 0">
      <slot />
    </NLayoutContent>
  </NLayout>
</template>
