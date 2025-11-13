<template>
    <v-app>
      <!-- Navbar with Sidebar toggle -->
      <Navbar @toggle-sidebar="drawer = !drawer" />
      <v-main class="main-content">
        <v-container fluid class="pa-0">
          <v-row no-gutters>
            <!-- Sidebar (visible when drawer = true) -->
       
              <Sidebar v-if="drawer"/>
         
            <!-- Main content -->
            <v-col
              :cols=12
              class="content-col pa-6 transition-all"
            >
              <router-view />
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </template>
  <script setup>
  import Navbar from "./components/Navbar.vue";
  import Sidebar from "./components/Sidebar.vue";
  import { ref } from "vue";
  const drawer = ref(true); // Controls sidebar visibility
  </script>
  <style scoped>
  .main-content {
    min-height: 100vh;
    background-color: #f8f9fb;
  }

  .content-col {
    background-color: #f9fafb;
    transition: all 0.3s ease;
  }
  </style>
  
  
  
  
  