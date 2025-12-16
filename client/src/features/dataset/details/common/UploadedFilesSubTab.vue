<template>
  <div>
    <!-- SEARCH BAR -->
    <div class="d-flex justify-end align-center ma-8">
      <v-text-field
        v-model="searchQuery"
        placeholder="Search files"
        density="compact"
        variant="outlined"
        class="file-search"
        hide-details
      >
        <template #prepend-inner>
          <span class="material-symbols-outlined">search</span>
        </template>
      </v-text-field>
    </div>

    <!-- TABLE (CLIENT-SIDE PAGINATION) -->
    <BaseTable
      :columns="columns"
      :data="filteredItems"
      :loading="loading"
    >
      <template #item.name="{ item }">
        {{ item.name }}
      </template>

      <template #item.size="{ item }">
        {{ formatSize(item.size) }}
      </template>

      <template #item.uploadedAt="{ item }">
        <div>{{ formatDate(item.uploadedAt).date }}</div>
        <div>{{ formatDate(item.uploadedAt).time }}</div>
      </template>

      <template #item.actions> — </template>
    </BaseTable>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import BaseTable from "@/components/common/BaseTable.vue";

const props = defineProps({
  datasetUuid: {
    type: String,
    required: true,
  },
});

const store = useStore();

const searchQuery = ref("");
const files = computed(() => store.getters["dataset/blobFiles"] || []);
const loading = computed(() => store.getters["dataset/loading"]);

async function fetchFromServer() {
  await store.dispatch("dataset/fetchDatasetBlobFiles", {
    datasetUUID: props.datasetUuid,
  });
}

const filteredItems = computed(() => {
  if (!searchQuery.value) return files.value;

  const q = searchQuery.value.toLowerCase();
  return files.value.filter((f) => f.name?.toLowerCase().includes(q));
});

function formatDate(ts) {
  if (!ts) return { date: "", time: "" };
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

function formatSize(bytes) {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const columns = [
  { label: "Name", key: "name", sortable: true },
  { label: "Size", key: "size", sortable: true },
  { label: "Uploaded At", key: "uploadedAt", sortable: true },
  { label: "Actions", key: "actions" },
];

onMounted(async () => {
  await fetchFromServer();
});
</script>

<style scoped>
.file-search {
  max-width: 260px;
}
</style>
