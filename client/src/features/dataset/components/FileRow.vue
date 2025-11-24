<template>
    <v-row
      class="py-3 px-4 align-center file-row"
      dense
      no-gutters
    >
      <!-- File name -->
      <v-col cols="4">
        {{ file.name }}
      </v-col>
  
      <!-- Size -->
      <v-col cols="2">
        {{ formattedSize }}
      </v-col>
  
      <!-- Uploaded at: date + time stacked -->
      <v-col cols="3">
        <span>{{ uploadedAtFormatted.date }} {{ uploadedAtFormatted.time }}</span>
      </v-col>
  
      <!-- Actions -->
      <v-col cols="3">
        <ActionIconButton
          type="download"
          @click="$emit('download', file)"
        />
        <ActionIconButton
          type="delete"
          @click="$emit('delete', file)"
        />
        <ActionIconButton
          type="importNew"
          @click="$emit('import-new', file)"
        />
        <ActionIconButton
          type="importAppend"
          @click="$emit('import-append', file)"
        />
      </v-col>
    </v-row>
  </template>
  
  <script setup>
  import { computed } from "vue";
  import ActionIconButton from "@/components/common/ActionIconButton.vue";
  
  const props = defineProps({
    file: { type: Object, required: true },
  });
  
  defineEmits(["download", "delete", "import-new", "import-append"]);
  
  // Size formatting
  const formattedSize = computed(() => {
    const bytes = props.file.size;
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  });
  
  // Date formatting (same style as DatasetRow)
  function formatDateTime(ts) {
    if (!ts) {
      return { date: "—", time: "" };
    }
  
    const d = new Date(ts);
  
    return {
      date: d.toLocaleDateString("en-GB"), // DD/MM/YYYY
      time: d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  }
  
  const uploadedAtFormatted = computed(() =>
    formatDateTime(props.file.uploadedAt)
  );
  </script>
  
  <style scoped>
  .file-row {
    border-bottom: 1px solid #F0F0F0;
    background-color: #FFFFFF;
    transition: background-color 0.2s ease;
  }
  
  .file-row:hover {
    background-color: #F5F8FF;
  }
  
  .v-col {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: unset !important;
    word-wrap: break-word !important;
  }
  </style>
  
  