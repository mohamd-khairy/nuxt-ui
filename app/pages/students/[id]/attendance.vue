<script setup lang="ts">
import { ref, onMounted } from "vue";
definePageMeta({
  permission: "read-student-attendance",
});
const props = defineProps<{
  student: any; // use `any` or define a type if available
}>();

const items = ref([]);
const activeGroupTab = ref(null); // model for selected tab
const activeScheduleTab = ref(null); // model for selected tab
const UBadge = resolveComponent("UBadge");

onMounted(() => {
  if (props.student?.groups && Array.isArray(props.student.groups)) {
    items.value = props.student?.groups;

    if (items.value.length > 0) {
      activeGroupTab.value = items.value[0]?.value;
    }
  }
});

watch(activeGroupTab, async (id) => {
  const obj = items.value.find((item) => item.id == id);
  if (obj?.schedules.length > 0) {
    activeScheduleTab.value = obj?.schedules[0]?.value;
  }
});

const statusColors = {
  حضر: "success",
  غائب: "error",
  متأخر: "warning",
};

// Table Columns
const columns = [
  {
    accessorKey: "date",
    id: "date",
    header: " التاريخ",
    cell: ({ row }) =>
      h(() =>
        new Date(row.original.created_at).toLocaleString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      ),
  },
  {
    accessorKey: "time",
    id: "time",
    header: " الوقت",
    cell: ({ row }) =>
      h(() =>
        new Date(row.original.created_at).toLocaleString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        })
      ),
  },
  {
    accessorKey: "status",
    id: "status",
    header: "حالة الحضور",
    cell: ({ row }) =>
      h(
        UBadge,
        {
          class: "capitalize",
          variant: "subtle",
          color: statusColors[row.original.status],
        },
        () => row.original.status
      ),
  },
  {
    accessorKey: "note",
    id: "note",
    header: "الملاحظات",
  },
];

const setActiveTab = (tabValue: string) => {
  activeGroupTab.value = tabValue;

  console.log("Active Group Tab:", activeGroupTab.value);
};

const activeItem = computed(() => {
  if (!activeGroupTab.value) return null;
  return items.value.find((item) => item.value === activeGroupTab.value);
});
</script>

<template>
  <div class="tabs-container" dir="rtl">
    <!-- Tab buttons (Group Tabs) -->
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

    <!-- Schedule Tabs (based on active group tab) -->
    <div class="tabs">
      <div
        v-for="schedule in activeItem?.schedules"
        :key="schedule.value"
        :class="[
          'schedule-tab',
          activeScheduleTab === schedule.value ? 'active' : '',
        ]"
        @click="activeScheduleTab = schedule.value"
      >
        {{ schedule.label }}
      </div>
    </div>

    <!-- Active Schedule Content -->
    <div class="tab-content">
      <div v-if="activeItem && activeScheduleTab">
        <UTable
          :columns="columns"
          :data="
            activeItem.schedules.find((s) => s.value === activeScheduleTab)
              ?.attendances || []
          "
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
                <tr
                  v-for="(result, index) in row.original.results"
                  :key="index"
                >
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
  overflow-x: auto;
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
  min-width: 150px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

/* Hover effect */
.tab:hover {
  background-color: #e0e0e0;
  transform: scale(1.05);
}

/* Active Tab Style */
.tab.active {
  background-color: var(--ui-success);
}

.schedule-tabs {
  display: flex;
  gap: 6px;
  /* padding-bottom: 10px; */
}

.schedule-tab {
  background-color: transparent;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  /* color: #444; */
  text-align: center;
  text-decoration: none;
  transition: color 0.3s ease;
  min-width: fit-content;
}

/* Hover effect for schedule tabs (links) */
.schedule-tab:hover {
  color: var(--ui-success);
}

/* Active Tab Style for schedule tabs */
.schedule-tab.active {
  color: var(--ui-success);
  font-weight: bold;
}

/* Media Queries for Mobile */
@media (max-width: 767px) {
  .tabs {
    flex-wrap: nowrap;
  }

  .tab {
    min-width: fit-content;
    padding: 10px 18px;
    font-size: 14px;
  }
}
</style>
