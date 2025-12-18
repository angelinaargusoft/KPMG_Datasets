<template>
  <div>
    <!-- SEARCH BAR -->
    <div class="d-flex justify-end align-center ma-8">
      <v-text-field
        v-model="searchQuery"
        placeholder="Search files"
        density="compact"
        variant="outlined"
        class="file-search"
        hide-details
      >
        <template #prepend-inner>
          <span class="material-symbols-outlined">search</span>
        </template>
      </v-text-field>
    </div>

    <!-- TABLE (CLIENT-SIDE PAGINATION) -->
    <BaseTable :columns="columns" :data="filteredItems" :loading="loading">
      <template #item.name="{ item }">
        {{ item.name }}
      </template>

      <template #item.size="{ item }">
        {{ formatSize(item.size) }}
      </template>

      <template #item.uploadedAt="{ item }">
        <div>{{ formatDate(item.uploadedAt).date }}</div>
        <div>{{ formatDate(item.uploadedAt).time }}</div>
      </template>

      <template #item.actions="{ item }">
        <ActionIconButton type="download" />
        <ActionIconButton type="delete" @click.stop="openDeleteDialog(item)" />
        <ActionIconButton type="importNew" />
        <ActionIconButton type="importAppend" />
      </template>
    </BaseTable>

    <!-- DELETE FILE CONFIRMATION DIALOG -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6 font-weight-medium">
          Confirm Deletion
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ selectedFile?.name }}</strong
          >?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDeleteFile">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import BaseTable from "@/components/common/BaseTable.vue";

const props = defineProps({
  datasetUuid: {
    type: String,
    required: true,
  },
  refreshKey: Number,
});

const store = useStore();

const deleteDialog = ref(false);
const selectedFile = ref(null);

const searchQuery = ref("");
const files = computed(() => store.getters["dataset/blobFiles"] || []);
const loading = computed(() => store.getters["dataset/loading"]);

async function fetchFromServer() {
  try {
    await store.dispatch("dataset/fetchDatasetBlobFiles", {
      datasetUUID: props.datasetUuid,
    });
  } catch (err) {
    store.dispatch("toast/show", {
      message: "Failed to load files",
      type: "error",
    });
  }
}

watch(
  () => props.refreshKey,
  () => {
    fetchFromServer();
  }
);

const filteredItems = computed(() => {
  if (!searchQuery.value) return files.value;

  const q = searchQuery.value.toLowerCase();
  return files.value.filter((f) => f.name?.toLowerCase().includes(q));
});

function downloadFile(file) {
  console.log("Download clicked for", file);
}

function openDeleteDialog(file) {
  selectedFile.value = file;
  deleteDialog.value = true;
}

async function confirmDeleteFile() {
  const file = selectedFile.value;

  try {
    await store.dispatch("dataset/removeDatasetBlobFiles", {
      datasetUUID: props.datasetUuid,
      filesName: [file.name],
    });

    store.dispatch("toast/show", {
      message: "File deleted successfully",
      type: "success",
    });

    deleteDialog.value = false;
    selectedFile.value = null;

    await fetchFromServer(); // refresh table
  } catch (err) {
    store.dispatch("toast/show", {
      message: "Failed to delete file",
      type: "error",
    });
  }
}

function formatDate(ts) {
  if (!ts) return { date: "", time: "" };
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

function formatSize(bytes) {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const columns = [
  { label: "Name", key: "name", sortable: true },
  { label: "Size", key: "size", sortable: true },
  { label: "Uploaded At", key: "uploadedAt", sortable: true },
  { label: "Actions", key: "actions" },
];

onMounted(async () => {
  await fetchFromServer();
});
</script>

<style scoped>
.file-search {
  max-width: 260px;
}
</style>
