<template>
  <v-container class="py-8" fluid>
    <v-card outlined class="elevation-1 pa-0">
      <!-- BACK BUTTON -->
      <div>
        <v-btn
          variant="text"
          color="primary"
          class="no-uppercase"
          @click="$router.push('/admin/datasets')"
        >
          <span class="material-symbols-outlined" style="margin-right: 6px">
            arrow_back
          </span>
          Back to Datasets
        </v-btn>
      </div>

      <v-divider />

      <!-- TOP TABS -->
      <v-tabs v-model="activeTab" density="comfortable" class="mt-2">
        <v-tab value="files" class="no-uppercase">Files</v-tab>
        <v-tab value="tables" class="no-uppercase">Tables</v-tab>
        <v-tab value="history" class="no-uppercase">History</v-tab>
      </v-tabs>

      <v-divider />

      <!-- HEADER -->
      <div
        class="d-flex justify-space-between align-center px-4 py-4 flex-wrap header-section"
      >
        <div class="d-flex flex-column">
          <h2 class="text-h5 font-weight-bold">
            {{ datasetName }}
          </h2>

          <div v-if="datasetPrefix" class="text-body-2 mt-1">
            Table prefix: {{ datasetPrefix }}
          </div>
        </div>
      </div>

      <v-divider />

      <!-- TAB CONTENT -->
      <DatasetFilesTab
        v-if="activeTab === 'files'"
        :dataset-uuid="datasetUUID"
      />

      <DatasetTablesTab
        v-else-if="activeTab === 'tables'"
        :dataset-uuid="datasetUUID"
      />

      <DatasetHistoryTab
        v-else-if="activeTab === 'history'"
        :dataset-uuid="datasetUUID"
      />
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import DatasetFilesTab from "../components/DatasetFilesTab.vue";
import DatasetTablesTab from "../components/DatasetTablesTab.vue";
import DatasetHistoryTab from "../components/DatasetHistoryTab.vue";

const route = useRoute();
const store = useStore();

const datasetUUID = route.params.id;

const activeTab = ref("files");

// ---- DATASET HEADER (from dataset store) ----
const currentDataset = computed(
  () => store.getters["dataset/currentDataset"] || {}
);

const datasetName = computed(() => currentDataset.value.name || "Dataset");

// pick tablePrefix if available, fall back to prefix
const datasetPrefix = computed(() => {
  const prefix =
    currentDataset.value.tablePrefix ?? currentDataset.value.prefix;

  if (!prefix) return null;
  const trimmed = String(prefix).trim();
  return trimmed ? trimmed : null;
});

// Initial load: dataset header
onMounted(async () => {
  await store.dispatch("dataset/fetchDatasetByUUID", datasetUUID);
});
</script>

<style scoped>
.no-uppercase {
  text-transform: none !important;
}
</style>

