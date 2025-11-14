<template>
    <v-card outlined class="pa-0 elevation-1 base-table">
      <!-- Header Row -->
      <v-row class="font-weight-medium py-3 px-4 bg-light" no-gutters>
        <v-col
          v-for="col in columns"
          :key="col.key"
          :cols="col.cols || 2"
          :class="col.headerClass"
        >
          {{ col.label }}
        </v-col>
        <!-- Action Column -->
        <v-col v-if="showActions" cols="2" class="text-right">
          Actions
        </v-col>
      </v-row>
      <!-- Body -->
      <slot name="rows" />
      <!-- Empty State -->
      <div v-if="!loading && !hasData" class="text-center py-8 text-grey">
        {{ emptyText }}
      </div>
      <!-- Loading -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate />
      </div>
    </v-card>
  </template>
  <script setup>
  import { computed } from "vue";
  const props = defineProps({
    columns: {
      type: Array,
      required: true,
    },
    data: {
      type: Array,
      default: () => [],
    },
    loading: Boolean,
    showActions: Boolean,
    emptyText: {
      type: String,
      default: "No records found.",
    },
  });
  // for empty state
  const hasData = computed(() => Array.isArray(props.data) && props.data.length > 0);
  </script>
  <style scoped>
  .base-table {
    width: 100%;
    overflow-x: auto;
  }
  .bg-light {
    background-color: #f9fafb;
  }
  .text-grey {
    color: #9e9e9e;
  }
  </style>