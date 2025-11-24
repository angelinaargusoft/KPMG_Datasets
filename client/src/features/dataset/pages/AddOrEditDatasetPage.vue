<template>
  <v-container class="py-10 add-dataset-page" theme="light" fluid>
    <!-- Inner box: heading + form + actions -->
    <v-container class="form-box pa-6" fluid>
      <!-- Header inside the box -->
      <div class="d-flex justify-space-between align-center mb-6">
        <h2 class="text-h5 font-weight-bold">
          {{ isEdit ? "Edit Dataset" : "Add Dataset" }}
        </h2>
        <v-btn
          variant="text"
          color="primary"
          @click="$router.push('/admin/datasets')"
        >
          <span class="material-symbols-outlined mr-2">
            arrow_back
          </span>
          Back to Datasets
        </v-btn>
      </div>

      <!-- Error Alert -->
      <v-alert v-if="error" type="error" dense class="mb-4">
        {{ error }}
      </v-alert>

      <!-- Dataset Form -->
      <DatasetForm
        v-model="localDataset"
        :isEdit="isEdit"
        :endpoints="dataEndpoints"
        @valid="formValid = $event"
      />

      <!-- Action Buttons -->
      <div class="d-flex justify-end mt-6" style="gap: 12px">
        <!-- Cancel Button -->
        <v-btn
          variant="outlined"
          color="primary"
          @click="$router.push('/admin/datasets')"
        >
          Cancel
        </v-btn>

        <!-- Submit Button -->
        <v-btn
          color="primary"
          class="px-6"
          :loading="loading"
          :disabled="!formValid"
          @click="handleSubmit"
        >
          Submit
        </v-btn>
      </div>
    </v-container>
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

const formValid = ref(false);

const dataEndpoints = computed(
  () => store.getters["dataEndpoint/dataEndpoints"] || []
);

// Local reactive dataset object (v-model)
const localDataset = ref({
  name: "",
  description: "",
  applicationPackageId: "",
  storageType: "SFTP",
  enablev3: false,
  tablePrefix: "",
  endpointServerUUID: "",
});
const isEdit = ref(false);

// Load existing profile
onMounted(async () => {
  try {
    await store.dispatch("dataEndpoint/fetchDataEndpoints");
  } catch (err) {
    console.error("Error fetching data endpoints:", err);
  }

  const datasetUuid = route.params.id;
  if (datasetUuid) {
    try {
      const existing = await store.dispatch(
        "dataset/fetchDatasetByUUID",
        datasetUuid
      );
      if (existing) {
        localDataset.value = {
          name: existing.name || "",
          description: existing.description || "",
          applicationPackageId: existing.applicationPackageId || "",
          storageType: existing.storageType || "",
          enablev3: Boolean(existing.enablev3) || false,
          tablePrefix: existing.tablePrefix,
          endpointServerUUID: existing.endpointServerUUID || "",
        };
        isEdit.value = true;
      }
    } catch (err) {
      console.log("Error fetching dataset:", err);
    }
  }
});

// Handle form submission
const handleSubmit = async () => {
  // don't submit if form is invalid
  if (!formValid.value) return;

  const payload = {
    ...localDataset.value,
    createdAt: new Date().toISOString(),
    createdBy: "123e4567-e89b-12d3-a456-426614174000",
  };

  const ok = await store.dispatch("dataset/saveDataset", {
    datasetId: route.params.id,
    dataset: payload,
  });

  if (ok) router.push("/admin/datasets");
};
</script>

<style scoped>
.add-dataset-page {
  max-width: 100%;
  margin: 0 auto;
  background-color: #f9fafb;
}

.form-box {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0; 
}
</style>

