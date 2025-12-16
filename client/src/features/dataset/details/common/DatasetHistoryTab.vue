<template>
  <div>
    <!-- SEARCH BAR -->
    <div
      class="d-flex justify-end align-center ma-8 flex-wrap"
      style="gap: 12px"
    >
      <v-text-field
        v-model="searchQuery"
        placeholder="Search history"
        density="compact"
        variant="outlined"
        class="file-search"
        hide-details
        aria-label="Search upload history"
      >
        <template #prepend-inner>
          <span class="material-symbols-outlined search-icon"> search </span>
        </template>
      </v-text-field>
    </div>

    <!-- HISTORY TABLE -->
    <BaseTable
      :columns="columns"
      :data="tableItems"
      :page="page"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loading"
      @update:page="onPageChange"
      @update:itemsPerPage="onItemsPerPageChange"
      @update:sort="onSortChange"
    >
      <template #item.uploadedAt="{ item }">
        <div class="d-flex flex-column">
          <span>{{ formatDate(item.uploadedAt).date }}</span>
          <span>
            {{ formatDate(item.uploadedAt).time }}
          </span>
        </div>
      </template>
      <template #item.fileName="{ item }">
        {{ item.name }}
      </template>
      <template #item.sha256="{ item }">
        {{ item.sha256 }}
      </template>

      <template #item.md5="{ item }">
        {{ item.md5 }}
      </template>

      <template #item.lineCount="{ item }">
        {{ item.lineCount }}
      </template>

      <template #item.sizeBytes="{ item }">
        {{ formatSize(item.sizeBytes ?? item.size) }}
      </template>

      <template #item.uploadedTo="{ item }">
        {{ item.uploadedTo }}
      </template>
    </BaseTable>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useStore } from "vuex";
import BaseTable from "@/components/common/BaseTable.vue";

const props = defineProps({
  datasetUuid: {
    type: String,
    required: true,
  },
});

const store = useStore();

const searchQuery = ref("");

const page = ref(1);
const itemsPerPage = ref(10);

const sortKey = ref(null);
const sortDirection = ref(null);

const pagination = computed(
  () => store.getters["datasetFileUpload/pagination"] || null
);

watch(
  pagination,
  (val) => {
    if (!val) return;
    page.value = val.page || 1;
    itemsPerPage.value = val.pageSize || 10;
  },
  { immediate: true }
);

const totalItems = computed(() => pagination.value?.totalItems || 0);
const files = computed(() => store.getters["datasetFileUpload/files"] || []);
const loading = computed(() => store.getters["datasetFileUpload/loading"]);
const tableItems = computed(() => files.value);

const columns = [
  { label: "Uploaded At", key: "uploadedAt", sortable: true },
  { label: "File Name", key: "fileName", sortable: true },
  { label: "SHA256", key: "sha256", sortable: true },
  { label: "MD5", key: "md5", sortable: true },
  { label: "Line Count", key: "lineCount", sortable: true },
  { label: "Size (bytes)", key: "sizeBytes", sortable: true },
  { label: "Uploaded to", key: "uploadedTo", sortable: true },
];

async function fetchFromServer(
  newPage = page.value,
  newPageSize = itemsPerPage.value,
  newSortKey = sortKey.value,
  newSortDirection = sortDirection.value,
  search = searchQuery.value
) {
  await store.dispatch("datasetFileUpload/fetchDatasetFiles", {
    datasetUUID: props.datasetUuid,
    page: newPage,
    pageSize: newPageSize,
    sortBy: newSortKey,
    sortDirection: newSortDirection,
    search: search || null,
  });
}

async function onPageChange(newPage) {
  page.value = newPage;
  await fetchFromServer(newPage, itemsPerPage.value);
}

async function onItemsPerPageChange(newSize) {
  itemsPerPage.value = newSize;
  page.value = 1;
  await fetchFromServer(1, newSize);
}

async function onSortChange({ key, direction }) {
  sortKey.value = key;
  sortDirection.value = direction;
  page.value = 1;
  await fetchFromServer(1, itemsPerPage.value, key, direction);
}

watch(searchQuery, () => {
  debouncedFetchFromServer();
});

function debounce(fn, delay = 400) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const debouncedFetchFromServer = debounce(() => {
  page.value = 1;
  fetchFromServer();
}, 400);

function formatDate(ts) {
  if (!ts) return { date: "", time: "" };
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString("en-GB"),
    time: d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

function formatSize(bytes) { 
  if (!bytes && bytes !== 0) return "—"; 
  if (bytes < 1024) return `${bytes} B`; 
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`; 
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; 
}

onMounted(() => {
  fetchFromServer(1, itemsPerPage.value);
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
