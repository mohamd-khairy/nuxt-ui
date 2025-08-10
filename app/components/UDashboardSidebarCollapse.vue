<script setup lang="ts">
const emit = defineEmits(['click'])
</script>

<template>
  <UButton
    icon="i-heroicons-bars-3"
    variant="ghost"
    color="gray"
    size="sm"
    @click="emit('click')"
  />
</template>

