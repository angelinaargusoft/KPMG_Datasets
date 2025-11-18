<template>
  <v-container class="py-8" fluid>
    <!-- Back Button -->
    <v-btn variant="text" color="primary" @click="$router.push('/admin/datasets')">
      <v-icon left>mdi-arrow-left</v-icon>
      Back to Datasets
    </v-btn>

    <h2 class="text-h5 font-weight-bold mt-4 mb-6">Dataset Details</h2>

    <!-- Upload Box -->
    <v-card class="pa-6 mb-6" outlined>
      <div
        class="dropzone"
        :class="{ 'dropzone--over': isDragOver }"
        @dragover.prevent="onDragOver"
        @dragenter.prevent="onDragEnter"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
        @click="openFilePicker"
      >
        <v-icon size="38">mdi-cloud-upload-outline</v-icon>
        <div class="dropzone-text">
          <div class="text-h6">Drop files here or click to select</div>
          <div class="text--secondary">Files will be uploaded via backend</div>
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
        <v-btn color="primary" :disabled="!pendingFiles.length" @click="uploadAll">
          <v-icon left>mdi-upload</v-icon>
          Upload Files
        </v-btn>
      </div>
    </v-card>

    <!-- File list -->
    <BaseTable
      :columns="columns"
      :data="blobList"
      :loading="loadingFiles"
      show-actions
      empty-text="No files uploaded yet"
    >
      <template #rows>
        <v-row v-for="file in blobList" :key="file.id || file.name" class="py-3 px-4">
          <v-col cols="4">{{ file.name }}</v-col>
          <v-col cols="2">{{ formatSize(file.size) }}</v-col>
          <v-col cols="3">{{ formatDate(file.uploadedAt) }}</v-col>
          <v-col cols="3" class="text-right">
            <!-- Download -->
            <v-btn icon @click="downloadFile(file)">
              <v-icon>mdi-download</v-icon>
            </v-btn>
            <!-- Delete -->
            <v-btn icon @click="deleteFile(file)">
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
            <!-- Import as NEW (stub for now) -->
            <v-btn icon @click="importAsNew(file)">
              <v-icon>mdi-import</v-icon>
            </v-btn>
            <!-- Import & APPEND (stub for now) -->
            <v-btn icon @click="importAndAppend(file)">
              <v-icon>mdi-plus-circle-outline</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </BaseTable>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import BaseTable from "@/components/common/BaseTable.vue";

const route = useRoute();
const store = useStore();
const datasetUUID = route.params.id;

// -------------------------------
// STATES
// -------------------------------
const pendingFiles = ref([]);
const fileInput = ref(null);
const isDragOver = ref(false);

// Use Vuex store for files + loading
const blobList = computed(() => store.getters["datasetFileUpload/files"]);
const loadingFiles = computed(() => store.getters["datasetFileUpload/loading"]);

// -------------------------------
// Table columns
// -------------------------------
const columns = [
  { label: "Name", key: "name", cols: 4 },
  { label: "Size", key: "size", cols: 2 },
  { label: "Uploaded At", key: "uploadedAt", cols: 3 },
];

// -------------------------------
// Upload all files using BACKEND via store
// -------------------------------
async function uploadAll() {
  for (const file of pendingFiles.value) {
    await store.dispatch("datasetFileUpload/uploadFileToDataset", {
      datasetUUID,
      file,
    });
  }
  pendingFiles.value = [];
}

// -------------------------------
// Load uploaded files (from backend via store)
// -------------------------------
async function loadFileList() {
  await store.dispatch("datasetFileUpload/fetchDatasetFiles", datasetUUID);
}

// -------------------------------
// Drag & Drop + file picker
// -------------------------------
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
  for (const f of Array.from(files)) pendingFiles.value.push(f);
}

// -------------------------------
// Helpers
// -------------------------------
function formatSize(bytes) {
  if (!bytes) return "-";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString();
}

// Download stub
function downloadFile(file) {
  console.log("Download clicked for", file);
  // e.g., window.location = `/datasets/${datasetUUID}/files/${encodeURIComponent(file.name)}`;
}

// 🔥 Delete file via store (removes blob + history)
async function deleteFile(file) {
  if (!file.id) {
    console.warn("Cannot delete file: missing id", file);
    return;
  }
  await store.dispatch("datasetFileUpload/removeDatasetFile", {
    recordId: file.id,
    datasetUUID,
  });
}

// Stubs for import actions
function importAsNew(file) {
  console.log("Import as NEW", file);
}

function importAndAppend(file) {
  console.log("Import & APPEND", file);
}

// Load list initially
onMounted(loadFileList);
</script>

<style scoped>
.dropzone {
  min-height: 150px;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 24px;
  cursor: pointer;
  transition: 0.2s;
}
.dropzone--over {
  border-color: #2196f3;
  background-color: #e3f2fd;
}
.dropzone-text {
  text-align: center;
  max-width: 60%;
}
</style>

