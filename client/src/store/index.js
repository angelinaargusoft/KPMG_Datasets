import { createStore } from "vuex";
import dataset from "./modules/dataset";
import endpointServers from "./modules/endpointServers";
import datasetFileUpload from "./modules/datasetFileUpload";

export default createStore({
  modules: {
    dataset,
    endpointServers, 
    datasetFileUpload
  },
});