import api from "@/plugins/axios"; 

// Create a new dataset
export const createDataset = async (data) => {
  const res = await api.post(`/datasets`, data);
  // backend: { message, dataset }
  return res.data.dataset || res.data;
};

// Fetch all datasets (with pagination)
export const getAllDatasets = async (page = 1, pageSize = 10) => {
  const res = await api.get(`/datasets`, {
    params: { page, pageSize },
  });
  // backend: { data: [...], pagination: {...} }
  return res.data;
};

// Fetch dataset by database ID
export const getDatasetById = async (id) => {
  const res = await api.get(`/datasets/${id}`);
  return res.data;
};

// Fetch dataset by UUID
export const getDatasetByUUID = async (uuid) => {
  const res = await api.get(`/datasets/uuid/${uuid}`);
  return res.data;
};

// Update dataset details
export const updateDataset = async (id, data) => {
  const res = await api.put(`/datasets/${id}`, data);
  // backend: { message, updated }
  return res.data.updated || res.data;
};

// Delete dataset
export const deleteDataset = async (id) => {
  const res = await api.delete(`/datasets/${id}`);
  return res.data; // { message: "Dataset deleted" }
};








