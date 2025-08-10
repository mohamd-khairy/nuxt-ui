<script setup lang="ts">
defineProps<{ unit?: string; ui?: Record<string, any> }>()
</script>

<template>
  <div class="flex" :class="ui?.wrapper">
    <slot />
  </div>
</template>

