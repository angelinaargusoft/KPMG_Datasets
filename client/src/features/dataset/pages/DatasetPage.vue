<template>
  <v-container class="dataset-container py-8" theme="light" fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5 font-weight-bold">Datasets</h2>
      <v-btn
        color="primary"
        prepend-icon="mdi-database-plus"
        @click="$router.push('/admin/datasets/add')"
      >
        Add Dataset
      </v-btn>
    </div>
    <!-- Search -->
    <v-row class="mb-4" dense>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Search datasets..."
          dense
          outlined
          append-icon="mdi-magnify"
          clearable
        />
      </v-col>
    </v-row>
    <!-- REUSABLE TABLE -->
    <BaseTable
      :columns="columns"
      :data="filteredDatasets"
      :loading="loading"
      show-actions
      empty-text="No matching datasets found."
    >
      <template #rows>
        <DatasetRow
          v-for="dataset in filteredDatasets"
          :key="dataset.id"
          :dataset="dataset"
          @view="handleView"
        />
      </template>
    </BaseTable>
  </v-container>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import DatasetRow from "../components/DatasetRow.vue";
import BaseTable from "@/components/common/BaseTable.vue";
const store = useStore();
const searchQuery = ref("");
const loading = ref(false);
// Fetch datasets
onMounted(async () => {
  loading.value = true;
  await store.dispatch("dataset/fetchDatasets");
  loading.value = false;
});
// Table column definitions
const columns = [
  { label: "Name", key: "name", cols: 2 },
  { label: "Description", key: "description", cols: 3 },
  { label: "Created At", key: "createdAt", cols: 1 },
  { label: "Created By", key: "createdBy", cols: 2 },
  { label: "Storage", key: "storage", cols: 1 },
  { label: "Data Import", key: "import", cols: 1 },
];
// Dataset data
const datasets = computed(() => store.getters["dataset/datasets"] || []);
const filteredDatasets = computed(() => {
  if (!searchQuery.value) return datasets.value;
  const q = searchQuery.value.toLowerCase();
  return datasets.value.filter((d) =>
    Object.values(d).join(" ").toLowerCase().includes(q)
  );
});
function handleView(dataset) {
  alert(`Viewing dataset: ${dataset.name}`);
}
</script>
<style scoped>
.dataset-container {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>