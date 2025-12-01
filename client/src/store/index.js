import { createStore } from "vuex";
import dataset from "@/features/dataset/store";
import endpointServer from "@/features/endpointServer/store";
import datasetFileUpload from "@/features/dataset/details/store";

export default createStore({
  modules: {
    dataset,
    endpointServer, 
    datasetFileUpload
  },
});