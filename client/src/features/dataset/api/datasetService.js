import api from "@/plugins/axios"; 

//Create a new dataset
export const createDataset = async (data) => {
  const res = await api.post(`/datasets`, data);
  return res.data.dataset || res.data;
};

// Fetch all datasets
export const getAllDatasets = async () => {
  const res = await api.get(`/datasets`);
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
  return res.data;
};

// Delete dataset
export const deleteDataset = async (id) => {
  const res = await api.delete(`/datasets/${id}`);
  return res.data;
};







