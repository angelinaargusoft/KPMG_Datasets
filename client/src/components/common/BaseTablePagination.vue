<template>
  <!-- Pagination + info + rows-per-page -->
  <div class="d-flex align-center px-4 py-4">
    <!-- LEFT: Page & records info -->
    <div>
      <b>{{ totalItems }}</b> records
    </div>

    <!-- CENTER: Pagination controls -->
    <div class="d-flex justify-center flex-grow-1">
      <!-- Prev button -->
      <v-btn
        icon
        variant="text"
        class="mr-2"
        :disabled="page <= 1"
        @click="changePage(page - 1)"
      >
        <span class="material-symbols-outlined"> chevron_left </span>
      </v-btn>

      <!-- Page numbers + ellipsis -->
      <div class="d-flex align-center">
        <template v-for="p in pages" :key="`page-${p}`">
          <!-- Ellipsis (non-clickable) -->
          <span v-if="p === '...'" class="ellipsis"> ... </span>

          <!-- Page button -->
          <v-btn
            v-else
            class="page-btn"
            :class="{ active: p === page }"
            @click="changePage(p)"
            variant="text"
          >
            <span class="page-number">{{ p }}</span>
          </v-btn>
        </template>
      </div>

      <!-- Next button -->
      <v-btn
        icon
        variant="text"
        class="ml-2"
        :disabled="page >= pageCount"
        @click="changePage(page + 1)"
      >
        <span class="material-symbols-outlined"> chevron_right </span>
      </v-btn>
    </div>

    <!-- RIGHT: Rows per page selector -->
    <div class="d-flex align-center">
      <span class="mr-2">Rows per page</span>
      <v-select
        :items="itemsPerPageOptions"
        :model-value="itemsPerPage"
        density="compact"
        variant="outlined"
        hide-details
        style="max-width: 90px"
        :menu-icon="false"
        @update:model-value="changeItemsPerPage"
      >
        <template #append-inner>
          <span class="material-symbols-outlined"> expand_more </span>
        </template>
      </v-select>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  page: {
    type: Number,
    default: 1,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  totalItems: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:page", "update:itemsPerPage"]);

const pageCount = computed(() => {
  if (!props.totalItems || !props.itemsPerPage) return 1;
  return Math.ceil(props.totalItems / props.itemsPerPage);
});

const maxVisiblePages = 5;
const itemsPerPageOptions = [10, 25, 50, 100];

const pages = computed(() => {
  const total = pageCount.value || 1;
  const current = props.page;
  const pagesArray = [];

  if (total <= maxVisiblePages) {
    for (let i = 1; i <= total; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }

  const showLeftEllipsis = current > 3;
  const showRightEllipsis = current < total - 2;

  pagesArray.push(1);

  if (showLeftEllipsis && !showRightEllipsis) {
    pagesArray.push("...");
    for (let i = total - 3; i < total; i++) {
      pagesArray.push(i);
    }
  } else if (!showLeftEllipsis && showRightEllipsis) {
    for (let i = 2; i <= 4; i++) {
      pagesArray.push(i);
    }
    pagesArray.push("...");
  } else if (showLeftEllipsis && showRightEllipsis) {
    pagesArray.push("...");
    pagesArray.push(current - 1);
    pagesArray.push(current);
    pagesArray.push(current + 1);
    pagesArray.push("...");
  } else {
    for (let i = 2; i <= total; i++) {
      pagesArray.push(i);
    }
  }

  if (pagesArray[pagesArray.length - 1] !== total) {
    pagesArray.push(total);
  }

  return pagesArray;
});

function changePage(newPage) {
  if (newPage < 1 || newPage > pageCount.value) return;
  emit("update:page", newPage);
}

function changeItemsPerPage(newVal) {
  const value = Number(newVal) || 10;
  emit("update:itemsPerPage", value);
  emit("update:page", 1);
}
</script>

<style scoped>
.page-number {
  font-size: 16px;
  font-weight: 500;
}

.ellipsis {
  font-size: 18px;
  font-weight: 600;
  margin: 0 4px;
}

.material-symbols-outlined {
  font-size: 22px;
}

.page-btn {
  height: 36px !important;
  width: 36px !important;
  min-width: 36px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  margin: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;
}

.page-btn:hover {
  background-color: rgba(25, 118, 210, 0.12);
}

.page-btn.active {
  background-color: #1976d2 !important;
  color: white !important;
}
</style>
