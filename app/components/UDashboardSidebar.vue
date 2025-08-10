<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ ui?: Record<string, any>; open?: boolean }>()

const collapsed = ref(false)
</script>

<template>
  <aside class="flex flex-col" :class="ui?.wrapper">
    <slot name="header" :collapsed="collapsed" />
    <div class="flex-1" :class="ui?.content">
      <slot :collapsed="collapsed" />
    </div>
    <div :class="ui?.footer">
      <slot name="footer" :collapsed="collapsed" />
    </div>
  </aside>
</template>

