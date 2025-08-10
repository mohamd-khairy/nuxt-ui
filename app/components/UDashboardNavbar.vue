<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  toggle?: boolean
  ui?: Record<string, unknown>
}>()
</script>

<template>
  <header class="flex items-center gap-2 p-4 border-b border-default" :class="ui?.wrapper">
    <div class="flex items-center gap-2" :class="ui?.leading">
      <slot name="leading" />
    </div>
    <div class="flex-1">
      <h1 class="text-lg font-medium" :class="ui?.title">
        {{ title }}
      </h1>
      <p v-if="description" class="text-sm text-muted" :class="ui?.description">
        {{ description }}
      </p>
    </div>
    <div class="flex items-center gap-2" :class="ui?.right">
      <slot name="right" />
      <slot />
    </div>
  </header>
</template>
