<template>
    <div>
      <div
        class="d-flex justify-end align-center ma-8 flex-wrap"
        style="gap: 12px"
      >
        <v-text-field
          v-model="statusSearchQuery"
          placeholder="Search files"
          density="compact"
          variant="outlined"
          class="file-search"
          hide-details
        >
          <template #prepend-inner>
            <span class="material-symbols-outlined search-icon"> search </span>
          </template>
        </v-text-field>
      </div>
  
      <!-- STATUS FILTER BUTTONS -->
      <div class="d-flex mb-8 mx-4">
        <v-btn
          class="no-uppercase"
          :variant="statusFilter === 'all' ? 'flat' : 'outlined'"
          color="primary"
          @click="statusFilter = 'all'"
        >
          All
        </v-btn>
  
        <v-btn
          class="no-uppercase"
          :variant="statusFilter === 'in-progress' ? 'flat' : 'outlined'"
          color="primary"
          @click="statusFilter = 'in-progress'"
        >
          In Progress
        </v-btn>
  
        <v-btn
          class="no-uppercase"
          :variant="statusFilter === 'error' ? 'flat' : 'outlined'"
          color="primary"
          @click="statusFilter = 'error'"
        >
          Error
        </v-btn>
  
        <v-btn
          class="no-uppercase"
          :variant="statusFilter === 'completed' ? 'flat' : 'outlined'"
          color="primary"
          @click="statusFilter = 'completed'"
        >
          Completed
        </v-btn>
      </div>
  
      <!-- IMPORT STATUS TABLE -->
      <BaseTable
        :columns="statusColumns"
        :data="filteredImportStatus"
        :loading="loadingImportStatus"
        show-actions
        empty-text="No import status records"
        :server-pagination="true"
        :actions-cols="2"
      >
        <template #rows="{ items }">
          <v-row
            v-for="row in items"
            :key="row.uuid || row.id || row.name"
            class="py-3 px-4"
            no-gutters
          >
            <v-col :cols="2">
              {{ row.status }}
            </v-col>
            <v-col :cols="2">
              {{ row.name }}
            </v-col>
            <v-col :cols="1">
              {{ row.size }}
            </v-col>
            <v-col :cols="2">
              {{ row.importedAt }}
            </v-col>
            <v-col :cols="3">
              {{ row.progress ?? "-" }}
            </v-col>
          </v-row>
        </template>
      </BaseTable>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
  import { useStore } from "vuex";
  import BaseTable from "@/components/common/BaseTable.vue";
  
  const props = defineProps({
    datasetUuid: {
      type: String,
      required: true,
    },
  });
  
  const store = useStore();
  
  // search for status view
  const statusSearchQuery = ref("");
  
  // filter state for status
  const statusFilter = ref("all");
  
  // Expect rows shaped like:
  // { uuid, status, name, size, importedAt, progress }
  const importStatusList = computed(
    () => store.getters["datasetFileUpload/importStatus"] || []
  );
  
  const loadingImportStatus = computed(
    () => store.getters["datasetFileUpload/importStatusLoading"] || false
  );
  
  // filter by search + status (All, In Progress, Error, Completed)
  const filteredImportStatus = computed(() => {
    const q = statusSearchQuery.value?.toLowerCase?.() || "";
    let list = importStatusList.value;
  
    if (statusFilter.value !== "all") {
      list = list.filter((item) => item.status === statusFilter.value);
    }
  
    if (q) {
      list = list.filter((item) =>
        [item.name, item.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
  
    return list;
  });
  
  // columns for status table
  const statusColumns = [
    { label: "Status", key: "status", cols: 2, sortable: true },
    { label: "Name", key: "name", cols: 2, sortable: false },
    { label: "Size", key: "size", cols: 1, sortable: false },
    { label: "Imported At", key: "importedAt", cols: 2, sortable: true },
    { label: "Progress", key: "progress", cols: 3, sortable: false },
  ];
  </script>
  
  <style scoped>
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
  