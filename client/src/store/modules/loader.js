export default {
    namespaced: true,
  
    state: () => ({
      count: 0,
    }),
  
    getters: {
      isLoading: (state) => state.count > 0,
    },
  
    mutations: {
      START(state) {
        state.count++;
      },
      STOP(state) {
        state.count = Math.max(0, state.count - 1);
      },
      RESET(state) {
        state.count = 0;
      },
    },
  
    actions: {
      start({ commit }) {
        commit("START");
      },
      stop({ commit }) {
        commit("STOP");
      },
      reset({ commit }) {
        commit("RESET");
      },
    },
  };
  