import {
    getImportsByDataset,
    triggerImport,
  } from "@/features/inputHistory/api/inputHistoryService";
  
  const state = () => ({
    records: [],          
    currentRecord: null,  
    loading: false,
    error: null,
    pagination: null,
  });
  
  const getters = {
    records: (state) => state.records,
    currentRecord: (state) => state.currentRecord,
    loading: (state) => state.loading,
    error: (state) => state.error,
    pagination: (state) => state.pagination,
  };
  
  const actions = {
    async fetchImportsByDataset({ commit }, datasetUUID) {
      commit("setLoading", true);
      commit("setError", null);
  
      try {
        const records = await getImportsByDataset(datasetUUID);
  
        commit("setRecords", records);
        commit("setPagination", {
          page: 1,
          pageSize: records.length,
          totalItems: records.length,
          totalPages: 1,
          datasetUUID,
        });
  
        return records;
      } catch (err) {
        commit("setError", err.message || "Failed to fetch import history");
        commit("setRecords", []);
        return [];
      } finally {
        commit("setLoading", false);
      }
    },
  
    async createImport({ commit, dispatch }, { datasetUUID, uploadUUID }) {
      commit("setLoading", true);
      commit("setError", null);
  
      try {
        const response = await triggerImport({
          datasetUUID,
          uploadUUID,
        });
  
        const record = response.record || response;
  
        commit("setCurrentRecord", record);
  
        await dispatch("fetchImportsByDataset", datasetUUID);
  
        return record;
      } catch (err) {
        commit("setError", err.message || "Failed to trigger import");
        return false;
      } finally {
        commit("setLoading", false);
      }
    },
  
    resetCurrentRecord({ commit }) {
      commit("setCurrentRecord", null);
    },
  };
  
  const mutations = {
    setRecords(state, records) {
      state.records = records;
    },
    setCurrentRecord(state, record) {
      state.currentRecord = record;
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
  