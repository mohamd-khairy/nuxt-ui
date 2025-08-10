<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{ ui?: Record<string, any> }>()
</script>

<template>
  <div
    v-bind="$attrs"
    class="flex items-center gap-2 p-4 border-b border-default"
    :class="ui?.wrapper"
  >
    <div class="flex items-center gap-2" :class="ui?.left">
      <slot name="left" />
    </div>
    <div class="flex items-center gap-2 ml-auto" :class="ui?.right">
      <slot />
    </div>
  </div>
</template>

