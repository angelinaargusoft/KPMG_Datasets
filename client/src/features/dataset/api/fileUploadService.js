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
