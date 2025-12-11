const state = () => ({
  datasets: [],
  currentDataset: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    sortBy: null,
    sortDirection: null,
    search: "",
  },
});

export default state;
