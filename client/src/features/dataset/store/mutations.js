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
    state.pagination = {
      ...state.pagination,
      ...pagination,
    };
  },

  setBlobFiles(state, files) {
    state.blobFiles = files;
  },

  resetBlobFiles(state) {
    state.blobFiles = [];
  },
};

export default mutations;


