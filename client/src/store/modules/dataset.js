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
  });
  const getters = {
    datasets: (state) => state.datasets,
    currentDataset: (state) => state.currentDataset,
    loading: (state) => state.loading,
    error: (state) => state.error,
  };
  const actions = {
    // Fetch all datasets
    async fetchDatasets({ commit }) {
      commit("setLoading", true);
      commit("setError", null);
      try {
        const datasets = await getAllDatasets();
        commit("setDatasets", datasets);
      } catch (err) {
        commit("setError", err.message);
      } finally {
        commit("setLoading", false);
      }
    },
    //  Fetch single dataset by ID 
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
    //  Fetch dataset by UUID 
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
      } finally {
        commit("setLoading", false);
      }
    },
    // Create or update dataset
    async saveDataset({ commit, dispatch }, { datasetId, dataset }) {
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
        // Refresh dataset list after save
        await dispatch("fetchDatasets");
        return savedDataset;
      } catch (err) {
        commit("setError", err.message);
        return false;
      } finally {
        commit("setLoading", false);
      }
    },
    // Delete dataset
    async removeDataset({ commit, dispatch }, datasetId) {
      commit("setLoading", true);
      commit("setError", null);
      try {
        await deleteDataset(datasetId);
        // Refresh dataset list after deletion
        await dispatch("fetchDatasets");
        return true;
      } catch (err) {
        commit("setError", err.message);
        return false;
      } finally {
        commit("setLoading", false);
      }
    },
    //  Reset current dataset
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
  };
  export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
  };