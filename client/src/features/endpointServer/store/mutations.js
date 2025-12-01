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

export default mutations;
