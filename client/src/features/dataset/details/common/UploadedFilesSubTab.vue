<template>
  <div>
    <!-- SEARCH BAR -->
    <div
      class="d-flex justify-end align-center ma-8 flex-wrap"
      style="gap: 12px"
    >
      <v-text-field
        v-model="fileSearchQuery"
        placeholder="Search files"
        density="compact"
        variant="outlined"
        class="file-search"
        hide-details
      >
      <!-- Icon inside search bar -->
        <template #prepend-inner>
          <span class="material-symbols-outlined search-icon"> search </span>
        </template>
      </v-text-field>
    </div>

    <!-- MAIN TABLE -->
    <BaseTable
      :columns="columns"
      :data="tableItems"
      :loading="loadingFiles"
      show-actions
      empty-text="No files uploaded yet"
      :actions-cols="3"
      :server-pagination="true"
      :page="filesPage"
      :items-per-page="filesItemsPerPage"
      :total-items="filesTotalItems"
      @update:page="handleFilesPageChange"
      @update:items-per-page="handleFilesItemsPerPageChange"
      @update:sort="handleFilesSortChange"
    >
      <template #rows="{ items }">
        <FileRow
          v-for="file in items"
          :key="file.uuid || file.name"
          :file="file"
          @download="downloadFile"
          @delete="openDeleteDialog"
          @import-new="importAsNew"
          @import-append="importAndAppend"
        />
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
import { ref, computed, watch, onMounted } from "vue";
import { useStore } from "vuex";
import BaseTable from "@/components/common/BaseTable.vue";
import FileRow from "../../manage-files/FileRow.vue";
import { triggerImport } from "@/features/inputHistory/api/inputHistoryService";

const props = defineProps({
  datasetUuid: {
    type: String,
    required: true,
  },
});

const store = useStore();

const deleteDialog = ref(false);
const selectedFile = ref(null);

const fileSearchQuery = ref("");

const filesPage = ref(1);
const filesItemsPerPage = ref(10);

const filesSortKey = ref(null);        
const filesSortDirection = ref(null); 

const filesPagination = computed(
  () => store.getters["datasetFileUpload/pagination"] || null
);

// Sync local pagination with store whenever store updates
watch(
  filesPagination,
  (val) => {
    if (!val) return;
    filesPage.value = val.page || 1;
    filesItemsPerPage.value = val.pageSize || 10;
  },
  { immediate: true }
);

// Total item count for pagination UI
const filesTotalItems = computed(() => filesPagination.value?.totalItems || 0);

// Get list of uploaded files from Vuex
const blobList = computed(
  () => store.getters["datasetFileUpload/files"] || []
);

const loadingFiles = computed(
  () => store.getters["datasetFileUpload/loading"]
);

// backend will filter by search
const tableItems = computed(() => blobList.value);

// Table columns for uploaded files
const columns = [
  { label: "Name", key: "name", cols: 4, sortable: true },
  { label: "Size", key: "size", cols: 2, sortable: true },
  { label: "Uploaded At", key: "uploadedAt", cols: 3, sortable: true },
];

async function loadFileList(
  page = filesPage.value,
  pageSize = filesItemsPerPage.value,
  sortKey = filesSortKey.value,
  sortDirection = filesSortDirection.value,
  search = fileSearchQuery.value
) {
  await store.dispatch("datasetFileUpload/fetchDatasetFiles", {
    datasetUUID: props.datasetUuid,
    page,
    pageSize,
    sortBy: sortKey,              
    sortDirection: sortDirection, 
    search: search || null,       
  });
}

async function handleFilesPageChange(newPage) {
  filesPage.value = newPage;
  await loadFileList(newPage, filesItemsPerPage.value);
}

async function handleFilesItemsPerPageChange(newItemsPerPage) {
  filesItemsPerPage.value = newItemsPerPage;
  filesPage.value = 1;
  await loadFileList(1, newItemsPerPage);
}

async function handleFilesSortChange({ key, direction }) {
  filesSortKey.value = key;
  filesSortDirection.value = direction;
  filesPage.value = 1;
  await loadFileList(1, filesItemsPerPage.value, key, direction);
}

// Runs backend search when query changes 
watch(fileSearchQuery, async () => {
  filesPage.value = 1;
  await loadFileList(1, filesItemsPerPage.value);
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
  if (!file || !file.uuid) {
    console.warn("Cannot delete file: missing uuid", file);
    deleteDialog.value = false;
    return;
  }

  await store.dispatch("datasetFileUpload/removeDatasetFile", {
    uploadUUID: file.uuid,
    datasetUUID: props.datasetUuid,
  });

  deleteDialog.value = false;
  selectedFile.value = null;
}

async function importAsNew(file) {
  if (!file?.uuid) {
    console.warn("Cannot import: file has no uuid", file);
    return;
  }

  try {
    await triggerImport({
      datasetUUID: props.datasetUuid,
      uploadUUID: file.uuid,
      mode: "new",
    });
    console.log("Import as NEW triggered for", file.name);
  } catch (err) {
    console.error("Failed to trigger Import as NEW:", err);
  }
}

function importAndAppend(file) {
  console.log("Import & APPEND", file);
}

onMounted(async () => {
  await loadFileList(1, filesItemsPerPage.value);
});
</script>

<style scoped>
.file-search {
  min-width: 140px;
  max-width: 260px;
}

.file-search .v-field {
  border-radius: 8px !important;
}
</style>


  