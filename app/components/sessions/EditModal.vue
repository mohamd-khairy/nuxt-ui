<script setup lang="ts">
import * as z from "zod";

const props = defineProps({
  open: Boolean,
  item: Object,
});

const emit = defineEmits(["update:open"]);
const sessionStore = useSessionStore();
const authStore = useAuthStore();
const groupStore = useGroupStore();
const schedules = ref([]);
const showScheduleModal = ref(true);
const searchGroupTerm = ref("");

const state = reactive<Partial<Schema>>({
  name: null,
  content: null,
  group_id: null,
  schedule_id: null,
  date: null,
});

watch(
  () => props.open,
  (val) => {
    open.value = val;
  }
);

const open = ref(false);

watch(open, (val) => {
  emit("update:open", val);
});

watch(searchGroupTerm, (newVal) => {
  if (newVal.length >= 3 || newVal.length < 1)
    // For example, debounce here if needed to avoid too many requests
    groupStore.loadGroupsForSelect(newVal);
});

watch(
  () => state.group_id,
  async (newVal, oldVal) => {
    await groupStore.loadSchedules(state.group_id.value);
    schedules.value = groupStore.schedules;
    showScheduleModal.value = true;
  }
);

const schema = z.object({
  name: z.string().min(2, "Too short"),
});

type Schema = z.output<typeof schema>;

const toast = useToast();

async function onSubmit() {
  let payload = {
    name: state.name,
    content: state.content,
    group_id: state.group_id?.value,
    teacher_id: state.group_id?.teacher_id,
    schedule_id: state.schedule_id?.value,
    date: state.date,
  };
  sessionStore.editSession(payload, props.item?.id);
  toast.add({
    title: "نجح",
    description: `حصة  ${state.name} تم تعديل بنجاح`,
    color: "success",
  });
  open.value = false;
}

watch(
  () => props.item,
  (val) => {
    if (!val) return;
    state.name = val.name || "";
    state.content = val.content || null;
    state.group_id = {
      value: val.group?.id,
      label: val.group?.name,
    };
    state.schedule_id = {
      value: val.schedule?.id,
      label: val.schedule?.label,
    };
    state.date = val.date || null;
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <UModal
    v-model:open="open"
    title="تعديل حصة"
    description="تعديل حصة "
    dir="rtl"
    fullscreen
  >
    <template #body dir="rtl">
      <UForm :schema="schema" :state="state" class="space-y-4" dir="rtl">
        <UFormField label="اسم الحصة" placeholder="اسم الحصة" name="name">
          <UInput required v-model="state.name" class="w-full" />
        </UFormField>

        <UFormField
          label="اسم المجموعة"
          placeholder="اختر المجموعة"
          name="group_id"
        >
          <USelectMenu
            required
            dir="rtl"
            v-model:search-term="searchGroupTerm"
            v-model="state.group_id"
            :items="groupStore.groupOptions"
            class="w-full"
            placeholder="اختر المجموعة"
            :search-input="{
              placeholder: 'بحث...',
              icon: 'i-lucide-search',
            }"
          />
        </UFormField>

        <UFormField
          label=" الموعد"
          placeholder="اختر الموعد"
          name="schedule_id"
          v-if="showScheduleModal"
        >
          <USelectMenu
            required
            dir="rtl"
            v-model:search-term="searchGroupTerm"
            v-model="state.schedule_id"
            :items="schedules"
            class="w-full"
            placeholder="اختر الموعد"
          />
        </UFormField>

        <UFormField label="تاريخ الحصة" placeholder="تاريخ الحصة" name="date">
          <UInput
            required
            v-model="state.date"
            type="date"
            placeholder="اختر التاريخ"
            class="w-full"
          />
        </UFormField>

        <UFormField label="تفاصيل الحصة" placeholder="تفاصيل الحصة" name="name">
          <Editor required v-model="state.content" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2" dir="ltr">
          <UButton
            label="الغاء"
            color="neutral"
            variant="subtle"
            @click="open = false"
          />
          <UButton
            label="حفظ"
            color="primary"
            variant="solid"
            loading-auto
            type="submit"
            @click="onSubmit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
