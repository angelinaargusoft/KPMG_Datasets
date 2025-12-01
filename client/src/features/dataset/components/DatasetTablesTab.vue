<template>
      <!-- search -->
      <div
        class="d-flex justify-end align-center ma-8 flex-wrap"
        style="gap: 12px"
      >
        <v-text-field
          v-model="tableSearchQuery"
          placeholder="Search tables"
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
        :columns="tableColumns"
        :data="filteredTables"
        :loading="loadingTables"
        empty-text="No tables found"
        :server-pagination="true"
        :page="tablesPage"
        :items-per-page="tablesItemsPerPage"
        :total-items="tablesTotalItems"
        @update:page="handleTablesPageChange"
        @update:itemsPerPage="handleTablesItemsPerPageChange"
      >
        <template #rows="{ items }">
          <!-- build a TableRow component later -->
          <tr v-for="row in items" :key="row.name">
          </tr>
        </template>
      </BaseTable>
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
  
  // search for tables
  const tableSearchQuery = ref("");
  
  // pagination for tables
  const tablesPage = ref(1);
  const tablesItemsPerPage = ref(10);
  
  // temp
  const tablesPagination = computed(
    () => store.getters["datasetTables/pagination"] || null
  );
  const tablesTotalItems = computed(
    () => tablesPagination.value?.totalItems || 0
  );
  
  // temp
  const tablesList = computed(
    () => store.getters["datasetTables/items"] || []
  );
  
  const loadingTables = computed(
    () => store.getters["datasetTables/loading"]
  );
  
  // columns for tables tab
  const tableColumns = [
    { label: "Table", key: "name", cols: 4, sortable: true },
    { label: "# of records", key: "recordCount", cols: 3, sortable: true },
    { label: "Last Modified", key: "lastModified", cols: 3, sortable: true },
  ];
  
  // filtered list for tables
  const filteredTables = computed(() => {
    if (!tableSearchQuery.value) return tablesList.value;
  
    const q = tableSearchQuery.value.toLowerCase();
  
    return tablesList.value.filter((t) =>
      [t.name, t.recordCount, t.lastModified]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });
  
  // handlers for tables pagination
  async function handleTablesPageChange(newPage) {
    tablesPage.value = newPage;
    await store.dispatch("datasetTables/fetchTables", {
      datasetUUID: props.datasetUuid,
      page: newPage,
      pageSize: tablesItemsPerPage.value,
    });
  }
  
  async function handleTablesItemsPerPageChange(newItemsPerPage) {
    tablesItemsPerPage.value = newItemsPerPage;
    tablesPage.value = 1;
    await store.dispatch("datasetTables/fetchTables", {
      datasetUUID: props.datasetUuid,
      page: 1,
      pageSize: newItemsPerPage,
    });
  }
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
  