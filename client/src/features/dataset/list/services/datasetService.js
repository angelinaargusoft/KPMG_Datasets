import api from "@/plugins/axios"; 

export const createDataset = async (data) => {
  const res = await api.post(`/datasets`, data);
  return res.data.dataset;
};

export const getAllDatasets = async (page = 1, pageSize = 10) => {
  const res = await api.get(`/datasets`, {
    params: { page, pageSize },
  });
  return res.data;
};

export const getDatasetById = async (id) => {
  const res = await api.get(`/datasets/${id}`);
  return res.data;
};

export const getDatasetByUUID = async (uuid) => {
  const res = await api.get(`/datasets/uuid/${uuid}`);
  return res.data;
};

export const updateDataset = async (id, data) => {
  const res = await api.put(`/datasets/${id}`, data);
  return res.data.updated;
};

export const deleteDataset = async (id) => {
  const res = await api.delete(`/datasets/${id}`);
  return res.data; 
};








