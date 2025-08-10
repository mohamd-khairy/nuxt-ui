import { defineStore } from "pinia";
import { ref } from "vue";

export const usePermissionStore = defineStore("permission", () => {
  const api = useApi();

  const items = ref<object[]>([]);
  const permissionOptions = ref<object[]>([]);
  const selectedIds = ref<number[]>([]);
  const deleteModalOpen = ref(false);
  const idsToDelete = ref<number[]>([]);
  const editModalOpen = ref(false);
  const editItem = ref({});

  // Pagination state — optional if you want to track for UI
  const pagination = ref({
    page: 1,
    pageCount: 1,
    pageSize: 10,
    total: 0,
  });

  // Load all pages from backend, combine all items into one array
  async function loadAllPermissions(page = 1) {
    items.value = []; // clear current items

    const res = await api(`permission?page=${page}`);
    const json = await res.json();

    if (json?.data) {
      items.value = json.data.data;

      // Update pagination info from last response
      pagination.value.page = json.data.current_page;
      pagination.value.pageCount = json.data.last_page;
      pagination.value.pageSize = json.data.per_page;
      pagination.value.total = json.data.total;
    }
  }

  async function loadPermissions(search = null) {
    items.value = []; // clear current items

    const res = await api(`permission/all?limit=all`);
    const json = await res.json();

    if (json?.data) {
      items.value = json.data;
    }
  }

  async function loadPermissionsForSelect(search = null) {
    try {
      const response = await api(`permission/all?search=${search || ""}`);

      if (!response.ok) {
        console.error("Failed to load courses:", response.statusText);
        return [];
      }

      const json = await response.json();

      // Assuming the API response has a structure like { data: [...] }
      if (!json.data || !Array.isArray(json.data)) {
        console.error("Invalid data format received");
        return [];
      }

      // Map data to the format expected by your select
      permissionOptions.value = json.data.map(
        (item: { id: number; name: string }) => ({
          label: item.name,
          value: String(item.id),
        })
      );
    } catch (error) {
      console.error("Error loading courses:", error);
      return [];
    }
  }

  async function addPermission(data) {
    const res = await api(`permission`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      await loadAllPermissions();
    } else {
      throw new Error("Failed to delete groups");
    }
  }

  async function editPermission(data, id) {
    const res = await api(`permission/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      await loadAllPermissions();
      editModalOpen.value = false;
    } else {
      throw new Error("Failed to delete groups");
    }
  }

  // Delete selected Permissions from backend, then update local items and selection
  async function deleteSelectedPermissions() {
    if (selectedIds.value.length === 0) return;

    const res = await api(`permission/delete-all`, {
      method: "POST", // Adjust method as your API requires
      body: JSON.stringify({ ids: selectedIds.value }),
    });

    if (res.ok) {
      // Remove deleted items locally
      items.value = items.value.filter(
        (item) => !selectedIds.value.includes(item.id)
      );
      await loadAllPermissions();
      deleteModalOpen.value = false;
      clearSelection();
    } else {
      throw new Error("Failed to delete Permissions");
    }
  }

  // Toggle selection for a single ID
  function toggleId(id: number) {
    if (selectedIds.value.includes(id)) {
      selectedIds.value = selectedIds.value.filter((i) => i !== id);
    } else {
      selectedIds.value.push(id);
    }
  }

  // Add an ID if not present
  function addId(id: number) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value.push(id);
    }
  }

  // Remove an ID if present
  function removeId(id: number) {
    selectedIds.value = selectedIds.value.filter((i) => i !== id);
  }

  // Clear all selections
  function clearSelection() {
    selectedIds.value = [];
  }

  return {
    items,
    permissionOptions,
    selectedIds,
    deleteModalOpen,
    idsToDelete,
    pagination,
    editModalOpen,
    editItem,
    addPermission,
    editPermission,
    loadAllPermissions,
    loadPermissions,
    loadPermissionsForSelect,
    toggleId,
    addId,
    removeId,
    clearSelection,
    deleteSelectedPermissions,
  };
});
