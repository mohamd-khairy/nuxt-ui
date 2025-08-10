<script setup lang="ts">
import { ref, watch } from "vue";
definePageMeta({
  permission: "read-session",
});
const sessionStore = useSessionStore();
const item = ref(null);
const router = useRouter();

// Watch for changes to the open prop from the parent and sync with localOpen
watch(
    () => sessionStore.showItem,
    (val) => {
        if (!val) return;
        item.value = val;
    },
    { immediate: true, deep: true }
);
</script>

<template>
    <UDashboardPanel id="customers">
        <template #header>
            <UDashboardNavbar title="عرض محتوي الحصة">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #right>
                    <Communication />
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <!-- Use v-html to render HTML content -->
            <div v-html="item?.content"></div>

            <div class="flex justify-end gap-2" dir="ltr">
                <UButton label="اغلاق" color="neutral" variant="subtle" size="xl" @click="router.go(-1)" />
            </div>
        </template>
    </UDashboardPanel>
</template>
