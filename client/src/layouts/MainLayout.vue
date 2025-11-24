<template>
    <!-- Navbar with Sidebar toggle -->
    <Navbar @toggle-sidebar="rail = !rail" />

    <!-- Sidebar sticks to the left -->
    <Sidebar :rail="rail" @expand-request="rail = false" />

    <!-- Main scrollable content area -->
    <v-main class="main-content">
      <v-container fluid class="pa-0">
        <!-- Whatever page is active -->
        <router-view />
      </v-container>
    </v-main>
</template>

<script setup>
import Navbar from "./components/Navbar.vue";
import Sidebar from "./components/Sidebar.vue";
import { ref } from "vue";

const rail = ref(false); // false = full sidebar, true = collapsed (icons only)
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

  
  
  
  
  