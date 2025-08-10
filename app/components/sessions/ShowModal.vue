<script setup lang="ts">
import { ref, watch } from "vue";

// Props passed to the component
const props = defineProps<{
  open: Boolean;
  item?: any;
}>();

// Local state to control modal visibility
const localOpen = ref(props.open);

// Watch for changes to the open prop from the parent and sync with localOpen
watch(
  () => props.open,
  (newVal) => {
    localOpen.value = newVal;
  }
);
</script>

<template>
  <UModal
    v-model:open="localOpen"
    :title="'تفاصيل الحصة'"
    :description="'تفاصيل الحصة'"
    fullscreen
  >
    <template #body>
      <!-- Use v-html to render HTML content -->
      <div v-html="item?.content"></div>
    </template>

    <!-- The default close button will be available from UModal -->
  </UModal>
</template>

<style scoped>
/* Optional styles */
</style>
