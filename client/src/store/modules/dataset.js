import {
  getAllDatasets,
  getDatasetById,
  getDatasetByUUID,
  createDataset,
  updateDataset,
  deleteDataset,
} from "@/features/dataset/api/datasetService";

const state = () => ({
  datasets: [],
  currentDataset: null,
  loading: false,
  error: null,
  pagination: null,
});

const getters = {
  datasets: (state) => state.datasets,
  currentDataset: (state) => state.currentDataset,
  loading: (state) => state.loading,
  error: (state) => state.error,
  pagination: (state) => state.pagination,
};

const actions = {
  // Fetch datasets with pagination
  async fetchDatasets({ commit }, { page = 1, pageSize = 10 } = {}) {
    commit("setLoading", true);
    commit("setError", null);
    try {
      // backend should return: { data, pagination }
      const { data, pagination } = await getAllDatasets(page, pageSize);
      commit("setDatasets", data);
      commit("setPagination", pagination);
    } catch (err) {
      commit("setError", err.message || "Failed to fetch datasets");
    } finally {
      commit("setLoading", false);
    }
  },

  // Fetch single dataset by ID
  async fetchDatasetById({ commit }, datasetId) {
    commit("setLoading", true);
    commit("setError", null);
    try {
      const dataset = await getDatasetById(datasetId);
      commit("setCurrentDataset", dataset);
    } catch (err) {
      commit("setError", err.message);
      commit("setCurrentDataset", null);
    } finally {
      commit("setLoading", false);
    }
  },

  // Fetch dataset by UUID
  async fetchDatasetByUUID({ commit }, uuid) {
    commit("setLoading", true);
    commit("setError", null);
    try {
      const dataset = await getDatasetByUUID(uuid);
      commit("setCurrentDataset", dataset);
      return dataset;
    } catch (err) {
      commit("setError", err.message);
      commit("setCurrentDataset", null);
      return null;
    } finally {
      commit("setLoading", false);
    }
  },

  // Create or update dataset
  async saveDataset({ commit, dispatch, state }, { datasetId, dataset }) {
    commit("setLoading", true);
    commit("setError", null);
    try {
      let savedDataset;
      if (!datasetId) {
        // Create new dataset
        savedDataset = await createDataset(dataset);
      } else {
        // Update existing dataset
        savedDataset = await updateDataset(datasetId, dataset);
      }

      commit("setCurrentDataset", savedDataset);

      // Refresh dataset list after save, keeping current page if available
      const page = state.pagination?.page || 1;
      const pageSize = state.pagination?.pageSize || 10;
      await dispatch("fetchDatasets", { page, pageSize });

      return savedDataset;
    } catch (err) {
      commit("setError", err.message);
      return false;
    } finally {
      commit("setLoading", false);
    }
  },

  // Delete dataset
  async removeDataset({ commit, dispatch, state }, datasetId) {
    commit("setLoading", true);
    commit("setError", null);
    try {
      await deleteDataset(datasetId);

      // Refresh dataset list after deletion, keep current page
      const page = state.pagination?.page || 1;
      const pageSize = state.pagination?.pageSize || 10;
      await dispatch("fetchDatasets", { page, pageSize });

      return true;
    } catch (err) {
      commit("setError", err.message);
      return false;
    } finally {
      commit("setLoading", false);
    }
  },

  // Reset current dataset
  resetCurrentDataset({ commit }) {
    commit("setCurrentDataset", null);
  },
};

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

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
