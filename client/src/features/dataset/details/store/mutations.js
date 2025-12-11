const mutations = {
  setFiles(state, files) {
    state.files = files;
  },

  setLoading(state, val) {
    state.loading = val;
  },

  setError(state, err) {
    state.error = err;
  },

  // merge instead of replace, so we keep sortBy, sortDirection, search.
  setPagination(state, pagination) {
    state.pagination = {
      ...state.pagination,
      ...pagination,
    };
  },
};

export default mutations;

