<template>
  <div>
    <!-- SEARCH BAR -->
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
        @keyup.enter="triggerSearch"
        aria-label="Search upload history"
      >
        <template #prepend-inner>
          <span class="material-symbols-outlined search-icon"> search </span>
        </template>
      </v-text-field>
    </div>

    <!-- HISTORY TABLE -->
    <BaseTable
      :columns="historyColumns"
      :data="tableItems"
      :loading="loadingHistory"
      empty-text="No upload history found"
      :server-pagination="true"
      :page="historyPage"
      :items-per-page="historyItemsPerPage"
      :total-items="historyTotalItems"
      @update:page="handleHistoryPageChange"
      @update:items-per-page="handleHistoryItemsPerPageChange"
      @update:sort="handleHistorySortChange"
    >
      <template #rows="{ items }">
        <HistoryRow
          v-for="row in items"
          :key="row.uuid || row.id || row.fileName || row.filename"
          :row="row"
        />
      </template>
    </BaseTable>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useStore } from "vuex";
import BaseTable from "@/components/common/BaseTable.vue";
import HistoryRow from "./HistoryRow.vue";

const props = defineProps({
  datasetUuid: {
    type: String,
    required: true,
  },
});

const store = useStore();

const historySearchQuery = ref("");

const historyPage = ref(1);
const historyItemsPerPage = ref(10);

const historySortKey = ref(null);
const historySortDirection = ref(null);

const historyPagination = computed(
  () => store.getters["datasetFileUpload/pagination"] || null
);

watch(
  historyPagination,
  (val) => {
    if (!val) return;
    historyPage.value = val.page || 1;
    historyItemsPerPage.value = val.pageSize || 10;
  },
  { immediate: true }
);

const historyTotalItems = computed(() => historyPagination.value?.totalItems || 0);
const blobList = computed(() => store.getters["datasetFileUpload/files"] || []);
const loadingHistory = computed(() => store.getters["datasetFileUpload/loading"]);

const tableItems = computed(() => blobList.value);

const historyColumns = [
  { label: "Uploaded At", key: "uploadedAt", cols: 2, sortable: true },
  { label: "File Name", key: "fileName", cols: 2, sortable: true },
  { label: "SHA256", key: "sha256", cols: 1, sortable: true },
  { label: "MD5", key: "md5", cols: 1, sortable: true },
  { label: "Line Count", key: "lineCount", cols: 2, sortable: true },
  { label: "Size (bytes)", key: "sizeBytes", cols: 2, sortable: true },
  { label: "Uploaded to", key: "uploadedTo", cols: 2, sortable: true },
];

async function loadHistoryList(
  page = historyPage.value,
  pageSize = historyItemsPerPage.value,
  sortKey = historySortKey.value,
  sortDirection = historySortDirection.value,
  search = historySearchQuery.value
) {
  await store.dispatch("datasetFileUpload/fetchDatasetFiles", {
    datasetUUID: props.datasetUuid,
    page,
    pageSize,
    sortBy: sortKey,
    sortDirection: sortDirection,
    search: search || null,
  });
}

async function handleHistoryPageChange(newPage) {
  historyPage.value = newPage;
  await loadHistoryList(newPage, historyItemsPerPage.value);
}

async function handleHistoryItemsPerPageChange(newItemsPerPage) {
  historyItemsPerPage.value = newItemsPerPage;
  historyPage.value = 1;
  await loadHistoryList(1, newItemsPerPage);
}

async function handleHistorySortChange({key, direction}) {
  historySortKey.value = key;
  historySortDirection.value = direction;
  historyPage.value = 1;

  await loadHistoryList(1, historyItemsPerPage.value, key, direction);
}

function triggerSearch() {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = null;
  historyPage.value = 1;
  loadHistoryList(1, historyItemsPerPage.value, historySortKey.value, historySortDirection.value, historySearchQuery.value || null);
}

let searchDebounce = null;
watch(historySearchQuery, async (val) => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(async () => {
    historyPage.value = 1;
    await loadHistoryList(1, historyItemsPerPage.value);
  }, 500);
});

onMounted(async () => {
  await loadHistoryList(1, historyItemsPerPage.value);
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
