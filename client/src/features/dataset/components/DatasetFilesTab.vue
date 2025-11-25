<template>
    <div>
      <!-- UPLOAD SECTION -->
      <div class="px-4 py-4">
        <div
          class="dropzone"
          :class="{ 'dropzone--over': isDragOver }"
          @dragover.prevent="onDragOver"
          @dragenter.prevent="onDragEnter"
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
          @click="openFilePicker"
        >
          <div class="dropzone-text">
            <span class="material-symbols-outlined" style="font-size: 38px">
              cloud_upload
            </span>
            <div class="text-h6">Drop files here or click to select</div>
          </div>
          <input
            ref="fileInput"
            type="file"
            multiple
            class="d-none"
            @change="onFileInputChange"
          />
        </div>
  
        <div class="d-flex justify-end mt-4">
          <v-btn
            color="primary"
            :disabled="!pendingFiles.length"
            @click="uploadAll"
          >
            <span class="material-symbols-outlined" style="margin-right: 6px">
              upload
            </span>
            Upload Files
          </v-btn>
        </div>
      </div>
  
      <!-- SUB-TABS (buttons) -->
      <div class="my-2 mx-4">
        <v-btn
          :color="'primary'"
          :variant="activeSubTab === 'uploaded' ? 'flat' : 'outlined'"
          @click="activeSubTab = 'uploaded'"
          class="no-uppercase"
        >
          Uploaded Files
        </v-btn>
  
        <v-btn
          :color="'primary'"
          :variant="activeSubTab === 'status' ? 'flat' : 'outlined'"
          @click="activeSubTab = 'status'"
          class="no-uppercase"
        >
          Status of Imported Files
        </v-btn>
      </div>
  
      <v-divider />
  
      <!-- FILES SECTION -->

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
            <template #prepend-inner>
              <span class="material-symbols-outlined search-icon">
                search
              </span>
            </template>
          </v-text-field>
        </div>
  
        <BaseTable
          :columns="columns"
          :data="filteredFiles"
          :loading="loadingFiles"
          show-actions
          empty-text="No files uploaded yet"
          :actions-cols="3"
          :server-pagination="true"
          :page="filesPage"
          :items-per-page="filesItemsPerPage"
          :total-items="filesTotalItems"
          @update:page="handleFilesPageChange"
          @update:itemsPerPage="handleFilesItemsPerPageChange"
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
            <strong>{{ selectedFile?.name }}</strong>?
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
  import FileRow from "../components/FileRow.vue";
  
  const props = defineProps({
    datasetUuid: {
      type: String,
      required: true,
    },
  });
  
  const store = useStore();
  
  // upload state
  const pendingFiles = ref([]);
  const fileInput = ref(null);
  const isDragOver = ref(false);
  
  // delete dialog state
  const deleteDialog = ref(false);
  const selectedFile = ref(null);
  
  const activeSubTab = ref("uploaded"); // default active button
  
  // search state for files
  const fileSearchQuery = ref("");
  
  // ---- PAGINATION STATE FOR FILES ----
  const filesPage = ref(1);
  const filesItemsPerPage = ref(10);
  
  const filesPagination = computed(
    () => store.getters["datasetFileUpload/pagination"] || null
  );
  
  // keep local page + itemsPerPage in sync with store pagination
  watch(
    filesPagination,
    (val) => {
      if (!val) return;
      filesPage.value = val.page || 1;
      filesItemsPerPage.value = val.pageSize || 10;
    },
    { immediate: true }
  );
  
  // total items for pagination control
  const filesTotalItems = computed(() => filesPagination.value?.totalItems || 0);
  
  // ---- FILE LIST (from datasetFileUpload store) ----
  const blobList = computed(
    () => store.getters["datasetFileUpload/files"] || []
  );
  const loadingFiles = computed(
    () => store.getters["datasetFileUpload/loading"]
  );
  
  // Filtered files (client-side search on the current page)
  const filteredFiles = computed(() => {
    if (!fileSearchQuery.value) return blobList.value;
  
    const q = fileSearchQuery.value.toLowerCase();
  
    return blobList.value.filter((f) =>
      [f.name, f.size, f.uploadedAt]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });
  
  // Table columns
  const columns = [
    { label: "Name", key: "name", cols: 4, sortable: true },
    { label: "Size", key: "size", cols: 2, sortable: true },
    { label: "Uploaded At", key: "uploadedAt", cols: 3, sortable: true },
  ];
  
  // Upload all files via backend
  async function uploadAll() {
    for (const file of pendingFiles.value) {
      await store.dispatch("datasetFileUpload/uploadFileToDataset", {
        datasetUUID: props.datasetUuid,
        file,
      });
    }
    pendingFiles.value = [];
  }
  
  // Load uploaded files for a page
  async function loadFileList(
    page = filesPage.value,
    pageSize = filesItemsPerPage.value
  ) {
    await store.dispatch("datasetFileUpload/fetchDatasetFiles", {
      datasetUUID: props.datasetUuid,
      page,
      pageSize,
    });
  }
  
  // Handlers for table pagination events
  async function handleFilesPageChange(newPage) {
    filesPage.value = newPage;
    await loadFileList(newPage, filesItemsPerPage.value);
  }
  
  async function handleFilesItemsPerPageChange(newItemsPerPage) {
    filesItemsPerPage.value = newItemsPerPage;
    // reset to first page on page-size change
    filesPage.value = 1;
    await loadFileList(1, newItemsPerPage);
  }
  
  // Drag & Drop + file picker handlers
  function onDragOver(e) {
    e.dataTransfer.dropEffect = "copy";
  }
  
  function onDragEnter() {
    isDragOver.value = true;
  }
  
  function onDragLeave() {
    isDragOver.value = false;
  }
  
  function onDrop(e) {
    isDragOver.value = false;
    addFiles(e.dataTransfer.files);
  }
  
  function openFilePicker() {
    fileInput.value?.click();
  }
  
  function onFileInputChange(e) {
    addFiles(e.target.files);
    e.target.value = null;
  }
  
  function addFiles(files) {
    for (const f of Array.from(files)) {
      pendingFiles.value.push(f);
    }
  }
  
  // Download stub
  function downloadFile(file) {
    console.log("Download clicked for", file);
  }
  
  // Open delete dialog for a specific file
  function openDeleteDialog(file) {
    selectedFile.value = file;
    deleteDialog.value = true;
  }
  
  // Confirm delete file via store
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
  
  // Stubs for import actions
  function importAsNew(file) {
    console.log("Import as NEW", file);
  }
  
  function importAndAppend(file) {
    console.log("Import & APPEND", file);
  }
  
  // Initial load: first page of files
  onMounted(async () => {
    await loadFileList(1, filesItemsPerPage.value);
  });
  </script>
  
  <style scoped>
  .dropzone {
    min-height: 150px;
    border: 2px dashed #2196f3;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    padding: 24px;
    cursor: pointer;
    transition: 0.2s;
  }
  
  .dropzone:hover {
    border-style: solid;
    background-color: #f8f9fb;
  }
  
  .dropzone--over {
    border-color: #2196f3;
    background-color: #e3f2fd;
  }
  
  .dropzone-text {
    text-align: center;
    max-width: 60%;
  }
  
  .file-search {
    min-width: 140px;
    max-width: 260px;
  }
  
  .file-search .v-field {
    border-radius: 8px !important;
  }
  
  .no-uppercase {
    text-transform: none !important;
  }
  </style>
  