import api from "@/plugins/axios";

export const createDataset = async (data) => {
  const res = await api.post(`/datasets`, data);
  return res.data.dataset;
};

export const getAllDatasets = async (
  page = 1,
  pageSize = 10,
  sortBy,
  sortDirection,
  search
) => {
  const params = { page, pageSize };

  // only include if defined
  if (sortBy) params.sortBy = sortBy;
  if (sortDirection) params.sortDirection = sortDirection;
  if (search) params.search = search;

  const res = await api.get(`/datasets`, { params });
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

//metadata
export const getDatasetBlobFiles = async (uuid, continuationToken = null) => {
  const params = {};

  if (continuationToken) {
    params.continuationToken = continuationToken;
  }

  const res = await api.get(`/datasets/uuid/${uuid}/blob-files`, { params });
  return res.data;
};

export const deleteDatasetBlobFiles = async (datasetUUID, filesName) => {
  return api.delete(`/datasets/uuid/${datasetUUID}/blob-files`, {
    data: { filesName },
  });
};
