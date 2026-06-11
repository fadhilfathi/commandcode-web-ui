<script setup lang="ts">
import { NH2, NCard, NText, NTag } from 'naive-ui';
</script>

<template>
  <div style="padding: 24px; height: 100%; overflow-y: auto">
    <NH2 prefix="bar" style="margin-bottom: 24px">
      <NText>Settings</NText>
    </NH2>

    <NCard title="Server Status">
      <NText depth="3">Server running on port 3001</NText>
    </NCard>
  </div>
</template>
