<template>
  <v-card outlined class="pa-0 elevation-1 base-table">
    <!-- Header Row -->
    <v-row class="font-weight-medium py-3 px-4 bg-light" no-gutters>
      <v-col
        v-for="col in columns"
        :key="col.key"
        :cols="col.cols || 2"
        :class="[
          col.headerClass,
          col.sortable ? 'sortable-header' : ''
        ]"
        @click="onHeaderClick(col)"
      >
        <div class="header-content">
          <span>{{ col.label }}</span>

          <!-- Sort icon always shown for sortable columns -->
          <span
            v-if="col.sortable"
            class="material-symbols-outlined sort-icon"
            :class="{
              active: sortKey === col.key && sortDirection,
            }"
          >
            {{ getSortIcon(col) }}
          </span>
        </div>
      </v-col>

      <!-- Action Column -->
      <v-col v-if="showActions" :cols="actionsCols">
        Actions
      </v-col>
    </v-row>

    <!-- Body (rows slot with sorted items + columns) -->
    <slot
      name="rows"
      :items="sortedItems"
      :columns="columns"
    />

    <!-- Empty State -->
    <div
      v-if="!loading && !hasData"
      class="text-center py-8 text-grey"
    >
      {{ emptyText }}
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="text-center py-8"
    >
      <v-progress-circular indeterminate />
    </div>
  </v-card>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: "No records found.",
  },
  actionsCols: {
    type: Number,
    default: 2,
  },
});

// ---------- state ----------
const sortKey = ref(null);        // current sorted column key
const sortDirection = ref(null);  // "asc" | "desc" | null

const hasData = computed(
  () => Array.isArray(props.data) && props.data.length > 0
);

// ---------- sorting logic ----------
function onHeaderClick(col) {
  if (!col.sortable || !col.key) return;

  if (sortKey.value === col.key) {
    // toggle asc <-> desc
    sortDirection.value =
      sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = col.key;
    sortDirection.value = "asc";
  }
}

const sortedItems = computed(() => {
  const items = props.data || [];

  if (!sortKey.value || !sortDirection.value) {
    return items;
  }

  const key = sortKey.value;
  const dir = sortDirection.value;

  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    let result;

    if (typeof aVal === "number" && typeof bVal === "number") {
      result = aVal - bVal;
    } else {
      const aDate = Date.parse(aVal);
      const bDate = Date.parse(bVal);

      if (!isNaN(aDate) && !isNaN(bDate)) {
        result = aDate - bDate;
      } else {
        result = String(aVal).localeCompare(String(bVal));
      }
    }

    return dir === "asc" ? result : -result;
  });
});

// ---------- helper for icon text ----------
function getSortIcon(col) {
  // not sortable? shouldn't be called but safe default
  if (!col.sortable) return "arrow_drop_up";

  // if this column is not the active sort → light default icon
  if (sortKey.value !== col.key || !sortDirection.value) {
    return "arrow_drop_up";
  }

  // active column: pick icon by direction
  return sortDirection.value === "asc"
    ? "arrow_drop_up"
    : "arrow_drop_down";
}
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

.sortable-header {
  cursor: pointer;
}

.header-content {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

/* default weak icon */
.sort-icon {
  font-size: 20px;
  opacity: 0.3;
  transition: opacity 0.2s, color 0.2s;
}

/* when column is actively sorted */
.sort-icon.active {
  opacity: 1;
  color: #424242;
}

/* optional: hover effect */
.sort-icon:hover {
  opacity: 1;
  color: #424242;
}
</style>

