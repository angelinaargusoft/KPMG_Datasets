const mutations = {
  setDatasets(state, datasets) {
    state.datasets = datasets;
  },
  setCurrentDataset(state, dataset) {
    state.currentDataset = dataset;
  },
  setLoading(state, val) {
    state.loading = val;
  },
  setError(state, err) {
    state.error = err;
  },
  setPagination(state, pagination) {
    state.pagination = pagination;
  },
};

export default mutations;
