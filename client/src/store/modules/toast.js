// store/modules/toast.js
export default {
    namespaced: true,
  
    state: () => ({
      toasts: []
    }),
  
    mutations: {
      ADD_TOAST(state, toast) {
        state.toasts.push(toast);
      },
      REMOVE_TOAST(state, id) {
        state.toasts = state.toasts.filter(t => t.id !== id);
      }
    },
  
    actions: {
      show({ commit }, options) {
        commit('ADD_TOAST', {
          id: Date.now(),
          show: true,
          message: options.message,
          type: options.type || 'info', // success | error 
          timeout: options.timeout || 3000
        });
      }
    }
  };
  
  