const getters = {
  datasets: (state) => state.datasets,
  currentDataset: (state) => state.currentDataset,
  loading: (state) => state.loading,
  error: (state) => state.error,
  pagination: (state) => state.pagination,
};

export default getters;
