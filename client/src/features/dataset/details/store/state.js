const state = () => ({
  files: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    sortBy: null,
    sortDirection: null,
    search: null,
  },
});

export default state;
