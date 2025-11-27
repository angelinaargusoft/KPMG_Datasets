import {
  getAllEndpointServers,
  getEndpointServerByUUID,
  createEndpointServer,
  updateEndpointServer,
  deleteEndpointServer,
  getEndpointServerById,
} from "@/features/endpointServer/api/endpointServerService";

const state = () => ({
  endpointServers: [],
  currentEndpointServer: null,
  loading: false,
  error: null,
});

const getters = {
  endpointServers: (state) => state.endpointServers,
  currentEndpointServer: (state) => state.currentEndpointServer,
  loading: (state) => state.loading,
  error: (state) => state.error,
};

const actions = {
  // Fetch all endpoint servers
  async fetchEndpointServers({ commit }, { page = 1, pageSize = 10 } = {}) {
    commit("setLoading", true);
    commit("setError", null);
    try {
      const result = await getAllEndpointServers(page, pageSize);
      commit("setEndpointServers", result.data || result);
    } catch (err) {
      commit("setError", err.message);
    } finally {
      commit("setLoading", false);
    }
  },

  // Fetch endpoint server by UUID
  async fetchEndpointServerByUUID({ commit }, uuid) {
    commit("setLoading", true);
    commit("setError", null);
    try {
      const endpoint = await getEndpointServerByUUID(uuid);
      commit("setCurrentEndpointServer", endpoint);
      return endpoint;
    } catch (err) {
      commit("setError", err.message);
      commit("setCurrentEndpointServer", null);
      return null;
    } finally {
      commit("setLoading", false);
    }
  },

  // Fetch endpoint by numeric ID (for edit views if needed)
  async fetchEndpointServerById({ commit }, id) {
    commit("setLoading", true);
    commit("setError", null);
    try {
      const endpoint = await getEndpointServerById(id);
      commit("setCurrentEndpointServer", endpoint);
      return endpoint;
    } catch (err) {
      commit("setError", err.message);
      commit("setCurrentEndpointServer", null);
      return null;
    } finally {
      commit("setLoading", false);
    }
  },

  // Create or update endpoint server
  async saveEndpointServer({ commit, dispatch }, { uuid, endpoint }) {
    commit("setLoading", true);
    commit("setError", null);

    try {
      let savedEndpoint;

      if (!uuid) {
        // CREATE
        savedEndpoint = await createEndpointServer(endpoint);
      } else {
        // UPDATE via UUID
        savedEndpoint = await updateEndpointServer(uuid, endpoint);
      }

      commit("setCurrentEndpointServer", savedEndpoint);

      // refresh list
      await dispatch("fetchEndpointServers");

      return savedEndpoint;
    } catch (err) {
      commit("setError", err.message);
      return false;
    } finally {
      commit("setLoading", false);
    }
  },

  // Delete endpoint server
  async removeEndpointServer({ commit, dispatch }, id) {
    commit("setLoading", true);
    commit("setError", null);

    try {
      await deleteEndpointServer(id);
      await dispatch("fetchEndpointServers");
      return true;
    } catch (err) {
      commit("setError", err.message);
      return false;
    } finally {
      commit("setLoading", false);
    }
  },

  // Reset selected endpoint
  resetCurrentEndpointServer({ commit }) {
    commit("setCurrentEndpointServer", null);
  },
};

const mutations = {
  setEndpointServers(state, endpoints) {
    state.endpointServers = endpoints;
  },
  setCurrentEndpointServer(state, endpoint) {
    state.currentEndpointServer = endpoint;
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

  