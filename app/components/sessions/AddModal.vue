<script setup lang="ts">
import * as z from "zod";
import Editor from "../Editor.vue";

const open = ref(false);
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
    status: true
  };
  sessionStore.addSession(payload);
  toast.add({
    title: "تم بنجاح",
    description: `حصة جديد ${state.name} تم اضافة بنجاح`,
    color: "success",
  });
  open.value = false;
  resetState();
}
function resetState() {
  Object.assign(state, {
    name: null,
    content: null,
    group_id: null,
    schedule_id: null,
    date: null,
  });
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="اضافة حصة"
    description="إضافة حصة جديد"
    dir="rtl"
    fullscreen
  >
    <UButton
      label="إضافة حصة جديد"
      icon="i-lucide-plus"
      dir="rtl"
      v-if="authStore.hasPermission('create-session')"
    />

    <template #body dir="rtl" class="w-full">
      <UForm dir="rtl" :schema="schema" :state="state" class="space-y-4 w-full">
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
            type="submit"
            loading-auto
            @click="onSubmit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
