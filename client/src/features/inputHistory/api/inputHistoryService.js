import api from "@/plugins/axios";

export const triggerImport = async ({
  datasetUUID,
  filesName,
  append = false,
}) => {
  const res = await api.post("/inputHistory/trigger-import", {
    datasetUUID,
    filesName,
    append,
  });

  return res.data;
};

export const getImportsByDataset = async (datasetUUID) => {
  const res = await api.get(`/inputHistory/dataset/${datasetUUID}`);
  return res.data;
};
