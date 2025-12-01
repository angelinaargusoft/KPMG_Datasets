import api from "@/plugins/axios";

export const triggerImport = async ({ datasetUUID, uploadUUID }) => {
  const res = await api.post("/inputHistory/trigger-import", {
    datasetUUID,
    uploadUUID,
  });
  return res.data;
};

export const getImportsByDataset = async (datasetUUID) => {
  const res = await api.get(`/inputHistory/dataset/${datasetUUID}`);
  return res.data;
};

