<template>
  <v-container class="py-8" theme="light" fluid>
    <v-card outlined class="elevation-1 pa-0">
      <!-- HEADER -->
      <div
        class="d-flex justify-space-between align-center px-4 py-4 flex-wrap"
      >
        <h2 class="text-h5 font-weight-600">Datasets</h2>
        <!-- SEARCH BAR -->
        <div
          class="d-flex align-center"
          style="gap: 12px; flex: 1; justify-content: flex-end"
        >
          <v-text-field
            v-model="searchQuery"
            placeholder="Search"
            density="compact"
            variant="outlined"
            class="search-clean"
            hide-details
          >
            <template #prepend-inner>
              <span class="material-symbols-outlined search-icon">
                search
              </span>
            </template>
          </v-text-field>

          <v-btn
            variant="text"
            color="primary"
            class="add-icon-btn"
            @click="$router.push('/admin/datasets/add')"
          >
            <span class="material-symbols-outlined">add_circle</span>
          </v-btn>
        </div>
      </div>
      <!-- REUSABLE TABLE -->
      <!-- <BaseTable
        embedded
        :columns="columns"
        :data="filteredDatasets"
        :loading="loading"
        show-actions
        server-pagination
        :page="page"
        :items-per-page="itemsPerPage"
        :total-items="totalItems"
        :actions-cols="2"
        empty-text="No matching datasets found."
        @update:page="onPageChange"
        @update:items-per-page="onItemsPerPageChange"
        @update:sort="onSortChange"  
      > -->
      <BaseTable
        :columns="columns"
        :data="filteredDatasets"
        :page="page"
        :items-per-page="itemsPerPage"
        :total-items="totalItems"
        :loading="loading"
        @update:page="page = $event"
        @update:itemsPerPage="itemsPerPage = $event"
        @update:sort="onSortChange"
      >
        <template #item.name="{ item }">
          <span class="dataset-name" @click.stop="goToDetails(item)">
            {{ item.name }}
          </span>
        </template>

        <template #item.description="{ item }">
          {{ item.description }}
        </template>

        <template #item.createdAt="{ item }">
          <span>{{ formatDate(item.createdAt).date }}</span>
          <span class="d-block">
            {{ formatDate(item.createdAt).time }}
          </span>
        </template>

        <template #item.createdBy> Angelina </template>

        <template #item.storageType="{ item }">
          {{ item.storageType }}
        </template>

        <template #item.enablev3="{ item }">
          {{ item.enablev3 ? "V3" : "V2" }}
        </template>

        <template #item.actions="{ item }">
          <ActionIconButton type="edit" @click.stop="editDataset(item)" />
          <ActionIconButton type="manage" />
          <ActionIconButton type="delete" @click.stop="confirmDelete(item)" />
        </template>
      </BaseTable>
    </v-card>
  </v-container>
  <v-dialog v-model="deleteDialog" max-width="420">
    <v-card>
      <v-card-title class="text-h6 font-weight-medium">
        Confirm Deletion
      </v-card-title>

      <v-card-text>
        Are you sure you want to delete
        <strong>{{ datasetToDelete?.name }}</strong
        >?
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="deleteDialog = false"> Cancel </v-btn>
        <v-btn color="error" @click="deleteDataset"> Delete </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import BaseTable from "@/components/common/BaseTable.vue";

const store = useStore();

const searchQuery = ref("");
const loading = ref(false);

const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);

const sortKey = ref(null);
const sortDirection = ref(null);

const router = useRouter();

const datasets = computed(() => store.getters["dataset/datasets"] || []);
const pagination = computed(() => store.getters["dataset/pagination"] || {});

const filteredDatasets = computed(() => datasets.value);

const deleteDialog = ref(false);
const datasetToDelete = ref(null);

function confirmDelete(dataset) {
  datasetToDelete.value = dataset;
  deleteDialog.value = true;
}

async function deleteDataset() {
  if (!datasetToDelete.value?.id) return;

  try {
    await store.dispatch("dataset/removeDataset", datasetToDelete.value.id);

    // refresh table
    await fetchFromServer();
  } finally {
    deleteDialog.value = false;
    datasetToDelete.value = null;
  }
}

async function fetchFromServer() {
  loading.value = true;
  try {
    await store.dispatch("dataset/fetchDatasets", {
      page: page.value,
      pageSize: itemsPerPage.value,
      sortBy: sortKey.value,
      sortDirection: sortDirection.value,
      search: searchQuery.value || null,
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

// Refetch when search changes
watch(searchQuery, () => {
  debouncedFetchFromServer();
});

function onSortChange({ key, direction }) {
  sortKey.value = key;
  sortDirection.value = direction;
  page.value = 1;
  fetchFromServer();
}

function goToDetails(dataset) {
  router.push(`/admin/datasets/details/${dataset.uuid}`);
}

function editDataset(dataset) {
  router.push(`/admin/datasets/${dataset.uuid}/edit`);
}

function formatDate(ts) {
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

function debounce(fn, delay = 300) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const debouncedFetchFromServer = debounce(() => {
  page.value = 1;   
  fetchFromServer();
}, 400);



const columns = [
  { label: "Name", key: "name", sortable: true },
  { label: "Description", key: "description" },
  { label: "Created At", key: "createdAt", sortable: true },
  { label: "Created By", key: "createdBy", sortable: true },
  { label: "Storage", key: "storageType", sortable: true },
  { label: "Data Import Version", key: "enablev3", sortable: true },
  { label: "Actions", key: "actions", sortable: false },
];
</script>

<style scoped>
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

.dataset-name {
  color: #1565c0;
  font-weight: 500;
  cursor: pointer;
}

.dataset-name:hover {
  color: #0d47a1;
  text-decoration: underline;
}
</style>
