<script setup lang="ts">
import * as z from "zod";
// import Editor from "../Editor.vue";
import Editor from "@tinymce/tinymce-vue";
definePageMeta({
  permission: "create-session",
});
const sessionStore = useSessionStore();
const authStore = useAuthStore();
const groupStore = useGroupStore();
const schedules = ref([]);
const showScheduleModal = ref(true);
const searchGroupTerm = ref("");
const router = useRouter();

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
    status: true,
  };
  sessionStore.addSession(payload);
  toast.add({
    title: "تم بنجاح",
    description: `حصة جديد ${state.name} تم اضافة بنجاح`,
    color: "success",
  });
  setTimeout(() => {
    router.push("/sessions");
    resetState();
  }, 1000);
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
const colorMode = useColorMode();

let initOptions = {};

if (process.client) {
  initOptions = {
    plugins:
      "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion",
    editimage_cors_hosts: ["picsum.photos"],
    menubar: "file edit view insert format tools table help",
    toolbar:
      "undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl",
    autosave_ask_before_unload: true,
    autosave_interval: "30s",
    autosave_prefix: "{path}{query}-{id}-",
    autosave_restore_when_empty: false,
    autosave_retention: "2m",
    image_advtab: true,
    importcss_append: true,
    height: 600,
    image_caption: true,
    quickbars_selection_toolbar:
      "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
    noneditable_class: "mceNonEditable",
    toolbar_mode: "sliding",
    contextmenu: "link image table",
    skin: colorMode.value !== "light" ? "oxide-dark" : "oxide",
    content_css: colorMode.value !== "light" ? "dark" : "default",
    content_style:
      "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
  };
}
</script>

<template>
  <UDashboardPanel id="customers">
    <template #header>
      <UDashboardNavbar title="إضافة حصة جديدة">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <Communication />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body dir="rtl" class="w-full">
      <UForm dir="rtl" :schema="schema" :state="state" class="space-y-4 w-full">
        <div class="flex gap-4">
          <UFormField label="اسم الحصة" class="w-full" placeholder="اسم الحصة" name="name">
            <UInput required v-model="state.name" class="w-full" placeholder="اسم الحصة" />
          </UFormField>

          <UFormField label=" المجموعة" class="w-full" placeholder="اختر المجموعة" name="group_id">
            <USelectMenu required dir="rtl" v-model:search-term="searchGroupTerm" v-model="state.group_id"
              :items="groupStore.groupOptions" class="w-full" placeholder="اختر المجموعة" :search-input="{
                placeholder: 'بحث...',
                icon: 'i-lucide-search',
              }" />
          </UFormField>
        </div>
        <div class="flex gap-4">
          <UFormField label="تاريخ الحصة" class="w-full" placeholder="تاريخ الحصة" name="date">
            <UInput required v-model="state.date" type="date" placeholder="اختر التاريخ" class="w-full" />
          </UFormField>
          <UFormField label=" الموعد" class="w-full" placeholder="اختر الموعد" name="schedule_id"
            v-if="showScheduleModal">
            <USelectMenu required dir="rtl" v-model="state.schedule_id" :items="schedules" class="w-full"
              placeholder="اختر الموعد" />
          </UFormField>


        </div>
        <UFormField label="تفاصيل الحصة" placeholder="تفاصيل الحصة" name="name">
          <!-- <Editor required v-model="state.content" class="w-full" /> -->
          <Editor id="uuid" api-key="zirk96xgerhvi8vwxd6owc1ygee2fty3trxlpzeg72ax69mx" v-model="state.content"
            :init="initOptions" />
        </UFormField>

        <div class="flex justify-end gap-2" dir="ltr">
          <UButton label="اغلاق" color="neutral" variant="subtle" size="xl" @click="router.go(-1)" />
          <UButton label="حفظ" color="primary" variant="solid" type="submit" loading-auto @click="onSubmit" />
        </div>
      </UForm>
    </template>
  </UDashboardPanel>
</template>
