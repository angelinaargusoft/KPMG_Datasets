import api from "@/plugins/axios";

// Upload file to a dataset (by UUID)
export const uploadDatasetFile = async (uuid, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(`/datasets/${uuid}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// Get dataset files (paginated)
export const getDatasetFiles = async (uuid, { page = 1, pageSize = 10 } = {}) => {
  const res = await api.get(`/datasets/${uuid}/files`, {
    params: { page, pageSize },
  });

  // backend returns: { files: [...], pagination: {...} }
  return {
    files: res.data.files || [],
    pagination: res.data.pagination || null,
  };
};

// Delete dataset file by upload UUID
export const deleteDatasetFile = async (datasetUUID, uploadUUID) => {
  const res = await api.delete(`/datasets/${datasetUUID}/files/${uploadUUID}`);
  return res.data;
};