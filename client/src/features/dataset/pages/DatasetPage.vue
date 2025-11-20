<template>
  <v-container class="dataset-container py-8" theme="light" fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap">
      <h2 class="text-h5 font-weight-bold">Datasets</h2>

      <div class="d-flex align-center" style="gap: 12px; flex: 1; justify-content: flex-end;">

        <!-- Wider + Thinner Search -->
        <v-text-field v-model="searchQuery" label="Search datasets..." density="compact" variant="outlined"
          class="search-clean" hide-details>
          <template #append-inner>
            <span class="material-symbols-outlined" style="cursor:pointer;">search</span>
          </template>
        </v-text-field>

        <!-- Icon-only Add Dataset Button -->
        <v-btn variant="text" class="add-icon-btn" @click="$router.push('/admin/datasets/add')">
          <span class="material-symbols-outlined">add_circle</span>
        </v-btn>


      </div>
    </div>
    <!-- REUSABLE TABLE -->
    <BaseTable :columns="columns" :data="filteredDatasets" :loading="loading" show-actions
      empty-text="No matching datasets found.">
      <template #rows>
        <DatasetRow v-for="dataset in filteredDatasets" :key="dataset.id" :dataset="dataset" @view="handleView" />
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

.search-clean {
  min-width: 280px;
  /* wider */
  max-width: 360px;
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