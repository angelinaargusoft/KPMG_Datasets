import {
    getAllDataEndpoints,
    getDataEndpointByUUID,
    createDataEndpoint,
    updateDataEndpoint,
    deleteDataEndpoint,
  } from "@/features/dataEndpoint/api/dataEndpointService";
  
  const state = () => ({
    dataEndpoints: [],
    currentDataEndpoint: null,
    loading: false,
    error: null,
  });
  
  const getters = {
    dataEndpoints: (state) => state.dataEndpoints,
    currentDataEndpoint: (state) => state.currentDataEndpoint,
    loading: (state) => state.loading,
    error: (state) => state.error,
  };
  
  const actions = {
    // Fetch all data endpoints
    async fetchDataEndpoints({ commit }) {
      commit("setLoading", true);
      commit("setError", null);
      try {
        const endpoints = await getAllDataEndpoints();
        commit("setDataEndpoints", endpoints);
      } catch (err) {
        commit("setError", err.message);
      } finally {
        commit("setLoading", false);
      }
    },
  
    // Fetch single data endpoint by UUID
    async fetchDataEndpointByUUID({ commit }, uuid) {
      commit("setLoading", true);
      commit("setError", null);
      try {
        const endpoint = await getDataEndpointByUUID(uuid);
        commit("setCurrentDataEndpoint", endpoint);
        return endpoint;
      } catch (err) {
        commit("setError", err.message);
        commit("setCurrentDataEndpoint", null);
        return null;
      } finally {
        commit("setLoading", false);
      }
    },
  
    // Create or update data endpoint
    async saveDataEndpoint({ commit, dispatch }, { endpointId, endpoint }) {
      commit("setLoading", true);
      commit("setError", null);
      try {
        let savedEndpoint;
        if (!endpointId) {
          // Create new endpoint
          savedEndpoint = await createDataEndpoint(endpoint);
        } else {
          // Update existing endpoint (id in URL)
          savedEndpoint = await updateDataEndpoint(endpointId, endpoint);
        }
  
        commit("setCurrentDataEndpoint", savedEndpoint);
        // Refresh list
        await dispatch("fetchDataEndpoints");
        return savedEndpoint;
      } catch (err) {
        commit("setError", err.message);
        return false;
      } finally {
        commit("setLoading", false);
      }
    },
  
    // Delete data endpoint
    async removeDataEndpoint({ commit, dispatch }, endpointId) {
      commit("setLoading", true);
      commit("setError", null);
      try {
        await deleteDataEndpoint(endpointId);
        await dispatch("fetchDataEndpoints");
        return true;
      } catch (err) {
        commit("setError", err.message);
        return false;
      } finally {
        commit("setLoading", false);
      }
    },
  
    // Reset current endpoint
    resetCurrentDataEndpoint({ commit }) {
      commit("setCurrentDataEndpoint", null);
    },
  };
  
  const mutations = {
    setDataEndpoints(state, endpoints) {
      state.dataEndpoints = endpoints;
    },
    setCurrentDataEndpoint(state, endpoint) {
      state.currentDataEndpoint = endpoint;
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
  