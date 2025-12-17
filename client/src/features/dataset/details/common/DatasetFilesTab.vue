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

    <!-- SUBTAB CONTENT -->
    <UploadedFilesSubTab
      v-if="activeSubTab === 'uploaded'"
      :dataset-uuid="datasetUuid"
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

// upload state
const pendingFiles = ref([]);
const fileInput = ref(null);
const isDragOver = ref(false);

const activeSubTab = ref("uploaded"); // default active button

async function uploadAll() {
  for (const file of pendingFiles.value) {
    try {
      await store.dispatch("datasetFileUpload/uploadFileToDataset", {
        datasetUUID: props.datasetUuid,
        file,
      });
      store.dispatch("toast/show", {
        message: `File: ${file.name} uploaded successfully`,
        type: "success",
      });
      pendingFiles.value = [];
    } catch (err) {
      store.dispatch("toast/show", {
        message: `Failed to upload file: ${file.name}`,
        type: "error",
      });
    }
  }
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

.no-uppercase {
  text-transform: none !important;
}
</style>
