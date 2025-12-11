import api from "@/plugins/axios";

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

export const getDatasetFiles = async (
  uuid,
  { page = 1, pageSize = 10, sortBy, sortDirection, search } = {}
) => {
  const params = {
    page,
    pageSize,
  };

  // only send if provided
  if (sortBy) params.sortBy = sortBy;
  if (sortDirection) params.sortDirection = sortDirection;
  if (search) params.search = search; 

  const res = await api.get(`/datasets/${uuid}/files`, {
    params,
  });

  return {
    files: res.data.files || [],
    pagination: res.data.pagination || null,
  };
};

export const deleteDatasetFile = async (datasetUUID, uploadUUID) => {
  const res = await api.delete(`/datasets/${datasetUUID}/files/${uploadUUID}`);
  return res.data;
};

