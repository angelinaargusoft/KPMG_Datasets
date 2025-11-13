import { createStore } from "vuex";
import dataset from "./modules/dataset";

export default createStore({
  modules: {
    dataset
  },
});