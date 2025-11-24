<template>
  <v-container class="dataset-container py-8" theme="light" fluid>
    <v-card outlined class="elevation-1 pa-0">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center px-4 py-4 flex-wrap">
        <h2 class="text-h5 font-weight-600">Datasets</h2>

        <div class="d-flex align-center" style="gap: 12px; flex: 1; justify-content: flex-end;">
          <v-text-field v-model="searchQuery" placeholder="Search" density="compact" variant="outlined"
            class="search-clean" hide-details>
            <template #prepend-inner>
              <span class="material-symbols-outlined search-icon">
                search
              </span>
            </template>
          </v-text-field>

          <v-btn variant="text" color="primary" class="add-icon-btn" @click="$router.push('/admin/datasets/add')">
            <span class="material-symbols-outlined">add_circle</span>
          </v-btn>
        </div>
      </div>

      <!-- REUSABLE TABLE -->
      <BaseTable embedded :columns="columns" :data="filteredDatasets" :loading="loading" show-actions server-pagination
        :page="page" :items-per-page="itemsPerPage" :total-items="totalItems" @update:page="page = $event"
        @update:items-per-page="itemsPerPage = $event" :actions-cols="2" empty-text="No matching datasets found.">
        <template #rows="{ items }">
          <DatasetRow v-for="dataset in items" :key="dataset.id" :dataset="dataset" />
        </template>
      </BaseTable>
    </v-card>
  </v-container>
</template>


<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import DatasetRow from "../components/DatasetRow.vue";
import BaseTable from "@/components/common/BaseTable.vue";

const store = useStore();

const searchQuery = ref("");
const loading = ref(false);

// Pagination state for the table
const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);

// Raw datasets & pagination from store
const datasets = computed(() => store.getters["dataset/datasets"] || []);
const pagination = computed(() => store.getters["dataset/pagination"] || {});

// Filtered by search query (on current page data)
const filteredDatasets = computed(() => {
  if (!searchQuery.value) return datasets.value;

  const q = searchQuery.value.toLowerCase();

  return datasets.value.filter((d) =>
    Object.values(d).join(" ").toLowerCase().includes(q)
  );
});

// Fetch from server with current pagination
async function fetchFromServer() {
  loading.value = true;
  try {
    await store.dispatch("dataset/fetchDatasets", {
      page: page.value,
      pageSize: itemsPerPage.value, 
    });

    // Sync pagination from store
    totalItems.value = pagination.value.totalItems || 0;

    if (pagination.value.page) {
      page.value = pagination.value.page;
    }
    if (pagination.value.pageSize) {
      itemsPerPage.value = pagination.value.pageSize;
    }
  } finally {
    loading.value = false;
  }
}

// Initial fetch
onMounted(() => {
  fetchFromServer();
});

// Refetch whenever page or itemsPerPage changes
watch([page, itemsPerPage], () => {
  fetchFromServer();
});

// Table column definitions 
const columns = [
  { label: "Name", key: "name", cols: 2, sortable: true },
  { label: "Description", key: "description", cols: 2 },
  { label: "Created At", key: "createdAt", cols: 2, sortable: true },
  { label: "Created By", key: "createdBy", cols: 1 },
  { label: "Storage", key: "storageType", cols: 1, sortable: true },
  { label: "Data Import Version", key: "enablev3", cols: 2, sortable: true },
  // + Actions col from show-actions (2) = 12 total
];
</script>


<style scoped>
.dataset-container {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.search-clean {
  min-width: 140px;
  max-width: 280px;
}

.search-clean .v-field {
  border-radius: 8px !important;
}

.add-icon-btn {
  padding: 0 !important;
  min-width: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.add-icon-btn .material-symbols-outlined {
  font-size: 32px;
}
</style>
