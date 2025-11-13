<template>
  <v-row class="py-3 px-4 align-center dataset-row" dense no-gutters>
    <v-col cols="2">{{ dataset.name }}</v-col>
    <v-col cols="3">{{ dataset.description || "—" }}</v-col>
    <v-col cols="1">{{ formatDate(dataset.createdAt) }}</v-col>
    <v-col cols="2">{{ dataset.createdBy || "N/A" }}</v-col>
    <v-col cols="1">{{ dataset.storageType || "—" }}</v-col>
    <v-col cols="1">{{ dataset.enablev3 ? "V3" : "V2" }}</v-col>
    <v-col cols="2" class="text-right">
      <v-btn icon @click="$emit('view', dataset)">
        <v-icon>mdi-eye-outline</v-icon>
      </v-btn>
      <v-btn icon color="primary" @click="editProfile(dataset)">
        <v-icon>mdi-pencil-outline</v-icon>
      </v-btn>
      <v-btn icon color="error" @click="confirmDelete(dataset)">
        <v-icon>mdi-delete-outline</v-icon>
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
function confirmDelete(dataset) {
  selectedDataset = dataset;
  deleteDialog.value = true;
}
async function deleteDataset() {
  if (!selectedDataset?.id) return;
  try {
    await store.dispatch("dataset/removeDataset", selectedDataset.id);
    deleteDialog.value = false;
  } catch (err) {
    console.error("Failed to delete dataset:", err);
  }
}
const editProfile = (dataset) => {
    router.push(`/admin/datasets/${dataset.uuid}/edit`);
  };
function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}
</script>
<style scoped>
.dataset-row {
  border-bottom: 1px solid #f0f0f0;
  background-color: #ffffff;
  color: #000000;
}
.dataset-row:hover {
  background-color: #f5f8ff;
  cursor: pointer;
}
.v-col {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  word-wrap: break-word !important;
}
</style>




