<script setup lang="ts">
import { useRoute } from "vue-router";
import Qrcode from "qrcode.vue"; // QR Code component
import { computed } from "vue";

const props = defineProps<{
  student: any; // use `any` or define a type if available
}>();

const route = useRoute();
const studentId = route.params.id;
const config = useRuntimeConfig();

const qrValue = computed(() => {
  return studentId;
});

const redirectToPrint = (studentId: string) => {
  // Redirect to the print page with the student ID
  window.location.href = `${config.public.NUXT_PUBLIC_SITE_URL}/student-card/${studentId}/pdf`;
  // window.open(`${config.public.NUXT_PUBLIC_SITE_URL}/student-card/${studentId}/pdf`, "_blank");
};
</script>

<template>
  <div class="student-card" v-if="props.student" dir="rtl">
    <!-- Card Container -->
    <div class="card bg-elevated/50" id="student-card">
      <!-- Student Image in the middle -->
      <div class="image-container">
        <img
          v-if="props.student?.image"
          :src="props.student?.image"
          :alt="props.student?.name"
          class="student-image"
        />
        <img
          v-else
          src="assets/images/agency.png"
          :alt="props.student?.name"
          class="student-image"
        />
      </div>

      <!-- Student Details -->
      <div class="details text-black dark:text-white">
        <h2 class="student-name text-3xl">{{ props.student?.name }}</h2>
        <p class="text-xl">
          <strong class="font-bold text-warning">رقم الجوال:</strong>
          {{ props.student?.phone }}
        </p>
        <p class="text-xl">
          <strong class="font-bold text-error"> ولي الامر:</strong>
          {{ props.student?.parent?.name }}
        </p>
        <p class="text-xl">
          <strong class="font-bold text-primary">الصف الدراسي:</strong>
          {{ props.student?.grade_level }}
        </p>
      </div>

      <!-- QR Code Section -->
      <div class="qr-code">
        <!-- <h3>QR Code</h3> -->
        <!-- <qrcode :value="qrValue" size="200" /> -->
        <img :src="props.student?.qr" alt="QR Code" size="200" />
      </div>

      <!-- Print Button -->
      <UButton
        color="primary"
        target="_blank"
        variant="solid"
        @click="redirectToPrint(props.student.id)"
      >
        تحميل بطاقة الطالب
      </UButton>
    </div>
  </div>
</template>

<style scoped>
/* Card container */
.student-card {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  /* background-color: #f9f9f9; */
}

.card {
  /* width: 50%; */
  height: 650px;
  padding: 20px;
  /* background-color: gray; */
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Image container */
.image-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20px;
}

.student-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* Student details */
.details {
  margin-bottom: 20px;
}

.student-name {
  font-weight: bold;
  margin-bottom: 10px;
  /* color: #000; */
}

.details p {
  padding: 10px;
  /* color: #000; */
}

/* QR Code section */
.qr-code {
  margin-bottom: 50px;
}

/* Print Button */
.print-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 5px;
  cursor: pointer;
}

.print-button:hover {
  background-color: #0056b3;
}
</style>
