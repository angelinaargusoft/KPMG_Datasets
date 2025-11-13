const { v4: uuidv4 } = require("uuid");
const DatasetRepository = require("./datasetRepository");
async function createDataset(data) {
  if (!data.name) {
    throw new Error("Dataset name is required");
  }
  if (!data.applicationPackageId) {
    throw new Error("ApplicationPackageId is required");
  }
  if (!["Blob", "SFTP"].includes(data.storageType)) {
    throw new Error("Invalid storageType. Allowed: Blob, SFTP");
  }
  const newDataset = {
    uuid: uuidv4(),
    name: data.name.trim(),
    description: data.description || null,
    applicationPackageId: data.applicationPackageId,
    storageType: data.storageType,
    enablev3: data.enablev3 ?? false,
    tablePrefix: data.tablePrefix || null,
    createdBy: data.createdBy || null,
  };
  const datasetId = await DatasetRepository.createDataset(newDataset);
  return { id: datasetId, uuid: newDataset.uuid };
}
async function getAllDatasets() {
  return DatasetRepository.getAllDatasets();
}
async function getDatasetById(id) {
  const dataset = await DatasetRepository.getDatasetById(id);
  if (!dataset) throw new Error(`Dataset with id ${id} not found`);
  return dataset;
}
async function getDatasetByUUID(uuid) {
  const dataset = await DatasetRepository.getDatasetByUUID(uuid);
  if (!dataset) throw new Error(`Dataset with UUID ${uuid} not found`);
  return dataset;
}
async function updateDataset(id, data) {
  const allowedFields = [
    "name",
    "description",
    "applicationPackageId",
    "storageType",
    "enablev3",
    "tablePrefix",
    "lastChangeBy",
  ];
  const cleanUpdates = {};
  for (const key of Object.keys(data)) {
    if (allowedFields.includes(key)) cleanUpdates[key] = data[key];
  }
  if (Object.keys(cleanUpdates).length === 0) {
    throw new Error("No valid fields to update");
  }
  const affected = await DatasetRepository.updateDataset(id, cleanUpdates);
  if (!affected) throw new Error(`Dataset with id ${id} not found`);
  return { message: "Dataset updated successfully" };
}
async function deleteDataset(id) {
  const affected = await DatasetRepository.deleteDataset(id);
  if (!affected) throw new Error(`Dataset with id ${id} not found`);
  return { message: "Dataset deleted successfully" };
}
module.exports = {
  createDataset,
  getAllDatasets,
  getDatasetById,
  getDatasetByUUID,
  updateDataset,
  deleteDataset,
};









