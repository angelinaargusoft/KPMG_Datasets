<template>
  <v-navigation-drawer v-model="drawer" :rail="rail" rail-width="52" color="white" width="250" app>
    <v-list>
      <v-list-group value="true" class="menu-item" expand-icon="" collapse-icon="">
        <template #activator="{ props: listProps }">
          <v-list-item v-bind="listProps" title="Data Sources" @click="handleActivatorClick">
            <template #prepend>
              <span class="material-symbols-outlined nav-icon">
                database
              </span>
            </template>
          </v-list-item>
        </template>


        <v-list-item v-for="child in dataSources" :key="child.title" :to="child.route" link>
          <v-list-item-title>{{ child.title }}</v-list-item-title>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  rail: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["expand-request"]);

const drawer = ref(true);

const dataSources = [
  { title: "Datasets", route: "/admin/datasets" },
  { title: "Data Export", route: "/data-export" },
  { title: "Data Endpoints", route: "/data-endpoints" },
];

const handleActivatorClick = () => {
  // if collapsed, ask parent to expand
  if (props.rail) {
    emit("expand-request");
  }
};
</script>


<style scoped>
:deep(.v-list-group__items .v-list-item) {
  padding-inline-start: 52px !important
}

.nav-icon {
  font-size: 22px;
  margin-right: 12px;
  display: inline-flex;
  align-items: center;
}

.menu-item:hover {
  background-color: #f0f4ff;
}

:deep(.v-navigation-drawer--rail .v-list-item-title) {
  display: none;
}

:deep(.v-navigation-drawer--rail .v-list-item__prepend) {
  justify-content: center;
  margin-right: 0;
}

/* Optional: slightly smaller icons in rail */
:deep(.v-navigation-drawer--rail .nav-icon) {
  font-size: 20px;
}
</style>
