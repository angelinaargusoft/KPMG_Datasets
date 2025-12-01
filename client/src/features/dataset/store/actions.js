import {
  getAllDatasets,
  getDatasetById,
  getDatasetByUUID,
  createDataset,
  updateDataset,
  deleteDataset,
} from "../list/services/datasetService";

const actions = {
  async fetchDatasets({ commit }, { page = 1, pageSize = 10 } = {}) {
    commit("setLoading", true);
    commit("setError", null);
    try {
      const { data, pagination } = await getAllDatasets(page, pageSize);
      commit("setDatasets", data);
      commit("setPagination", pagination);
    } catch (err) {
      commit("setError", err.message || "Failed to fetch datasets");
    } finally {
      commit("setLoading", false);
    }
  },

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

  async saveDataset({ commit, dispatch, state }, { datasetId, dataset }) {
    commit("setLoading", true);
    commit("setError", null);
    try {
      let savedDataset;
      if (!datasetId) {
        savedDataset = await createDataset(dataset);
      } else {
        savedDataset = await updateDataset(datasetId, dataset);
      }

      commit("setCurrentDataset", savedDataset);

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

  async removeDataset({ commit, dispatch, state }, datasetId) {
    commit("setLoading", true);
    commit("setError", null);
    try {
      await deleteDataset(datasetId);

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

  resetCurrentDataset({ commit }) {
    commit("setCurrentDataset", null);
  },
};

export default actions;
