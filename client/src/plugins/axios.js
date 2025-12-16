import axios from "axios";
import store from "@/store"; 

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

let startTime = 0;

api.interceptors.request.use((config) => {
  startTime = Date.now();
  store.commit("loader/START");
  return config;
});

api.interceptors.response.use(
  (response) => {
    const elapsed = Date.now() - startTime;
    setTimeout(
      () => store.commit("loader/STOP"),
      Math.max(0, 300 - elapsed)
    );
    return response;
  },
  (error) => {
    store.commit("loader/STOP");
    return Promise.reject(error);
  }
);

export default api;
