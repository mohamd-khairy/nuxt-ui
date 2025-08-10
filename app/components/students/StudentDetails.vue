<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import AddModal from "~/components/students/AddModal.vue";

const emit = defineEmits(["updateStudent", "addStudent", "close"]);

const authStore = useAuthStore();
const studentStore = useStudentStore();

const props = defineProps<{
  student: object;
}>();

const route = useRoute();
const studentId = computed(() => route.params.id as string);

const links = computed(() => {
  // Define the links that need permission check
  const allLinks = [
    {
      label: "بيانات الطالب",
      icon: "i-lucide-user",
      to: `/students/${studentId.value}`,
      exact: true,
      permission: "read-student",
    },
    {
      label: "QR Code",
      icon: "i-lucide-qr-code",
      to: `/students/${studentId.value}/qr`,
      permission: "read-student",
    },
    {
      label: "ولي الامر",
      icon: "i-lucide-user",
      to: `/students/${studentId.value}/parent`,
      permission: "read-student-parent",
    },
    {
      label: "المجموعات",
      icon: "i-lucide-folders",
      to: `/students/${studentId.value}/groups`,
      permission: "read-student-group",
    },
    {
      label: "الاختبارات",
      icon: "i-lucide-bell",
      to: `/students/${studentId.value}/exams`,
      permission: "read-student-exam",
    },
    {
      label: "الحضور والغياب",
      icon: "i-lucide-shield",
      to: `/students/${studentId.value}/attendance`,
      permission: "read-student-attendance",
    },
    {
      label: "المدفوعات",
      icon: "i-lucide-dollar-sign",
      to: `/students/${studentId.value}/payments`,
      permission: "read-student-payment",
    },
  ];

  // Filter the links based on user's permissions
  const filteredLinks = allLinks.filter((link) => {
    if (
      link.permission == "read-student-parent" &&
      props.student?.parent == null
    )
      return false;
    if (
      link.permission == "read-student-payment" &&
      props.student?.payments?.length == 0
    )
      return false;
    if (
      link.permission == "read-student-exam" &&
      props.student?.groups?.length == 0
    )
      return false;
    if (
      link.permission == "read-student-attendance" &&
      props.student?.groups?.length == 0
    )
      return false;

    // Check if user has the permission for the link
    return authStore.permissions.includes(link.permission);
  });

  // Return the filtered links
  return [filteredLinks]; // Returning the links wrapped in an array, similar to your original structure
});

function handleUpdateStudent(updatedStudent: object) {
  emit("updateStudent", updatedStudent);
}

function handleAddStudent(addStudent: object) {
  // Logic to add a new student
  emit("addStudent", addStudent);
}
</script>

<template>
  <UDashboardPanel id="inbox-2">
    <template #header>
      <UDashboardNavbar
        :title="`الطالب:  ${student?.name || ''}`"
        :toggle="true"
      >
        <template #leading> </template>

        <template #right>
          <AddModal @addStudent="handleAddStudent" />
          <!-- <Communication /> -->

          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            class="-ms-1.5"
            @click="emit('close')"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar v-if="!studentStore.isItemLoading" dir="rtl">
        <UNavigationMenu
          :items="links"
          highlight
          class="-mx-1 flex-1 font-bold"
        />
      </UDashboardToolbar>
    </template>
    <template #body v-if="!studentStore.isItemLoading">
      <div
        class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-4xl mx-auto"
      >
        <NuxtPage :student="student" @updateStudent="handleUpdateStudent" />
      </div>
    </template>
    <template #body v-else>
      <div
        class="hidden lg:flex flex-col items-center justify-center flex-1 gap-4 text-center p-8"
      >
        <span
          class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"
        >
        </span>
        <p class="text-gray-700 dark:text-gray-300 text-sm">
          جاري تحميل البيانات...
        </p>
      </div>
    </template>
  </UDashboardPanel>
</template>
