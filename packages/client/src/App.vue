<script setup lang="ts">
import { NConfigProvider, darkTheme } from 'naive-ui';
import AppLayout from './components/layout/AppLayout.vue';
import { useSocket } from './composables/useSocket';

useSocket();
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <AppLayout>
      <RouterView />
    </AppLayout>
  </NConfigProvider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #1a1a2e;
  color: #e0e0e0;
}
</style>
