<template>
  <component
    :is="embedded ? 'div' : 'v-card'"
    class="pa-0"
    v-bind="embedded ? {} : { variant: 'outlined' }"
  >
    <component
      :is="isServerSide ? VDataTableServer : VDataTable"
      :headers="headers"
      :items="displayItems"
      :loading="loading"
      :page="effectivePage"
      :items-per-page="effectiveItemsPerPage"
      :items-length="isServerSide ? totalItems : undefined"
    >
      <!-- CUSTOM HEADER  -->
      <template
        v-for="col in columns"
        :key="col.key"
        #[`header.${col.key}`]="{ column }"
      >
        <span
          v-if="col.sortable"
          class="d-inline-flex align-center cursor-pointer"
          @click="onSort(column)"
        >
          {{ column.title }}
          <span class="material-symbols-outlined ms-1">
            {{ sortIcon(column.key) }}
          </span>
        </span>

        <span v-else>
          {{ column.title }}
        </span>
      </template>

      <!-- CELL SLOTS -->
      <template
        v-for="col in columns"
        :key="col.key"
        #[`item.${col.key}`]="slotProps"
      >
        <slot :name="`item.${col.key}`" v-bind="slotProps">
          {{ slotProps.value }}
        </slot>
      </template>

      <!-- EMPTY -->
      <template #no-data>
        <div class="text-center py-8 text-grey">
          No records found.
        </div>
      </template>

      <!-- LOADING -->
      <template #loading>
        <div class="text-center py-6">
          <v-progress-circular indeterminate />
        </div>
      </template>

      <!-- FOOTER -->
      <template #bottom>
        <BaseTablePagination
          :page="effectivePage"
          :items-per-page="effectiveItemsPerPage"
          :total-items="isServerSide ? totalItems : displayItems.length"
          @update:page="onPageChange"
          @update:itemsPerPage="onItemsPerPageChange"
        />
      </template>
    </component>
  </component>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { VDataTable, VDataTableServer } from "vuetify/components/VDataTable";
import BaseTablePagination from "./BaseTablePagination.vue";

const props = defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  page: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 10 },
  totalItems: { type: Number, default: 0 },
  embedded: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:page",
  "update:itemsPerPage",
  "update:sort",
]);

const isServerSide = computed(() => props.totalItems > 0);

const clientPage = ref(1);
const clientItemsPerPage = ref(props.itemsPerPage);

const effectivePage = computed(() =>
  isServerSide.value ? props.page : clientPage.value
);

const effectiveItemsPerPage = computed(() =>
  isServerSide.value ? props.itemsPerPage : clientItemsPerPage.value
);

function onPageChange(page) {
  if (isServerSide.value) {
    emit("update:page", page);
  } else {
    clientPage.value = page;
  }
}

function onItemsPerPageChange(ipp) {
  if (isServerSide.value) {
    emit("update:itemsPerPage", ipp);
  } else {
    clientItemsPerPage.value = ipp;
    clientPage.value = 1;
  }
}

const sortState = ref(null); // { key, order }

function onSort(column) {
  if (!column.sortable) return;

  if (!sortState.value || sortState.value.key !== column.key) {
    sortState.value = { key: column.key, order: "asc" };
  } else {
    sortState.value = {
      key: column.key,
      order: sortState.value.order === "asc" ? "desc" : "asc",
    };
  }

  if (isServerSide.value) {
    emit("update:sort", {
      key: sortState.value.key,
      direction: sortState.value.order,
    });
  }
}

function sortIcon(key) {
  if (!sortState.value || sortState.value.key !== key) {
    return "arrow_drop_up";
  }
  return sortState.value.order === "asc"
    ? "arrow_drop_up"
    : "arrow_drop_down";
}

const displayItems = computed(() => {
  if (isServerSide.value || !sortState.value) {
    return props.data;
  }

  const { key, order } = sortState.value;

  return [...props.data].sort((a, b) => {
    if (a[key] < b[key]) return order === "asc" ? -1 : 1;
    if (a[key] > b[key]) return order === "asc" ? 1 : -1;
    return 0;
  });
});

const headers = computed(() =>
  props.columns.map((col) => ({
    title: col.label,
    key: col.key,
    sortable: !!col.sortable,
    align: col.align,
  }))
);

watch(
  () => props.data,
  () => {
    if (!isServerSide.value) return;
    // optional: keep or reset server sort
  }
);
</script>


