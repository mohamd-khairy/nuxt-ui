<script setup lang="ts">
defineProps<{ title?: string; ui?: Record<string, any> }>()
</script>

<template>
  <header class="flex items-center gap-2 p-4 border-b border-default" :class="ui?.wrapper">
    <div class="flex items-center gap-2" :class="ui?.leading">
      <slot name="leading" />
    </div>
    <h1 class="flex-1 text-lg font-medium" :class="ui?.title">{{ title }}</h1>
    <div class="flex items-center gap-2" :class="ui?.right">
      <slot name="right" />
      <slot />
    </div>
  </header>
</template>

