<template>
    <v-app-bar
      color="rgb(12,35,60)"
      dark
      flat
      height="64"
      class="px-4 d-flex align-center"
    >
      <!-- Sidebar Toggle -->
      <v-btn
        icon
        class="mr-4"
        @click="$emit('toggle-sidebar')"
        variant="text"
      >
        <v-icon size="28">mdi-menu</v-icon>
      </v-btn>
      <!-- Long Logo / App Title -->
      <div class="d-flex align-center">
        <span class="text-h6 font-weight-medium">KPMG</span>
      </div>
      <v-spacer />
      <!-- Right-aligned Menu Items -->
      <div class="d-flex align-center text-body-1">
        <v-btn
          v-for="(item, index) in navItems"
          :key="index"
          text
          class="mx-1 text-white text-capitalize"
          :to="item.route"
        >
          <v-icon start>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
        <!-- User Icon -->
        <v-avatar size="36" color="white" class="cursor-pointer ml-2">
          <v-icon color="rgb(12,35,60)">mdi-account</v-icon>
        </v-avatar>
      </div>
    </v-app-bar>
  </template>
  <script setup>
  import { ref } from "vue";
  const navItems = [
    { title: "Soft Docs", icon: "mdi-file-document-outline", route: "/soft-docs" },
    { title: "Home", icon: "mdi-home-outline", route: "/" },
    { title: "Inbox", icon: "mdi-inbox-outline", route: "/inbox" },
    { title: "Quick Links", icon: "mdi-link-variant", route: "/quick-links" },
    { title: "Select Entity", icon: "mdi-graph-outline", route: "/quick-links" },
  ];
  </script>
  <style scoped>
  .entity-select .v-field__input,
  .entity-select .v-label {
    color: white !important;
  }
  .v-btn.text-white:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
  </style>