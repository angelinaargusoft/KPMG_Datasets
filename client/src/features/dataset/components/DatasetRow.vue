<template>
  <v-row class="py-3 px-4 align-center dataset-row" dense no-gutters>
    <v-col cols="2">
      <span class="dataset-name" @click="goToDetails(dataset)">
        {{ dataset.name }}
      </span>
    </v-col>

    <v-col cols="2">
      {{ dataset.description || "—" }}
    </v-col>

    <v-col cols="2">
      <span>{{ uploadedAtFormatted.date }}</span>
      <span class="d-block">{{ uploadedAtFormatted.time }}</span>
    </v-col>

    <v-col cols="1"> Angelina </v-col>

    <v-col cols="1">
      {{ dataset.storageType || "—" }}
    </v-col>

    <v-col cols="2">
      {{ dataset.enablev3 ? "V3" : "V2" }}
    </v-col>

    <!-- Actions -->
    <v-col cols="2">
      <ActionIconButton type="edit" @click="editDataset(dataset)" />
      <ActionIconButton type="manage" />
      <ActionIconButton type="delete" @click="confirmDelete(dataset)" />
    </v-col>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6 font-weight-medium">
          Confirm Deletion
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ dataset.name }}</strong
          >?
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
import { ref, computed } from "vue";
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
function formatDateTime(ts) {
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

const uploadedAtFormatted = computed(() =>
  formatDateTime(props.dataset.createdAt)
);
</script>

<style scoped>
.dataset-row {
  border-bottom: 1px solid #f0f0f0;
  background-color: #ffffff;
  transition: background-color 0.2s ease;
}

.dataset-row:hover {
  background-color: #f5f8ff;
  cursor: pointer;
}

.dataset-name {
  color: #1565c0;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease, text-decoration 0.2s ease;
}

.dataset-name:hover {
  color: #0d47a1;
  text-decoration: underline;
}

.v-col {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  word-wrap: break-word !important;
}
</style>
