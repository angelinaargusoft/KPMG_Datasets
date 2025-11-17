<template>
  <v-container class="py-10 add-dataset-page" theme="light" fluid>
    <!-- Page Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5 font-weight-bold">{{ isEdit ? "Edit Dataset" : "Create Dataset" }}</h2>
      <v-btn variant="text" color="primary" @click="$router.push('/admin/datasets')">
        <v-icon left>mdi-arrow-left</v-icon>
        Back to Datasets
      </v-btn>
    </div>
    <!-- Error Alert -->
    <v-alert v-if="error" type="error" dense class="mb-4">
      {{ error }}
    </v-alert>
    <!-- Dataset Form -->
    <DatasetForm v-model="localDataset" :isEdit="isEdit" :endpoints="dataEndpoints"/>
    <!-- Action Button -->
    <div class="text-right mt-6">
      <v-btn color="primary" class="px-6" :loading="loading" @click="handleSubmit">
        Submit
      </v-btn>
    </div>
  </v-container>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import DatasetForm from "../components/DatasetForm.vue";

const router = useRouter();
const route = useRoute();
const store = useStore();

// Vuex reactive states
const loading = computed(() => store.getters["dataset/loading"]);
const error = computed(() => store.getters["dataset/error"]);

const dataEndpoints = computed(
  () => store.getters["dataEndpoint/dataEndpoints"] || []
);

// Local reactive dataset object (v-model)
const localDataset = ref({
  name: "",
  description: "",
  applicationPackageId: "",
  storageType: "",
  enablev3: false,
  tablePrefix: "",
  endpointServerUUID: ""
});
const isEdit = ref(false);

//---Load exiting profile
onMounted(async () => {
  try {
    await store.dispatch("dataEndpoint/fetchDataEndpoints");
  } catch (err) {
    console.error("Error fetching data endpoints:", err);
  }

  const datasetUuid = route.params.id;
  if (datasetUuid) {
    try {
      const existing = await store.dispatch("dataset/fetchDatasetByUUID", datasetUuid);
      if (existing) {
        localDataset.value = {
          name: existing.name || "",
          description: existing.description || "",
          applicationPackageId: existing.applicationPackageId || "",
          storageType: existing.storageType || "",
          enablev3: existing.enablev3 || false,
          tablePrefix: existing.tablePrefix,
          endpointServerUUID: existing.endpointServerUUID || ""
        };
        isEdit.value = true;
      }
    } catch(err){
      console.log("Error fetching dataset:", err);
    }
  }


})
// Handle form submission
const handleSubmit = async () => {
  const payload = {
    ...localDataset.value,
    createdAt: new Date().toISOString(),
    createdBy: "123e4567-e89b-12d3-a456-426614174000", // Replace with actual user later
  };

  const ok = await store.dispatch("dataset/saveDataset", { datasetId: route.params.id, dataset: payload });
  if (ok) {
    router.push("/admin/datasets");
  }
}
</script>
<style scoped>
.add-dataset-page {
  max-width: 100%;
  margin: 0 auto;
}

.v-card {
  background-color: #ffffff !important;
  border-radius: 12px;
}

.v-container {
  background-color: #f9fafb;
}
</style>