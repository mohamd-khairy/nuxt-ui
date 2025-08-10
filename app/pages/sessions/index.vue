<script setup lang="ts">
definePageMeta({
  permission: "read-session",
});
import type { TableColumn } from "@nuxt/ui";
import { upperFirst } from "scule";
import AddModal from "~/components/sessions/AddModal.vue";
import DeleteModal from "~/components/sessions/DeleteModal.vue";
import EditModal from "~/components/sessions/EditModal.vue";
import ShowModal from "~/components/sessions/ShowModal.vue";
import type { User } from "~/types";

const sessionStore = useSessionStore();
const authStore = useAuthStore();
const groupStore = useGroupStore();
const router = useRouter();

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UCheckbox = resolveComponent("UCheckbox");
const toast = useToast();
const table = useTemplateRef("table");

const columnFilters = ref([
  {
    id: "اسم الحصة",
    value: "",
  },
]);

const columnVisibility = ref();

onMounted(() => {
  sessionStore.loadAllSessions();
  groupStore.loadGroupsForSelect();
});

function getRowItems(row: any) {
  const items = [{ type: "label", label: "الاجراءات" }, { type: "separator" }];

  if (authStore.hasPermission("read-session")) {
    items.push({
      label: "عرض الحصة",
      icon: "i-lucide-eye",
      color: "warning",
      onSelect() {
        sessionStore.showItem = row.original;
        // sessionStore.showModalOpen = true;
        router.push(`/sessions/show`);
      },
    });
  }

  if (authStore.hasPermission("update-session")) {
    items.push({
      label: "تعديل الحصة",
      icon: "i-lucide-edit",
      color: "primary",
      onSelect() {
        sessionStore.editItem = row.original;
        // sessionStore.editModalOpen = true;
        router.push(`/sessions/edit`);
      },
    });
  }

  if (authStore.hasPermission("delete-session")) {
    items.push({
      label: "حذف الحصة",
      icon: "i-lucide-trash",
      color: "error",
      onSelect() {
        sessionStore.addId(row.original.id);
        sessionStore.deleteModalOpen = true;
      },
    });
  }

  return items;
}

const searchGroupTerm = ref("");
const group_id = ref(null);
watch(searchGroupTerm, (newVal) => {
  if (newVal.length >= 3 || newVal.length < 1)
    groupStore.loadGroupsForSelect(newVal);
});

const columns: TableColumn<User>[] = [
  {
    id: "اختار",
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue:
          sessionStore.selectedIds.length > 0 &&
          sessionStore.selectedIds.length ===
            table.getFilteredRowModel().rows.length
            ? true
            : sessionStore.selectedIds?.length > 0
            ? "indeterminate"
            : false,
        "onUpdate:modelValue": (value: boolean | "indeterminate") => {
          if (value) {
            // Select all visible rows
            table.getFilteredRowModel().rows.forEach((r) => {
              sessionStore.toggleId(r.original.id);
            });
          } else {
            // Deselect all visible rows
            table.getFilteredRowModel().rows.forEach((r) => {
              sessionStore.removeId(r.original.id);
            });
          }
        },
        ariaLabel: "Select all",
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: sessionStore.selectedIds.includes(row.original.id),
        "onUpdate:modelValue": (value: boolean | "indeterminate") => {
          if (value) {
            sessionStore.addId(row.original.id);
          } else {
            sessionStore.removeId(row.original.id);
          }
        },
        ariaLabel: "Select row",
      }),
  },
  {
    id: "رقم الحصة",
    accessorKey: "id",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "رقم الحصة",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => h(() => row.original.id),
  },
  {
    accessorKey: "name",
    id: "اسم الحصة",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "اسم الحصة",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => h(() => row.original.name),
  },
  {
    accessorKey: "group_id",
    id: " المجموعة",
    header: " المجموعة",
    cell: ({ row }) =>
      h(
        UBadge,
        { class: "capitalize", variant: "subtle", color: "success" },
        () => row.original.group?.name
      ),
  },
  {
    accessorKey: "date",
    id: " التاريخ",
    header: " التاريخ",
    cell: ({ row }) => h(() => row.original.date),
  },
  {
    accessorKey: "schedule_id",
    id: " الموعد",
    header: " الموعد",
    cell: ({ row }) => h(() => row.original.schedule?.label),
  },
  {
    accessorKey: "teacher_id",
    id: " المدرس",
    header: " المدرس",
    cell: ({ row }) => h(() => row.original.teacher?.name),
  },
  {
    accessorKey: "الاجراءات",
    id: "الاجراءات",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: {
              align: "end",
            },
            items: getRowItems(row),
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              class: "ml-auto",
            })
        )
      );
    },
  },
];

watch(
  () => group_id.value,
  () => {
    sessionStore.loadAllSessions(1, { group_id: group_id?.value?.value ?? '' });
  }
);
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="الحصص">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <!-- <AddModal /> -->
          <RouterLink :to="{ name: 'sessions-add' }">
            <UButton
              label="إضافة حصة جديد"
              icon="i-lucide-plus"
              dir="rtl"
              v-if="authStore.hasPermission('create-session')"
            />
          </RouterLink>
          <Communication />
        </template>

        <!-- <DeleteModal
          :count="sessionStore.selectedIds.length"
          v-model:open="sessionStore.deleteModalOpen"
        /> -->

        <!-- <EditModal
          :item="sessionStore.editItem"
          v-model:open="sessionStore.editModalOpen"
        /> -->

        <!-- <ShowModal
          :item="sessionStore.showItem"
          v-model:open="sessionStore.showModalOpen"
        /> -->
      </UDashboardNavbar>
    </template>

    <template #body v-if="!sessionStore.isItemLoading">
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <div>
          <UInput
            :model-value="(table?.tableApi?.getColumn('اسم الحصة')?.getFilterValue() as string)"
            class="max-w-sm"
            icon="i-lucide-search"
            placeholder="ابحث ..."
            @update:model-value="
              table?.tableApi?.getColumn('اسم الحصة')?.setFilterValue($event)
            "
          />

          <USelectMenu
            class="w-50 mr-2"
            v-model:search-term="searchGroupTerm"
            v-model="group_id"
            :items="groupStore.groupOptions"
            placeholder="اختر المجموعة"
            :search-input="{
              placeholder: 'بحث...',
              icon: 'i-lucide-search',
            }"
          />

          <UButton
            icon="i-lucide-x"
            color="gray"
            size="sm"
            @click="group_id = null"
            class="hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-300"
          />
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <DeleteModal :count="sessionStore.selectedIds.length">
            <UButton
              v-if="sessionStore.selectedIds.length"
              label="حذف"
              color="error"
              variant="subtle"
              icon="i-lucide-trash"
            >
              <template #trailing>
                <UKbd>
                  {{ sessionStore.selectedIds.length }}
                </UKbd>
              </template>
            </UButton>
          </DeleteModal>
          <!-- 
          <UButton
            label="تصدير"
            loading-auto
            color="success"
            variant="outline"
            trailing-icon="i-lucide-file-spreadsheet"
            v-if="authStore.hasPermission('read-session')"
            @click="exportToExcel('session')"
          /> -->

          <UDropdownMenu
            :items="table?.tableApi
            ?.getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => ({
              label: upperFirst(column.id),
              type: 'checkbox' as const,
              checked: column.getIsVisible(),
              onUpdateChecked(checked: boolean) {
                table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
              },
              onSelect(e?: Event) {
                e?.preventDefault()
              }
            }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="الاعمدة"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-settings-2"
            />
          </UDropdownMenu>
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:column-visibility="columnVisibility"
        v-model:pagination="sessionStore.pagination"
        class="shrink-0"
        :data="sessionStore.items"
        :columns="columns"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2  border-y border-default ',
          td: 'border-b border-default',
        }"
      />

      <div
        class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto"
        dir="ltr"
      >
        <div class="flex items-center gap-1.5" dir="ltr">
          <UPagination
            dir="ltr"
            :total="sessionStore.pagination?.total"
            :items-per-page="sessionStore.pagination?.pageSize"
            :default-page="sessionStore.pagination?.page"
            @update:page="(p) => sessionStore.loadAllSessions(p)"
          />
        </div>
      </div>
    </template>

    <template #body v-else>
      <Loader />
    </template>
  </UDashboardPanel>
</template>
