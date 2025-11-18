import { createStore } from "vuex";
import dataset from "./modules/dataset";
import dataEndpoint from "./modules/dataEndpoint";
import datasetFileUpload from "./modules/datasetFileUpload";

export default createStore({
  modules: {
    dataset,
    dataEndpoint, 
    datasetFileUpload
  },
});