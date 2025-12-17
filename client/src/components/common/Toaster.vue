<template>
  <div class="toaster">
    <v-snackbar
      v-for="(toast, index) in toasts"
      :key="toast.id"
      v-model="toast.show"
      location="top right"
      :timeout="toast.timeout"
      :class="['app-toast', `app-toast--${toast.type}`]"
      :style="{ top: `${topOffsets[index]}px` }"
      @update:model-value="remove(toast.id)"
      @click="close(toast.id)"
    >
      <div class="toast-content">
        <span class="material-symbols-outlined toast-icon">
          {{ iconMap[toast.type] }}
        </span>

        <span class="toast-text">
          {{ toast.message }}
        </span>
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'AppToaster',

  computed: {
    ...mapState('toast', ['toasts']),

    iconMap() {
      return {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
      }
    },

    // 🔑 THIS IS WHAT PREVENTS OVERLAP
    topOffsets() {
      const BASE_TOP = 64     // distance from top of screen
      const TOAST_HEIGHT = 72  // adjust if your toasts are taller

      return this.toasts.map(
        (_, index) => BASE_TOP + index * TOAST_HEIGHT
      )
    }
  },

  methods: {
    ...mapMutations('toast', {
      remove: 'REMOVE_TOAST'
    }),
    close(id) {
    this.remove(id)
  }
  }
}
</script>

<style>
.toaster {
  pointer-events: none;
}

.app-toast {
  pointer-events: auto;
  transition: top 0.25s ease, opacity 0.2s ease;
  padding: 0 !important;
}

.app-toast .v-snackbar__wrapper {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  min-width: 280px;
  max-width: 420px;
}

/* content layout */
.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-family: 'Roboto', sans-serif;
}

.toast-icon {
  font-size: 22px;
  line-height: 1;
  flex-shrink: 0;
}

.toast-text {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

/* SUCCESS */
.app-toast--success .v-snackbar__wrapper {
  background-color: #e8f5e9;
  color: #1b5e20;
}

.app-toast--success .toast-icon {
  color: #2e7d32;
}

/* ERROR */
.app-toast--error .v-snackbar__wrapper {
  background-color: #fdecea;
  color: #b71c1c;
}

.app-toast--error .toast-icon {
  color: #d32f2f;
}
</style>

  
