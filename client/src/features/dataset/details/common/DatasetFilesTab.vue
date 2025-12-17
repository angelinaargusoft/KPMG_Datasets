<template>
  <div>
    <!-- UPLOAD SECTION -->
      <div
        class="dropzone ma-4 mb-10"
        :class="{ 'dropzone--over': isDragOver }"
        @dragover.prevent="onDragOver"
        @dragenter.prevent="onDragEnter"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
        @click="openFilePicker"
      >
          <span class="material-symbols-outlined upload-icon">
            upload_file
          </span>
          <div>
            Drop files here or
            <a class="upload-link">Click to select file</a>
            <!-- Info tooltip -->
            <v-tooltip location="right">
              <template #activator="{ props }">
                <span
                  v-bind="props"
                  class="material-symbols-outlined info-icon"
                >
                  info
                </span>
              </template>

              <span>
                Supported file types: .txt, .csv, .pgp, .gpg, .xlsm, .xlsx, .xls, .xml, .zip
              </span>
            </v-tooltip>
        </div>
        <input
          ref="fileInput"
          type="file"
          multiple
          class="d-none"
          @change="onFileInputChange"
        />
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

    <!-- SUBTAB CONTENT -->
    <UploadedFilesSubTab
      v-if="activeSubTab === 'uploaded'"
      :dataset-uuid="datasetUuid"
      :refresh-key="refreshKey"
    />

    <ImportStatusSubTab v-else :dataset-uuid="datasetUuid" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import UploadedFilesSubTab from "./UploadedFilesSubTab.vue";
import ImportStatusSubTab from "./ImportStatusSubTab.vue";

const props = defineProps({
  datasetUuid: {
    type: String,
    required: true,
  },
});

const store = useStore();

const refreshKey = ref(0);

// upload state
const pendingFiles = ref([]);
const fileInput = ref(null);
const isDragOver = ref(false);

const activeSubTab = ref("uploaded"); // default active button

async function uploadAll() {
  const filesToUpload = [...pendingFiles.value];

  if (!filesToUpload.length) return;

  pendingFiles.value = []; 

  for (const file of filesToUpload) {
    try {
      await store.dispatch("datasetFileUpload/uploadFileToDataset", {
        datasetUUID: props.datasetUuid,
        file,
      });

      store.dispatch("toast/show", {
        message: `File: ${file.name} uploaded successfully`,
        type: "success",
      });
    } catch (err) {
      store.dispatch("toast/show", {
        message: `Failed to upload file: ${file.name}`,
        type: "error",
      });
    }
  }
  refreshKey.value++;
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

async function addFiles(files) {
  const newFiles = Array.from(files);

  if (!newFiles.length) return;

  pendingFiles.value.push(...newFiles);

  await uploadAll();
}

</script>

<style scoped>
.dropzone {
  min-height: 150px;
  border: 2px dashed #2196f3;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
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

.no-uppercase {
  text-transform: none !important;
}

.upload-icon {
  font-size: 38px;
  color: #1976d2
}

.upload-link {
  color: #1976d2 !important;
  text-decoration: underline;
  cursor: pointer;
  margin: 0 4px;
}

.info-icon {
  font-size: 28px;
  vertical-align: middle;
  padding-bottom: 4px;
  color: #1976d2;
  cursor: pointer;
  font-variation-settings: 'FILL' 1;
}

</style>
