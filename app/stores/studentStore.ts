import { defineStore } from "pinia";
import { ref } from "vue";

export const useStudentStore = defineStore("student", () => {
  const api = useApi();

  const items = ref<object[]>([]);
  const studentOptions = ref<object[]>([]);
  const selectedIds = ref<number[]>([]);
  const deleteModalOpen = ref(false);
  const idsToDelete = ref<number[]>([]);
  const editModalOpen = ref(false);
  const editItem = ref({});
  const item = ref({});
  const information = ref({});
  const isItemLoading = ref(false);
  // Pagination state — optional if you want to track for UI
  const pagination = ref({
    page: 1,
    pageCount: 1,
    pageSize: 10,
    total: 0,
  });

  // Load all pages from backend, combine all items into one array
  async function loadAllStudents(
    page = 1,
    params = null,
    search = null,
    limit = null
  ) {
    isItemLoading.value = true;
    items.value = []; // clear current items

    const relations = "parent";

    if (params || search) {
      page = 1; // Reset to first page if params or search are provided
    }

    let url = `student?page=${page}`;

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

    if (search) {
      const filterEntries = Object.entries(search).map(
        ([key, value]) => `[${key},${value}]`
      );
      const filterParam = `search=[${filterEntries.join(",")}]`;
      url += `&${filterParam}`;
    }

    if (limit) {
      url += `&per_page=${limit}`;
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

  async function loadStudents(search = null, limit = null) {
    items.value = []; // clear current items

    const res = await api(`student/all?search=${search}&limit=${limit}`);
    const json = await res.json();

    if (json?.data) {
      items.value = json.data;
    }
  }

  async function loadOneStudent(id = null) {
    isItemLoading.value = true;
    item.value = []; // clear current items

    const res = await api(
      `student/${id}?relations=groups.teacher,groups.course`
    );
    const json = await res.json();

    if (json?.data) {
      item.value = json.data;
    }
    isItemLoading.value = false;
  }

  async function loadInformation(id = null) {
    isItemLoading.value = true;

    information.value = []; // clear current items

    const res = await api(`student/information/${id}`);
    const json = await res.json();

    if (json?.data) {
      information.value = json.data;
    }
    isItemLoading.value = false;
  }

  async function loadStudentsForSelect(search = null) {
    try {
      const response = await api(`student/all?search=${search || ""}`);

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
      studentOptions.value = json.data;
    } catch (error) {
      console.error("Error loading courses:", error);
      return [];
    }
  }

  async function loadStudentNotHaveResult(exam_id = null) {
    try {
      const response = await api(
        `student/not-have-exam-result?exam_id=${exam_id || ""}`
      );

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
      studentOptions.value = json.data;
    } catch (error) {
      console.error("Error loading courses:", error);
      return [];
    }
  }

  async function addStudent(data) {
    const res = await api(`student`, {
      method: "POST",
      body: data,
    });

    if (res.ok) {
      // await loadAllStudents();
    } else {
      throw new Error("Failed to delete groups");
    }
  }

  async function addEnrollment(data) {
    const res = await api(`enrollment`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async function enrollmentStatusChange(data) {
    const res = await api(`enrollment/change-status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async function deleteEnrollment(data) {
    const res = await api(`enrollment/delete`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async function editStudent(data, id) {
    const res = await api(`student/${id}`, {
      method: "POST",
      body: data,
    });

    if (res.ok) {
      await loadAllStudents();
      editModalOpen.value = false;
    } else {
      throw new Error("Failed to delete groups");
    }
  }

  // Delete selected Students from backend, then update local items and selection
  async function deleteSelectedStudents() {
    if (selectedIds.value.length === 0) return;

    const res = await api(`student/delete-all`, {
      method: "POST", // Adjust method as your API requires
      body: JSON.stringify({ ids: selectedIds.value }),
    });

    if (res.ok) {
      // Remove deleted items locally
      items.value = items.value.filter(
        (item) => !selectedIds.value.includes(item.id)
      );
      await loadAllStudents();
      deleteModalOpen.value = false;
      clearSelection();
    } else {
      throw new Error("Failed to delete Students");
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
    studentOptions,
    selectedIds,
    deleteModalOpen,
    idsToDelete,
    pagination,
    editModalOpen,
    editItem,
    item,
    information,
    isItemLoading,
    loadStudentNotHaveResult,
    loadInformation,
    deleteEnrollment,
    enrollmentStatusChange,
    loadOneStudent,
    addEnrollment,
    addStudent,
    editStudent,
    loadAllStudents,
    loadStudents,
    loadStudentsForSelect,
    toggleId,
    addId,
    removeId,
    clearSelection,
    deleteSelectedStudents,
  };
});
