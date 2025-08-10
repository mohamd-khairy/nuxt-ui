<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as z from "zod";
import type { TabsItem } from "@nuxt/ui";
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
const UBadge = resolveComponent("UBadge");
definePageMeta({
  permission: "read-student-exam",
});
const props = defineProps<{
  student: any; // use `any` or define a type if available
}>();

const items = ref<TabsItem[]>([]);
const activeGroupTab = ref(null); // model for selected tab

onMounted(() => {
  if (props.student?.groups && Array.isArray(props.student.groups)) {
    items.value = props.student?.groups;

    // ✅ Set the first tab as active
    if (items.value?.length > 0) {
      activeGroupTab.value = items.value[0]?.value;
    }
  }
});

const columns = [
  {
    id: "id",
    header: "#",
    accessorKey: "id",
    cell: ({ row }) => {
      return h("div", { class: "text-right font-medium" }, row.getValue("id"));
    },
  },
  {
    id: "title",
    header: "اسم الاختبار",
    accessorKey: "title",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right font-medium" },
        row.getValue("title")
      );
    },
  },
  {
    id: "date",
    header: "تاريخ الاختبار",
    accessorKey: "date",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right font-medium" },
        row.getValue("date")
      );
    },
  },
  {
    id: "time",
    header: "وقت الاختبار",
    accessorKey: "time",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right font-medium" },
        row.getValue("time")
      );
    },
  },
  {
    id: "total_marks",
    header: "درجة الاختبار",
    accessorKey: "total_marks",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right font-medium" },
        row.getValue("total_marks")
      );
    },
  },
  {
    id: "expand",
    header: "نتائج الاختبار",
    cell: ({ row }) =>
      h(UButton, {
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-chevron-down",
        square: true,
        "aria-label": "Expand",
        ui: {
          leadingIcon: [
            "transition-transform",
            row.getIsExpanded() ? "duration-200 rotate-180" : "",
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
];

const UButton = resolveComponent("UButton");

const expanded = ref({ 0: false });

const setActiveTab = (tabValue: string) => {
  activeGroupTab.value = tabValue;
};

const activeItem = computed(() => {
  return items.value.find((item) => item.value === activeGroupTab.value);
});
</script>

<template>
  <div class="tabs-container" dir="rtl">
    <!-- Tab buttons -->
    <div class="tabs">
      <div
        v-for="item in items"
        :key="item.value"
        :class="['tab', activeGroupTab === item.value ? 'active' : '']"
        @click="setActiveTab(item.value)"
      >
        {{ item.label }}
      </div>
    </div>

    <!-- Tab content -->
    <div v-if="activeItem">
      <UTable
        v-model:expanded="expanded"
        :columns="columns"
        :data="activeItem.exams"
        :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
        class="flex-1"
      >
        <template #expanded="{ row }">
          <table class="w-full table-auto border mt-2 text-sm">
            <thead class="bg-gray-100 dark:bg-(--chip-dark)">
              <tr>
                <th class="border px-2 py-1">التاريخ والوقت</th>
                <th class="border px-2 py-1">الدرجة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(result, index) in row.original.results" :key="index">
                <td class="border px-2 py-1">
                  {{
                    new Date(result.created_at).toLocaleString("ar-EG", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                </td>
                <td class="border px-2 py-1">
                  <UBadge>{{ result.score }}</UBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </UTable>
    </div>
  </div>
</template>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 10px;
}

.tabs {
  display: flex;
  gap: 16px;
  overflow-x: auto; /* Enable horizontal scrolling */
  padding-bottom: 6px;
}

.tab {
  padding: 10px 10px;
  background-color: #f7f7f7;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  color: #444;
  transition: background-color 0.3s ease, transform 0.2s ease-in-out;
  text-align: center;
  min-width: fit-content;
  text-overflow: ellipsis;
  white-space: nowrap; /* Prevent text from wrapping */
  overflow: hidden;
}

/* Hover effect */
.tab:hover {
  background-color: #e0e0e0;
  transform: scale(1.05); /* Slight scaling effect on hover */
}

/* Active Tab Style */
.tab.active {
  background-color: var(--ui-success);
}

/* Media Queries for Mobile */
@media (max-width: 767px) {
  .tabs {
    flex-wrap: nowrap; /* Prevent tabs from wrapping on mobile */
  }

  .tab {
    min-width: fit-content;
    padding: 10px 18px;
    font-size: 14px; /* Adjust font size for smaller screens */
  }
}
</style>
