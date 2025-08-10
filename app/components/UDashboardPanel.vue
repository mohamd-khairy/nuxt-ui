<script setup lang="ts">
defineProps<{ id?: string; ui?: Record<string, any> }>()
</script>

<template>
  <section :id="id" class="flex flex-col flex-1" :class="ui?.wrapper">
    <slot />
  </section>
</template>

