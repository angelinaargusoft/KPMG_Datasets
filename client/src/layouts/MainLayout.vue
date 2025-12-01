<template>
    <Navbar @toggle-sidebar="rail = !rail" />
    <Sidebar :rail="rail" @expand-request="rail = false" />
    <v-main class="main-content">
      <v-container fluid class="pa-0">
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

  
  
  
  
  