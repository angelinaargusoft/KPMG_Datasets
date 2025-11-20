<template>
  <v-app>
    <component :is="layoutComponent">
      <router-view />
    </component>
  </v-app>
</template>
<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import MainLayout from "@/layouts/MainLayout.vue";

const route = useRoute();
const layoutComponent = computed(() => {
  const layout = route.meta.layout || "main";
  switch (layout) {
    case "main":
      return MainLayout;
    default:
      return MainLayout;
  }
});
</script>
<style>
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}
</style>
