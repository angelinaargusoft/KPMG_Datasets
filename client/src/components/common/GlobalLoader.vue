<template>
    <div v-if="isLoading" class="global-loader">
      <v-progress-linear
        indeterminate
        color="primary"
        height="6"
      />
    </div>
  </template>
  
  <script setup>
  import { computed } from "vue";
  import { useStore } from "vuex";
  
  const store = useStore();
  
  const isLoading = computed(
    () => store.getters["loader/isLoading"]
  );
  </script>
  
  <style scoped>
  .global-loader {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;
  }
  </style>
  