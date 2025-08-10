<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const config = useRuntimeConfig();

definePageMeta({
  permission: "read-student-payment",
});
const props = defineProps<{
  student: any; // use `any` or define a type if available
}>();

const getColorByStatus = (status) => {
  return {
    paid: "success",
    cancelled: "error",
    pending: "warning",
  }[status];
};

const getStatus = (status) => {
  return {
    paid: "تم الدفع",
    cancelled: "لم يتم الدفع",
    pending: "في انتظار الدفع",
  }[status];
};

const columns: TableColumn<Payment>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => `#${row.getValue("id")}`,
  },
  {
    accessorKey: "created_at",
    header: "تاريخ الدفع",
    cell: ({ row }) => {
      return new Date(row.getValue("created_at")).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },
  },
  {
    accessorKey: "status",
    header: "حالة الدفع",
    cell: ({ row }) => {
      const state = row.getValue("status");
      const color = getColorByStatus(state);
      return h(
        UBadge,
        {
          color: color,
          class: "capitalize",
        },
        () => getStatus(state)
      );
    },
  },
  {
    accessorKey: "method",
    header: "طريقة الدفع",
  },
  {
    accessorKey: "amount",
    header: "قيمة الدفع",
    header: () => h("div", { class: "text-right" }, "قيمة الدفع"),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"));

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EGP",
      }).format(amount);

      return h("div", { class: "text-right font-medium" }, formatted);
    },
  },
  {
    id: "note",
    accessorKey: "note",
    header: "الملاحظات",
  },
  {
  id: "actions",
  accessorKey: "actions",
  header: "الاجراءات",
  cell: ({ row }) => {
    // Define your condition here. For example, disable the button if the row's status is "paid".
    const isDisabled = row.getValue("status") === "paid"; // Replace 'status' with the actual field name

    // Set button color to 'success' when enabled, 'neutral' when disabled
    const buttonColor = !isDisabled ? "neutral" : "success";  // Change color based on condition

    return h(
      UButton,
      {
        color: buttonColor,  // Dynamically set the color based on the condition
        variant: "soft",
        icon: "i-lucide-dollar-sign",
        class: "cursor-pointer",
        onClick: () => {
          if (isDisabled) {
            // Handle the action if not disabled
            window.location.href = `${
              config.public.NUXT_PUBLIC_SITE_URL
            }/student-invoice/${row.getValue("id")}/pdf`;
          }
        },
        disabled: !isDisabled, // Disable button if condition is true
      },
      () => "الفاتورة"
    );
  },
}

];
</script>

<template>
  <UTable
    :data="props.student.payments"
    :columns="columns"
    class="w-full"
    dir="rtl"
  ></UTable>
</template>
