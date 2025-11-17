import { createStore } from "vuex";
import dataset from "./modules/dataset";
import dataEndpoint from "./modules/dataEndpoint";

export default createStore({
  modules: {
    dataset,
    dataEndpoint
  },
});