<template>
    <div class="toaster">
      <v-snackbar
        v-for="toast in toasts"
        :key="toast.id"
        v-model="toast.show"
        location="top right"
        :timeout="toast.timeout"
        :class="['app-toast', `app-toast--${toast.type}`]"
        @update:model-value="remove(toast.id)"
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
  import { mapState, mapMutations } from 'vuex';
  
  export default {
    computed: {
      ...mapState('toast', ['toasts']),
  
      iconMap() {
        return {
          success: 'check_circle',
          error: 'error',
          warning: 'warning',
          info: 'info'
        };
      }
    },
  
    methods: {
      ...mapMutations('toast', {
        remove: 'REMOVE_TOAST'
      })
    }
  };
  </script>
  
  <style>
  .app-toast {
    padding: 0 !important;
  }
  
  .app-toast .v-snackbar__wrapper {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    min-width: 280px;
    max-width: 420px;
  }
  
  .toast-content {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'Roboto', sans-serif;
  }
  
  .toast-text {
    font-size: 14px;
    line-height: 1.4;
  }
  
  .toast-icon {
    font-size: 22px;
    line-height: 1;
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
  
  /* WARNING
  .app-toast--warning .v-snackbar__wrapper {
    background-color: #fff8e1;
    color: #795548;
  }
  
  .app-toast--warning .toast-icon {
    color: #f9a825;
  } */
  
  /* INFO
  .app-toast--info .v-snackbar__wrapper {
    background-color: #e3f2fd;
    color: #0d47a1;
  }
  
  .app-toast--info .toast-icon {
    color: #1976d2;
  } */
  </style>
  
