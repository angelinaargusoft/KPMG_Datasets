<template>
  <v-app-bar color="rgb(12,35,60)" dark flat height="64" class=" d-flex align-center">
  <v-btn icon class="mr-4" @click="$emit('toggle-sidebar')" variant="text">
    <span class="material-symbols-outlined">menu</span>
  </v-btn>

  <span class="text-h6 font-weight-medium">KPMG</span>

  <v-spacer />

  <v-btn
    v-for="item in navItems"
    :key="item.title"
    text
    class="mx-1 px-2 text-white text-capitalize"
    :to="item.route"
  >
    <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
    {{ item.title }}
  </v-btn>
  <v-btn icon class="cursor-pointer mx-2">
    <span class="material-symbols-outlined">person</span>
  </v-btn>
</v-app-bar>

</template>
<script setup>
const navItems = [
  { title: "Soft Docs", icon: "book_2", route: "/soft-docs" },
  { title: "Home", icon: "home", route: "/" },
  { title: "Inbox", icon: "mail", route: "/inbox" },
  { title: "Quick Links", icon: "star", route: "/quick-links" },
  { title: "Select Entity", icon: "graph_2", route: "/quick-links" },
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
.nav-icon {
  font-size: 20px;
  margin-right: 6px;
  display: inline-flex;
  align-items: center;
}
</style>