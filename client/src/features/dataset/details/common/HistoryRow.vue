<template>
    <v-row
      class="py-3 px-4 align-center file-row"
      dense
      no-gutters
    >
      <!-- Uploaded At -->
      <v-col cols="2">
        <span>{{ uploadedAtFormatted.date }} {{ uploadedAtFormatted.time }}</span>
      </v-col>
  
      <!-- File Name -->
      <v-col cols="2">
        {{ row.name }}
      </v-col>
  
      <!-- SHA256 -->
      <v-col cols="1">
        {{ row.sha256 }}
      </v-col>
  
      <!-- MD5 -->
      <v-col cols="1">
        {{ row.md5 }}
      </v-col>
  
      <!-- Line Count -->
      <v-col cols="2">
        {{ row.lineCount }}
      </v-col>
  
      <!-- Size (bytes) -->
      <v-col cols="2">
        {{ formattedSize }}
      </v-col>
  
      <!-- Uploaded To -->
      <v-col cols="2">
        {{ row.uploadedTo }}
      </v-col>
    </v-row>
  </template>
  
  <script setup>
  import { computed } from "vue";
  
  const props = defineProps({
    row: { type: Object, required: true },
  });
  
  const formattedSize = computed(() => {
    const bytes = props.row.sizeBytes ?? props.row.size ?? null;
    if (!bytes) return;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  });
  
  function formatDateTime(ts) {
    if (!ts) {
      return { date: "", time: "" };
    }
  
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
    formatDateTime(props.row.uploadedAt)
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
  
  
  
  
  