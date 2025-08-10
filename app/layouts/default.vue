<script setup lang='ts'>
import { ref, onMounted } from 'vue'

// Initialize the stores
const linksStore = useLinksStore()

const open = ref(false)
const links = ref([])
const groups = ref([])
// Ensure that permissions are loaded before filtering links
onMounted(async () => {
  // Call filterLinks to filter links based on permissions
  await linksStore.filterLinks()

  links.value = linksStore.items // Assign the filtered items to the links variable
  groups.value = linksStore.groups
})
</script>

<template>
  <UDashboardLayout>
    <template #sidebar>
      <UDashboardSidebar
        id="default"
        v-model:open="open"
        collapsible
        class="bg-elevated/25"
        side="right"
        :ui="{ footer: 'lg:border-t lg:border-default' }"
      >
        <template #header="{ collapsed }">
          <TeamsMenu :collapsed="collapsed" />
        </template>

        <template #default="{ collapsed }">
          <!-- Navigation menu for the first group of links (filtered) -->
          <UNavigationMenu
            :collapsed="collapsed"
            :items="links[0]"
            orientation="vertical"
          />

          <!-- Navigation menu for the second group of links (filtered) -->
          <UNavigationMenu
            :collapsed="collapsed"
            :items="links[1]"
            orientation="vertical"
            class="mt-auto"
          />
        </template>

        <template #footer="{ collapsed }">
          <UserMenu :collapsed="collapsed" />
        </template>
      </UDashboardSidebar>
    </template>

    <template #navbar>
      <UDashboardNavbar />
    </template>

    <template #default>
      <UDashboardMain>
        <slot />
        <NotificationsSlideover />
      </UDashboardMain>
    </template>
  </UDashboardLayout>
</template>
