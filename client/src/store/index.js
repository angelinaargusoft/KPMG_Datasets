import { createStore } from "vuex";
import dataset from "@/features/dataset/store";
import endpointServer from "@/features/endpointServer/store";
import datasetFileUpload from "@/features/dataset/details/store";
import loader from "./modules/loader";
import toast from "./modules/toast";

export default createStore({
  modules: {
    dataset,
    endpointServer, 
    datasetFileUpload, 
    loader,
    toast
  },
});