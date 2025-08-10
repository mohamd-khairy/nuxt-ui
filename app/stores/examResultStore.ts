import { defineStore } from "pinia";
import { ref } from "vue";

export const useExamResultStore = defineStore("examResult", () => {
  const api = useApi();

  const items = ref<object[]>([]);
  const examResultOptions = ref<object[]>([]);
  const selectedIds = ref<number[]>([]);
  const deleteModalOpen = ref(false);
  const idsToDelete = ref<number[]>([]);
  const editModalOpen = ref(false);
  const editItem = ref({});
  const showExamResultItem = ref({});
  const showExamResultModalOpen = ref(false);
const isItemLoading = ref(false);
  // Pagination state — optional if you want to track for UI
  const pagination = ref({
    page: 1,
    pageCount: 1,
    pageSize: 10,
    total: 0,
  });

  // Load all pages from backend, combine all items into one array
  async function loadAllExamResults(page = 1, params = null) {
    isItemLoading.value = true;
    items.value = []; // clear current items

    const relations = "exam,student";

    let url = `examResult?page=${page}`;

    if (relations) {
      url += `&relations=${relations}`;
    }

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
      items.value = json.data.data;

      // Update pagination info from last response
      pagination.value.page = json.data.current_page;
      pagination.value.pageCount = json.data.last_page;
      pagination.value.pageSize = json.data.per_page;
      pagination.value.total = json.data.total;
    }

    isItemLoading.value = false;
  }

  async function loadExamResults(search = null) {
    items.value = []; // clear current items

    const res = await api(`examResult/all?search=${search}`);
    const json = await res.json();

    if (json?.data) {
      items.value = json.data;
    }
  }

  async function loadExamResultsForSelect(search = null) {
    try {
      const response = await api(`examResult/all?search=${search || ""}`);

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
      examResultOptions.value = json.data.map(
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

  async function addExamResult(data) {
    const res = await api(`examResult`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      await loadAllExamResults();
    } else {
      throw new Error("Failed to delete groups");
    }
  }

  async function editExamResult(data, id) {
    const res = await api(`examResult/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      await loadAllExamResults();
      editModalOpen.value = false;
    } else {
      throw new Error("Failed to delete groups");
    }
  }

  // Delete selected Exams from backend, then update local items and selection
  async function deleteSelectedExamResults() {
    if (selectedIds.value.length === 0) return;

    const res = await api(`examResult/delete-all`, {
      method: "POST",
      body: JSON.stringify({ ids: selectedIds.value }),
    });

    if (res.ok) {
      // Remove deleted items locally
      items.value = items.value.filter(
        (item) => !selectedIds.value.includes(item.id)
      );
      await loadAllExamResults();
      deleteModalOpen.value = false;
      clearSelection();
    } else {
      throw new Error("Failed to delete Exams");
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
    examResultOptions,
    selectedIds,
    deleteModalOpen,
    idsToDelete,
    pagination,
    editModalOpen,
    editItem,
    showExamResultItem,
    showExamResultModalOpen,
    isItemLoading,
    addExamResult,
    editExamResult,
    loadAllExamResults,
    loadExamResults,
    loadExamResultsForSelect,
    toggleId,
    addId,
    removeId,
    clearSelection,
    deleteSelectedExamResults,
  };
});
