<script setup lang="ts">
defineProps<{ id?: string, ui?: Record<string, unknown> }>()
</script>

<template>
  <section :id="id" class="flex flex-col flex-1" :class="ui?.wrapper">
    <header v-if="$slots.header" :class="ui?.header">
      <slot name="header" />
    </header>
    <div class="flex flex-col flex-1" :class="ui?.body">
      <slot name="body">
        <slot />
      </slot>
    </div>
  </section>
</template>
