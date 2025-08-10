import { defineStore } from "pinia";
import { ref } from "vue";

export const useSessionStore = defineStore("session", () => {
  const api = useApi();

  const items = ref<object[]>([]);
  const sessionOptions = ref<object[]>([]);
  const selectedIds = ref<number[]>([]);
  const deleteModalOpen = ref(false);
  const idsToDelete = ref<number[]>([]);
  const editModalOpen = ref(false);
  const editItem = ref({});
  const isItemLoading = ref(false);
  const showItem = ref({});
  const showModalOpen = ref(false);

  // Pagination state — optional if you want to track for UI
  const pagination = ref({
    page: 1,
    pageCount: 1,
    pageSize: 10,
    total: 0,
  });

  // Load all pages from backend, combine all items into one array
  async function loadAllSessions(page = 1, params = null) {
    isItemLoading.value = true;
    items.value = []; // clear current items

    let url = `session?relations=group,teacher,schedule&page=${page}`;

    if (params) {
      const filterEntries = Object.entries(params).map(
        ([key, value]) => `[${key},${value}]`
      );
      const filterParam = `filters=[${filterEntries.join(",")}]`;
      url += `&${filterParam}`;
    }

    const res = await api(url);
    const json = await res.json();

    if (json?.data) {
      items.value = json?.data?.data;

      // Update pagination info from last response
      pagination.value.page = json.data.current_page;
      pagination.value.pageCount = json.data.last_page;
      pagination.value.pageSize = json.data.per_page;
      pagination.value.total = json.data.total;
    }

    isItemLoading.value = false;
  }

  async function loadSessions(search = null) {
    items.value = []; // clear current items

    const res = await api(`session/all?search=${search}`);
    const json = await res.json();

    if (json?.data) {
      items.value = json.data;
    }
  }

  async function addSession(data) {
    const res = await api(`session`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      await loadAllSessions();
    } else {
      throw new Error("Failed to delete groups");
    }
  }

  async function editSession(data, id) {
    const res = await api(`session/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      await loadAllSessions();
      editModalOpen.value = false;
    } else {
      throw new Error("Failed to delete groups");
    }
  }

  // Delete selected sessions from backend, then update local items and selection
  async function deleteSelectedsessions() {
    if (selectedIds.value.length === 0) return;

    const res = await api(`session/delete-all`, {
      method: "POST", // Adjust method as your API requires
      body: JSON.stringify({ ids: selectedIds.value }),
    });

    if (res.ok) {
      // Remove deleted items locally
      items.value = items.value.filter(
        (item) => !selectedIds.value.includes(item.id)
      );
      await loadAllSessions();
      deleteModalOpen.value = false;
      clearSelection();
    } else {
      throw new Error("Failed to delete sessions");
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
    sessionOptions,
    selectedIds,
    deleteModalOpen,
    idsToDelete,
    pagination,
    editModalOpen,
    editItem,
    isItemLoading,
    showItem,
    showModalOpen,
    editSession,
    addSession,
    loadAllSessions,
    loadSessions,
    toggleId,
    addId,
    removeId,
    clearSelection,
    deleteSelectedsessions,
  };
});
