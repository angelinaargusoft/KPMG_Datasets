<template>
  <v-container class="py-8" fluid>
    <!-- Back Button -->
    <v-btn variant="text" color="primary" @click="$router.push('/admin/datasets')">
      <v-icon left>mdi-arrow-left</v-icon>
      Back to Datasets
    </v-btn>
    <h2 class="text-h5 font-weight-bold mt-4 mb-6">
      Dataset Details
    </h2>
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
          <div class="text--secondary">Files will be uploaded to Azure Blob Storage</div>
        </div>
        <input ref="fileInput" type="file" multiple class="d-none" @change="onFileInputChange" />
      </div>
      <div class="d-flex justify-end mt-4">
        <v-btn color="primary" :disabled="!pendingFiles.length" @click="uploadAllToAzure">
          <v-icon left>mdi-upload</v-icon>
          Upload Files
        </v-btn>
      </div>
    </v-card>
    <!-- Files Table -->
    <BaseTable
  :columns="columns"
  :data="blobList"
  :loading="false"
  show-actions
  empty-text="No files in storage yet"
>
  <template #rows>
    <v-row
      v-for="blob in blobList"
      :key="blob.name"
      class="py-3 px-4 align-center file-row"
      dense
      no-gutters
    >
      <!-- Name -->
      <v-col cols="4">
        {{ blob.name }}
      </v-col>
      <!-- Size -->
      <v-col cols="2">
        {{ formatSize(blob.size) }}
      </v-col>
      <!-- Last Modified -->
      <v-col cols="3">
        {{ formatDate(blob.lastModified) }}
      </v-col>
      <!-- Actions -->
      <v-col cols="3" class="text-right">
        <!-- Download -->
        <v-btn icon @click="downloadBlob(blob)">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <!-- Delete -->
        <v-btn icon @click="deleteBlob(blob)">
          <v-icon>mdi-delete-outline</v-icon>
        </v-btn>
        <!-- Import as NEW -->
        <v-btn icon @click="importAsNew(blob)">
          <v-icon>mdi-file-plus-outline</v-icon>
        </v-btn>
        <!-- Import & APPEND -->
        <v-btn icon @click="importAndAppend(blob)">
          <v-icon>mdi-plus-circle-outline</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </template>
</BaseTable>
  </v-container>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { BlobServiceClient } from "@azure/storage-blob";
import BaseTable from "@/components/common/BaseTable.vue";

const columns = [
  { label: "Name", key: "name", cols: 4 },
  { label: "Size", key: "size", cols: 2 },
  { label: "Last Modified", key: "lastModified", cols: 3 },
];
// ---------------------------------------------
// :one: SET YOUR SAS URL HERE
// ---------------------------------------------
// Example: "https://myacc.blob.core.windows.net/datasets?sv=xxx&sig=yyy"
// ---------------------------------------------
const sasUrl = import.meta.env.VITE_URL;
const blobService = new BlobServiceClient(sasUrl);
const containerClient = blobService.getContainerClient("");
const fileInput = ref(null);
const pendingFiles = ref([]);
const blobList = ref([]);
const isDragOver = ref(false);
// ------------------
// Fetch blob list
// ------------------
async function loadBlobList() {
  blobList.value = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    blobList.value.push({
      name: blob.name,
      size: blob.properties?.contentLength,
      lastModified: blob.properties?.lastModified,
    });
  }
}
// ------------------
// Upload files to Azure
// ------------------
async function uploadAllToAzure() {
  for (const file of pendingFiles.value) {
    const blockBlobClient = containerClient.getBlockBlobClient(file.name);
    await blockBlobClient.uploadData(file);
  }
  pendingFiles.value = [];
  await loadBlobList();
}
// ------------------
// Drag upload
// ------------------
function onDragOver(e) { e.dataTransfer.dropEffect = "copy"; }
function onDragEnter() { isDragOver.value = true; }
function onDragLeave() { isDragOver.value = false; }
function onDrop(e) {
  isDragOver.value = false;
  addFiles(e.dataTransfer.files);
}
// ------------------
// File dialog
// ------------------
function openFilePicker() {
  fileInput.value?.click();
}
function onFileInputChange(e) {
  addFiles(e.target.files);
  e.target.value = null;
}
function addFiles(fileList) {
  for (const f of Array.from(fileList)) {
    pendingFiles.value.push(f);
  }
}
// ------------------
// Helpers
// ------------------
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
// Load on page open
onMounted(loadBlobList);
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
  transition: 0.2s border-color, 0.2s background-color;
}
.dropzone--over {
  border-color: #2196f3;
  background-color: #e3f2fd;
}
.dropzone-text {
  text-align: center;
  max-width: 60%;
}
.action-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid #BFD3FF; /* light outline */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  cursor: pointer;
  transition: 0.2s ease;
  background-color: #F8FAFF; /* subtle white-blue */
}

.action-btn:hover {
  background-color: #E9F1FF; /* hover highlight */
}

.action-btn .v-icon {
  font-size: 22px;
  color: #1565C0; /* default blue */
}

/* Red delete button */
.action-btn.delete {
  border-color: #FFB8B8;
}

.action-btn.delete .v-icon {
  color: #E53935;
}
</style>