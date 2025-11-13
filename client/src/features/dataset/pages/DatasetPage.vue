<template>
  <v-container class=" dataset-container py-8" theme="light" fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5 font-weight-bold">Datasets</h2>
      <v-btn color="primary" prepend-icon="mdi-database-plus" @click="$router.push('/admin/datasets/add')">
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
    <!-- Dataset Table -->
    <v-card outlined class="pa-0 elevation-1 dataset-table">
      <!-- Table Header -->
      <v-row class="font-weight-medium py-3 px-4 bg-light" no-gutters>
        <v-col cols="2">Name</v-col>
        <v-col cols="3">Description</v-col>
        <v-col cols="1">Created At</v-col>
        <v-col cols="2">Created By</v-col>
        <v-col cols="1">Storage</v-col>
        <v-col cols="1">Data Import</v-col>
        <v-col cols="2" class="text-right">Actions</v-col>
      </v-row>
      <!-- Dataset Rows -->
      <DatasetRow
        v-for="dataset in filteredDatasets"
        :key="dataset.id"
        :dataset="dataset"
        @view="handleView"
      />
      <!-- Empty State -->
      <div v-if="!filteredDatasets.length" class="text-center py-8 text-grey">
        No matching datasets found.
      </div>
    </v-card>
  </v-container>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import DatasetRow from "../components/DatasetRow.vue";
const store = useStore();
const searchQuery = ref("");
// Fetch datasets
onMounted(async () => {
  await store.dispatch("dataset/fetchDatasets");
});
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
.dataset-container{
  padding-left: 0 !important;
  padding-right: 0 !important;
}
.dataset-table {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  background-color: #ffffff !important;
  color: #000000;
  border-radius: 0;
  border-left: none;
  border-right: none;
  margin: 0 !important
}
.v-row.font-weight-medium {
  border-bottom: 1px solid #e0e0e0;
}
.bg-light {
  background-color: #f9fafb !important;
}
.text-grey {
  color: #9e9e9e;
}
</style>