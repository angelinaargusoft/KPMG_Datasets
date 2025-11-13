<template>
    <v-navigation-drawer
      v-model="drawer"
      color="white"
      width="250"
      app
      class="elevation-1"
    >
      <v-list>
        <!-- Collapsible Group: Data Sources -->
        <v-list-group
          prepend-icon="mdi-database-outline"
          value="true"
          class="menu-item"
        >
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="Data Sources" />
          </template>
          <!-- Sub Items (No Icons) -->
          <v-list-item
            v-for="(child, index) in dataSources"
            :key="index"
            :to="child.route"
            link
            class="sub-item"
          >
            <v-list-item-title class="text-body-1">
              {{ child.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
  </template>
  <script setup>
  import { ref } from "vue";
  const drawer = ref(true);
  const dataSources = [
    { title: "Datasets", route: "/admin/datasets" },
    { title: "Data Export", route: "/data-export" },
    { title: "Data Endpoints", route: "/data-endpoints" },
  ];
  </script>
  <style scoped>

  .menu-item:hover {
    background-color: #f0f4ff;
  }
  .sub-item {
    border-radius: 6px;
    margin-left: 12px; /* reduced indentation for better visibility */
    margin-top: 2px;
    margin-bottom: 2px;
    transition: background-color 0.2s ease;
    padding-left: 16px; /* aligns text neatly */
  }
  .sub-item:hover {
    background-color: #eef3ff;
  }
  </style>