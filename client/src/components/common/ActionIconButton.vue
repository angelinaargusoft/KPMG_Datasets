<template>
  <v-tooltip v-if="tooltip" location="bottom">
    <template #activator="{ props }">
      <v-btn
        icon
        v-bind="props"
        class="action-btn"
        :color="resolved.color"
        :variant="variant"
        @click="$emit('click')"
      >
        <span class="material-symbols-outlined">
          {{ resolved.icon }}
        </span>
      </v-btn>
    </template>
    <span>{{ tooltip }}</span>
  </v-tooltip>

  <!-- Fallback without tooltip -->
  <v-btn
    v-else
    icon
    class="action-btn"
    :color="resolved.color"
    :variant="variant"
    @click="$emit('click')"
  >
    <span class="material-symbols-outlined">
      {{ resolved.icon }}
    </span>
  </v-btn>
</template>

<script setup>
import { computed } from "vue";
import { ACTION_BUTTONS } from "@/config/actionButtons";

const props = defineProps({
  type: {
    type: String,
    required: true, // 'edit' | 'delete' | 'download' | etc
  },
  // optional overrides
  icon: String,
  color: String,
  tooltip: String,
  variant: {
    type: String,
    default: "outlined", // or 'flat', 'outlined', etc.
  },
});

const resolved = computed(() => {
  const def = ACTION_BUTTONS[props.type] || {};
  return {
    icon: props.icon || def.icon || "help",
    color: props.color || def.color || "primary",
  };
});

const tooltip = computed(() => props.tooltip || ACTION_BUTTONS[props.type]?.tooltip || "");
</script>

<style scoped>
.action-btn {
  height: 32px !important;
  width: 32px !important;
  min-width: 32px !important;
  padding: 0 !important;
  margin-right: 8px;
}

.action-btn .material-symbols-outlined {
  font-size: 20px;
  transition: color 0.2s ease, opacity 0.2s ease;
}
</style>
