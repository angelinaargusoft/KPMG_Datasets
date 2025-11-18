import api from "@/plugins/axios";

// Upload file to a dataset (by UUID)
export const uploadDatasetFile = async (uuid, file) => {
  console.log(uuid)
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(`/datasets/${uuid}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const getDatasetFiles = async (uuid) => {
  const res = await api.get(`/datasets/${uuid}/files`);
  // adjust if your backend returns { files: [...] }
  return res.data.files || res.data;
};

export const deleteDatasetFile = async (id) => {
  const res = await api.delete(`/datasets/uploads/${id}`);
  return res.data;
};
