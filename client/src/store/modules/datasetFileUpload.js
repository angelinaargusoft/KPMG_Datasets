// src/store/modules/datasetUpload.js

import {
    uploadDatasetFile,
    getDatasetFiles,
    deleteDatasetFile,
  } from "@/features/dataset/api/fileUploadService";
  
  const state = () => ({
    files: [],          // list of uploaded files for current dataset
    loading: false,
    error: null,
  });
  
  const getters = {
    files: (state) => state.files,
    loading: (state) => state.loading,
    error: (state) => state.error,
  };
  
  const actions = {
    // Fetch all uploaded files for a dataset (by UUID)
    async fetchDatasetFiles({ commit }, datasetUUID) {
      commit("setLoading", true);
      commit("setError", null);
      try {
        const files = await getDatasetFiles(datasetUUID);
        commit("setFiles", files);
        return files;
      } catch (err) {
        commit("setError", err.message);
        commit("setFiles", []);
        return [];
      } finally {
        commit("setLoading", false);
      }
    },
  
    // Upload a single file to a dataset, then refresh list
    async uploadFileToDataset({ commit, dispatch }, { datasetUUID, file }) {
      commit("setLoading", true);
      commit("setError", null);
      try {
        await uploadDatasetFile(datasetUUID, file);
        await dispatch("fetchDatasetFiles", datasetUUID);
        return true;
      } catch (err) {
        commit("setError", err.message);
        return false;
      } finally {
        commit("setLoading", false);
      }
    },
  
    // Delete an uploaded file (by upload history record ID), then refresh list
    async removeDatasetFile({ commit, dispatch }, { recordId, datasetUUID }) {
      commit("setLoading", true);
      commit("setError", null);
      try {
        await deleteDatasetFile(recordId);
        await dispatch("fetchDatasetFiles", datasetUUID);
        return true;
      } catch (err) {
        commit("setError", err.message);
        return false;
      } finally {
        commit("setLoading", false);
      }
    },
  
    // Reset files list
    resetFiles({ commit }) {
      commit("setFiles", []);
    },
  };
  
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
  };
  
  export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
  };
  