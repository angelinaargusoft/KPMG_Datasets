// src/store/modules/datasetUpload.js

import {
  uploadDatasetFile,
  getDatasetFiles,
  deleteDatasetFile,
} from "@/features/dataset/api/fileUploadService";

const state = () => ({
  files: [],
  loading: false,
  error: null,
  pagination: null,
});

const getters = {
  files: (state) => state.files,
  loading: (state) => state.loading,
  error: (state) => state.error,
  pagination: (state) => state.pagination,
};

const actions = {
  // Fetch uploaded files for a dataset (by UUID) with pagination
  async fetchDatasetFiles({ commit }, payload) {
    commit("setLoading", true);
    commit("setError", null);

    // Support both:
    // 1) fetchDatasetFiles("uuid")
    // 2) fetchDatasetFiles({ datasetUUID: "uuid", page, pageSize })
    let datasetUUID;
    let page = 1;
    let pageSize = 10;

    if (typeof payload === "string") {
      datasetUUID = payload;
    } else if (payload && typeof payload === "object") {
      datasetUUID = payload.datasetUUID;
      page = payload.page ?? 1;
      pageSize = payload.pageSize ?? 10;
    }

    try {
      const { files, pagination } = await getDatasetFiles(datasetUUID, {
        page,
        pageSize,
      });

      commit("setFiles", files);
      commit("setPagination", pagination);
      return files;
    } catch (err) {
      commit("setError", err.message || "Failed to fetch dataset files");
      commit("setFiles", []);
      commit("setPagination", null);
      return [];
    } finally {
      commit("setLoading", false);
    }
  },
  // Upload a single file to a dataset, then refresh list
  async uploadFileToDataset(
    { commit, dispatch, state },
    { datasetUUID, file }
  ) {
    commit("setLoading", true);
    commit("setError", null);
    try {
      await uploadDatasetFile(datasetUUID, file);

      // keep the current page if available
      const page = state.pagination?.page || 1;
      const pageSize = state.pagination?.pageSize || 10;

      await dispatch("fetchDatasetFiles", { datasetUUID, page, pageSize });
      return true;
    } catch (err) {
      commit("setError", err.message || "Failed to upload file");
      return false;
    } finally {
      commit("setLoading", false);
    }
  },

  // Delete an uploaded file (by upload UUID), then refresh list
  async removeDatasetFile(
    { commit, dispatch, state },
    { datasetUUID, uploadUUID }
  ) {
    commit("setLoading", true);
    commit("setError", null);
    try {
      await deleteDatasetFile(datasetUUID, uploadUUID);

      // keep the current page if available
      const page = state.pagination?.page || 1;
      const pageSize = state.pagination?.pageSize || 10;

      await dispatch("fetchDatasetFiles", { datasetUUID, page, pageSize });
      return true;
    } catch (err) {
      commit("setError", err.message || "Failed to delete file");
      return false;
    } finally {
      commit("setLoading", false);
    }
  },

  // Reset files list (e.g. on dataset change / route leave)
  resetFiles({ commit }) {
    commit("setFiles", []);
    commit("setPagination", null);
    commit("setError", null);
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
