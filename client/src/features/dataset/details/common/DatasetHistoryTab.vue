<template>
      <!-- SEARCH -->
      <div
        class="d-flex justify-end align-center ma-8 flex-wrap"
        style="gap: 12px"
      >
        <v-text-field
          v-model="historySearchQuery"
          placeholder="Search history"
          density="compact"
          variant="outlined"
          class="file-search"
          hide-details
        >
          <template #prepend-inner>
            <span class="material-symbols-outlined search-icon">
              search
            </span>
          </template>
        </v-text-field>
      </div>
  
      <!-- HISTORY TABLE -->
      <BaseTable
        :columns="historyColumns"
        :data="filteredHistory"
        :loading="loadingHistory"
        empty-text="No upload history found"
        :server-pagination="true"
        :page="historyPage"
        :items-per-page="historyItemsPerPage"
        :total-items="historyTotalItems"
        @update:page="handleHistoryPageChange"
        @update:itemsPerPage="handleHistoryItemsPerPageChange"
      >
        <template #rows="{ items }">
          <!-- replace this with a dedicated HistoryRow component later -->
          <tr v-for="row in items" :key="row.uuid || row.id || row.fileName">
          </tr>
        </template>
      </BaseTable>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue";
  import { useStore } from "vuex";
  import BaseTable from "@/components/common/BaseTable.vue";
  
  const props = defineProps({
    datasetUuid: {
      type: String,
      required: true,
    },
  });
  
  const store = useStore();
  
  // Search for history
  const historySearchQuery = ref("");
  
  // Pagination for history
  const historyPage = ref(1);
  const historyItemsPerPage = ref(10);
  
  // History data from store (temp)
  const historyPagination = computed(
    () => store.getters["datasetHistory/pagination"] || null
  );
  const historyTotalItems = computed(
    () => historyPagination.value?.totalItems || 0
  );
  
  const historyList = computed(
    () => store.getters["datasetHistory/items"] || []
  );
  
  const loadingHistory = computed(
    () => store.getters["datasetHistory/loading"]
  );
  
  // Columns for history tab
  const historyColumns = [
    { label: "Uploaded At", key: "uploadedAt", cols: 2, sortable: true },
    { label: "File Name", key: "fileName", cols: 2, sortable: true },
    { label: "SHA256", key: "sha256", cols: 1, sortable: true },
    { label: "MD5", key: "md5", cols: 1, sortable: true },
    { label: "Line Count", key: "lineCount", cols: 2, sortable: true },
    { label: "Size (bytes)", key: "sizeBytes", cols: 2, sortable: true },
    { label: "Uploaded to", key: "uploadedTo", cols: 2, sortable: true },
  ];
  
  // Filtered list for history
  const filteredHistory = computed(() => {
    if (!historySearchQuery.value) return historyList.value;
  
    const q = historySearchQuery.value.toLowerCase();
  
    return historyList.value.filter((h) =>
      [
        h.uploadedAt,
        h.fileName,
        h.sha256,
        h.md5,
        h.lineCount,
        h.sizeBytes,
        h.uploadedTo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });
  
  // Handlers for history pagination
  async function handleHistoryPageChange(newPage) {
    historyPage.value = newPage;
    await store.dispatch("datasetHistory/fetchHistory", {
      datasetUUID: props.datasetUuid,
      page: newPage,
      pageSize: historyItemsPerPage.value,
    });
  }
  
  async function handleHistoryItemsPerPageChange(newItemsPerPage) {
    historyItemsPerPage.value = newItemsPerPage;
    historyPage.value = 1;
    await store.dispatch("datasetHistory/fetchHistory", {
      datasetUUID: props.datasetUuid,
      page: 1,
      pageSize: newItemsPerPage,
    });
  }
  
  onMounted(async () => {
    await store.dispatch("datasetHistory/fetchHistory", {
      datasetUUID: props.datasetUuid,
      page: historyPage.value,
      pageSize: historyItemsPerPage.value,
    });
  });
  </script>
  
  <style scoped>
  .file-search {
    min-width: 140px;
    max-width: 260px;
  }
  
  .file-search .v-field {
    border-radius: 8px !important;
  }
  </style>
  