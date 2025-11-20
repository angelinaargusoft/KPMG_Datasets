<template>
  <v-row class="py-3 px-4 align-center dataset-row" dense no-gutters>
    <!-- Clickable Dataset Name -->
    <v-col cols="2">
      <span class="dataset-name" @click="goToDetails(dataset)">
        {{ dataset.name }}
      </span>
    </v-col>

    <v-col cols="2">
      {{ dataset.description || "—" }}
    </v-col>

    <v-col cols="1">
      {{ formatDate(dataset.createdAt) }}
    </v-col>

    <v-col cols="2">
      Angelina
    </v-col>

    <v-col cols="1">
      {{ dataset.storageType || "—" }}
    </v-col>

    <v-col cols="2">
      {{ dataset.enablev3 ? "V3" : "V2" }}
    </v-col>

    <!-- Actions -->
    <v-col cols="2">
      <v-btn icon @click="editDataset(dataset)">
        <span class="material-symbols-outlined">
          edit
        </span>
      </v-btn>

      <v-btn icon @click="$emit('manage', dataset)">
        <span class="material-symbols-outlined">
          sort
        </span>
      </v-btn>

      <v-btn icon @click="confirmDelete(dataset)">
        <span class="material-symbols-outlined">
          delete
        </span>
      </v-btn>
    </v-col>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6 font-weight-medium">
          Confirm Deletion
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ dataset.name }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteDataset">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const props = defineProps({
  dataset: { type: Object, required: true },
});

const store = useStore();
const router = useRouter();

const deleteDialog = ref(false);
let selectedDataset = null;

// Open dialog
function confirmDelete(dataset) {
  selectedDataset = dataset;
  deleteDialog.value = true;
}

// Delete dataset
async function deleteDataset() {
  if (!selectedDataset?.id) return;
  try {
    await store.dispatch("dataset/removeDataset", selectedDataset.id);
  } catch (err) {
    console.error("Failed to delete dataset:", err);
  }
  deleteDialog.value = false;
}

// Edit dataset
function editDataset(dataset) {
  router.push(`/admin/datasets/${dataset.uuid}/edit`);
}

// View dataset details
function goToDetails(dataset) {
  router.push(`/admin/datasets/details/${dataset.uuid}`);
}

// Date formatting
function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}
</script>

<style scoped>
.dataset-row {
  border-bottom: 1px solid #F0F0F0;
  background-color: #FFFFFF;
  transition: background-color 0.2s ease;
}

.dataset-row:hover {
  background-color: #F5F8FF;
  cursor: pointer;
}

.dataset-name {
  color: #1565C0;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease, text-decoration 0.2s ease;
}

.dataset-name:hover {
  color: #0D47A1;
  text-decoration: underline;
}

.v-col {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  word-wrap: break-word !important;
}
</style>
